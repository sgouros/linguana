import VocabularyEntry from "./components/VocabularyEntry.js";
import PouchDB from "pouchdb";
PouchDB.plugin(require("pouchdb-find"));

export default class VocabularyFactory {
  constructor() {
    this.database = new PouchDB("greek_german_db");
    window.PouchDB = PouchDB; // for dev tools
    this.database.createIndex({
      index: {
        fields: ["totalTimesSelected"]
      }
    });
    console.info("greek_german database created");
    // μέχρι στιγμής μπόρεσα να αποθηκεύω στην pouchdb μία entry
    // μετά πρέπει να μπορώ να την κάνω update όταν γίνεται selected ή correctly translated κλπ
    // αντί να τις διαβάζει από το global dic, πρέπει να τις διαβάζει από την βάση κάθε φορά.
    // Το global dic μάλλον δεν θα χρησιμοποιείται(γεμίζει). Απλώς κάθε φορά που ζητάμε λέξεις,
    // θα κάνει request στην pouchdb
  }

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

  getNewVocabulary = (numberOfEntries, allSelectedEntries = []) => {
    let allSelectedEntryIDs = allSelectedEntries.map(entry => {
      return entry._id;
    });

    let entriesFromDatabase = this.database
      .find({
        selector: {
          _id: { $nin: allSelectedEntryIDs }
        },
        // sort: ["totalTimesSelected"],
        limit: numberOfEntries
      })
      .then(result => {
        // εδώ πρέπει να κατασκευάζεται το updated vocabulary και να καλείται callback στην App
        // ώστε να γεμίσει το vocabulary όπως πρέπει
        // EKTOΣ αν το κάνω synchronous και εδώ περιμένω να τελειώσει το promise
        // αλλα μάλλον όχι. Μάλλον θα βάλω ένα loading dialog το οποίο θα γίνεται dismissed
        // αυτομάτως μόλις τελειώσει η promise. (και σε κάποιο σημείο θα πρέπει να καλείται
        // και η selected() από κάθε VocabularyEntry)
        console.info(result.docs[0]);

        // για να κάνουμε construct το καινούριο vocabulary πρέπει να δώ λίγο τί γίνεται
        // με τα revs και τα ids και ΠΩΣ (και αν) αυτά θα χρησιμοποιηθούν στα vocabularyEntry
        // objects.
        // Αρα πρέπει να δω πως γίνεται το put, και το upate και μετά πρέπει να δω και τo link
        // Can we cast a generic object to a custom object type in javascript?
        // https://stackoverflow.com/questions/8736886/can-we-cast-a-generic-object-to-a-custom-object-type-in-javascript
      });

    return [
      new VocabularyEntry("τρόφιμα", "das Lebensmittel", 8),
      new VocabularyEntry("σύνδεση", "einloggen", 20)
    ];

    // let totalEntriesSelected = 0;
    // let sortedVocabulary = this.sortGlobalVocabulary();
    // let filteredVocabulary = sortedVocabulary.filter(entry => {
    //   if (allSelectedEntries.indexOf(entry) >= 0) {
    //     return false;
    //   } else {
    //     if (totalEntriesSelected >= numberOfEntries) {
    //       return false;
    //     } else {
    //       totalEntriesSelected += 1;
    //       return true;
    //     }
    //   }
    // });
    // let updatedVocabulary = filteredVocabulary.map(entry => {
    //   entry.selected();
    //   return entry;
    // });
    // return updatedVocabulary;
  };

  addNewEntry = (term, translation) => {
    // let newEntry = new VocabularyEntry(term, translation, 0);
    // GLOBAL_VOC.push(newEntry);
    // return GLOBAL_VOC;
  };
}
