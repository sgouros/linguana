import VocabularyEntry from "./components/VocabularyEntry.js";
import PouchDB from "pouchdb";
PouchDB.plugin(require("pouchdb-find"));

export default class VocabularyFactory {
  initialVocabularyLength = 10;

  constructor(app) {
    this.app = app;
    this.databaseName = "greek_german_db_30";
    this.database = new PouchDB(this.databaseName);
    window.PouchDB = PouchDB; // for dev tools
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

    this.database
      .createIndex({
        index: {
          fields: ["totalTimesSelected", "totalSuccesses", "totalFailures"]
        }
      })
      .then(() => {
        return this.database.find({
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
        return this.database.bulkDocs(updatedVoc);
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
    this.database
      .put(newEntry)
      .then(response => {
        onSuccess(term, translation, response);
      })
      .catch(error => {
        onFailure(term, translation, error);
      });
  };

  traceDatabase = () => {
    this.database
      .find({
        selector: {
          _id: { $exists: "true" }
        }
      })
      .then(responseFromDb => {
        let v = this.constructNewVocabulary(responseFromDb.docs);
        v.map(item => item.trace());
      })
      .catch(console.log.bind(console));
  };

  seedDatabase = () => {
    this.database
      .bulkDocs([
        new VocabularyEntry("εγκατάσταση-installieren", null, "εγκατάσταση", "installieren", 0, 0, 0),
        new VocabularyEntry("ναι-ja", null, "ναι", "ja", 1, 1, 1),
        new VocabularyEntry("οθόνη-der Monitor", null, "οθόνη", "der Monitor", 1, 5, 6),
        new VocabularyEntry("κατόπιν-anschließend", null, "κατόπιν", "anschließend", 5, 2, 8),
        new VocabularyEntry("ευγενικός-nett", null, "ευγενικός", "nett", 2, 0, 7),
        new VocabularyEntry("αυτοκίνητο-das Auto", null, "αυτοκίνητο", "das Auto", 2, 0, 12),
        new VocabularyEntry("λάθος-der Fehler", null, "λάθος", "der Fehler", 2, 0, 5),
        new VocabularyEntry("όχι-nein", null, "όχι", "nein", 2, 0, 3),
        new VocabularyEntry(
          "ηλεκτρονικός υπολογιστής-der Rechner",
          null,
          "ηλεκτρονικός υπολογιστής",
          "der Rechner",
          2,
          0,
          4
        ),
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
      .then(() => console.info(`${this.databaseName} database seeded`));
  };

  resetDatabase = () => {
    this.database
      .destroy()
      .then(() => {
        return new PouchDB(this.databaseName);
      })
      .then(newDb => {
        this.database = newDb;
        console.info(`${this.databaseName} database has been reset`);
      })
      .catch(console.log.bind(console));
  };

  traceVocabulary = voc => {
    console.info("------- tracing vocabulary ---------");
    voc.map(entry => {
      console.info(`${entry.term} - ${entry.translation}: ${entry.totalTimesSelected} times selected`);
      return entry;
    });
    console.info("----- end tracing vocabulary -------");
  };
}
