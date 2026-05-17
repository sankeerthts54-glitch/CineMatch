// src/components/GradientDots.jsx
// 3D Floating Black Cubes with Depth of Field (Pure CSS + Framer Motion)
import { motion } from "framer-motion";
import { useMemo } from "react";

// Helper to generate a random number between min and max
const random = (min, max) => Math.random() * (max - min) + min;

// A single 3D Cube component
const Cube = ({ size, initialPosition, animationData, blur, zIndex }) => {
  return (
    <motion.div
      style={{
        position: "absolute",
        width: size,
        height: size,
        transformStyle: "preserve-3d",
        left: initialPosition.x,
        top: initialPosition.y,
        filter: `blur(${blur}px)`,
        zIndex: zIndex,
        pointerEvents: "none",
      }}
      animate={{
        x: animationData.x,
        y: animationData.y,
        rotateX: animationData.rotateX,
        rotateY: animationData.rotateY,
        rotateZ: animationData.rotateZ,
      }}
      transition={{
        duration: animationData.duration,
        ease: "linear",
        repeat: Infinity,
        repeatType: "mirror",
      }}
    >
      {/* Front Face */}
      <div style={{ ...faceStyle, transform: `translateZ(${size / 2}px)`, background: "#111" }} />
      {/* Back Face */}
      <div style={{ ...faceStyle, transform: `rotateY(180deg) translateZ(${size / 2}px)`, background: "#050505" }} />
      {/* Right Face */}
      <div style={{ ...faceStyle, transform: `rotateY(90deg) translateZ(${size / 2}px)`, background: "#0a0a0a" }} />
      {/* Left Face */}
      <div style={{ ...faceStyle, transform: `rotateY(-90deg) translateZ(${size / 2}px)`, background: "#151515" }} />
      {/* Top Face */}
      <div style={{ ...faceStyle, transform: `rotateX(90deg) translateZ(${size / 2}px)`, background: "#1a1a1a" }} />
      {/* Bottom Face */}
      <div style={{ ...faceStyle, transform: `rotateX(-90deg) translateZ(${size / 2}px)`, background: "#000" }} />
    </motion.div>
  );
};

const faceStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  border: "1px solid rgba(255,255,255,0.05)", // extremely subtle edge highlight
};

export function GradientDots() {
  // Generate a memoized array of cubes so they don't re-render on every app state change
  const cubes = useMemo(() => {
    const tempCubes = [];
    const NUM_CUBES = 60; // Enough to fill the screen but keep performance okay

    for (let i = 0; i < NUM_CUBES; i++) {
      // 1. Size variations
      const size = random(20, 120);

      // 2. Starting positions spread across the viewport
      const initialPosition = {
        x: `${random(-10, 100)}vw`,
        y: `${random(-10, 100)}vh`,
      };

      // 3. Animation paths (drifting slowly)
      const driftRange = 15; // How far in vw/vh they drift
      const animationData = {
        x: [0, random(-driftRange, driftRange) + "vw", random(-driftRange, driftRange) + "vw", 0],
        y: [0, random(-driftRange, driftRange) + "vh", random(-driftRange, driftRange) + "vh", 0],
        rotateX: [random(0, 90), random(180, 360), random(360, 720)],
        rotateY: [random(0, 90), random(180, 360), random(360, 720)],
        rotateZ: [random(0, 90), random(180, 360), random(360, 720)],
        duration: random(30, 60), // Very slow tumbling
      };

      // 4. Depth of Field (Blur)
      // Some very blurry (foreground/background), some sharp (midground)
      let blur = 0;
      let zIndex = 0;
      const depthLayer = Math.random();
      
      if (depthLayer < 0.3) {
        // Foreground - huge and very blurry
        blur = random(10, 25);
        zIndex = 30;
      } else if (depthLayer < 0.7) {
        // Midground - sharpest
        blur = random(0, 3);
        zIndex = 20;
      } else {
        // Background - small and blurry
        blur = random(5, 15);
        zIndex = 10;
      }

      tempCubes.push(
        <Cube
          key={i}
          size={size}
          initialPosition={initialPosition}
          animationData={animationData}
          blur={blur}
          zIndex={zIndex}
        />
      );
    }
    return tempCubes;
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        backgroundColor: "#ffffff", // Pure white background
        overflow: "hidden",
        perspective: "1000px", // Enables 3D perspective for the container
      }}
    >
      {/* Container for the tumbling cubes */}
      <div
        style={{
          position: "absolute",
          inset: "-20%", // Oversize to prevent cubes clipping at screen edges
          transformStyle: "preserve-3d",
        }}
      >
        {cubes}
      </div>

      {/* Subtle vignette to focus the center slightly */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 30%, rgba(255,255,255,0.4) 100%)",
          pointerEvents: "none",
          zIndex: 40,
        }}
      />
    </div>
  );
}
