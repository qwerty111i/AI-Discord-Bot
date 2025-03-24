echo "Pulling latest code..."
git pull origin main

echo "Building Docker image..."
docker build -t discord-bot .

echo "Stopping old container..."
docker stop zeroshift
docker rm zeroshift

echo "Starting new container..."
docker run -d --env-file .env --name zeroshift discord-bot

echo "Deployment complete!"
