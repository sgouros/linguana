import VocabularyEntry from "./components/VocabularyEntry.js";
import PouchDB from "pouchdb";

const GLOBAL_VOC = [
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
];

export default class VocabularyFactory {
  constructor() {
    this.database = new PouchDB("greek_german");
    window.PouchDB = PouchDB;
    console.info("greek_german database created");

    // μέχρι στιγμής μπόρεσα να αποθηκεύω στην pouchdb μία entry
    // μετά πρέπει να μπορώ να την κάνω update όταν γίνεται selected ή correctly translated κλπ
    // μετά πρέπει να περάσω και τις 20 στη βάση
    // αντί να τις διαβάζει από το global dic, πρέπει να τις διαβάζει από την βάση κάθε φορά.
    // Το global dic μάλλον δεν θα χρησιμοποιείται(γεμίζει). Απλώς κάθε φορά που ζητάμε λέξεις, θα κάνει
    // request στην pouchdb
    let entryForDb = new VocabularyEntry("Γιώργος", "geo", 2);
    this.database.put(entryForDb, function callback(err, result) {
      if (!err) {
        console.info("Successfully added an entry:");
        console.info(result);
      }
    });
  }

  getNewVocabulary = (numberOfEntries, allSelectedEntries = []) => {
    let totalEntriesSelected = 0;

    let sortedVocabulary = this.sortGlobalVocabulary();

    let filteredVocabulary = sortedVocabulary.filter(entry => {
      if (allSelectedEntries.indexOf(entry) >= 0) {
        return false;
      } else {
        if (totalEntriesSelected >= numberOfEntries) {
          return false;
        } else {
          totalEntriesSelected += 1;
          return true;
        }
      }
    });

    let updatedVocabulary = filteredVocabulary.map(entry => {
      entry.selected();
      return entry;
    });

    return updatedVocabulary;
  };

  sortGlobalVocabulary = () => {
    return GLOBAL_VOC.sort(function(entry_a, entry_b) {
      return entry_a.totalTimesSelected - entry_b.totalTimesSelected;
    });
  };

  addNewEntry = (term, translation) => {
    let newEntry = new VocabularyEntry(term, translation, 0);
    GLOBAL_VOC.push(newEntry);
    return GLOBAL_VOC;
  };
}
