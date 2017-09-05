# προσοχή αυτό πρέπει να τρέχει μόνο στον κεντρικο server. Στους άλλους Η/Υ δεν έχει νόημα

DATE="$(date +"%Y.%m.%d_%H.%M")"


VOC_DB_NAME="linguana_vocabulary"
VOC_OUTPUT_FILE="$VOC_DB_NAME"_"$DATE"
echo -n "Exporting $VOC_DB_NAME\n"
sudo cp /var/lib/couchdb/$VOC_DB_NAME.couch  /home/george/code/linguana/db/$VOC_OUTPUT_FILE.couch

STATS_DB_NAME="linguana_stats"
STATS_OUTPUT_FILE="$STATS_DB_NAME"_"$DATE"
echo -n "Exporting $STATS_DB_NAME\n"
sudo cp /var/lib/couchdb/$STATS_DB_NAME.couch  /home/george/code/linguana/db/$STATS_OUTPUT_FILE.couch

echo -n "done\n"