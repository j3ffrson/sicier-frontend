#!/bin/sh

envsubst < /usr/share/nginx/html/env.js > /usr/share/nginx/html/env.tmp.js
mv /usr/share/nginx/html/env.tmp.js /usr/share/nginx/html/env.js

nginx -g "daemon off;"
