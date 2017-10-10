import VocabularyEntry from "./components/VocabularyEntry.js";
import PouchDB from "pouchdb";
PouchDB.plugin(require("pouchdb-find"));

export default class VocabularyFactory {
  constructor(app) {
    this.app = app;
    window.PouchDB = PouchDB; // for dev tools

    this.localVocDbName = "linguana_vocabulary";
    this.remoteVocDbName = "http://83.212.105.237:5984/" + this.localVocDbName;
    // this.remoteVocDbName = "http://localhost:5984/" + this.localVocDbName;
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
          fields: ["totalTimesSelected", "lastDateCorrectlyTranslated"]
        }
      })
      .then(() => {
        return this.localVocDb.find({
          selector: {
            _id: { $nin: allSelectedEntryIDs },
            totalTimesSelected: { $gt: -1 },
            lastDateCorrectlyTranslated: { $gt: -1 }
          },
          sort: [{ totalTimesSelected: "asc" }, { lastDateCorrectlyTranslated: "asc" }],
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
          fields: ["lastDateCorrectlyTranslated", "totalTimesSelected"]
        }
      })
      .then(() => {
        return this.localVocDb.find({
          selector: {
            _id: { $nin: allSelectedEntryIDs },
            lastDateCorrectlyTranslated: { $gt: -1 },
            totalTimesSelected: { $gt: -1 }
          },
          sort: [{ lastDateCorrectlyTranslated: "asc" }, { totalTimesSelected: "asc" }],
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
        item.totalTimesSelected,
        item.lastDateCorrectlyTranslated
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

  editEntry = changedEntry => {
    this.localVocDb
      .put(changedEntry)
      .then(response => {
        console.info(`Just edited successfully an entry in DB! newValidEntry:`);
        console.info(changedEntry);
      })
      .catch(err => {
        console.error("error inside editEntry:");
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

  extractVocDB = () => {
    this.localVocDb
      .createIndex({
        index: {
          fields: ["foreignTerm"]
        }
      })
      .then(() => {
        return this.localVocDb.find({
          selector: {
            $and: [{ _id: { $exists: "true" } }, { foreignTerm: { $gt: -1 } }]
          },
          sort: [{ foreignTerm: "asc" }]
        });
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

  constructDownloadDbString = (stringArray, onSuccess) => {
    this.localVocDb
      .find({
        selector: {
          _id: { $exists: "true" }
        }
      })
      .then(responseFromDb => {
        let voc = this.constructNewVocabulary(responseFromDb.docs);
        let downloadString = this.constructVocabularyDownloadString(voc, stringArray);
        onSuccess(downloadString);
      })
      .catch(err => {
        console.error("error inside voc constructDownloadDbString");
        console.error(err);
      });
  };

  constructVocabularyDownloadString = (voc, stringArray) => {
    voc.map(entry => entry.constructDownloadString(stringArray));
    return stringArray;
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
    console.info(`Total number of entries: ${voc.length}`);
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
        new VocabularyEntry("ablegen_ανήκω", null, "ανήκω", "ablegen", "", 7, 7, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("anhalten_σταματώ", null, "σταματώ", "anhalten", "", 7, 1, 1, "2017-09-28T05:56:23.225Z"),
        new VocabularyEntry("anhängen_κρεμώ", null, "κρεμώ", "anhängen", "", 5, 1, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("anlegen_διαμορφώνω", null, "διαμορφώνω", "anlegen", "", 12, 2, 2, "2017-09-30T13:18:28.583Z"),
        new VocabularyEntry(
          "anschließend_κατόπιν",
          null,
          "κατόπιν",
          "anschließend",
          "danach",
          6,
          2,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("anziehen_φορώ", null, "φορώ", "anziehen", "", 9, 1, 1, "2017-09-28T05:58:33.849Z"),
        new VocabularyEntry("arm_φτωχός", null, "φτωχός", "arm", "", 7, 4, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "auf den ersten Blick_με μια πρώτη ματιά",
          null,
          "με μια πρώτη ματιά",
          "auf den ersten Blick",
          "",
          12,
          7,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("aufräumen_συμμαζεύω", null, "συμμαζεύω", "aufräumen", "", 9, 1, 1, "2017-09-28T05:58:14.801Z"),
        new VocabularyEntry(
          "aufs Land ziehen_μετακομίζω στην επαρχία",
          null,
          "μετακομίζω στην επαρχία",
          "aufs Land ziehen",
          "",
          7,
          1,
          2,
          "2017-09-30T13:21:09.082Z"
        ),
        new VocabularyEntry("aufwachen_ξυπνώ", null, "ξυπνώ", "aufwachen", "", 15, 4, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("aufwerten_αναβαθμίζω", null, "αναβαθμίζω", "aufwerten", "", 18, 8, 3, "2017-09-25T05:31:02.190Z"),
        new VocabularyEntry(
          "ausführlich_διεξοδικά",
          null,
          "διεξοδικά",
          "ausführlich",
          "gründlich, ausgiebig",
          8,
          2,
          3,
          "2017-09-25T05:35:29.239Z"
        ),
        new VocabularyEntry(
          "ausgezeichnet_εξαιρετικά",
          null,
          "εξαιρετικά",
          "ausgezeichnet",
          "",
          8,
          5,
          4,
          "2017-09-26T06:26:10.632Z"
        ),
        new VocabularyEntry(
          "ausschlafen_κοιμάμαι διεξοδικά",
          null,
          "κοιμάμαι διεξοδικά",
          "ausschlafen",
          "",
          9,
          4,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("aussuchen_διαλέγω", null, "διαλέγω", "aussuchen", "", 23, 4, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("begleiten_συνοδεύω", null, "συνοδεύω", "begleiten", "", 9, 2, 1, "2017-09-28T05:58:17.769Z"),
        new VocabularyEntry("behalten_επιβαρύνω", null, "επιβαρύνω", "behalten", "", 9, 4, 2, "2017-09-28T11:54:25.668Z"),
        new VocabularyEntry("beitragen zu_συμβάλλω", null, "συμβάλλω", "beitragen zu", "", 6, 4, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "belasten_επιβαρύνω",
          null,
          "επιβαρύνω",
          "belasten",
          "behalten",
          11,
          2,
          2,
          "2017-09-28T07:22:15.651Z"
        ),
        new VocabularyEntry("bequem_άνετος", null, "άνετος", "bequem", "", 16, 3, 3, "2017-09-25T05:30:04.648Z"),
        new VocabularyEntry("bereichern_εμπλουτίζω", null, "εμπλουτίζω", "bereichern", "", 18, 5, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("bereits_ήδη", null, "ήδη2", "bereits13", "", 11, 1, 3, "2017-10-02T08:05:45.344Z"),
        new VocabularyEntry(
          "beschimpfen_βρίζω",
          null,
          "βρίζω",
          "beschimpfen",
          "#vorurteile",
          18,
          5,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "beschließen_αποφασίζω",
          null,
          "αποφασίζω",
          "beschließen",
          "1 lexi",
          5,
          1,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("besprechen_συζητώ", null, "συζητώ", "besprechen", "", 12, 3, 3, "2017-09-26T06:22:33.320Z"),
        new VocabularyEntry(
          "bestehen aus_αποτελούμαι από",
          null,
          "αποτελούμαι από",
          "bestehen aus",
          "",
          0,
          0,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("bestimmt_βεβαίως", null, "βεβαίως", "bestimmt", "", 14, 3, 2, "2017-09-28T07:22:39.995Z"),
        new VocabularyEntry("beurteilen_κρίνω", null, "κρίνω", "beurteilen", "1 lexi", 11, 4, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "bewältigen_αντιμετωπίζω",
          null,
          "αντιμετωπίζω",
          "bewältigen",
          "",
          11,
          6,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("bezahlen_πληρώνω", null, "πληρώνω", "bezahlen", "", 9, 2, 2, "2017-10-02T08:19:15.145Z"),
        new VocabularyEntry(
          "biegen Sie hier links ab_στρίψτε εδώ αριστερά",
          null,
          "στρίψτε εδώ αριστερά",
          "biegen Sie hier links ab",
          "",
          6,
          1,
          1,
          "2017-09-28T05:58:11.073Z"
        ),
        new VocabularyEntry(
          "da fällt mir ein_αυτό μου θυμίζει",
          null,
          "αυτό μου θυμίζει",
          "da fällt mir ein",
          "",
          6,
          4,
          4,
          "2017-09-26T06:22:42.232Z"
        ),
        new VocabularyEntry(
          "darf ich um ihre Aufmerksamkeit bitten_μπορώ να έχω την προσοχή σας παρακαλώ",
          null,
          "μπορώ να έχω την προσοχή σας παρακαλώ",
          "darf ich um ihre Aufmerksamkeit bitten",
          "",
          8,
          5,
          3,
          "2017-09-25T05:51:14.263Z"
        ),
        new VocabularyEntry(
          "darüber muss ich noch mal nachdenken_πρέπει να το ξανασκεφτώ",
          null,
          "πρέπει να το ξανασκεφτώ",
          "darüber muss ich noch mal nachdenken",
          "",
          14,
          3,
          3,
          "2017-09-25T05:06:04.938Z"
        ),
        new VocabularyEntry(
          "das Anliegen_παράκληση",
          null,
          "παράκληση",
          "das Anliegen",
          "",
          16,
          2,
          3,
          "2017-09-25T05:06:19.321Z"
        ),
        new VocabularyEntry(
          "das Ausland_εξωτερικό χώρας",
          null,
          "εξωτερικό χώρας",
          "das Ausland",
          "abroad",
          2,
          3,
          3,
          "2017-10-02T08:11:03.098Z"
        ),
        new VocabularyEntry("das Blatt_φύλλο", null, "φύλλο", "das Blatt", "", 4, 1, 1, "2017-09-28T07:17:46.851Z"),
        new VocabularyEntry(
          "das Christentum_Χριστιανισμός",
          null,
          "Χριστιανισμός",
          "das Christentum",
          "",
          4,
          2,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "das Eigeninteresse_ατομικό συμφέρον",
          null,
          "ατομικό συμφέρον",
          "das Eigeninteresse",
          "",
          18,
          7,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("das Ereignis_συμβάν", null, "συμβάν", "das Ereignis", "", 11, 3, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "das Ergebnis_αποτέλεσμα",
          null,
          "αποτέλεσμα",
          "das Ergebnis",
          "",
          3,
          5,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "das Geschirr_τα πιατικά",
          null,
          "τα πιατικά",
          "das Geschirr",
          "",
          6,
          1,
          1,
          "2017-09-28T05:58:23.369Z"
        ),
        new VocabularyEntry("das Gewicht_βάρος", null, "βάρος", "das Gewicht", "", 6, 3, 2, "2017-09-28T07:17:39.731Z"),
        new VocabularyEntry("das Hackfleisch_κιμάς", null, "κιμάς", "das Hackfleisch", "", 13, 5, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("das Hemd_πουκάμισο", null, "πουκάμισο", "das Hemd", "", 9, 2, 2, "2017-10-02T08:19:17.514Z"),
        new VocabularyEntry(
          "das Judentum_Ιουδαϊσμός",
          null,
          "Ιουδαϊσμός",
          "das Judentum",
          "",
          5,
          5,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "das Sondierungsgespräch_διερευνητική συζήτηση",
          null,
          "διερευνητική συζήτηση",
          "das Sondierungsgespräch",
          "",
          5,
          1,
          3,
          "2017-10-02T08:10:56.697Z"
        ),
        new VocabularyEntry(
          "das Sternzeichen_ζώδιο",
          null,
          "ζώδιο",
          "das Sternzeichen",
          "",
          16,
          8,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("das Umfeld_περίγυρος", null, "περίγυρος", "das Umfeld", "", 13, 4, 4, "2017-09-28T07:22:31.139Z"),
        new VocabularyEntry("das Unwissen_άγνοια", null, "άγνοια", "das Unwissen", "", 13, 6, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "das Verhandlungsgespräch_διαπραγματευτική συζήτηση",
          null,
          "διαπραγματευτική συζήτηση",
          "das Verhandlungsgespräch",
          "",
          13,
          1,
          3,
          "2017-10-02T08:06:29.851Z"
        ),
        new VocabularyEntry(
          "das Vorurteil_προκατάληψη",
          null,
          "προκατάληψη",
          "das Vorurteil",
          "",
          19,
          4,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("das Werkzeug_εργαλείο", null, "εργαλείο", "das Werkzeug", "", 7, 2, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("das Ziel_στόχος", null, "στόχος", "das Ziel", "", 13, 3, 4, "2017-10-02T08:15:25.489Z"),
        new VocabularyEntry(
          "das Zugeständnis_παραχώρηση",
          null,
          "παραχώρηση",
          "das Zugeständnis",
          "",
          20,
          4,
          2,
          "2017-09-30T13:27:35.752Z"
        ),
        new VocabularyEntry(
          "das gemeine Interesse_κοινό συμφέρον",
          null,
          "κοινό συμφέρον",
          "das gemeine Interesse",
          "",
          16,
          6,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "das öffentliche Interesse_δημόσιο συμφέρον",
          null,
          "δημόσιο συμφέρον",
          "das öffentliche Interesse",
          "",
          18,
          6,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("dennoch_παρόλα αυτά", null, "παρόλα αυτά", "dennoch", "", 10, 2, 2, "2017-10-02T08:15:39.634Z"),
        new VocabularyEntry("der Abschluss_πτυχίο", null, "πτυχίο", "der Abschluss", "", 13, 5, 4, "2017-10-02T08:11:06.657Z"),
        new VocabularyEntry(
          "der Aktenkoffer_χαρτοφύλακας",
          null,
          "χαρτοφύλακας",
          "der Aktenkoffer",
          "",
          4,
          1,
          1,
          "2017-09-28T07:17:52.931Z"
        ),
        new VocabularyEntry("der Anzug_κοστούμι", null, "κοστούμι", "der Anzug", "", 7, 2, 2, "2017-10-02T08:10:40.161Z"),
        new VocabularyEntry(
          "der Besitzer_ιδιοκτήτης",
          null,
          "ιδιοκτήτης",
          "der Besitzer",
          "der Inhaber",
          15,
          6,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "der Betreff_συστατική",
          null,
          "συστατική",
          "der Betreff",
          "reference",
          16,
          3,
          4,
          "2017-10-02T08:19:06.378Z"
        ),
        new VocabularyEntry(
          "der Betrieb_επιχείρηση",
          null,
          "επιχείρηση",
          "der Betrieb",
          "",
          11,
          2,
          2,
          "2017-09-28T07:22:18.252Z"
        ),
        new VocabularyEntry("der Bewohner_κάτοικος", null, "κάτοικος", "der Bewohner", "", 16, 3, 2, "2017-10-02T08:04:36.048Z"),
        new VocabularyEntry("der Frühling_άνοιξη", null, "άνοιξη", "der Frühling", "", 16, 4, 4, "2017-09-26T06:22:37.832Z"),
        new VocabularyEntry("überaus_υπερβολικά", null, "υπερβολικά", "überaus", "", 16, 2, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("überzeugt_πεπεισμένος", null, "πεπεισμένος", "überzeugt", "", 22, 3, 3, "2017-09-26T06:22:54.143Z")
      ])
      .then(() => console.info(`${this.localVocDbName} DB seeded`))
      .catch(err => {
        console.error("error inside seed DB");
        console.error(err);
      });
  };
}
