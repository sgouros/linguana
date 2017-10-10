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
        new VocabularyEntry(
          "der Geldautomat_το ΑΤΜ",
          null,
          "το ΑΤΜ",
          "der Geldautomat",
          "",
          13,
          7,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("der Herbst_φθινόπωρο", null, "φθινόπωρο", "der Herbst", "", 12, 3, 3, "2017-09-26T06:26:20.120Z"),
        new VocabularyEntry(
          "der Herkunftsort_τόπος προέλευσης",
          null,
          "τόπος προέλευσης",
          "der Herkunftsort",
          "",
          10,
          5,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("der Hinweis_συμβουλή", null, "συμβουλή", "der Hinweis", "rat", 20, 4, 4, "2017-10-02T08:15:29.537Z"),
        new VocabularyEntry("der Händler_έμπορος", null, "έμπορος", "der Händler", "", 8, 2, 2, "2017-09-28T07:18:00.899Z"),
        new VocabularyEntry(
          "der Inhaber_ιδιοκτήτης",
          null,
          "ιδιοκτήτης",
          "der Inhaber",
          "der Besitzer",
          13,
          3,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("der Islam_Ισλάμ", null, "Ισλάμ", "der Islam", "", 3, 1, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("der Kreis_κύκλος", null, "κύκλος", "der Kreis", "", 7, 2, 2, "2017-10-02T08:10:42.627Z"),
        new VocabularyEntry("der Rat_συμβουλή", null, "συμβουλή", "der Rat", "hinweis", 3, 1, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "der Schafskäse_τυρί φέτα",
          null,
          "τυρί φέτα",
          "der Schafskäse",
          "",
          4,
          3,
          1,
          "2017-09-28T05:58:28.689Z"
        ),
        new VocabularyEntry(
          "der Schein_χαρτονόμισμα",
          null,
          "χαρτονόμισμα",
          "der Schein",
          "",
          4,
          1,
          1,
          "2017-09-28T07:17:49.659Z"
        ),
        new VocabularyEntry("der Schlüssel_κλειδί", null, "κλειδί", "der Schlüssel", "", 16, 3, 2, "2017-10-02T08:04:51.089Z"),
        new VocabularyEntry("der Sportler_αθλητής", null, "αθλητής", "der Sportler", "", 7, 2, 2, "2017-09-28T07:17:36.236Z"),
        new VocabularyEntry(
          "der Stau_μποτιλιάρισμα",
          null,
          "μποτιλιάρισμα",
          "der Stau",
          "",
          10,
          3,
          4,
          "2017-09-28T07:17:55.115Z"
        ),
        new VocabularyEntry("der Verwandt_συγγενής", null, "συγγενής", "der Verwandt", "", 6, 8, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "der Vorbehalt_επιφύλαξη",
          null,
          "επιφύλαξη",
          "der Vorbehalt",
          "#vorurteile",
          29,
          8,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("der Zustand_κατάσταση", null, "κατάσταση", "der Zustand", "", 10, 3, 3, "2017-09-25T05:50:54.831Z"),
        new VocabularyEntry(
          "der wievielte ist heute_πόσο έχουμε σήμερα",
          null,
          "πόσο έχουμε σήμερα",
          "der wievielte ist heute",
          "",
          13,
          3,
          4,
          "2017-10-02T08:15:23.177Z"
        ),
        new VocabularyEntry("deutlich_σαφής", null, "σαφής", "deutlich", "", 8, 3, 1, "2017-09-27T21:03:09.641Z"),
        new VocabularyEntry("die Ahnung_γνώση", null, "γνώση", "die Ahnung", "", 7, 3, 4, "2017-09-26T06:22:45.711Z"),
        new VocabularyEntry(
          "die Anforderungen_απαιτήσεις",
          null,
          "απαιτήσεις",
          "die Anforderungen",
          "",
          6,
          1,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("die Angst_φόβος", null, "φόβος", "die Angst", "die Furcht", 8, 2, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "die Anzahl_αριθμητική ποσότητα",
          null,
          "αριθμητική ποσότητα",
          "die Anzahl",
          "",
          13,
          5,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "die Arbeitshypothese_υπόθεση εργασίας",
          null,
          "υπόθεση εργασίας",
          "die Arbeitshypothese",
          "#vorurteile",
          9,
          3,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "die Arbeitzeugnisse_πιστοποιητικά εργασίας",
          null,
          "πιστοποιητικά εργασίας",
          "die Arbeitzeugnisse",
          "",
          9,
          2,
          4,
          "2017-09-28T11:54:30.236Z"
        ),
        new VocabularyEntry(
          "die Aufführung_παράσταση",
          null,
          "παράσταση",
          "die Aufführung",
          "",
          11,
          4,
          4,
          "2017-09-28T07:22:27.516Z"
        ),
        new VocabularyEntry("die Augen_μάτια", null, "μάτια", "die Augen", "", 6, 3, 2, "2017-10-02T08:10:48.666Z"),
        new VocabularyEntry("die Bohnen_φασόλια", null, "φασόλια", "die Bohnen", "", 6, 1, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("die Erbsen_αρακάς", null, "αρακάς", "die Erbsen", "", 14, 2, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "die Erhaltung_διατήρηση",
          null,
          "διατήρηση",
          "die Erhaltung",
          "",
          16,
          7,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "die Erwartungshaltung_στάση προσδοκίας",
          null,
          "στάση προσδοκίας",
          "die Erwartungshaltung",
          "#vorurteile",
          9,
          5,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "die Fortbildung_επιμόρφωση",
          null,
          "επιμόρφωση",
          "die Fortbildung",
          "",
          11,
          2,
          3,
          "2017-09-25T05:35:16.118Z"
        ),
        new VocabularyEntry("die Furcht_φόβος", null, "φόβος", "die Furcht", "die Angst", 16, 3, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("die Handlung_πράξη", null, "πράξη", "die Handlung", "die Tat", 21, 7, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "die Hautfarbe_χρώμα δέρματος",
          null,
          "χρώμα δέρματος",
          "die Hautfarbe",
          "",
          12,
          4,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "die Ignoranz_άγνοια",
          null,
          "άγνοια",
          "die Ignoranz",
          "adiaforia",
          4,
          5,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "die Koalition_συνασπισμός",
          null,
          "συνασπισμός",
          "die Koalition",
          "",
          5,
          2,
          2,
          "2017-09-30T13:18:41.614Z"
        ),
        new VocabularyEntry("die Linsen_φακές", null, "φακές", "die Linsen", "", 7, 2, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("die Mahlzeit_γεύμα", null, "γεύμα", "die Mahlzeit", "", 11, 3, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("die Mappe_φάκελος", null, "φάκελος", "die Mappe", "", 8, 2, 1, "2017-09-28T05:58:31.281Z"),
        new VocabularyEntry("die Menge_ποσότητα", null, "ποσότητα", "die Menge", "", 8, 1, 4, "2017-09-28T11:54:33.181Z"),
        new VocabularyEntry(
          "die Minderheit_μειονότητα",
          null,
          "μειονότητα",
          "die Minderheit",
          "#vorurteile",
          9,
          5,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "die Misinformation_παραπληροφόρηση",
          null,
          "παραπληροφόρηση",
          "die Misinformation",
          "",
          13,
          7,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("die Münze_κέρμα", null, "κέρμα", "die Münze", "", 15, 4, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("die Nachbarn_γείτονες", null, "γείτονες", "die Nachbarn", "", 8, 3, 2, "2017-09-28T07:17:58.163Z"),
        new VocabularyEntry(
          "die Nachrichten_ειδήσεις",
          null,
          "ειδήσεις",
          "die Nachrichten",
          "",
          12,
          2,
          2,
          "2017-09-28T11:54:47.861Z"
        ),
        new VocabularyEntry("die Nase_μύτη", null, "μύτη", "die Nase", "", 11, 2, 2, "2017-10-02T08:15:33.729Z"),
        new VocabularyEntry("die Prüfung_εξέταση", null, "εξέταση", "die Prüfung", "", 12, 2, 2, "2017-09-28T11:54:50.652Z"),
        new VocabularyEntry(
          "die Richtung_κατεύθυνση",
          null,
          "κατεύθυνση",
          "die Richtung",
          "",
          17,
          2,
          2,
          "2017-10-02T08:04:40.753Z"
        ),
        new VocabularyEntry("die Tat_πράξη", null, "πράξη", "die Tat", "", 8, 2, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("die Teller_πιάτα", null, "πιάτα", "die Teller", "", 10, 2, 2, "2017-10-02T08:15:17.458Z"),
        new VocabularyEntry("die Tiefe_βάθος", null, "βάθος", "die Tiefe", "", 15, 3, 2, "2017-09-28T07:22:35.987Z"),
        new VocabularyEntry(
          "die Verabredung_ιδιωτικό ραντεβού",
          null,
          "ιδιωτικό ραντεβού",
          "die Verabredung",
          "",
          10,
          3,
          2,
          "2017-09-30T13:18:33.766Z"
        ),
        new VocabularyEntry(
          "die Völkerwanderung_μετακίνηση πληθυσμών",
          null,
          "μετακίνηση πληθυσμών",
          "die Völkerwanderung",
          "",
          14,
          3,
          2,
          "2017-09-30T13:27:30.824Z"
        ),
        new VocabularyEntry(
          "die Zeitschrift_περιοδικό",
          null,
          "περιοδικό",
          "die Zeitschrift",
          "",
          8,
          3,
          2,
          "2017-10-02T08:19:00.945Z"
        ),
        new VocabularyEntry("die Zeitung_εφημερίδα", null, "εφημερίδα", "die Zeitung", "", 6, 2, 3, "2017-09-25T05:35:23.870Z"),
        new VocabularyEntry(
          "die batterien aufladen_γεμίζω τις μπαταρίες",
          null,
          "γεμίζω τις μπαταρίες",
          "die batterien aufladen",
          "",
          12,
          7,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("dienen_εξυπηρετώ", null, "εξυπηρετώ", "dienen", "", 7, 2, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("dreckig_βρώμικος", null, "βρώμικος", "dreckig", "", 15, 3, 2, "2017-09-28T07:22:13.267Z"),
        new VocabularyEntry("dringend_επείγον", null, "επείγον", "dringend", "", 7, 2, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("durchhalten_κουράγιο", null, "κουράγιο", "durchhalten", "", 11, 4, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("ehemalig_προηγούμενος", null, "προηγούμενος", "ehemalig", "", 13, 3, 4, "2017-09-28T11:54:35.812Z"),
        new VocabularyEntry("eher_μάλλον", null, "μάλλον", "eher", "", 8, 1, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("ein wenig_λιγάκι", null, "λιγάκι", "ein wenig", "", 7, 2, 2, "2017-10-02T08:10:46.377Z"),
        new VocabularyEntry(
          "eine Vielfalt an Unterstützung_μία πληθώρα στήριξης",
          null,
          "μία πληθώρα στήριξης",
          "eine Vielfalt an Unterstützung",
          "",
          5,
          4,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("entdecken_ανακαλύπτω", null, "ανακαλύπτω", "entdecken", "", 0, 0, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "entlassen entließ entlassen_απολύω",
          null,
          "απολύω",
          "entlassen entließ entlassen",
          "3xr",
          12,
          4,
          3,
          "2017-09-25T05:30:24.910Z"
        ),
        new VocabularyEntry("entwickeln_εξελίσσω", null, "εξελίσσω", "entwickeln", "", 11, 2, 3, "2017-09-25T05:35:06.383Z"),
        new VocabularyEntry("ergänzen_συμπληρώνω", null, "συμπληρώνω", "ergänzen", "", 4, 2, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("erhalten_λαμβάνω", null, "λαμβάνω", "erhalten", "", 16, 7, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "ermöglichen_δίνω τη δυνατότητα",
          null,
          "δίνω τη δυνατότητα",
          "ermöglichen",
          "",
          9,
          2,
          4,
          "2017-09-26T06:22:48.551Z"
        ),
        new VocabularyEntry("ernst_σοβαρά", null, "σοβαρά", "ernst", "", 4, 3, 1, "2017-09-27T21:02:58.369Z"),
        new VocabularyEntry("erweitern_διευρύνω", null, "διευρύνω", "erweitern", "", 9, 2, 3, "2017-09-25T05:35:31.654Z"),
        new VocabularyEntry("erwerben_αποκτώ", null, "αποκτώ", "erwerben", "", 12, 2, 3, "2017-09-25T05:30:17.271Z"),
        new VocabularyEntry(
          "es geht dich an_σε αφορά",
          null,
          "σε αφορά",
          "es geht dich an",
          "",
          6,
          2,
          1,
          "2017-09-27T21:03:12.905Z"
        ),
        new VocabularyEntry(
          "es gilt als Sicher_θεωρείται σίγουρο",
          null,
          "θεωρείται σίγουρο",
          "es gilt als Sicher",
          "",
          11,
          3,
          3,
          "2017-09-25T05:51:31.447Z"
        ),
        new VocabularyEntry(
          "es gründet sich auf_αυτό βασίζεται σε",
          null,
          "αυτό βασίζεται σε",
          "es gründet sich auf",
          "+A",
          10,
          2,
          3,
          "2017-09-25T05:30:50.744Z"
        ),
        new VocabularyEntry(
          "es liegt daran, dass_οφείλεται στο ότι",
          null,
          "οφείλεται στο ότι",
          "es liegt daran, dass",
          "",
          4,
          9,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "es wird gesagt_λέγεται",
          null,
          "λέγεται",
          "es wird gesagt",
          "",
          13,
          3,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "fahren fuhr ist gefahren_οδηγώ",
          null,
          "οδηγώ",
          "fahren fuhr ist gefahren",
          "3xr",
          21,
          6,
          3,
          "2017-09-26T06:23:02.820Z"
        ),
        new VocabularyEntry("feiern_γιορτάζω", null, "γιορτάζω", "feiern", "", 12, 2, 2, "2017-09-28T11:54:43.172Z"),
        new VocabularyEntry(
          "finden fand gefunden_βρίσκω",
          null,
          "βρίσκω",
          "finden fand gefunden",
          "3xr",
          11,
          2,
          3,
          "2017-09-25T05:30:37.918Z"
        ),
        new VocabularyEntry("fleißig_εργατικός", null, "εργατικός", "fleißig", "", 10, 2, 2, "2017-09-28T07:22:20.827Z"),
        new VocabularyEntry("führend_πρωτοπόρος", null, "πρωτοπόρος", "führend", "", 10, 2, 3, "2017-09-25T05:13:26.783Z"),
        new VocabularyEntry(
          "gefülte Paprika und Tomaten_γεμιστά",
          null,
          "γεμιστά",
          "gefülte Paprika und Tomaten",
          "",
          9,
          3,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("gehören_ανήκω", null, "ανήκω", "gehören", "", 1, 0, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("gelb_κίτρινο", null, "κίτρινο", "gelb", "", 17, 2, 2, "2017-10-02T08:04:37.560Z"),
        new VocabularyEntry(
          "gelingen gelang ist gelungen_πετυχαίνω",
          null,
          "πετυχαίνω",
          "gelingen gelang ist gelungen",
          "3xr",
          18,
          4,
          2,
          "2017-09-30T13:26:48.082Z"
        ),
        new VocabularyEntry("genau_ακριβώς", null, "ακριβώς", "genau", "", 8, 2, 2, "2017-09-28T07:17:44.547Z"),
        new VocabularyEntry("genug_επαρκής", null, "επαρκής", "genug", "", 11, 3, 2, "2017-09-28T11:54:53.620Z"),
        new VocabularyEntry("geradeaus_ευθεία", null, "ευθεία", "geradeaus", "", 10, 2, 2, "2017-09-30T13:15:36.963Z"),
        new VocabularyEntry("gewinnen_κερδίζω", null, "κερδίζω", "gewinnen", "", 17, 2, 2, "2017-10-02T08:04:44.209Z"),
        new VocabularyEntry(
          "gewissenhaft_ευσυνείδητος",
          null,
          "ευσυνείδητος",
          "gewissenhaft",
          "",
          14,
          3,
          3,
          "2017-09-25T05:36:03.911Z"
        ),
        new VocabularyEntry("hinzufügen_προσθέτω", null, "προσθέτω", "hinzufügen", "", 11, 2, 3, "2017-09-25T05:13:24.391Z"),
        new VocabularyEntry(
          "hochladen_μεταφορτώνω",
          null,
          "μεταφορτώνω",
          "hochladen",
          "upload",
          10,
          2,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "hoffentlich_ελπίζοντας",
          null,
          "ελπίζοντας",
          "hoffentlich",
          "hopefully",
          10,
          3,
          4,
          "2017-09-26T06:26:06.961Z"
        ),
        new VocabularyEntry(
          "ich bin konfrontiert mit_είμαι αντιμέτωπος με",
          null,
          "είμαι αντιμέτωπος με",
          "ich bin konfrontiert mit",
          "",
          11,
          3,
          4,
          "2017-09-26T06:26:35.944Z"
        ),
        new VocabularyEntry(
          "ich gehe davon aus, dass_εικάζω",
          null,
          "εικάζω",
          "ich gehe davon aus, dass",
          "",
          14,
          6,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "ich muss Geld abheben_πρέπει να βγάλω λεφτά (από την τράπεζα)",
          null,
          "πρέπει να βγάλω λεφτά (από την τράπεζα)",
          "ich muss Geld abheben",
          "",
          8,
          4,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "im Rahmen_στο πλαίσιο του",
          null,
          "στο πλαίσιο του",
          "im Rahmen",
          "+ genitif",
          7,
          4,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "im Vergleich zu_σε σύγκριση με",
          null,
          "σε σύγκριση με",
          "im Vergleich zu",
          "",
          9,
          3,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "im engeren Sinne_με τη στενότερη έννοια",
          null,
          "με τη στενότερη έννοια",
          "im engeren Sinne",
          "",
          11,
          5,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "immerhin_τουλάχιστον",
          null,
          "τουλάχιστον",
          "immerhin",
          "at least, wenigstens",
          20,
          3,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "in der Tat_πράγματι",
          null,
          "πράγματι",
          "in der Tat",
          "indeed",
          17,
          3,
          3,
          "2017-09-25T05:51:22.759Z"
        ),
        new VocabularyEntry("intensiv_έντονα", null, "έντονα", "intensiv", "hart", 0, 2, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("knapp_σχεδόν", null, "σχεδόν", "knapp", "fast", 6, 1, 1, "2017-09-28T05:58:20.081Z"),
        new VocabularyEntry("kostspielig_δαπανηρός", null, "δαπανηρός", "kostspielig", "", 11, 2, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("kurz_κοντός", null, "κοντός", "kurz", "", 6, 2, 3, "2017-09-25T05:50:57.303Z"),
        new VocabularyEntry("langweilig_βαρετός", null, "βαρετός", "langweilig", "", 6, 2, 2, "2017-09-28T07:17:42.595Z"),
        new VocabularyEntry("lecker_νόστιμος", null, "νόστιμος", "lecker", "", 10, 2, 2, "2017-10-02T08:15:36.018Z"),
        new VocabularyEntry("ledig_ανύπαντρος", null, "ανύπαντρος", "ledig", "", 13, 2, 2, "2017-09-28T07:22:32.915Z"),
        new VocabularyEntry(
          "mal sehen_γιά να δούμε",
          null,
          "γιά να δούμε",
          "mal sehen",
          "",
          11,
          3,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("manchmal_κάπου κάπου", null, "κάπου κάπου", "manchmal", "", 16, 2, 2, "2017-10-02T08:04:24.704Z"),
        new VocabularyEntry(
          "nachvollziehen_καταννοώ",
          null,
          "καταννοώ",
          "nachvollziehen",
          "comprehend, relate to",
          19,
          5,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "nicht allzu_όχι ιδιαίτερα",
          null,
          "όχι ιδιαίτερα",
          "nicht allzu",
          "nicht besonders",
          8,
          1,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("niedrig_χαμηλός", null, "χαμηλός", "niedrig", "", 9, 4, 4, "2017-10-02T08:19:10.723Z"),
        new VocabularyEntry("nirgends_πουθενά", null, "πουθενά", "nirgends", "", 20, 4, 3, "2017-09-25T05:51:19.759Z"),
        new VocabularyEntry(
          "noch ich_ούτε εγώ",
          null,
          "ούτε εγώ",
          "noch ich",
          "me neither",
          10,
          2,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("noch nie_ποτέ ως τώρα", null, "ποτέ ως τώρα", "noch nie", "", 17, 5, 3, "2017-09-25T05:51:17.121Z"),
        new VocabularyEntry("nun_τώρα", null, "τώρα", "nun", "", 12, 2, 4, "2017-10-02T08:19:07.825Z"),
        new VocabularyEntry("offenbar_προφανής", null, "προφανής", "offenbar", "", 7, 2, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "ohnerin_ούτως ή άλλως",
          null,
          "ούτως ή άλλως",
          "ohnerin",
          "sowieso",
          10,
          3,
          4,
          "2017-09-28T07:22:22.755Z"
        ),
        new VocabularyEntry(
          "pass gut auf meine Sachen auf_πρόσεχε καλά τα πράγματά μου",
          null,
          "πρόσεχε καλά τα πράγματά μου",
          "pass gut auf meine Sachen auf",
          "",
          9,
          8,
          3,
          "2017-09-26T06:23:11.144Z"
        ),
        new VocabularyEntry("passen zu_ταιριάζω με", null, "ταιριάζω με", "passen zu", "", 12, 6, 3, "2017-09-26T06:26:17.273Z"),
        new VocabularyEntry("reagieren_αντιδρώ", null, "αντιδρώ", "reagieren", "", 12, 2, 3, "2017-09-25T05:30:13.798Z"),
        new VocabularyEntry("richtig_σωστά", null, "σωστά", "richtig", "", 7, 4, 3, "2017-09-25T05:13:01.022Z"),
        new VocabularyEntry(
          "runterladen_μεταφορτώνω",
          null,
          "μεταφορτώνω",
          "runterladen",
          "download",
          10,
          2,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("sammeln_συλλέγω", null, "συλλέγω", "sammeln", "", 5, 2, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "schaffen schaffte geschaft_καταφέρνω",
          null,
          "καταφέρνω",
          "schaffen schaffte geschaft",
          "3xr",
          6,
          6,
          2,
          "2017-09-30T13:14:09.662Z"
        ),
        new VocabularyEntry(
          "schaffen schuf geschaffen_δημιουργώ",
          null,
          "δημιουργώ",
          "schaffen schuf geschaffen",
          "3xr",
          12,
          2,
          3,
          "2017-10-02T08:06:57.192Z"
        ),
        new VocabularyEntry(
          "scheitern scheiterte ist gescheitert_αποτυγχάνω",
          null,
          "αποτυγχάνω",
          "scheitern scheiterte ist gescheitert",
          "",
          10,
          3,
          3,
          "2017-10-02T08:06:17.752Z"
        ),
        new VocabularyEntry("schlossen_κλειστός", null, "κλειστός", "schlossen", "", 12, 4, 2, "2017-10-02T08:11:24.561Z"),
        new VocabularyEntry("schulden_οφείλω", null, "οφείλω", "schulden", "", 20, 3, 3, "2017-09-25T05:51:26.744Z"),
        new VocabularyEntry("schöpfen_δημιουργώ", null, "δημιουργώ", "schöpfen", "", 8, 2, 3, "2017-09-25T05:30:01.774Z"),
        new VocabularyEntry(
          "sei so lieb und_αν έχεις την καλοσύνη",
          null,
          "αν έχεις την καλοσύνη",
          "sei so lieb und",
          "could you please",
          2,
          1,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "seit lange_εδώ και πολύ καιρό",
          null,
          "εδώ και πολύ καιρό",
          "seit lange",
          "",
          8,
          2,
          3,
          "2017-09-25T05:35:35.360Z"
        ),
        new VocabularyEntry(
          "seit langen_εδώ και καιρό",
          null,
          "εδώ και καιρό",
          "seit langen",
          "",
          5,
          1,
          3,
          "2017-10-02T08:10:59.970Z"
        ),
        new VocabularyEntry(
          "selber schuld_καλά να πάθεις",
          null,
          "καλά να πάθεις",
          "selber schuld",
          "",
          16,
          4,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("selten_σπάνια", null, "σπάνια", "selten", "", 4, 1, 1, "2017-09-28T05:56:20.937Z"),
        new VocabularyEntry(
          "sich entschließen_αποφασίζω",
          null,
          "αποφασίζω",
          "sich entschließen",
          "aytopathes",
          3,
          3,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "sich entspannen_ξεκουράζομαι",
          null,
          "ξεκουράζομαι",
          "sich entspannen",
          "",
          8,
          5,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "sich entwickeln_εξελίσσομαι",
          null,
          "εξελίσσομαι",
          "sich entwickeln",
          "",
          16,
          4,
          3,
          "2017-09-25T05:35:02.646Z"
        ),
        new VocabularyEntry(
          "sich fallen lassen_χαλαρώνω",
          null,
          "χαλαρώνω",
          "sich fallen lassen",
          "",
          5,
          1,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "sich richten an_απευθύνομαι προς",
          null,
          "απευθύνομαι προς",
          "sich richten an",
          "+A",
          20,
          7,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "sich richten gegen_στρέφομαι εναντίον",
          null,
          "στρέφομαι εναντίον",
          "sich richten gegen",
          "",
          9,
          5,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "sich richten nach_συμμορφώνομαι με",
          null,
          "συμμορφώνομαι με",
          "sich richten nach",
          "",
          14,
          3,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("sich weigern_αρνούμαι", null, "αρνούμαι", "sich weigern", "", 16, 6, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("sich äußern_εκφράζομαι", null, "εκφράζομαι", "sich äußern", "", 9, 4, 3, "2017-09-25T05:35:39.318Z"),
        new VocabularyEntry("so_όπως και", null, "όπως και", "so", "as well as2", 8, 4, 4, "2017-10-02T08:19:12.929Z"),
        new VocabularyEntry(
          "so gut wie nie_σχεδόν ποτέ",
          null,
          "σχεδόν ποτέ",
          "so gut wie nie",
          "",
          13,
          4,
          3,
          "2017-09-26T06:26:13.999Z"
        ),
        new VocabularyEntry(
          "so schlimm ist es auch nicht_δεν είναι κάτι το φοβερό",
          null,
          "δεν είναι κάτι το φοβερό",
          "so schlimm ist es auch nicht",
          "",
          9,
          11,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("sobald_μόλις", null, "μόλις", "sobald", "", 11, 4, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("solcher_τέτοιος", null, "τέτοιος", "solcher", "", 4, 3, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("sonst_ειδάλλως", null, "ειδάλλως", "sonst", "", 12, 2, 2, "2017-09-28T11:54:44.788Z"),
        new VocabularyEntry("sowie_καθώς και", null, "καθώς και", "sowie", "", 6, 1, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("starken_ισχυρός", null, "ισχυρός", "starken", "", 10, 2, 2, "2017-09-30T13:15:45.275Z"),
        new VocabularyEntry("stets_ανέκαθεν", null, "ανέκαθεν", "stets", "", 6, 3, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("stressig_αγχωτικό", null, "αγχωτικό", "stressig", "", 4, 1, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("unbedeutend_ασήμαντος", null, "ασήμαντος", "unbedeutend", "", 20, 5, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("unwichtig_αμελητέος", null, "αμελητέος", "unwichtig", "", 12, 3, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("unzählig_αμέτρητος", null, "αμέτρητος", "unzählig", "", 15, 3, 3, "2017-09-25T05:30:58.783Z"),
        new VocabularyEntry(
          "urteilen über_κρίνω",
          null,
          "κρίνω",
          "urteilen über",
          "#vorurteile     +A    2 lexeis",
          13,
          4,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "verantwortlich für_υπεύθυνος για",
          null,
          "υπεύθυνος για",
          "verantwortlich für",
          "",
          8,
          3,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("vergehen_παρέρχομαι", null, "παρέρχομαι", "vergehen", "", 20, 4, 3, "2017-09-26T06:22:50.848Z"),
        new VocabularyEntry(
          "verheiratet_παντρεμένος",
          null,
          "παντρεμένος",
          "verheiratet",
          "",
          9,
          2,
          2,
          "2017-10-02T08:15:12.385Z"
        ),
        new VocabularyEntry(
          "verlieren verlor verloren_χάνω",
          null,
          "χάνω",
          "verlieren verlor verloren",
          "3xr (px gialia)",
          13,
          3,
          3,
          "2017-09-26T06:26:27.657Z"
        ),
        new VocabularyEntry("verteilen_διανέμω", null, "διανέμω", "verteilen", "", 7, 6, 4, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "verurteilen_καταδικάζω",
          null,
          "καταδικάζω",
          "verurteilen",
          "",
          14,
          4,
          5,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "verwenden_χρησιμοποιώ",
          null,
          "χρησιμοποιώ",
          "verwenden",
          "nutzen, benutzen, einsetzen, verwenden, anwenden",
          17,
          3,
          3,
          "2017-09-26T06:26:30.728Z"
        ),
        new VocabularyEntry("vor kurzem_πρόσφατα", null, "πρόσφατα", "vor kurzem", "", 14, 2, 4, "2017-09-28T11:54:39.604Z"),
        new VocabularyEntry("vorhaben_σκοπεύω", null, "σκοπεύω", "vorhaben", "", 8, 2, 2, "2017-10-02T08:18:56.945Z"),
        new VocabularyEntry("vorher_προηγουμένως", null, "προηγουμένως", "vorher", "", 21, 4, 3, "2017-09-26T06:22:56.168Z"),
        new VocabularyEntry("vorne_μπροστά", null, "μπροστά", "vorne", "", 12, 2, 2, "2017-10-02T08:15:31.210Z"),
        new VocabularyEntry(
          "wegwerfen_πετώ στα σκουπίδια",
          null,
          "πετώ στα σκουπίδια",
          "wegwerfen",
          "",
          9,
          2,
          2,
          "2017-10-02T08:19:03.785Z"
        ),
        new VocabularyEntry("weit_μακριά", null, "μακριά", "weit", "", 8, 2, 2, "2017-10-02T08:10:50.337Z"),
        new VocabularyEntry(
          "wenigstens_τουλάχιστον",
          null,
          "τουλάχιστον",
          "wenigstens",
          "at least, immerhin",
          12,
          2,
          4,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("wie auch_επίσης", null, "επίσης", "wie auch", "as well as", 13, 2, 3, "2017-09-25T05:35:11.065Z"),
        new VocabularyEntry("wie breit_πόσο πλατύ", null, "πόσο πλατύ", "wie breit", "", 8, 3, 2, "2017-10-02T08:18:54.761Z"),
        new VocabularyEntry("wählen_επιλέγω", null, "επιλέγω", "wählen", "aussuchen", 18, 5, 5, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("ähnlich_παρόμοιος", null, "παρόμοιος", "ähnlich", "", 10, 4, 5, "2000-01-01T00:00:00.000Z"),
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
