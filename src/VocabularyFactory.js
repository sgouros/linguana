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
  initialVocabularyLength = 4;

  constructor(app) {
    this.app = app;
    window.PouchDB = PouchDB; // for dev tools

    this.localVocDbName = "linguana_vocabulary";
    this.remoteVocDbName = "http://localhost:5984/" + this.localVocDbName;
    this.localVocDb = new PouchDB(this.localVocDbName);
    this.remoteVocDb = new PouchDB(this.remoteVocDbName);

    this.localVocDb
      .sync(this.remoteVocDb, {
        live: true,
        retry: true
      })
      .on("change", function(change) {
        console.debug("Vocabulary synced!");
      })
      .on("paused", function(info) {
        console.debug("Vocabulary replication was paused, usually because of a lost connection");
      })
      .on("active", function(info) {
        console.debug("Vocabulary replication resumed");
      })
      .on("error", function(err) {
        console.debug("Vocabulary totally unhandeld replication error");
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

    this.localVocDb
      .createIndex({
        index: {
          fields: ["totalTimesSelected"]
        }
      })
      .then(() => {
        return this.localVocDb.find({
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
        return this.localVocDb.bulkDocs(updatedVoc);
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
        item.notes,
        item.totalSuccesses,
        item.totalFailures,
        item.totalTimesSelected
      );
    });
    return newVoc;
  };

  addEntry = (term, translation, notes, onSuccess, onFailure) => {
    let newEntry = new VocabularyEntry(null, null, term, translation, notes, 0, 0, 0);
    this.localVocDb
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

    this.localVocDb
      .find({
        selector: {
          _id: { $exists: "true" }
        }
      })
      .then(responseFromDb => {
        let v = this.constructNewVocabulary(responseFromDb.docs);
        this.traceVocabulary(v);
      })
      .catch(err => {
        console.error("error inside traceDatabase");
        console.error(err);
      });
  };

  seedDatabase = () => {
    this.localVocDb
      .bulkDocs([
        new VocabularyEntry(
          "00εγκατάσταση-installieren",
          null,
          "εγκατάσταση",
          "installieren",
          "ρήμα",
          0,
          0,
          0
        ),
        new VocabularyEntry("01ναι-ja", null, "ναι", "ja", null, 1, 1, 1),
        new VocabularyEntry("02οθόνη-der Monitor", null, "οθόνη", "der Monitor", "", 1, 5, 6),
        new VocabularyEntry("03κατόπιν-anschließend", null, "κατόπιν", "anschließend", "note", 5, 2, 8),
        new VocabularyEntry("04ευγενικός-nett", null, "ευγενικός", "nett", "note2", 2, 0, 7),
        new VocabularyEntry("05αυτοκίνητο-das Auto", null, "αυτοκίνητο", "das Auto", "note 3", 2, 0, 12)
        // new VocabularyEntry("λάθος-der Fehler", null, "λάθος", "der Fehler", 2, 0, 5),
        // new VocabularyEntry("όχι-nein", null, "όχι", "nein", 2, 0, 3),
        // new VocabularyEntry("μετα βίας-kaum", null, "μετα βίας", "kaum", 7, 5, 20),
        // new VocabularyEntry("πόνος-der Schmerz", null, "πόνος", "der Schmerz", 12),
        // new VocabularyEntry("ασφαλισμένος-versichert", null, "ασφαλισμένος", "versichert", 17, 2, 23),
        // new VocabularyEntry("προφανώς-offensichtlich", null, "προφανώς", "offensichtlich", 8, 6, 20),
        // new VocabularyEntry("εκφράζω-ausdrücken", null, "εκφράζω", "ausdrücken", 7, 4, 12),
        // new VocabularyEntry("αξία-der Wert", null, "αξία", "der Wert", 4, 6, 10),
        // new VocabularyEntry("διατήρηση-die Erhaltun", null, "διατήρηση", "die Erhaltung", 2, 5, 16),
        // new VocabularyEntry("μεταφόρτωση-runterladen", null, "μεταφόρτωση", "runterladen", 1, 0, 7),
        // new VocabularyEntry("ανέκδοτο-der Witz", null, "ανέκδοτο", "der Witz", 2, 2, 4),
        // new VocabularyEntry("τρόφιμα-das Lebensmittel", null, "τρόφιμα", "das Lebensmittel", 5, 3, 8),
        // new VocabularyEntry("σύνδεση-einloggen", null, "σύνδεση", "einloggen", 11, 11, 26)
      ])
      .then(() => console.info(`${this.localVocDbName} database seeded`))
      .catch(err => {
        console.error("error inside seed Database");
        console.error(err);
      });
  };

  resetDatabase = () => {
    let theDB = this.localVocDb;
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
        console.info(`${this.localVocDbName} database has been reset`);
      })
      .catch(err => {
        console.error("error inside reset Database");
        console.error(err);
      });
  };

  // .catch(console.log.bind(console));

  traceVocabulary = (voc, logMessage = `tracing vocabulary (length: ${voc.length})`) => {
    console.info(logMessage);
    voc.map(entry => entry.trace());
  };

  search = (searchTerm, onSearchCompleted) => {
    let searchTermRegex = searchTerm;
    this.localVocDb
      .createIndex({
        index: {
          fields: ["term", "translation", "notes"]
        }
      })
      .then(() => {
        return this.localVocDb.find({
          selector: {
            $or: [
              { term: { $regex: searchTermRegex } },
              { translation: { $regex: searchTermRegex } },
              { notes: { $regex: searchTermRegex } }
            ]
          },
          limit: 20
        });
      })
      .then(resultFromDb => {
        onSearchCompleted(this.constructNewVocabulary(resultFromDb.docs));
      })
      .catch(err => {
        console.error("error inside seed search");
        console.error(err);
      });
  };

  deleteEntryFromDb = entry => {
    this.localVocDb
      .remove(entry)
      .then(response => {
        console.debug("the following entry was removed from db:");
        console.debug(response);
      })
      .catch(err => {
        console.error("error inside deleteEntryFromDb");
        console.error(err);
      });
  };

  updateEntry = entry => {
    this.localVocDb
      .put(entry)
      .then(response => {
        console.debug("the following entry was updated to db:");
        console.debug(entry);
        console.debug("response:");
        console.debug(response);
      })
      .catch(err => {
        console.error("error inside updateEntry");
        console.error(err);
      });
  };
}
