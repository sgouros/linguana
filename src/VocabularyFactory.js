import VocabularyEntry from "./components/VocabularyEntry.js";
import PouchDB from "pouchdb";
PouchDB.plugin(require("pouchdb-find"));

export default class VocabularyFactory {
  constructor(app) {
    this.app = app;
    this.database = new PouchDB("greek_german_db");
    window.PouchDB = PouchDB; // for dev tools
    this.database.createIndex({
      index: {
        fields: ["totalTimesSelected", "totalSuccesses", "totalFailures"]
      }
    });
    // .then(() => {this.database.getIndexes().then(function(result) {console.log(result);});});
    console.info("greek_german database created");
  }

  getNewVocabulary = (
    numberOfEntries,
    allSelectedEntries = [],
    appCallback = null,
    currentIndex = 0
  ) => {
    let allSelectedEntryIDs = allSelectedEntries.map(entry => {
      return entry._id;
    });

    let entriesFromDatabase = this.database
      .find({
        selector: {
          _id: { $nin: allSelectedEntryIDs },
          totalTimesSelected: { $gt: -1 }
        },
        sort: [{ totalTimesSelected: "asc" }],
        limit: numberOfEntries
      })
      .then(result => {
        let newVoc = this.constructNewVocabulary(result.docs);
        newVoc.map(entry => entry.selected());

        // *****  todo εδώ πρέπει να ξαναγράφονται τα ανανεωμένα πλέον selected items πίσω στη db

        // todo: αυτή τη συνάρτηση δεν γίνεται να την περνάει η app ως callback?
        this.app.newVocabularyArrived(newVoc, currentIndex);
      });
    return [];
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

  addNewEntry = (term, translation) => {
    // let newEntry = new VocabularyEntry(term, translation, 0);
    // GLOBAL_VOC.push(newEntry);
    // return GLOBAL_VOC;
  };

  seedDatabase = () => {
    this.database.bulkDocs([
      new VocabularyEntry("εγκατάσταση", "installieren", 0),
      new VocabularyEntry("ναι", "ja", 1),
      new VocabularyEntry("οθόνη", "der Monitor", 1),
      new VocabularyEntry("κατόπιν", "anschließend", 5),
      new VocabularyEntry("ευγενικός", "nett", 7),
      new VocabularyEntry("αυτοκίνητο", "das Auto", 12),
      new VocabularyEntry("λάθος", "der Fehler", 5),
      new VocabularyEntry("όχι", "nein", 3),
      new VocabularyEntry("ηλεκτρονικός υπολογιστής", "der Rechner", 2),
      new VocabularyEntry("hardly μετα βίας", "kaum", 7),
      new VocabularyEntry("πόνος", "der Schmerz", 12),
      new VocabularyEntry("ασφαλισμένος", "versichert", 17),
      new VocabularyEntry("προφανώς", "offensichtlich", 8),
      new VocabularyEntry("εκφράζω", "ausdrücken", 7),
      new VocabularyEntry("αξία", "der Wert", 4),
      new VocabularyEntry("διατήρηση", "die Erhaltung", 16),
      new VocabularyEntry("μεταφόρτωση (download)", "runterladen", 7),
      new VocabularyEntry("ανέκδοτο", "der Witz", 4),
      new VocabularyEntry("τρόφιμα", "das Lebensmittel", 8),
      new VocabularyEntry("σύνδεση", "einloggen", 20)
    ]);
    console.info("greek_german database populated");
  };

  resetDatabase = () => {
    this.database.destroy();
    this.database = new PouchDB("greek_german_db");
    console.info("database has been reset");
  };

  traceVocabulary = voc => {
    console.info("------- tracing vocabulary ---------");
    voc.map(entry => {
      console.info(
        `${entry.term} - ${entry.translation}: ${entry.totalTimesSelected} times selected`
      );
      return entry;
    });
    console.info("----- end tracing vocabulary -------");
  };
}
