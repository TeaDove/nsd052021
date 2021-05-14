#!/usr/bin/env bash
PASS='FR33d0m13#&'

rsync --delete -havzP --exclude='/.git' \
 --filter="dir-merge,- ./back/.gitignore" \
   ./back/* root@65.21.155.166:~/nsd052021/back

# Не забудь забилдить фронт
# На серваке директоря отдаетсся как статика с помощью serve
rsync --delete -havzP  \
   ./front/build/* root@65.21.155.166:~/nsd052021/front

#  --filter="dir-merge,- ./back/.gitignore" \
#   --filter="dir-merge,- ./front/.gitignore" \
# # ps ax | grep test.py

# ssh root@65.21.155.166 '/bin/bash -c "source ~/.pipenv/bin/activate && cd ~/nsd052021/back && pip install -r requirements.txt && uvicorn main:app --reload"'
# ssh root@65.21.155.166 "cd ~ && cd nsd052021/front && yarn install --frozen-lockfile"
 