# NUST MISIS - NEKO SUSPICIOUS 
# Наше решение на хакатоне NSD Progress.Tech 14-06.05

# How to Run server
```
uvicorn main:app --reload --app-dir ../back --host 0.0.0.0 --port 8000
yarn --cwd front start
```
or
```
./utils/run_back.sh   # run bakcend
./utils/run_front.sh  # run frontend
```