FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Vite React app
RUN npm run build

# Expose the default HuggingFace port
EXPOSE 7860

# Start the Node.js server
CMD ["node", "server.js"]
