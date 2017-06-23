// ------ couchdb synchronization -------
// sudo apt-get install couchdb
// couchdb-server --port 5984
// curl localhost:5984
// npm install -g add-cors-to-couchdb
// add-cors-to-couchdb

import VocabularyEntry from "./components/VocabularyEntry.js";
import PouchDB from "pouchdb";
PouchDB.plugin(require("pouchdb-find"));

export default class VocabularyFactory {
  initialVocabularyLength = 2;

  constructor(app) {
    this.app = app;
    window.PouchDB = PouchDB; // for dev tools

    this.localDbName = "linguana";
    this.remoteDbName = "http://localhost:5984/" + this.localDbName;

    this.localDb = new PouchDB(this.localDbName);
    this.remoteDb = new PouchDB(this.remoteDbName);

    this.localDb
      .sync(this.remoteDb, {
        live: true,
        retry: true
      })
      .on("change", function(change) {
        console.info("Vocabulary synced!");
      })
      .on("paused", function(info) {
        console.debug("replication was paused, usually because of a lost connection");
      })
      .on("active", function(info) {
        console.info("replication resumed");
      })
      .on("error", function(err) {
        console.info("totally unhandeld replication error");
      });
  }

  newVocabularyNeeded = (
    onSuccess,
    numberOfEntries = this.initialVocabularyLength,
    allSelectedEntries = [],
    currentIndex = 0
  ) => {
    let allSelectedEntryIDs = allSelectedEntries.map(entry => {
      return entry._id;
    });
    let updatedVoc = [];

    this.localDb
      .createIndex({
        index: {
          fields: ["totalTimesSelected"]
        }
      })
      .then(() => {
        return this.localDb.find({
          selector: {
            _id: { $nin: allSelectedEntryIDs },
            totalTimesSelected: { $gt: -1 }
          },
          sort: [{ totalTimesSelected: "asc" }],
          limit: numberOfEntries
        });
      })
      .then(resultFromDb => {
        let newVoc = this.constructNewVocabulary(resultFromDb.docs);
        updatedVoc = newVoc.map(entry => {
          entry.selected();
          return entry;
        });
        return this.localDb.bulkDocs(updatedVoc);
      })
      .then(result => {
        onSuccess(updatedVoc, currentIndex);
      })
      .catch(console.log.bind(console));
  };

  constructNewVocabulary = vocFromDatabase => {
    let newVoc = vocFromDatabase.map(item => {
      return new VocabularyEntry(
        item._id,
        item._rev,
        item.term,
        item.translation,
        item.totalSuccesses,
        item.totalFailures,
        item.totalTimesSelected
      );
    });
    return newVoc;
  };

  addEntry = (term, translation, onSuccess, onFailure) => {
    let newEntry = new VocabularyEntry(null, null, term, translation, 0, 0, 0);
    this.localDb
      .put(newEntry)
      .then(response => {
        onSuccess(term, translation, response);
      })
      .catch(error => {
        onFailure(term, translation, error);
      });
  };

  traceDatabase = () => {
    console.info("tracing database:");

    this.localDb
      .find({
        selector: {
          _id: { $exists: "true" }
        }
      })
      .then(responseFromDb => {
        let v = this.constructNewVocabulary(responseFromDb.docs);
        this.traceVocabulary(v);
      })
      .catch(console.log.bind(console));
  };

  seedDatabase = () => {
    this.localDb
      .bulkDocs([
        new VocabularyEntry("00εγκατάσταση-installieren", null, "εγκατάσταση", "installieren", 0, 0, 0),
        new VocabularyEntry("00ναι-ja", null, "ναι", "ja", 1, 1, 1),
        new VocabularyEntry("οθόνη-der Monitor", null, "οθόνη", "der Monitor", 1, 5, 6),
        new VocabularyEntry("κατόπιν-anschließend", null, "κατόπιν", "anschließend", 5, 2, 8),
        new VocabularyEntry("ευγενικός-nett", null, "ευγενικός", "nett", 2, 0, 7),
        new VocabularyEntry("αυτοκίνητο-das Auto", null, "αυτοκίνητο", "das Auto", 2, 0, 12),
        new VocabularyEntry("λάθος-der Fehler", null, "λάθος", "der Fehler", 2, 0, 5),
        new VocabularyEntry("όχι-nein", null, "όχι", "nein", 2, 0, 3),
        new VocabularyEntry("μετα βίας-kaum", null, "μετα βίας", "kaum", 7, 5, 20),
        new VocabularyEntry("πόνος-der Schmerz", null, "πόνος", "der Schmerz", 12),
        new VocabularyEntry("ασφαλισμένος-versichert", null, "ασφαλισμένος", "versichert", 17, 2, 23),
        new VocabularyEntry("προφανώς-offensichtlich", null, "προφανώς", "offensichtlich", 8, 6, 20),
        new VocabularyEntry("εκφράζω-ausdrücken", null, "εκφράζω", "ausdrücken", 7, 4, 12),
        new VocabularyEntry("αξία-der Wert", null, "αξία", "der Wert", 4, 6, 10),
        new VocabularyEntry("διατήρηση-die Erhaltun", null, "διατήρηση", "die Erhaltung", 2, 5, 16),
        new VocabularyEntry("μεταφόρτωση-runterladen", null, "μεταφόρτωση", "runterladen", 1, 0, 7),
        new VocabularyEntry("ανέκδοτο-der Witz", null, "ανέκδοτο", "der Witz", 2, 2, 4),
        new VocabularyEntry("τρόφιμα-das Lebensmittel", null, "τρόφιμα", "das Lebensmittel", 5, 3, 8),
        new VocabularyEntry("σύνδεση-einloggen", null, "σύνδεση", "einloggen", 11, 11, 26)
      ])
      .then(() => console.info(`${this.localDbName} database seeded`))
      .catch(console.log.bind(console));
  };

  resetDatabase = () => {
    let theDB = this.localDb;
    theDB
      .allDocs()
      .then(result => {
        return Promise.all(
          result.rows.map(function(row) {
            return theDB.remove(row.id, row.value.rev);
          })
        );
      })
      .then(() => {
        console.info(`${this.localDbName} database has been reset`);
      })
      .catch(console.log.bind(console));
  };

  traceVocabulary = (voc, logMessage = "tracing vocabulary:") => {
    console.info(logMessage);
    voc.map(entry => entry.trace());
  };

  search = (searchTerm, onSearchCompleted) => {
    let searchTermRegex = searchTerm;
    this.localDb
      .createIndex({
        index: {
          fields: ["term", "translation"]
        }
      })
      .then(() => {
        return this.localDb.find({
          selector: {
            $or: [{ term: { $regex: searchTermRegex } }, { translation: { $regex: searchTermRegex } }]
          },
          limit: 50
        });
      })
      .then(resultFromDb => {
        onSearchCompleted(this.constructNewVocabulary(resultFromDb.docs));
      })
      .catch(console.log.bind(console));
  };

  deleteEntryFromDb = entry => {
    this.localDb
      .remove(entry)
      .then(response => {
        console.info("the following entry was removed from db:");
        console.info(response);
      })
      .catch(console.log.bind(console));
  };
}
