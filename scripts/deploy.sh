#!/usr/bin/env bash
set -euo pipefail

# Basic VPS deploy helper (run from repo root on the server).
# Requires Docker + Docker Compose plugin.

git pull --ff-only
docker compose up -d --build
docker compose ps
