DATE="$(date +"%Y.%m.%d_%H.%M")"
DB_NAME="linguana"
OUTPUT_FILE="$DATE.json"

echo -n "Exporting $DB_NAME to $OUTPUT_FILE\n"
curl -X GET 'http://localhost:5984/linguana/_all_docs?include_docs=true' | jq '{"docs": [.rows[].doc]}' | jq 'del(.docs[]._rev)' > $OUTPUT_FILE
echo -n "Done!\n"
