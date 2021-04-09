#!/usr/bin/env sh

set -e

npm run build

cd .vuepress/dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:aim-leo/totea-core.git master:gh-pages

cd -