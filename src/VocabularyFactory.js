import VocabularyEntry from "./components/VocabularyEntry.js";
import PouchDB from "pouchdb";
PouchDB.plugin(require("pouchdb-find"));

export default class VocabularyFactory {
  constructor(app) {
    this.app = app;
    window.PouchDB = PouchDB; // for dev tools

    this.localVocDbName = "linguana_vocabulary";
    // this.remoteVocDbName = "http://83.212.105.237:5984/" + this.localVocDbName;
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

  newVocabularyNeeded = (onSuccess, numberOfEntries, allSelectedEntries = [], currentIndex = 0) => {
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

  oldVocabularyNeeded = (onSuccess, numberOfEntries, allSelectedEntries = [], currentIndex = 0) => {
    let allSelectedEntryIDs = allSelectedEntries.map(entry => {
      return entry._id;
    });
    let updatedVoc = [];

    this.localVocDb
      .createIndex({
        index: {
          fields: ["lastDateCorrectlyTranslated"]
        }
      })
      .then(() => {
        return this.localVocDb.find({
          selector: {
            _id: { $nin: allSelectedEntryIDs },
            lastDateCorrectlyTranslated: { $gt: -1 }
          },
          sort: [{ lastDateCorrectlyTranslated: "desc" }],
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

  constructNewVocabulary = vocFromDB => {
    let newVoc = vocFromDB.map(item => {
      return new VocabularyEntry(
        item._id,
        item._rev,
        item.nativeTerm,
        item.foreignTerm,
        item.foreignTermNotes,
        item.totalSuccesses,
        item.totalFailures,
        item.totalTimesSelected
      );
    });
    return newVoc;
  };

  addEntry = (nativeTerm, foreignTerm, foreignTermNotes, onSuccess, onFailure) => {
    let newEntry = new VocabularyEntry(null, null, nativeTerm, foreignTerm, foreignTermNotes, 0, 0, 0);
    this.localVocDb
      .put(newEntry)
      .then(response => {
        onSuccess(nativeTerm, foreignTerm, response);
      })
      .catch(error => {
        onFailure(nativeTerm, foreignTerm, error);
      });
  };

  extractVocDB = () => {
    this.localVocDb
      .find({
        selector: {
          _id: { $exists: "true" }
        }
      })
      .then(responseFromDb => {
        let v = this.constructNewVocabulary(responseFromDb.docs);
        this.extractVocabulary(v);
      })
      .catch(err => {
        console.error("error inside extractVocDB");
        console.error(err);
      });
  };

  extractVocabulary = voc => {
    console.info("************** extracting Vocabulary DB ****************");
    voc.map(entry => entry.extract());
    console.info("************** end of Vocabulary DB extraction ****************");
  };

  traceVocDB = () => {
    console.info("tracing vocabulary DB:");

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
        console.error("error inside traceDB");
        console.error(err);
      });
  };

  resetVocDB = () => {
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
        console.info(`${this.localVocDbName} DB has been reset`);
      })
      .catch(err => {
        console.error("error inside reset DB");
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
          fields: ["nativeTerm", "foreignTerm", "foreignTermNotes"]
        }
      })
      .then(() => {
        return this.localVocDb.find({
          selector: {
            $or: [
              { nativeTerm: { $regex: searchTermRegex } },
              { foreignTerm: { $regex: searchTermRegex } },
              { foreignTermNotes: { $regex: searchTermRegex } }
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

  seedVocDB = () => {
    this.localVocDb
      .bulkDocs([
        new VocabularyEntry("Ιουδαϊσμός-das Judentum", null, "Ιουδαϊσμός", "das Judentum", "", 5, 5, 5),
        new VocabularyEntry("Ισλάμ-der Islam", null, "Ισλάμ", "der Islam", "", 3, 1, 5),
        new VocabularyEntry("Χριστιανισμός-das Christentum", null, "Χριστιανισμός", "das Christentum", "", 4, 2, 5),
        new VocabularyEntry("άγνοια-das Unwissen", null, "άγνοια", "das Unwissen", "", 13, 6, 5),
        new VocabularyEntry("άγνοια-die Ignoranz", null, "άγνοια", "die Ignoranz", "adiaforia", 4, 5, 5),
        new VocabularyEntry("άνετος-bequem", null, "άνετος", "bequem", "", 13, 2, 2),
        new VocabularyEntry("άνοιξη-der Frühling", null, "άνοιξη", "der Frühling", "", 12, 3, 2),
        new VocabularyEntry("έντονα-intensiv", null, "έντονα", "intensiv", "hart", 0, 2, 4),
        new VocabularyEntry("αγχωτικό-stressig", null, "αγχωτικό", "stressig", "", 4, 1, 5),
        new VocabularyEntry("αμέτρητος-unzählig", null, "αμέτρητος", "unzählig", "", 11, 2, 2),
        new VocabularyEntry("αμελητέος-unwichtig", null, "αμελητέος", "unwichtig", "", 12, 3, 5)
        // new VocabularyEntry(
        //   "αν έχεις την καλοσύνη-sei so lieb und",
        //   null,
        //   "αν έχεις την καλοσύνη",
        //   "sei so lieb und",
        //   "could you please",
        //   2,
        //   1,
        //   5
        // ),
        // new VocabularyEntry("ανέκαθεν-stets", null, "ανέκαθεν", "stets", "", 6, 3, 5),
        // new VocabularyEntry("ανήκω-ablegen", null, "ανήκω", "ablegen", "", 7, 7, 4),
        // new VocabularyEntry("ανήκω-gehören", null, "ανήκω", "gehören", "", 1, 0, 4),
        // new VocabularyEntry("αναβαθμίζω-aufwerten", null, "αναβαθμίζω", "aufwerten", "", 13, 6, 2),
        // new VocabularyEntry("ανακαλύπτω-entdecken", null, "ανακαλύπτω", "entdecken", "", 0, 0, 5),
        // new VocabularyEntry("εξελίσσομαι-sich entwickeln", null, "εξελίσσομαι", "sich entwickeln", "", 14, 3, 2),
        // new VocabularyEntry("αντιδρώ-reagieren", null, "αντιδρώ", "reagieren", "", 8, 1, 1),
        // new VocabularyEntry("αντιμετωπίζω-bewältigen", null, "αντιμετωπίζω", "bewältigen", "", 11, 6, 4),
        // new VocabularyEntry("απαιτήσεις-die Anforderungen", null, "απαιτήσεις", "die Anforderungen", "", 6, 1, 4),
        // new VocabularyEntry("απευθύνομαι προς-sich richten an", null, "απευθύνομαι προς", "sich richten an", "+A", 20, 7, 5),
        // new VocabularyEntry("αποκτώ-erwerben", null, "αποκτώ", "erwerben", "", 8, 1, 1),
        // new VocabularyEntry("απολύω-entlassen entließ entlassen", null, "απολύω", "entlassen entließ entlassen", "3xr", 7, 3, 1),
        // new VocabularyEntry("αποτέλεσμα-das Ergebnis", null, "αποτέλεσμα", "das Ergebnis", "", 3, 5, 5),
        // new VocabularyEntry("αποτελούμαι από-bestehen aus", null, "αποτελούμαι από", "bestehen aus", "", 0, 0, 4),
        // new VocabularyEntry("αποφασίζω-beschließen", null, "αποφασίζω", "beschließen", "1 lexi", 5, 1, 4),
        // new VocabularyEntry("αποφασίζω-sich entschließen", null, "αποφασίζω", "sich entschließen", "aytopathes", 3, 3, 4),
        // new VocabularyEntry("αρακάς-die Erbsen", null, "αρακάς", "die Erbsen", "", 14, 2, 5),
        // new VocabularyEntry("αριθμητική ποσότητα-die Anzahl", null, "αριθμητική ποσότητα", "die Anzahl", "", 13, 5, 5),
        // new VocabularyEntry("αρνούμαι-sich weigern", null, "αρνούμαι", "sich weigern", "", 16, 6, 5),
        // new VocabularyEntry("ασήμαντος-unbedeutend", null, "ασήμαντος", "unbedeutend", "", 20, 5, 5),
        // new VocabularyEntry("ατομικό συμφέρον-das Eigeninteresse", null, "ατομικό συμφέρον", "das Eigeninteresse", "", 18, 7, 5),
        // new VocabularyEntry(
        //   "αυτό βασίζεται σε-es gründet sich auf",
        //   null,
        //   "αυτό βασίζεται σε",
        //   "es gründet sich auf",
        //   "+A",
        //   6,
        //   1,
        //   1
        // ),
        // new VocabularyEntry("αυτό μου θυμίζει-da fällt mir ein", null, "αυτό μου θυμίζει", "da fällt mir ein", "", 3, 2, 3),
        // new VocabularyEntry("αόρατος-unsichtbar", null, "αόρατος", "unsichtbar", "", 10, 1, 1),
        // new VocabularyEntry("βρίζω-beschimpfen", null, "βρίζω", "beschimpfen", "#vorurteile", 18, 5, 5),
        // new VocabularyEntry("βρίσκω-finden fand gefunden", null, "βρίσκω", "finden fand gefunden", "3xr", 8, 1, 1),
        // new VocabularyEntry(
        //   "γεμίζω τις μπαταρίες-die batterien aufladen",
        //   null,
        //   "γεμίζω τις μπαταρίες",
        //   "die batterien aufladen",
        //   "",
        //   12,
        //   7,
        //   5
        // ),
        // new VocabularyEntry("γεμιστά-gefülte Paprika und Tomaten", null, "γεμιστά", "gefülte Paprika und Tomaten", "", 9, 3, 5),
        // new VocabularyEntry("γεύμα-die Mahlzeit", null, "γεύμα", "die Mahlzeit", "", 11, 3, 5),
        // new VocabularyEntry("γιά να δούμε-mal sehen", null, "γιά να δούμε", "mal sehen", "", 11, 3, 5),
        // new VocabularyEntry("γνώση-die Ahnung", null, "γνώση", "die Ahnung", "", 3, 2, 3),
        // new VocabularyEntry("δίνω τη δυνατότητα-ermöglichen", null, "δίνω τη δυνατότητα", "ermöglichen", "", 5, 1, 3),
        // new VocabularyEntry("δαπανηρός-kostspielig", null, "δαπανηρός", "kostspielig", "", 11, 2, 5),
        // new VocabularyEntry(
        //   "δεν είναι κάτι το φοβερό-so schlimm ist es auch nicht",
        //   null,
        //   "δεν είναι κάτι το φοβερό",
        //   "so schlimm ist es auch nicht",
        //   "",
        //   9,
        //   11,
        //   5
        // ),
        // new VocabularyEntry("δημιουργώ-schöpfen", null, "δημιουργώ", "schöpfen", "", 5, 1, 1),
        // new VocabularyEntry(
        //   "δημόσιο συμφέρον-das öffentliche Interesse",
        //   null,
        //   "δημόσιο συμφέρον",
        //   "das öffentliche Interesse",
        //   "",
        //   18,
        //   6,
        //   5
        // ),
        // new VocabularyEntry("διαλέγω-aussuchen", null, "διαλέγω", "aussuchen", "", 23, 4, 5),
        // new VocabularyEntry("διανέμω-verteilen", null, "διανέμω", "verteilen", "", 7, 4, 3),
        // new VocabularyEntry("διατήρηση-die Erhaltung", null, "διατήρηση", "die Erhaltung", "", 16, 7, 5),
        // new VocabularyEntry("διεξοδικά-ausführlich", null, "διεξοδικά", "ausführlich", "gründlich, ausgiebig", 5, 1, 1),
        // new VocabularyEntry("διευρύνω-erweitern", null, "διευρύνω", "erweitern", "", 6, 1, 1),
        // new VocabularyEntry(
        //   "είμαι αντιμέτωπος με-ich bin konfrontiert mit",
        //   null,
        //   "είμαι αντιμέτωπος με",
        //   "ich bin konfrontiert mit",
        //   "",
        //   7,
        //   2,
        //   3
        // ),
        // new VocabularyEntry("εδώ και πολύ καιρό-seit lange", null, "εδώ και πολύ καιρό", "seit lange", "", 5, 1, 1),
        // new VocabularyEntry("εικάζω-ich gehe davon aus, dass", null, "εικάζω", "ich gehe davon aus, dass", "", 14, 6, 5),
        // new VocabularyEntry("εκφράζομαι-sich äußern", null, "εκφράζομαι", "sich äußern", "", 5, 2, 1),
        // new VocabularyEntry("ελπίζοντας-hoffentlich", null, "ελπίζοντας", "hoffentlich", "hopefully", 7, 2, 3),
        // new VocabularyEntry("εμπλουτίζω-bereichern", null, "εμπλουτίζω", "bereichern", "", 18, 5, 5),
        // new VocabularyEntry("εξαιρετικά-ausgezeichnet", null, "εξαιρετικά", "ausgezeichnet", "", 6, 3, 3),
        // new VocabularyEntry("εξελίσσω-entwickeln", null, "εξελίσσω", "entwickeln", "", 9, 1, 1),
        // new VocabularyEntry("εξυπηρετώ-dienen", null, "εξυπηρετώ", "dienen", "", 7, 2, 3),
        // new VocabularyEntry("επίσης-wie auch", null, "επίσης", "wie auch", "as well as", 9, 1, 1),
        // new VocabularyEntry("επείγον-dringend", null, "επείγον", "dringend", "", 7, 2, 3),
        // new VocabularyEntry("επιλέγω-wählen", null, "επιλέγω", "wählen", "aussuchen", 18, 5, 5),
        // new VocabularyEntry("επιμόρφωση-die Fortbildung", null, "επιμόρφωση", "die Fortbildung", "", 9, 1, 1),
        // new VocabularyEntry("επιφύλαξη-der Vorbehalt", null, "επιφύλαξη", "der Vorbehalt", "#vorurteile", 29, 8, 5),
        // new VocabularyEntry("εργαλείο-das Werkzeug", null, "εργαλείο", "das Werkzeug", "", 7, 2, 3),
        // new VocabularyEntry("ευσυνείδητος-gewissenhaft", null, "ευσυνείδητος", "gewissenhaft", "", 8, 2, 1),
        // new VocabularyEntry("εφημερίδα-die Zeitung", null, "εφημερίδα", "die Zeitung", "", 4, 1, 1),
        // new VocabularyEntry("ζώδιο-das Sternzeichen", null, "ζώδιο", "das Sternzeichen", "", 16, 8, 5),
        // new VocabularyEntry("θεωρείται σίγουρο-es gilt als Sicher", null, "θεωρείται σίγουρο", "es gilt als Sicher", "", 8, 2, 1),
        // new VocabularyEntry("ιδιοκτήτης-der Besitzer", null, "ιδιοκτήτης", "der Besitzer", "der Inhaber", 15, 6, 5),
        // new VocabularyEntry("ιδιοκτήτης-der Inhaber", null, "ιδιοκτήτης", "der Inhaber", "der Besitzer", 13, 3, 5),
        // new VocabularyEntry("κέρμα-die Münze", null, "κέρμα", "die Münze", "", 15, 4, 5),
        // new VocabularyEntry("καλά να πάθεις-selber schuld", null, "καλά να πάθεις", "selber schuld", "", 16, 4, 5),
        // new VocabularyEntry("κατάσταση-der Zustand", null, "κατάσταση", "der Zustand", "", 8, 2, 1),
        // new VocabularyEntry("καταδικάζω-verurteilen", null, "καταδικάζω", "verurteilen", "", 14, 4, 5),
        // new VocabularyEntry("καταννοώ-nachvollziehen", null, "καταννοώ", "nachvollziehen", "comprehend, relate to", 19, 5, 5),
        // new VocabularyEntry("κατόπιν-anschließend", null, "κατόπιν", "anschließend", "danach", 6, 2, 3),
        // new VocabularyEntry("κιμάς-das Hackfleisch", null, "κιμάς", "das Hackfleisch", "", 13, 5, 5),
        // new VocabularyEntry("κοιμάμαι διεξοδικά-ausschlafen", null, "κοιμάμαι διεξοδικά", "ausschlafen", "", 9, 4, 5),
        // new VocabularyEntry(
        //   "κοινό συμφέρον-das gemeine Interesse",
        //   null,
        //   "κοινό συμφέρον",
        //   "das gemeine Interesse",
        //   "",
        //   16,
        //   6,
        //   5
        // ),
        // new VocabularyEntry("κοντός-kurz", null, "κοντός", "kurz", "", 4, 1, 1),
        // new VocabularyEntry("κουράγιο-durchhalten", null, "κουράγιο", "durchhalten", "", 11, 4, 5),
        // new VocabularyEntry("κρίνω-beurteilen", null, "κρίνω", "beurteilen", "1 lexi", 11, 4, 5),
        // new VocabularyEntry("κρίνω-urteilen über", null, "κρίνω", "urteilen über", "#vorurteile     +A    2 lexeis", 13, 4, 5),
        // new VocabularyEntry("κρεμώ-anhängen", null, "κρεμώ", "anhängen", "", 5, 1, 3),
        // new VocabularyEntry("λέγεται-es wird gesagt", null, "λέγεται", "es wird gesagt", "", 13, 3, 5),
        // new VocabularyEntry("λαμβάνω-erhalten", null, "λαμβάνω", "erhalten", "", 16, 7, 3),
        // new VocabularyEntry("μάλλον-eher", null, "μάλλον", "eher", "", 8, 1, 3),
        // new VocabularyEntry(
        //   "μία πληθώρα στήριξης-eine Vielfalt an Unterstützung",
        //   null,
        //   "μία πληθώρα στήριξης",
        //   "eine Vielfalt an Unterstützung",
        //   "",
        //   5,
        //   4,
        //   3
        // ),
        // new VocabularyEntry(
        //   "με μια πρώτη ματιά-auf den ersten Blick",
        //   null,
        //   "με μια πρώτη ματιά",
        //   "auf den ersten Blick",
        //   "",
        //   12,
        //   7,
        //   5
        // ),
        // new VocabularyEntry(
        //   "με τη στενότερη έννοια-im engeren Sinne",
        //   null,
        //   "με τη στενότερη έννοια",
        //   "im engeren Sinne",
        //   "",
        //   11,
        //   5,
        //   5
        // ),
        // new VocabularyEntry("μειονότητα-die Minderheit", null, "μειονότητα", "die Minderheit", "#vorurteile", 9, 5, 5),
        // new VocabularyEntry("μεταφορτώνω-hochladen", null, "μεταφορτώνω", "hochladen", "upload", 10, 2, 5),
        // new VocabularyEntry("μεταφορτώνω-runterladen", null, "μεταφορτώνω", "runterladen", "download", 10, 2, 5),
        // new VocabularyEntry("μποτιλιάρισμα-der Stau", null, "μποτιλιάρισμα", "der Stau", "", 6, 2, 3),
        // new VocabularyEntry("μόλις-sobald", null, "μόλις", "sobald", "", 11, 4, 5),
        // new VocabularyEntry("ξεκουράζομαι-sich entspannen", null, "ξεκουράζομαι", "sich entspannen", "", 8, 5, 5),
        // new VocabularyEntry("ξυπνώ-aufwachen", null, "ξυπνώ", "aufwachen", "", 15, 4, 5),
        // new VocabularyEntry("οδηγώ-fahren fuhr ist gefahren", null, "οδηγώ", "fahren fuhr ist gefahren", "3xr", 8, 2, 1),
        // new VocabularyEntry("οφείλω-schulden", null, "οφείλω", "schulden", "", 8, 1, 1),
        // new VocabularyEntry(
        //   "οφείλεται στο ότι-es liegt daran, dass",
        //   null,
        //   "οφείλεται στο ότι",
        //   "es liegt daran, dass",
        //   "",
        //   4,
        //   9,
        //   5
        // ),
        // new VocabularyEntry("ούτε εγώ-noch ich", null, "ούτε εγώ", "noch ich", "me neither", 10, 2, 5),
        // new VocabularyEntry("ούτως ή άλλως-ohnerin", null, "ούτως ή άλλως", "ohnerin", "sowieso", 3, 2, 3),
        // new VocabularyEntry("ούτως ή άλλως-sowieso", null, "ούτως ή άλλως", "sowieso", "ohnerin", 6, 1, 3),
        // new VocabularyEntry("παράκληση-das Anliegen", null, "παράκληση", "das Anliegen", "", 7, 1, 1),
        // new VocabularyEntry("παράσταση-die Aufführung", null, "παράσταση", "die Aufführung", "", 6, 2, 3),
        // new VocabularyEntry("παρέρχομαι-vergehen", null, "παρέρχομαι", "vergehen", "", 7, 1, 1),
        // new VocabularyEntry(
        //   "μπορώ να έχω την προσοχή σας παρακαλώ-darf ich um ihre Aufmerksamkeit bitten",
        //   null,
        //   "μπορώ να έχω την προσοχή σας παρακαλώ",
        //   "darf ich um ihre Aufmerksamkeit bitten",
        //   "",
        //   6,
        //   3,
        //   1
        // ),
        // new VocabularyEntry("παραπληροφόρηση-die Misinformation", null, "παραπληροφόρηση", "die Misinformation", "", 13, 7, 5),
        // new VocabularyEntry("παρόμοιος-ähnlich", null, "παρόμοιος", "ähnlich", "", 10, 4, 5),
        // new VocabularyEntry("πεπεισμένος-überzeugt", null, "πεπεισμένος", "überzeugt", "", 7, 1, 1),
        // new VocabularyEntry("περίγυρος-das Umfeld", null, "περίγυρος", "das Umfeld", "", 8, 2, 3),
        // new VocabularyEntry(
        //   "πιστοποιητικά εργασίας-die Arbeitzeugnisse",
        //   null,
        //   "πιστοποιητικά εργασίας",
        //   "die Arbeitzeugnisse",
        //   "",
        //   4,
        //   0,
        //   3
        // ),
        // new VocabularyEntry("ποσότητα-die Menge", null, "ποσότητα", "die Menge", "", 2, 0, 3),
        // new VocabularyEntry("ποτέ ως τώρα-noch nie", null, "ποτέ ως τώρα", "noch nie", "", 6, 1, 1),
        // new VocabularyEntry("πουθενά-nirgends", null, "πουθενά", "nirgends", "", 7, 2, 1),
        // new VocabularyEntry("πράγματι-in der Tat", null, "πράγματι", "in der Tat", "indeed", 6, 1, 1),
        // new VocabularyEntry("πράξη-die Handlung", null, "πράξη", "die Handlung", "die Tat", 21, 7, 5),
        // new VocabularyEntry("πράξη-die Tat", null, "πράξη", "die Tat", "", 8, 2, 5),
        // new VocabularyEntry(
        //   "πρέπει να βγάλω λεφτά (από την τράπεζα)-ich muss Geld abheben",
        //   null,
        //   "πρέπει να βγάλω λεφτά (από την τράπεζα)",
        //   "ich muss Geld abheben",
        //   "",
        //   8,
        //   4,
        //   5
        // ),
        // new VocabularyEntry(
        //   "πρέπει να το ξανασκεφτώ-darüber muss ich noch mal nachdenken",
        //   null,
        //   "πρέπει να το ξανασκεφτώ",
        //   "darüber muss ich noch mal nachdenken",
        //   "",
        //   7,
        //   1,
        //   1
        // ),
        // new VocabularyEntry("προηγουμένως-vorher", null, "προηγουμένως", "vorher", "", 7, 1, 1),
        // new VocabularyEntry("προηγούμενος-ehemalig", null, "προηγούμενος", "ehemalig", "", 7, 2, 3),
        // new VocabularyEntry("προκατάληψη-das Vorurteil", null, "προκατάληψη", "das Vorurteil", "", 19, 4, 4),
        // new VocabularyEntry("προσθέτω-hinzufügen", null, "προσθέτω", "hinzufügen", "", 5, 1, 1),
        // new VocabularyEntry("προφανής-offenbar", null, "προφανής", "offenbar", "", 7, 2, 4),
        // new VocabularyEntry("πρωτοπόρος-führend", null, "πρωτοπόρος", "führend", "", 5, 1, 1),
        // new VocabularyEntry(
        //   "πρόσεχε καλά τα πράγματά μου-pass gut auf meine Sachen auf",
        //   null,
        //   "πρόσεχε καλά τα πράγματά μου",
        //   "pass gut auf meine Sachen auf",
        //   "",
        //   3,
        //   3,
        //   1
        // ),
        // new VocabularyEntry("πρόσφατα-vor kurzem", null, "πρόσφατα", "vor kurzem", "", 8, 1, 3),
        // new VocabularyEntry("πτυχίο-der Abschluss", null, "πτυχίο", "der Abschluss", "", 9, 4, 3),
        // new VocabularyEntry(
        //   "πόσο έχουμε σήμερα-der wievielte ist heute",
        //   null,
        //   "πόσο έχουμε σήμερα",
        //   "der wievielte ist heute",
        //   "",
        //   8,
        //   1,
        //   3
        // ),
        // new VocabularyEntry("σε σύγκριση με-im Vergleich zu", null, "σε σύγκριση με", "im Vergleich zu", "", 9, 3, 4),
        // new VocabularyEntry(
        //   "στάση προσδοκίας-die Erwartungshaltung",
        //   null,
        //   "στάση προσδοκίας",
        //   "die Erwartungshaltung",
        //   "#vorurteile",
        //   9,
        //   5,
        //   4
        // ),
        // new VocabularyEntry("στο πλαίσιο του-im Rahmen", null, "στο πλαίσιο του", "im Rahmen", "+ genitif", 7, 4, 4),
        // new VocabularyEntry(
        //   "στρέφομαι εναντίον-sich richten gegen",
        //   null,
        //   "στρέφομαι εναντίον",
        //   "sich richten gegen",
        //   "",
        //   9,
        //   5,
        //   4
        // ),
        // new VocabularyEntry("στόχος-das Ziel", null, "στόχος", "das Ziel", "", 7, 2, 3),
        // new VocabularyEntry("συγγενής-der Verwandt", null, "συγγενής", "der Verwandt", "", 6, 8, 4),
        // new VocabularyEntry("συζητώ-besprechen", null, "συζητώ", "besprechen", "", 5, 1, 1),
        // new VocabularyEntry("συλλέγω-sammeln", null, "συλλέγω", "sammeln", "", 5, 2, 4),
        // new VocabularyEntry("συμβάλλω-beitragen zu", null, "συμβάλλω", "beitragen zu", "", 6, 4, 4),
        // new VocabularyEntry("συμβάν-das Ereignis", null, "συμβάν", "das Ereignis", "", 11, 3, 4),
        // new VocabularyEntry("συμβουλή-der Hinweis", null, "συμβουλή", "der Hinweis", "rat", 13, 3, 3),
        // new VocabularyEntry("συμβουλή-der Rat", null, "συμβουλή", "der Rat", "hinweis", 3, 1, 3),
        // new VocabularyEntry("συμμορφώνομαι με-sich richten nach", null, "συμμορφώνομαι με", "sich richten nach", "", 14, 3, 4),
        // new VocabularyEntry("συμπληρώνω-ergänzen", null, "συμπληρώνω", "ergänzen", "", 4, 2, 4),
        // new VocabularyEntry("συστατική-der Betreff", null, "συστατική", "der Betreff", "reference", 12, 2, 3),
        // new VocabularyEntry("σχεδόν ποτέ-so gut wie nie", null, "σχεδόν ποτέ", "so gut wie nie", "", 5, 1, 1),
        // new VocabularyEntry("σωστά-richtig", null, "σωστά", "richtig", "", 3, 2, 1),
        // new VocabularyEntry("τέτοιος-solcher", null, "τέτοιος", "solcher", "", 4, 3, 4),
        // new VocabularyEntry("ταιριάζω με-passen zu", null, "ταιριάζω με", "passen zu", "", 5, 2, 1),
        // new VocabularyEntry("το ΑΤΜ-der Geldautomat", null, "το ΑΤΜ", "der Geldautomat", "", 13, 7, 4),
        // new VocabularyEntry("τουλάχιστον-immerhin", null, "τουλάχιστον", "immerhin", "at least, wenigstens", 20, 3, 4),
        // new VocabularyEntry("τουλάχιστον-wenigstens", null, "τουλάχιστον", "wenigstens", "at least, immerhin", 12, 2, 4),
        // new VocabularyEntry("τόπος προέλευσης-der Herkunftsort", null, "τόπος προέλευσης", "der Herkunftsort", "", 10, 5, 4),
        // new VocabularyEntry("τώρα-nun", null, "τώρα", "nun", "", 7, 1, 3),
        // new VocabularyEntry("υπερβολικά-überaus", null, "υπερβολικά", "überaus", "", 16, 2, 4),
        // new VocabularyEntry("υπεύθυνος για-verantwortlich für", null, "υπεύθυνος για", "verantwortlich für", "", 8, 3, 4),
        // new VocabularyEntry(
        //   "υπόθεση εργασίας-die Arbeitshypothese",
        //   null,
        //   "υπόθεση εργασίας",
        //   "die Arbeitshypothese",
        //   "#vorurteile",
        //   9,
        //   3,
        //   4
        // ),
        // new VocabularyEntry("φακές-die Linsen", null, "φακές", "die Linsen", "", 7, 2, 4),
        // new VocabularyEntry("φασόλια-die Bohnen", null, "φασόλια", "die Bohnen", "", 6, 1, 4),
        // new VocabularyEntry("φθινόπωρο-der Herbst", null, "φθινόπωρο", "der Herbst", "", 5, 1, 1),
        // new VocabularyEntry("φτωχός-arm", null, "φτωχός", "arm", "", 7, 4, 4),
        // new VocabularyEntry("φόβος-die Angst", null, "φόβος", "die Angst", "die Furcht", 8, 2, 4),
        // new VocabularyEntry("φόβος-die Furcht", null, "φόβος", "die Furcht", "die Angst", 16, 3, 4),
        // new VocabularyEntry(
        //   "χάνω-verlieren verlor verloren",
        //   null,
        //   "χάνω",
        //   "verlieren verlor verloren",
        //   "3xr (px gialia)",
        //   5,
        //   1,
        //   1
        // ),
        // new VocabularyEntry("χαλαρώνω-sich fallen lassen", null, "χαλαρώνω", "sich fallen lassen", "", 5, 1, 4),
        // new VocabularyEntry("χαμηλός-niedrig", null, "χαμηλός", "niedrig", "", 5, 2, 3),
        // new VocabularyEntry(
        //   "χρησιμοποιώ-verwenden",
        //   null,
        //   "χρησιμοποιώ",
        //   "verwenden",
        //   "nutzen, benutzen, einsetzen, verwenden, anwenden",
        //   8,
        //   1,
        //   1
        // ),
        // new VocabularyEntry("χρώμα δέρματος-die Hautfarbe", null, "χρώμα δέρματος", "die Hautfarbe", "", 12, 4, 4),
        // new VocabularyEntry("όπως και-sowie", null, "όπως και", "sowie", "as well as", 4, 2, 3),
        // new VocabularyEntry("όχι ιδιαίτερα-nicht allzu", null, "όχι ιδιαίτερα", "nicht allzu", "nicht besonders", 8, 1, 4)
      ])
      .then(() => console.info(`${this.localVocDbName} DB seeded`))
      .catch(err => {
        console.error("error inside seed DB");
        console.error(err);
      });
  };
}
