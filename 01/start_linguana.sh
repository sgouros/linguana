echo -n "STARTING linguana\n"
cd /home/george/code/linguana
# nautilus /home/george/code/0linguana &
git pull origin
code
npm start
# gnome-terminal -x bash -c 'npm start'

#------------ όταν θελεις να κατεβάσεις από το github και να κάνεις overwrite το local
#git reset --hard
#git pull origin master