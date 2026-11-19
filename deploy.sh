#!/bin/bash
set -e

cd /media/sf_gobi-brands


IMAGE="turbadrakh/gobi-brands:latest"

OLD_ID=$(sudo docker image inspect "$IMAGE" --format '{{.Id}}' 2>/dev/null || echo "none")

echo "Checking Docker Hub for updates ..."
sudo docker compose pull web

NEW_ID=$(sudo docker image inspect "$IMAGE" --format '{{.Id}}')

if [ "$OLD_ID" != "$NEW_ID" ]; then
	echo "New image detected. Deploying..."
	sudo docker compose up -d
	sudo docker compose ps
	echo "Deployment completed."
else
	echo "Image unchanged. No deployment needed."
fi
