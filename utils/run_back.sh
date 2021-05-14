source ../back/venv/bin/activate.fish
uvicorn main:app --reload --app-dir ../back
# nohup uvicorn main:app --reload --port 8000 --host 0.0.0.0 &
