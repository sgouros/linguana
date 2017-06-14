# 1. reset DB from application (deletes all records)
# 2. let couchdb to auto sync
# 3. select below a file to
INPUT_FILE="2017.06.14_08.47.json"
# 4. run this file



DATE="$(date +"%Y.%m.%d_%H.%M")"
DB_NAME="linguana"
echo -n "Importing $INPUT_FILE to $DB_NAME\n"
curl -d @$INPUT_FILE -H "Content-Type: application/json" -X POST http://localhost:5984/$DB_NAME/_bulk_docs
echo -n "Done!\n"




