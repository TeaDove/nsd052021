#!/usr/bin/env bash
source ../back/venv/bin/activate.fish
uvicorn main:app --reload --app-dir ../back --host 0.0.0.0 --port 8000