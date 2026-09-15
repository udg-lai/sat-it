#!/bin/bash

set -e

podman compose build \
    && podman compose up -d

