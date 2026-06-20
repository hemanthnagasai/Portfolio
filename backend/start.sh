#!/bin/bash
cd "$(dirname "$0")"
exec uvicorn app.main:app --host localhost --port 8000 --reload
