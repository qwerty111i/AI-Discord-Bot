# Use an official Node.js runtime as base
FROM node:22.14.0

# Set the working directory
WORKDIR /zeroshift

# Copy only package files first (caching benefit)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your bot code
COPY . .

# Start the bot
CMD ["node", "app.js"]


