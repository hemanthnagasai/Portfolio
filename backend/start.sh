#!/bin/bash
cd /home/runner/workspace/backend
exec uvicorn server:app --host localhost --port 8000 --reload
