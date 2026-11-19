#!/bin/bash
set -e

cd /media/sf_gobi-brands


IMAGE="turbadrakh/gobi-brands:latest"
CONTAINER="gobi-brands-app"

RUNNING_ID=$(sudo docker inspect "$CONTAINER" --format '{{.Image}}' 2>/dev/null || echo "none")

echo "Pulling image from Docker Hub ..."
sudo docker compose pull web

NEW_ID=$(sudo docker image inspect "$IMAGE" --format '{{.Id}}')

if [ "$RUNNING__ID" != "$NEW_ID" ]; then
	echo "New image detected. Deploying..."
	sudo docker compose up -d
	sudo docker compose ps
	echo "Deployment completed."
else
	echo "Image unchanged. No deployment needed."
fi
