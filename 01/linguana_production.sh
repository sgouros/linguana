# echo -n "Preparing linguana for PRODUCTION\n"
# cd /home/george/code/linguana
# npm run build
# cd /home/george/code/linguana/build
# cp -R *.* /home/george/code/sgouros.github.io/linguana
# cd /home/george/code/sgouros.github.io
# git add --all
# git commit -m "by George Sgouros"
# git push -u origin master

echo -n "Deploying Linguana to https://sgouros.github.io/ \n"
cd /home/george/code/linguana
npm run deploy
