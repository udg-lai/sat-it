# Use official Node.js v20 LTS image
FROM node:20

# Set working directory
WORKDIR /edusatit

# Copy package files and install dependencies
COPY package*.json ./

RUN npm install

# Copy everything except those ignored by dockerignore
COPY . .

# Set build script or run command
# RUN npm run build   # Uncomment if you're building a static app
CMD ["node", "build"]

# Expose port (adjust as needed)
EXPOSE 3000
