echo -n "STARTING linguana\n"
cd /home/george/code/linguana
nautilus /home/george/code/linguana &
git pull origin
code
gnome-terminal -x bash -c 'npm start'
