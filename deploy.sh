#!/bin/bash
set -e

cd /media/sf_gobi-brands

IMAGE="turbadrakh/gobi-brands:latest"
HEALTH_URL="http://localhost:8080/api/health"

RUNNING_CONTAINER_ID=$(sudo docker compose ps -q web)

if [ -n "$RUNNING_CONTAINER_ID" ]; then
    RUNNING_ID=$(sudo docker inspect "$RUNNING_CONTAINER_ID" --format '{{.Image}}')
else
    RUNNING_ID="none"
fi

echo "Checking Docker Hub for updates..."
sudo docker compose pull web

NEW_ID=$(sudo docker image inspect "$IMAGE" --format '{{.Id}}')

if [ "$RUNNING_ID" = "$NEW_ID" ]; then
    echo "Image unchanged. No deployment needed."
    exit 0
fi

echo "New image detected."
echo "Deploying new image..."

sudo docker compose up -d

echo "Checking application health..."

HEALTHY="false"

for i in {1..12}; do
    if curl -fsS "$HEALTH_URL" > /dev/null; then
        HEALTHY="true"
        break
    fi

    echo "Health check attempt $i/12 failed. Waiting..."
    sleep 5
done

if [ "$HEALTHY" = "true" ]; then
    echo "Deployment successful. Application is healthy."
    sudo docker compose ps
else
    echo "Health check failed. Rolling back..."

    if [ "$RUNNING_ID" != "none" ]; then
        sudo docker tag "$RUNNING_ID" "$IMAGE"
        sudo docker compose up -d
        echo "Rollback completed."
    else
        echo "No previous image available for rollback."
    fi

    exit 1
fi