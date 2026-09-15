#!/bin/bash

set -e

podman compose down
podman compose build --no-cache \
    && podman compose up -d
podman image prune

