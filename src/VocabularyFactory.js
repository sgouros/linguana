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
        downloadString.push(`Total voc entries: ${voc.length}`)
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
        new VocabularyEntry("abbauen_μειώνω", null, "μειώνω", "abbauen", "", 27, 6, 4, "2017-10-09T08:27:08.823Z"),
        new VocabularyEntry("ablegen_ανήκω", null, "ανήκω", "ablegen", "", 20, 8, 5, "2017-10-04T06:20:07.501Z"),
        new VocabularyEntry("anbieten_προσφέρω", null, "προσφέρω", "anbieten", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("anhalten_σταματώ", null, "σταματώ", "anhalten", "", 21, 4, 4, "2017-10-06T10:16:05.753Z"),
        new VocabularyEntry("anhängen_κρεμώ", null, "κρεμώ", "anhängen", "", 10, 2, 5, "2017-10-04T06:19:04.404Z"),
        new VocabularyEntry("anlegen_διαμορφώνω", null, "διαμορφώνω", "anlegen", "", 12, 2, 4, "2017-09-30T13:18:28.583Z"),
        new VocabularyEntry(
          "anschließend_κατόπιν",
          null,
          "κατόπιν",
          "anschließend",
          "danach",
          10,
          3,
          5,
          "2017-10-04T06:19:07.900Z"
        ),
        new VocabularyEntry("anziehen_φορώ", null, "φορώ", "anziehen", "", 19, 3, 4, "2017-10-06T10:24:09.210Z"),
        new VocabularyEntry("arm_φτωχός", null, "φτωχός", "arm", "", 11, 5, 5, "2017-10-04T06:19:09.316Z"),
        new VocabularyEntry(
          "auf den ersten Blick_με την πρώτη ματιά",
          null,
          "με την πρώτη ματιά",
          "auf den ersten Blick",
          "",
          14,
          9,
          6,
          "2017-10-05T09:55:37.998Z"
        ),
        new VocabularyEntry("aufbauen_διαμορφώνω", null, "διαμορφώνω", "aufbauen", "", 22, 4, 4, "2017-10-06T10:07:07.401Z"),
        new VocabularyEntry("aufmachen_ανοίγω", null, "ανοίγω", "aufmachen", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("aufräumen_συμμαζεύω", null, "συμμαζεύω", "aufräumen", "", 18, 4, 4, "2017-10-06T10:15:45.130Z"),
        new VocabularyEntry(
          "aufs Land ziehen_μετακομίζω στην επαρχία",
          null,
          "μετακομίζω στην επαρχία",
          "aufs Land ziehen",
          "",
          7,
          1,
          4,
          "2017-09-30T13:21:09.082Z"
        ),
        new VocabularyEntry("aufstehen_σηκώνομαι", null, "σηκώνομαι", "aufstehen", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("aufwachen_ξυπνώ", null, "ξυπνώ", "aufwachen", "", 25, 5, 6, "2017-10-06T06:29:06.413Z"),
        new VocabularyEntry("aufwerten_αναβαθμίζω", null, "αναβαθμίζω", "aufwerten", "", 26, 10, 4, "2017-10-09T07:39:35.042Z"),
        new VocabularyEntry("ausbauen_διευρύνω", null, "διευρύνω", "ausbauen", "", 29, 5, 4, "2017-10-09T08:29:11.101Z"),
        new VocabularyEntry(
          "ausführlich_διεξοδικά",
          null,
          "διεξοδικά",
          "ausführlich",
          "gründlich, ausgiebig",
          8,
          2,
          5,
          "2017-09-25T05:35:29.239Z"
        ),
        new VocabularyEntry(
          "ausgezeichnet_εξαιρετικά",
          null,
          "εξαιρετικά",
          "ausgezeichnet",
          "",
          11,
          7,
          5,
          "2017-10-09T12:01:32.569Z"
        ),
        new VocabularyEntry(
          "ausschlafen_κοιμάμαι διεξοδικά",
          null,
          "κοιμάμαι διεξοδικά",
          "ausschlafen",
          "",
          17,
          6,
          6,
          "2017-10-06T06:29:12.437Z"
        ),
        new VocabularyEntry("aussuchen_επιλέγω", null, "επιλέγω", "aussuchen", "", 32, 6, 6, "2017-10-06T10:08:01.034Z"),
        new VocabularyEntry("begleiten_συνοδεύω", null, "συνοδεύω", "begleiten", "", 29, 6, 4, "2017-10-06T10:24:19.203Z"),
        new VocabularyEntry("behalten_επιβαρύνω", null, "επιβαρύνω", "behalten", "", 9, 4, 4, "2017-09-28T11:54:25.668Z"),
        new VocabularyEntry("beitragen zu_συμβάλλω", null, "συμβάλλω", "beitragen zu", "", 20, 7, 5, "2017-10-04T06:49:22.638Z"),
        new VocabularyEntry(
          "belasten_επιβαρύνω",
          null,
          "επιβαρύνω",
          "belasten",
          "behalten",
          16,
          4,
          5,
          "2017-10-10T05:18:16.510Z"
        ),
        new VocabularyEntry("bequem_άνετος", null, "άνετος", "bequem", "", 22, 4, 4, "2017-10-09T07:30:41.298Z"),
        new VocabularyEntry("bereichern_εμπλουτίζω", null, "εμπλουτίζω", "bereichern", "", 24, 7, 6, "2017-10-06T10:06:44.969Z"),
        new VocabularyEntry("bereits_ήδη", null, "ήδη", "bereits", "", 11, 1, 4, "2017-10-02T08:05:45.344Z"),
        new VocabularyEntry(
          "beschimpfen_βρίζω",
          null,
          "βρίζω",
          "beschimpfen",
          "#vorurteile",
          23,
          6,
          6,
          "2017-10-06T10:06:48.537Z"
        ),
        new VocabularyEntry(
          "beschließen_αποφασίζω",
          null,
          "αποφασίζω",
          "beschließen",
          "1 lexi",
          18,
          2,
          5,
          "2017-10-04T06:47:56.556Z"
        ),
        new VocabularyEntry("besprechen_συζητώ", null, "συζητώ", "besprechen", "", 12, 3, 5, "2017-09-26T06:22:33.320Z"),
        new VocabularyEntry(
          "bestehen aus_αποτελούμαι από",
          null,
          "αποτελούμαι από",
          "bestehen aus",
          "",
          5,
          1,
          5,
          "2017-10-04T06:47:59.573Z"
        ),
        new VocabularyEntry("bestimmt_βεβαίως", null, "βεβαίως", "bestimmt", "", 14, 3, 4, "2017-09-28T07:22:39.995Z"),
        new VocabularyEntry("beurteilen_κρίνω", null, "κρίνω", "beurteilen", "1 λέξη", 14, 7, 6, "2017-10-06T10:06:51.809Z"),
        new VocabularyEntry(
          "bewältigen_αντιμετωπίζω",
          null,
          "αντιμετωπίζω",
          "bewältigen",
          "",
          25,
          9,
          5,
          "2017-10-04T06:49:28.402Z"
        ),
        new VocabularyEntry("bezahlen_πληρώνω", null, "πληρώνω", "bezahlen", "", 9, 2, 4, "2017-10-02T08:19:15.145Z"),
        new VocabularyEntry(
          "biegen Sie hier links ab_στρίψτε εδώ αριστερά",
          null,
          "στρίψτε εδώ αριστερά",
          "biegen Sie hier links ab",
          "",
          14,
          5,
          4,
          "2017-10-06T10:16:18.994Z"
        ),
        new VocabularyEntry("bis_μέχρι", null, "μέχρι", "bis", "until", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "da fällt mir ein_αυτό μου θυμίζει",
          null,
          "αυτό μου θυμίζει",
          "da fällt mir ein",
          "",
          8,
          7,
          5,
          "2017-10-09T08:29:53.021Z"
        ),
        new VocabularyEntry(
          "darf ich um ihre Aufmerksamkeit bitten_μπορώ να έχω την προσοχή σας παρακαλώ",
          null,
          "μπορώ να έχω την προσοχή σας παρακαλώ",
          "darf ich um ihre Aufmerksamkeit bitten",
          "",
          8,
          5,
          5,
          "2017-09-25T05:51:14.263Z"
        ),
        new VocabularyEntry(
          "darüber muss ich noch mal nachdenken_πρέπει να το ξανασκεφτώ",
          null,
          "πρέπει να το ξανασκεφτώ",
          "darüber muss ich noch mal nachdenken",
          "",
          18,
          5,
          4,
          "2017-10-09T06:23:39.954Z"
        ),
        new VocabularyEntry(
          "das Anliegen_παράκληση",
          null,
          "παράκληση",
          "das Anliegen",
          "",
          21,
          4,
          4,
          "2017-10-09T07:31:33.866Z"
        ),
        new VocabularyEntry(
          "das Ausland_εξωτερικό χώρας",
          null,
          "εξωτερικό χώρας",
          "das Ausland",
          "abroad",
          2,
          3,
          4,
          "2017-10-02T08:11:03.098Z"
        ),
        new VocabularyEntry(
          "das Besteck_μαχαιροπήρουνα",
          null,
          "μαχαιροπήρουνα",
          "das Besteck",
          "",
          0,
          0,
          0,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("das Blatt_φύλλο", null, "φύλλο", "das Blatt", "", 12, 3, 4, "2017-10-06T10:23:23.754Z"),
        new VocabularyEntry(
          "das Christentum_Χριστιανισμός",
          null,
          "Χριστιανισμός",
          "das Christentum",
          "",
          9,
          4,
          6,
          "2017-10-06T10:15:51.233Z"
        ),
        new VocabularyEntry("das Dreieck_τρίγωνο", null, "τρίγωνο", "das Dreieck", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "das Eigeninteresse_ατομικό συμφέρον",
          null,
          "ατομικό συμφέρον",
          "das Eigeninteresse",
          "",
          23,
          9,
          6,
          "2017-10-06T10:17:11.810Z"
        ),
        new VocabularyEntry("das Ereignis_συμβάν", null, "συμβάν", "das Ereignis", "", 18, 5, 5, "2017-10-04T07:05:28.133Z"),
        new VocabularyEntry(
          "das Ergebnis_αποτέλεσμα",
          null,
          "αποτέλεσμα",
          "das Ergebnis",
          "",
          12,
          7,
          6,
          "2017-10-06T10:17:07.201Z"
        ),
        new VocabularyEntry("das Essen_φαγητό", null, "φαγητό", "das Essen", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("das Gehalt_μισθός", null, "μισθός", "das Gehalt", "", 6, 2, 4, "2017-10-09T06:24:58.753Z"),
        new VocabularyEntry("das Geschirr_πιατικά", null, "πιατικά", "das Geschirr", "", 15, 3, 4, "2017-10-06T10:23:58.162Z"),
        new VocabularyEntry("das Gesicht_πρόσωπο", null, "πρόσωπο", "das Gesicht", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("das Gewicht_βάρος", null, "βάρος", "das Gewicht", "", 11, 4, 4, "2017-10-04T07:05:23.981Z"),
        new VocabularyEntry("das Glas_ποτήρι", null, "ποτήρι", "das Glas", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("das Hackfleisch_κιμάς", null, "κιμάς", "das Hackfleisch", "", 17, 6, 6, "2017-10-06T10:16:02.921Z"),
        new VocabularyEntry("das Heft_τετράδιο", null, "τετράδιο", "das Heft", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("das Hemd_πουκάμισο", null, "πουκάμισο", "das Hemd", "", 11, 3, 4, "2017-10-05T09:56:04.543Z"),
        new VocabularyEntry(
          "das Judentum_Ιουδαϊσμός",
          null,
          "Ιουδαϊσμός",
          "das Judentum",
          "",
          7,
          6,
          6,
          "2017-10-06T10:22:01.450Z"
        ),
        new VocabularyEntry("das Kleingeld_νόμισμα", null, "νόμισμα", "das Kleingeld", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("das Merkmal_γνώρισμα", null, "γνώρισμα", "das Merkmal", "", 14, 2, 4, "2017-10-06T11:35:42.068Z"),
        new VocabularyEntry("das Ohr_αυτί", null, "αυτί", "das Ohr", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("das Quadrat_τετράγωνο", null, "τετράγωνο", "das Quadrat", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "das Sondierungsgespräch_διερευνητική συζήτηση",
          null,
          "διερευνητική συζήτηση",
          "das Sondierungsgespräch",
          "",
          5,
          1,
          4,
          "2017-10-02T08:10:56.697Z"
        ),
        new VocabularyEntry(
          "das Sternzeichen_ζώδιο",
          null,
          "ζώδιο",
          "das Sternzeichen",
          "",
          20,
          9,
          6,
          "2017-10-06T10:24:27.522Z"
        ),
        new VocabularyEntry("das Umfeld_περίγυρος", null, "περίγυρος", "das Umfeld", "", 13, 4, 4, "2017-09-28T07:22:31.139Z"),
        new VocabularyEntry("das Unwissen_άγνοια", null, "άγνοια", "das Unwissen", "", 20, 7, 6, "2017-10-06T10:25:33.322Z"),
        new VocabularyEntry(
          "das Verhandlungsgespräch_διαπραγματευτική συζήτηση",
          null,
          "διαπραγματευτική συζήτηση",
          "das Verhandlungsgespräch",
          "",
          13,
          1,
          4,
          "2017-10-02T08:06:29.851Z"
        ),
        new VocabularyEntry(
          "das Vorurteil_προκατάληψη",
          null,
          "προκατάληψη",
          "das Vorurteil",
          "",
          25,
          7,
          5,
          "2017-10-04T07:05:31.869Z"
        ),
        new VocabularyEntry("das Werkzeug_εργαλείο", null, "εργαλείο", "das Werkzeug", "", 15, 4, 5, "2017-10-04T07:05:35.253Z"),
        new VocabularyEntry("das Ziel_στόχος", null, "στόχος", "das Ziel", "", 13, 3, 4, "2017-10-02T08:15:25.489Z"),
        new VocabularyEntry(
          "das Zugeständnis_παραχώρηση",
          null,
          "παραχώρηση",
          "das Zugeständnis",
          "",
          34,
          6,
          4,
          "2017-10-05T09:19:29.062Z"
        ),
        new VocabularyEntry("das _", null, "", "das ", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "das gemeine Interesse_κοινό συμφέρον",
          null,
          "κοινό συμφέρον",
          "das gemeine Interesse",
          "",
          20,
          8,
          6,
          "2017-10-06T10:25:05.274Z"
        ),
        new VocabularyEntry(
          "das öffentliche Interesse_δημόσιο συμφέρον",
          null,
          "δημόσιο συμφέρον",
          "das öffentliche Interesse",
          "",
          25,
          7,
          6,
          "2017-10-06T11:36:02.516Z"
        ),
        new VocabularyEntry("dennoch_παρόλα αυτά", null, "παρόλα αυτά", "dennoch", "", 14, 3, 4, "2017-10-05T09:48:02.279Z"),
        new VocabularyEntry("der Abschluss_πτυχίο", null, "πτυχίο", "der Abschluss", "", 13, 5, 4, "2017-10-02T08:11:06.657Z"),
        new VocabularyEntry(
          "der Aktenkoffer_χαρτοφύλακας",
          null,
          "χαρτοφύλακας",
          "der Aktenkoffer",
          "",
          15,
          3,
          4,
          "2017-10-06T11:35:38.428Z"
        ),
        new VocabularyEntry("der Anzug_κοστούμι", null, "κοστούμι", "der Anzug", "", 7, 2, 4, "2017-10-02T08:10:40.161Z"),
        new VocabularyEntry("der Beruf_επάγγελμα", null, "επάγγελμα", "der Beruf", "", 5, 2, 4, "2017-10-09T06:23:49.148Z"),
        new VocabularyEntry(
          "der Besitzer_ιδιοκτήτης",
          null,
          "ιδιοκτήτης",
          "der Besitzer",
          "der Inhaber",
          20,
          7,
          6,
          "2017-10-06T11:35:27.380Z"
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
          17,
          3,
          5,
          "2017-10-10T05:18:19.262Z"
        ),
        new VocabularyEntry("der Bewohner_κάτοικος", null, "κάτοικος", "der Bewohner", "", 20, 4, 4, "2017-10-05T09:16:21.094Z"),
        new VocabularyEntry("der Chef_αφεντικό", null, "αφεντικό", "der Chef", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("der Durst_δίψα", null, "δίψα", "der Durst", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("der Frühling_άνοιξη", null, "άνοιξη", "der Frühling", "", 18, 6, 5, "2017-10-09T08:29:42.829Z"),
        new VocabularyEntry("der Gast_επισκέπτης", null, "επισκέπτης", "der Gast", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("der Geldautomat_ΑΤΜ", null, "ΑΤΜ", "der Geldautomat", "", 18, 9, 5, "2017-10-04T07:05:40.941Z"),
        new VocabularyEntry("der Herbst_φθινόπωρο", null, "φθινόπωρο", "der Herbst", "", 16, 4, 5, "2017-10-09T12:02:12.434Z"),
        new VocabularyEntry(
          "der Herkunftsort_τόπος προέλευσης",
          null,
          "τόπος προέλευσης",
          "der Herkunftsort",
          "",
          15,
          8,
          6,
          "2017-10-06T11:35:32.164Z"
        ),
        new VocabularyEntry("der Hinweis_συμβουλή", null, "συμβουλή", "der Hinweis", "rat", 20, 4, 4, "2017-10-02T08:15:29.537Z"),
        new VocabularyEntry("der Händler_έμπορος", null, "έμπορος", "der Händler", "", 13, 3, 5, "2017-10-10T05:18:10.598Z"),
        new VocabularyEntry(
          "der Inhaber_ιδιοκτήτης",
          null,
          "ιδιοκτήτης",
          "der Inhaber",
          "der Besitzer",
          18,
          4,
          6,
          "2017-10-06T11:35:34.756Z"
        ),
        new VocabularyEntry("der Islam_Ισλάμ", null, "Ισλάμ", "der Islam", "", 3, 1, 8, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "der Konditor_ζαχαροπλάστης",
          null,
          "ζαχαροπλάστης",
          "der Konditor",
          "",
          0,
          0,
          0,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("der Kreis_κύκλος", null, "κύκλος", "der Kreis", "", 11, 3, 4, "2017-10-05T09:36:32.365Z"),
        new VocabularyEntry("der Löffel_κουτάλι", null, "κουτάλι", "der Löffel", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("der Mantel_παλτό", null, "παλτό", "der Mantel", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "der Mitbürger_συμπολίτης",
          null,
          "συμπολίτης",
          "der Mitbürger",
          "",
          15,
          2,
          4,
          "2017-10-06T11:35:45.476Z"
        ),
        new VocabularyEntry("der Mund_στόμα", null, "στόμα", "der Mund", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "der Namenstag_ονομαστική γιορτή",
          null,
          "ονομαστική γιορτή",
          "der Namenstag",
          "",
          0,
          0,
          0,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("der Norden_βοράς", null, "βοράς", "der Norden", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("der Osten_ανατολή", null, "ανατολή", "der Osten", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("der Quadratmeter_τμ", null, "τμ", "der Quadratmeter", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "der Radiergummi_σβήστρα",
          null,
          "σβήστρα",
          "der Radiergummi",
          "",
          0,
          0,
          0,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("der Rat_συμβουλή", null, "συμβουλή", "der Rat", "hinweis", 5, 3, 6, "2017-10-06T11:41:29.316Z"),
        new VocabularyEntry(
          "der Schafskäse_τυρί φέτα",
          null,
          "τυρί φέτα",
          "der Schafskäse",
          "",
          11,
          7,
          4,
          "2017-10-06T10:24:04.090Z"
        ),
        new VocabularyEntry(
          "der Schein_χαρτονόμισμα",
          null,
          "χαρτονόμισμα",
          "der Schein",
          "",
          11,
          3,
          4,
          "2017-10-06T10:23:26.306Z"
        ),
        new VocabularyEntry("der Schlüssel_κλειδί", null, "κλειδί", "der Schlüssel", "", 20, 4, 4, "2017-10-05T09:36:30.051Z"),
        new VocabularyEntry(
          "der Schwiegervater_πεθερός",
          null,
          "πεθερός",
          "der Schwiegervater",
          "",
          0,
          0,
          0,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("der Sportler_αθλητής", null, "αθλητής", "der Sportler", "", 12, 3, 4, "2017-10-04T07:05:21.469Z"),
        new VocabularyEntry(
          "der Stau_μποτιλιάρισμα",
          null,
          "μποτιλιάρισμα",
          "der Stau",
          "",
          15,
          4,
          5,
          "2017-10-10T05:13:16.382Z"
        ),
        new VocabularyEntry("der Süden_νότος", null, "νότος", "der Süden", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("der Topf_κατσαρόλα", null, "κατσαρόλα", "der Topf", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "der Urlaub_άδεια",
          null,
          "άδεια",
          "der Urlaub",
          "από τη δουλειά",
          0,
          0,
          0,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("der Vertrag_συμβόλαιο", null, "συμβόλαιο", "der Vertrag", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("der Verwandt_συγγενής", null, "συγγενής", "der Verwandt", "", 13, 10, 6, "2017-10-06T11:43:11.396Z"),
        new VocabularyEntry(
          "der Vorbehalt_επιφύλαξη",
          null,
          "επιφύλαξη",
          "der Vorbehalt",
          "#vorurteile",
          35,
          11,
          6,
          "2017-10-06T11:43:08.788Z"
        ),
        new VocabularyEntry("der Zustand_κατάσταση", null, "κατάσταση", "der Zustand", "", 15, 4, 5, "2017-10-09T08:29:27.792Z"),
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
        new VocabularyEntry("deutlich_σαφής", null, "σαφής", "deutlich", "", 17, 5, 4, "2017-10-05T09:56:20.329Z"),
        new VocabularyEntry("die Abfahrt_αναχώρηση", null, "αναχώρηση", "die Abfahrt", "", 14, 3, 4, "2017-10-06T11:35:49.012Z"),
        new VocabularyEntry("die Ahnung_γνώση", null, "γνώση", "die Ahnung", "", 11, 4, 5, "2017-10-09T11:56:11.858Z"),
        new VocabularyEntry(
          "die Anforderungen_απαιτήσεις",
          null,
          "απαιτήσεις",
          "die Anforderungen",
          "",
          15,
          2,
          6,
          "2017-10-09T06:29:49.010Z"
        ),
        new VocabularyEntry("die Angst_φόβος", null, "φόβος", "die Angst", "die Furcht", 16, 4, 6, "2017-10-09T06:29:52.322Z"),
        new VocabularyEntry("die Ankunft_άφιξη", null, "άφιξη", "die Ankunft", "", 15, 2, 4, "2017-10-06T11:35:51.132Z"),
        new VocabularyEntry("die Anlage_υποδομή", null, "υποδομή", "die Anlage", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "die Anzahl_αριθμητική ποσότητα",
          null,
          "αριθμητική ποσότητα",
          "die Anzahl",
          "",
          21,
          6,
          6,
          "2017-10-09T06:29:30.066Z"
        ),
        new VocabularyEntry(
          "die Arbeitshypothese_υπόθεση εργασίας",
          null,
          "υπόθεση εργασίας",
          "die Arbeitshypothese",
          "#vorurteile",
          18,
          4,
          6,
          "2017-10-09T06:29:44.650Z"
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
        new VocabularyEntry("die Augen_μάτια", null, "μάτια", "die Augen", "", 9, 4, 4, "2017-10-05T09:40:33.278Z"),
        new VocabularyEntry("die Bohnen_φασόλια", null, "φασόλια", "die Bohnen", "", 15, 4, 6, "2017-10-09T06:33:30.274Z"),
        new VocabularyEntry("die Breite_πλάτος", null, "πλάτος", "die Breite", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("die Erbsen_αρακάς", null, "αρακάς", "die Erbsen", "", 22, 4, 6, "2017-10-09T06:33:22.457Z"),
        new VocabularyEntry(
          "die Erhaltung_διατήρηση",
          null,
          "διατήρηση",
          "die Erhaltung",
          "",
          23,
          8,
          6,
          "2017-10-09T06:32:58.409Z"
        ),
        new VocabularyEntry(
          "die Erwartungshaltung_στάση προσδοκίας",
          null,
          "στάση προσδοκίας",
          "die Erwartungshaltung",
          "#vorurteile",
          17,
          7,
          6,
          "2017-10-09T06:33:27.489Z"
        ),
        new VocabularyEntry("die Flasche_μπουκάλι", null, "μπουκάλι", "die Flasche", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "die Fortbildung_επιμόρφωση",
          null,
          "επιμόρφωση",
          "die Fortbildung",
          "",
          11,
          2,
          5,
          "2017-09-25T05:35:16.118Z"
        ),
        new VocabularyEntry("die Furcht_φόβος", null, "φόβος", "die Furcht", "die Angst", 22, 7, 6, "2017-10-09T07:32:22.970Z"),
        new VocabularyEntry("die Gabel_πηρούνι", null, "πηρούνι", "die Gabel", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("die Geschichte_ιστορία", null, "ιστορία", "die Geschichte", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("die Grippe_γρίππη", null, "γρίππη", "die Grippe", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("die Handlung_πράξη", null, "πράξη", "die Handlung", "die Tat", 28, 9, 6, "2017-10-09T07:31:16.434Z"),
        new VocabularyEntry(
          "die Hautfarbe_χρώμα δέρματος",
          null,
          "χρώμα δέρματος",
          "die Hautfarbe",
          "",
          18,
          5,
          6,
          "2017-10-09T07:31:19.938Z"
        ),
        new VocabularyEntry(
          "die Ignoranz_άγνοια",
          null,
          "άγνοια",
          "die Ignoranz",
          "adiaforia",
          12,
          6,
          6,
          "2017-10-09T07:31:23.794Z"
        ),
        new VocabularyEntry(
          "die Koalition_συνασπισμός",
          null,
          "συνασπισμός",
          "die Koalition",
          "",
          5,
          2,
          4,
          "2017-09-30T13:18:41.614Z"
        ),
        new VocabularyEntry("die Linsen_φακές", null, "φακές", "die Linsen", "", 14, 3, 6, "2017-10-09T07:38:07.826Z"),
        new VocabularyEntry("die Länge_μήκος", null, "μήκος", "die Länge", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("die Mahlzeit_γεύμα", null, "γεύμα", "die Mahlzeit", "", 17, 5, 6, "2017-10-09T07:38:12.306Z"),
        new VocabularyEntry("die Mappe_φάκελος", null, "φάκελος", "die Mappe", "", 15, 4, 4, "2017-10-06T10:15:40.842Z"),
        new VocabularyEntry("die Menge_ποσότητα", null, "ποσότητα", "die Menge", "", 8, 1, 4, "2017-09-28T11:54:33.181Z"),
        new VocabularyEntry(
          "die Minderheit_μειονότητα",
          null,
          "μειονότητα",
          "die Minderheit",
          "#vorurteile",
          16,
          6,
          6,
          "2017-10-09T07:38:15.395Z"
        ),
        new VocabularyEntry(
          "die Misinformation_παραπληροφόρηση",
          null,
          "παραπληροφόρηση",
          "die Misinformation",
          "",
          19,
          9,
          6,
          "2017-10-09T07:38:20.707Z"
        ),
        new VocabularyEntry("die Münze_κέρμα", null, "κέρμα", "die Münze", "", 19, 5, 8, "2017-10-09T11:56:31.369Z"),
        new VocabularyEntry("die Nachbarn_γείτονες", null, "γείτονες", "die Nachbarn", "", 8, 3, 5, "2017-09-28T07:17:58.163Z"),
        new VocabularyEntry(
          "die Nachrichten_ειδήσεις",
          null,
          "ειδήσεις",
          "die Nachrichten",
          "",
          12,
          2,
          4,
          "2017-09-28T11:54:47.861Z"
        ),
        new VocabularyEntry("die Nase_μύτη", null, "μύτη", "die Nase", "", 15, 4, 4, "2017-10-05T09:47:51.382Z"),
        new VocabularyEntry("die Neuigkeit_νέο", null, "νέο", "die Neuigkeit", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("die Ohren_αυτιά", null, "αυτιά", "die Ohren", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("die Prüfung_εξέταση", null, "εξέταση", "die Prüfung", "", 12, 2, 4, "2017-09-28T11:54:50.652Z"),
        new VocabularyEntry(
          "die Rechnung_λογαριασμός",
          null,
          "λογαριασμός",
          "die Rechnung",
          "",
          0,
          0,
          0,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "die Richtung_κατεύθυνση",
          null,
          "κατεύθυνση",
          "die Richtung",
          "",
          17,
          2,
          4,
          "2017-10-02T08:04:40.753Z"
        ),
        new VocabularyEntry("die Tafel_πίνακας", null, "πίνακας", "die Tafel", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("die Tat_πράξη", null, "πράξη", "die Tat", "", 12, 3, 8, "2017-10-09T11:56:34.338Z"),
        new VocabularyEntry("die Teller_πιάτα", null, "πιάτα", "die Teller", "", 13, 3, 4, "2017-10-05T09:40:53.551Z"),
        new VocabularyEntry("die Tiefe_βάθος", null, "βάθος", "die Tiefe", "", 15, 3, 4, "2017-09-28T07:22:35.987Z"),
        new VocabularyEntry(
          "die Verabredung_ιδιωτικό ραντεβού",
          null,
          "ιδιωτικό ραντεβού",
          "die Verabredung",
          "",
          10,
          3,
          4,
          "2017-09-30T13:18:33.766Z"
        ),
        new VocabularyEntry("die Vorlesung_διάλεξη", null, "διάλεξη", "die Vorlesung", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "die Völkerwanderung_μετακίνηση πληθυσμών",
          null,
          "μετακίνηση πληθυσμών",
          "die Völkerwanderung",
          "",
          22,
          5,
          4,
          "2017-10-05T09:19:21.374Z"
        ),
        new VocabularyEntry(
          "die Zeitschrift_περιοδικό",
          null,
          "περιοδικό",
          "die Zeitschrift",
          "",
          12,
          4,
          4,
          "2017-10-05T09:48:12.029Z"
        ),
        new VocabularyEntry("die Zeitung_εφημερίδα", null, "εφημερίδα", "die Zeitung", "", 6, 2, 5, "2017-09-25T05:35:23.870Z"),
        new VocabularyEntry(
          "die Batterien aufladen_γεμίζω τις μπαταρίες",
          null,
          "γεμίζω τις μπαταρίες",
          "die Batterien aufladen",
          "",
          13,
          9,
          8,
          "2017-10-09T11:53:23.434Z"
        ),
        new VocabularyEntry("dienen_εξυπηρετώ", null, "εξυπηρετώ", "dienen", "", 10, 3, 8, "2017-10-09T11:56:09.586Z"),
        new VocabularyEntry("dreckig_βρώμικος", null, "βρώμικος", "dreckig", "", 21, 4, 5, "2017-10-10T05:18:14.078Z"),
        new VocabularyEntry("dringend_επείγον", null, "επείγον", "dringend", "", 12, 3, 8, "2017-10-09T12:02:14.825Z"),
        new VocabularyEntry("du erklärst_εξηγείς", null, "εξηγείς", "du erklärst", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("durchhalten_κουράγιο", null, "κουράγιο", "durchhalten", "", 15, 6, 8, "2017-10-09T12:02:18.202Z"),
        new VocabularyEntry("ehemalig_προηγούμενος", null, "προηγούμενος", "ehemalig", "", 13, 3, 4, "2017-09-28T11:54:35.812Z"),
        new VocabularyEntry("eher_μάλλον", null, "μάλλον", "eher", "", 13, 2, 8, "2017-10-09T12:02:19.514Z"),
        new VocabularyEntry("ein wenig_λιγάκι", null, "λιγάκι", "ein wenig", "", 12, 3, 4, "2017-10-05T09:37:02.094Z"),
        new VocabularyEntry(
          "eine Vielfalt an Unterstützung_μία πληθώρα στήριξης",
          null,
          "μία πληθώρα στήριξης",
          "eine Vielfalt an Unterstützung",
          "",
          8,
          8,
          8,
          "2017-10-09T12:02:26.873Z"
        ),
        new VocabularyEntry("einkaufen_ψωνίζω", null, "ψωνίζω", "einkaufen", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("entdecken_ανακαλύπτω", null, "ανακαλύπτω", "entdecken", "", 8, 2, 8, "2017-10-10T05:13:19.030Z"),
        new VocabularyEntry(
          "entlassen entließ entlassen_απολύω",
          null,
          "απολύω",
          "entlassen entließ entlassen",
          "3χρ",
          21,
          5,
          4,
          "2017-10-09T07:39:19.315Z"
        ),
        new VocabularyEntry(
          "entstehen_δημιουργούμαι",
          null,
          "δημιουργούμαι",
          "entstehen",
          "",
          26,
          6,
          4,
          "2017-10-09T08:29:03.370Z"
        ),
        new VocabularyEntry("entwickeln_εξελίσσω", null, "εξελίσσω", "entwickeln", "", 11, 3, 5, "2017-09-25T05:35:06.383Z"),
        new VocabularyEntry("ergänzen_συμπληρώνω", null, "συμπληρώνω", "ergänzen", "", 13, 3, 8, "2017-10-10T05:13:21.830Z"),
        new VocabularyEntry("erhalten_λαμβάνω", null, "λαμβάνω", "erhalten", "", 27, 9, 5, "2017-10-05T09:17:15.925Z"),
        new VocabularyEntry(
          "ermöglichen_δίνω τη δυνατότητα",
          null,
          "δίνω τη δυνατότητα",
          "ermöglichen",
          "",
          12,
          3,
          5,
          "2017-10-09T11:56:14.770Z"
        ),
        new VocabularyEntry("ernst_σοβαρά", null, "σοβαρά", "ernst", "", 13, 7, 4, "2017-10-05T09:56:06.502Z"),
        new VocabularyEntry("erweitern_διευρύνω", null, "διευρύνω", "erweitern", "", 9, 2, 5, "2017-09-25T05:35:31.654Z"),
        new VocabularyEntry("erwerben_αποκτώ", null, "αποκτώ", "erwerben", "", 17, 4, 4, "2017-10-09T07:30:46.122Z"),
        new VocabularyEntry(
          "es geht dich an_σε αφορά",
          null,
          "σε αφορά",
          "es geht dich an",
          "",
          18,
          5,
          4,
          "2017-10-06T10:16:22.450Z"
        ),
        new VocabularyEntry(
          "es gilt als Sicher_θεωρείται σίγουρο",
          null,
          "θεωρείται σίγουρο",
          "es gilt als Sicher",
          "",
          11,
          3,
          5,
          "2017-09-25T05:51:31.447Z"
        ),
        new VocabularyEntry(
          "es gründet sich auf_αυτό βασίζεται σε",
          null,
          "αυτό βασίζεται σε",
          "es gründet sich auf",
          "+A",
          16,
          4,
          4,
          "2017-10-09T07:38:42.650Z"
        ),
        new VocabularyEntry(
          "es liegt daran, dass_οφείλεται στο ότι",
          null,
          "οφείλεται στο ότι",
          "es liegt daran, dass",
          "",
          9,
          12,
          8,
          "2017-10-10T05:13:27.070Z"
        ),
        new VocabularyEntry(
          "es wird gesagt_λέγεται",
          null,
          "λέγεται",
          "es wird gesagt",
          "",
          19,
          4,
          8,
          "2017-10-10T05:13:31.071Z"
        ),
        new VocabularyEntry(
          "etwas steht mir im Weg_κάτι με εμποδίζει",
          null,
          "κάτι με εμποδίζει",
          "etwas steht mir im Weg",
          "",
          17,
          4,
          4,
          "2017-10-09T08:29:19.790Z"
        ),
        new VocabularyEntry(
          "fahren fuhr ist gefahren_οδηγώ",
          null,
          "οδηγώ",
          "fahren fuhr ist gefahren",
          "3χρ",
          24,
          7,
          5,
          "2017-10-09T11:56:28.753Z"
        ),
        new VocabularyEntry("feiern_γιορτάζω", null, "γιορτάζω", "feiern", "", 12, 2, 4, "2017-09-28T11:54:43.172Z"),
        new VocabularyEntry(
          "finden fand gefunden_βρίσκω",
          null,
          "βρίσκω",
          "finden fand gefunden",
          "3χρ",
          19,
          3,
          4,
          "2017-10-09T07:38:34.210Z"
        ),
        new VocabularyEntry("fleißig_εργατικός", null, "εργατικός", "fleißig", "", 16, 3, 5, "2017-10-10T05:18:21.718Z"),
        new VocabularyEntry("folgen_ακολουθώ", null, "ακολουθώ", "folgen", "", 11, 4, 4, "2017-10-09T07:31:30.642Z"),
        new VocabularyEntry("führend_πρωτοπόρος", null, "πρωτοπόρος", "führend", "", 16, 3, 4, "2017-10-09T07:30:35.970Z"),
        new VocabularyEntry("gar nicht_καθόλου", null, "καθόλου", "gar nicht", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "gefülte Paprika und Tomaten_γεμιστά",
          null,
          "γεμιστά",
          "gefülte Paprika und Tomaten",
          "",
          14,
          5,
          8,
          "2017-10-10T05:18:32.478Z"
        ),
        new VocabularyEntry("gehören_ανήκω", null, "ανήκω", "gehören", "", 6, 1, 5, "2017-10-05T09:16:27.349Z"),
        new VocabularyEntry("gelb_κίτρινο", null, "κίτρινο", "gelb", "", 21, 3, 4, "2017-10-05T09:16:22.784Z"),
        new VocabularyEntry(
          "gelingen gelang ist gelungen_πετυχαίνω",
          null,
          "πετυχαίνω",
          "gelingen gelang ist gelungen",
          "3χρ",
          31,
          8,
          4,
          "2017-10-05T09:19:36.461Z"
        ),
        new VocabularyEntry("gemeinsam_μαζί", null, "μαζί", "gemeinsam", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("genau_ακριβώς", null, "ακριβώς", "genau", "", 13, 3, 5, "2017-10-10T05:13:13.967Z"),
        new VocabularyEntry("genug_επαρκής", null, "επαρκής", "genug", "", 11, 3, 4, "2017-09-28T11:54:53.620Z"),
        new VocabularyEntry("geradeaus_ευθεία", null, "ευθεία", "geradeaus", "", 10, 2, 4, "2017-09-30T13:15:36.963Z"),
        new VocabularyEntry("gewinnen_κερδίζω", null, "κερδίζω", "gewinnen", "", 21, 3, 4, "2017-10-05T09:36:24.678Z"),
        new VocabularyEntry(
          "gewissenhaft_ευσυνείδητος",
          null,
          "ευσυνείδητος",
          "gewissenhaft",
          "",
          18,
          5,
          5,
          "2017-10-09T08:29:24.452Z"
        ),
        new VocabularyEntry("hinten_πίσω", null, "πίσω", "hinten", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("hinzufügen_προσθέτω", null, "προσθέτω", "hinzufügen", "", 20, 3, 4, "2017-10-09T07:31:44.876Z"),
        new VocabularyEntry(
          "hochladen_μεταφορτώνω",
          null,
          "μεταφορτώνω",
          "hochladen",
          "upload",
          16,
          3,
          8,
          "2017-10-10T05:18:35.398Z"
        ),
        new VocabularyEntry(
          "hoffentlich_ελπίζοντας",
          null,
          "ελπίζοντας",
          "hoffentlich",
          "hopefully",
          14,
          4,
          5,
          "2017-10-09T12:01:27.849Z"
        ),
        new VocabularyEntry(
          "ich bin konfrontiert mit_είμαι αντιμέτωπος με",
          null,
          "είμαι αντιμέτωπος με",
          "ich bin konfrontiert mit",
          "",
          15,
          5,
          5,
          "2017-10-10T05:13:09.382Z"
        ),
        new VocabularyEntry(
          "ich bin selber schuld_φταίω",
          null,
          "φταίω",
          "ich bin selber schuld",
          "",
          21,
          3,
          4,
          "2017-10-09T08:28:56.741Z"
        ),
        new VocabularyEntry(
          "ich gehe davon aus, dass_εικάζω",
          null,
          "εικάζω",
          "ich gehe davon aus, dass",
          "",
          19,
          8,
          8,
          "2017-10-10T05:18:40.814Z"
        ),
        new VocabularyEntry(
          "ich muss Geld abheben_πρέπει να βγάλω λεφτά (από την τράπεζα)",
          null,
          "πρέπει να βγάλω λεφτά (από την τράπεζα)",
          "ich muss Geld abheben",
          "",
          12,
          6,
          8,
          "2017-10-10T05:18:07.351Z"
        ),
        new VocabularyEntry(
          "im Rahmen_στο πλαίσιο του",
          null,
          "στο πλαίσιο του",
          "im Rahmen",
          "+ genitif",
          18,
          5,
          5,
          "2017-10-05T09:16:29.911Z"
        ),
        new VocabularyEntry(
          "im Vergleich zu_σε σύγκριση με",
          null,
          "σε σύγκριση με",
          "im Vergleich zu",
          "",
          22,
          4,
          5,
          "2017-10-05T09:18:28.253Z"
        ),
        new VocabularyEntry(
          "im engeren Sinne_με τη στενότερη έννοια",
          null,
          "με τη στενότερη έννοια",
          "im engeren Sinne",
          "",
          11,
          5,
          7,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "immerhin_τουλάχιστον",
          null,
          "τουλάχιστον",
          "immerhin",
          "at least, wenigstens",
          26,
          4,
          5,
          "2017-10-05T09:36:41.486Z"
        ),
        new VocabularyEntry(
          "in der Tat_πράγματι",
          null,
          "πράγματι",
          "in der Tat",
          "indeed",
          21,
          4,
          5,
          "2017-10-09T08:29:34.956Z"
        ),
        new VocabularyEntry("intensiv_έντονα", null, "έντονα", "intensiv", "hart", 2, 4, 5, "2017-10-05T09:36:16.571Z"),
        new VocabularyEntry("knapp_σχεδόν", null, "σχεδόν", "knapp", "fast", 14, 3, 4, "2017-10-06T10:15:47.130Z"),
        new VocabularyEntry("kostspielig_δαπανηρός", null, "δαπανηρός", "kostspielig", "", 11, 2, 7, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("kurz_κοντός", null, "κοντός", "kurz", "", 9, 4, 5, "2017-10-09T08:27:26.909Z"),
        new VocabularyEntry("langweilig_βαρετός", null, "βαρετός", "langweilig", "", 11, 3, 5, "2017-10-10T05:13:12.078Z"),
        new VocabularyEntry("lecker_νόστιμος", null, "νόστιμος", "lecker", "", 14, 3, 4, "2017-10-05T09:47:58.638Z"),
        new VocabularyEntry("ledig_ανύπαντρος", null, "ανύπαντρος", "ledig", "", 13, 2, 4, "2017-09-28T07:22:32.915Z"),
        new VocabularyEntry(
          "mal schnell_στα γρήγορα",
          null,
          "στα γρήγορα",
          "mal schnell",
          "",
          0,
          0,
          0,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "mal sehen_γιά να δούμε",
          null,
          "γιά να δούμε",
          "mal sehen",
          "",
          11,
          3,
          7,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("manchmal_κάπου κάπου", null, "κάπου κάπου", "manchmal", "", 20, 3, 4, "2017-10-05T09:16:16.710Z"),
        new VocabularyEntry(
          "nachvollziehen_καταννοώ",
          null,
          "καταννοώ",
          "nachvollziehen",
          "comprehend, relate to",
          19,
          5,
          7,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "nicht allzu_όχι ιδιαίτερα",
          null,
          "όχι ιδιαίτερα",
          "nicht allzu",
          "nicht besonders",
          14,
          2,
          5,
          "2017-10-05T09:36:48.966Z"
        ),
        new VocabularyEntry("niedrig_χαμηλός", null, "χαμηλός", "niedrig", "", 9, 4, 4, "2017-10-02T08:19:10.723Z"),
        new VocabularyEntry("nirgends_πουθενά", null, "πουθενά", "nirgends", "", 24, 5, 5, "2017-10-09T08:27:32.652Z"),
        new VocabularyEntry(
          "noch ich_ούτε εγώ",
          null,
          "ούτε εγώ",
          "noch ich",
          "me neither",
          10,
          2,
          7,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("noch nie_ποτέ ως τώρα", null, "ποτέ ως τώρα", "noch nie", "", 21, 6, 5, "2017-10-09T08:27:30.165Z"),
        new VocabularyEntry("nun_τώρα", null, "τώρα", "nun", "", 12, 2, 4, "2017-10-02T08:19:07.825Z"),
        new VocabularyEntry("offenbar_προφανής", null, "προφανής", "offenbar", "", 12, 3, 5, "2017-10-05T09:36:22.350Z"),
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
          15,
          9,
          5,
          "2017-10-09T12:02:33.569Z"
        ),
        new VocabularyEntry("passen zu_ταιριάζω με", null, "ταιριάζω με", "passen zu", "", 15, 8, 5, "2017-10-09T12:01:41.157Z"),
        new VocabularyEntry("reagieren_αντιδρώ", null, "αντιδρώ", "reagieren", "", 18, 3, 4, "2017-10-09T07:30:43.810Z"),
        new VocabularyEntry("richtig_σωστά", null, "σωστά", "richtig", "", 12, 5, 4, "2017-10-09T07:30:30.834Z"),
        new VocabularyEntry(
          "runterladen_μεταφορτώνω",
          null,
          "μεταφορτώνω",
          "runterladen",
          "download",
          10,
          2,
          7,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("sammeln_συλλέγω", null, "συλλέγω", "sammeln", "", 10, 3, 5, "2017-10-05T09:40:57.923Z"),
        new VocabularyEntry(
          "schaffen schaffte geschaft_καταφέρνω",
          null,
          "καταφέρνω",
          "schaffen schaffte geschaft",
          "3χρ",
          6,
          6,
          4,
          "2017-09-30T13:14:09.662Z"
        ),
        new VocabularyEntry(
          "schaffen schuf geschaffen_δημιουργώ",
          null,
          "δημιουργώ",
          "schaffen schuf geschaffen",
          "3χρ",
          12,
          2,
          4,
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
          4,
          "2017-10-02T08:06:17.752Z"
        ),
        new VocabularyEntry("schlossen_κλειστός", null, "κλειστός", "schlossen", "", 15, 5, 4, "2017-10-05T09:40:46.422Z"),
        new VocabularyEntry("schulden_οφείλω", null, "οφείλω", "schulden", "", 23, 4, 5, "2017-10-09T08:27:40.445Z"),
        new VocabularyEntry("schöpfen_δημιουργώ", null, "δημιουργώ", "schöpfen", "", 14, 3, 4, "2017-10-09T07:30:38.730Z"),
        new VocabularyEntry(
          "sei so lieb und_αν έχεις την καλοσύνη",
          null,
          "αν έχεις την καλοσύνη",
          "sei so lieb und",
          "could you please",
          2,
          1,
          7,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "seit lange_εδώ και πολύ καιρό",
          null,
          "εδώ και πολύ καιρό",
          "seit lange",
          "",
          8,
          3,
          5,
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
          4,
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
          7,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "selbstverständlich_προφανώς",
          null,
          "προφανώς",
          "selbstverständlich",
          "",
          6,
          2,
          4,
          "2017-10-09T06:25:08.226Z"
        ),
        new VocabularyEntry(
          "selbständig_ελεύθερος επαγγελματίας",
          null,
          "ελεύθερος επαγγελματίας",
          "selbständig",
          "",
          0,
          0,
          0,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("selten_σπάνια", null, "σπάνια", "selten", "", 9, 2, 4, "2017-10-04T06:19:19.164Z"),
        new VocabularyEntry(
          "sich anpassen an_προσαρμόζομαι σε",
          null,
          "προσαρμόζομαι σε",
          "sich anpassen an",
          "+Α",
          28,
          7,
          4,
          "2017-10-09T06:25:32.730Z"
        ),
        new VocabularyEntry(
          "sich beschweren_διαμαρτύρομαι",
          null,
          "διαμαρτύρομαι",
          "sich beschweren",
          "",
          17,
          4,
          4,
          "2017-10-09T07:30:21.938Z"
        ),
        new VocabularyEntry(
          "sich entschließen_αποφασίζω",
          null,
          "αποφασίζω",
          "sich entschließen",
          "aytopathes",
          8,
          4,
          5,
          "2017-10-05T09:41:02.998Z"
        ),
        new VocabularyEntry(
          "sich entspannen_ξεκουράζομαι",
          null,
          "ξεκουράζομαι",
          "sich entspannen",
          "",
          8,
          5,
          7,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "sich entwickeln_εξελίσσομαι",
          null,
          "εξελίσσομαι",
          "sich entwickeln",
          "",
          21,
          6,
          4,
          "2017-10-09T07:38:05.187Z"
        ),
        new VocabularyEntry(
          "sich fallen lassen_χαλαρώνω",
          null,
          "χαλαρώνω",
          "sich fallen lassen",
          "",
          9,
          3,
          5,
          "2017-10-05T09:41:07.142Z"
        ),
        new VocabularyEntry(
          "sich richten an_απευθύνομαι προς",
          null,
          "απευθύνομαι προς",
          "sich richten an",
          "+A",
          20,
          7,
          7,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "sich richten gegen_στρέφομαι εναντίον",
          null,
          "στρέφομαι εναντίον",
          "sich richten gegen",
          "",
          14,
          6,
          5,
          "2017-10-05T09:41:11.943Z"
        ),
        new VocabularyEntry(
          "sich richten nach_συμμορφώνομαι με",
          null,
          "συμμορφώνομαι με",
          "sich richten nach",
          "",
          19,
          4,
          5,
          "2017-10-05T09:48:28.086Z"
        ),
        new VocabularyEntry("sich weigern_αρνούμαι", null, "αρνούμαι", "sich weigern", "", 16, 6, 7, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "sich äußern über_σχολιάζω",
          null,
          "σχολιάζω",
          "sich äußern über",
          "",
          9,
          4,
          5,
          "2017-09-25T05:35:39.318Z"
        ),
        new VocabularyEntry(
          "so gut wie nie_σχεδόν ποτέ",
          null,
          "σχεδόν ποτέ",
          "so gut wie nie",
          "",
          17,
          5,
          5,
          "2017-10-09T12:01:36.345Z"
        ),
        new VocabularyEntry(
          "so schlimm ist es auch nicht_δεν είναι κάτι το φοβερό",
          null,
          "δεν είναι κάτι το φοβερό",
          "so schlimm ist es auch nicht",
          "",
          9,
          11,
          7,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry("so_όπως και", null, "όπως και", "so", "as well as2", 8, 4, 4, "2017-10-02T08:19:12.929Z"),
        new VocabularyEntry("sobald_μόλις", null, "μόλις", "sobald", "", 11, 4, 7, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("solcher_τέτοιος", null, "τέτοιος", "solcher", "", 8, 5, 5, "2017-10-05T09:48:30.382Z"),
        new VocabularyEntry("sonst_ειδάλλως", null, "ειδάλλως", "sonst", "", 12, 2, 4, "2017-09-28T11:54:44.788Z"),
        new VocabularyEntry("sowie_καθώς και", null, "καθώς και", "sowie", "", 10, 3, 5, "2017-10-05T09:48:33.934Z"),
        new VocabularyEntry("starken_ισχυρός", null, "ισχυρός", "starken", "", 10, 2, 4, "2017-09-30T13:15:45.275Z"),
        new VocabularyEntry("stets_ανέκαθεν", null, "ανέκαθεν", "stets", "", 6, 3, 7, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("stressig_αγχωτικό", null, "αγχωτικό", "stressig", "", 4, 1, 7, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("unbedeutend_ασήμαντος", null, "ασήμαντος", "unbedeutend", "", 20, 5, 7, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("ungefähr_περίπου", null, "περίπου", "ungefähr", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("unwichtig_αμελητέος", null, "αμελητέος", "unwichtig", "", 12, 3, 7, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("unzählig_αμέτρητος", null, "αμέτρητος", "unzählig", "", 22, 4, 4, "2017-10-09T07:38:47.342Z"),
        new VocabularyEntry(
          "urteilen über_κρίνω",
          null,
          "κρίνω",
          "urteilen über",
          "#vorurteile     +A    2 lexeis",
          13,
          4,
          7,
          "2000-01-01T00:00:00.000Z"
        ),
        new VocabularyEntry(
          "verantwortlich für_υπεύθυνος για",
          null,
          "υπεύθυνος για",
          "verantwortlich für",
          "",
          13,
          4,
          5,
          "2017-10-05T09:48:39.702Z"
        ),
        new VocabularyEntry(
          "verdienen_βγάζω χρήματα",
          null,
          "βγάζω χρήματα",
          "verdienen",
          "",
          6,
          3,
          4,
          "2017-10-09T06:25:18.826Z"
        ),
        new VocabularyEntry("vergehen_παρέρχομαι", null, "παρέρχομαι", "vergehen", "", 23, 5, 5, "2017-10-09T11:56:16.978Z"),
        new VocabularyEntry(
          "verheiratet_παντρεμένος",
          null,
          "παντρεμένος",
          "verheiratet",
          "",
          12,
          3,
          4,
          "2017-10-05T09:40:51.254Z"
        ),
        new VocabularyEntry(
          "verlieren verlor verloren_χάνω",
          null,
          "χάνω",
          "verlieren verlor verloren",
          "πχ γυαλιά (3χρ)",
          19,
          4,
          5,
          "2017-10-10T05:12:51.279Z"
        ),
        new VocabularyEntry("verpassen_χάνω", null, "χάνω", "verpassen", "πχ τρένο", 7, 2, 4, "2017-10-09T06:25:22.204Z"),
        new VocabularyEntry("verteilen_μοιράζω", null, "μοιράζω", "verteilen", "", 11, 7, 5, "2017-10-05T09:56:24.918Z"),
        new VocabularyEntry(
          "verurteilen_καταδικάζω",
          null,
          "καταδικάζω",
          "verurteilen",
          "",
          19,
          6,
          7,
          "2017-10-09T08:29:56.452Z"
        ),
        new VocabularyEntry(
          "verwenden_χρησιμοποιώ",
          null,
          "χρησιμοποιώ",
          "verwenden",
          "nutzen, benutzen, einsetzen, verwenden, anwenden",
          26,
          4,
          5,
          "2017-10-10T05:13:36.830Z"
        ),
        new VocabularyEntry(
          "vor die Tür gehen_πάω βόλτα",
          null,
          "πάω βόλτα",
          "vor die Tür gehen",
          "",
          18,
          3,
          4,
          "2017-10-06T10:07:20.657Z"
        ),
        new VocabularyEntry("vor kurzem_πρόσφατα", null, "πρόσφατα", "vor kurzem", "", 14, 2, 4, "2017-09-28T11:54:39.604Z"),
        new VocabularyEntry("vorhaben_σκοπεύω", null, "σκοπεύω", "vorhaben", "", 12, 3, 4, "2017-10-05T09:48:07.998Z"),
        new VocabularyEntry("vorher_προηγουμένως", null, "προηγουμένως", "vorher", "", 25, 5, 5, "2017-10-09T11:56:21.754Z"),
        new VocabularyEntry("vorne_μπροστά", null, "μπροστά", "vorne", "", 15, 3, 4, "2017-10-05T09:40:55.108Z"),
        new VocabularyEntry("wann_πότε", null, "πότε", "wann", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry("wegen_εξαιτίας", null, "εξαιτίας", "wegen", "", 0, 0, 0, "2000-01-01T00:00:00.000Z"),
        new VocabularyEntry(
          "wegwerfen_πετώ στα σκουπίδια",
          null,
          "πετώ στα σκουπίδια",
          "wegwerfen",
          "",
          13,
          3,
          4,
          "2017-10-05T09:55:43.872Z"
        ),
        new VocabularyEntry("weit_μακριά", null, "μακριά", "weit", "", 11, 3, 4, "2017-10-05T09:40:42.926Z"),
        new VocabularyEntry(
          "wenigstens_τουλάχιστον",
          null,
          "τουλάχιστον",
          "wenigstens",
          "at least, immerhin",
          18,
          3,
          5,
          "2017-10-05T09:56:28.126Z"
        ),
        new VocabularyEntry("wie auch_επίσης", null, "επίσης", "wie auch", "as well as", 13, 3, 5, "2017-09-25T05:35:11.065Z"),
        new VocabularyEntry("wie breit_πόσο πλατύ", null, "πόσο πλατύ", "wie breit", "", 12, 4, 4, "2017-10-05T09:48:05.727Z"),
        new VocabularyEntry("wählen_επιλέγω", null, "επιλέγω", "wählen", "aussuchen", 24, 6, 7, "2017-10-09T08:29:59.317Z"),
        new VocabularyEntry(
          "zählen zählte gezählt_μετρώ",
          null,
          "μετρώ",
          "zählen zählte gezählt",
          "",
          6,
          3,
          4,
          "2017-10-09T06:25:28.914Z"
        ),
        new VocabularyEntry("ähnlich_παρόμοιος", null, "παρόμοιος", "ähnlich", "", 15, 6, 7, "2017-10-09T08:28:52.214Z"),
        new VocabularyEntry("überaus_υπερβολικά", null, "υπερβολικά", "überaus", "", 19, 4, 5, "2017-10-05T09:56:41.726Z"),
        new VocabularyEntry("überzeugt_πεπεισμένος", null, "πεπεισμένος", "überzeugt", "", 25, 4, 5, "2017-10-09T11:56:19.705Z")
      ])
      .then(() => console.info(`${this.localVocDbName} DB seeded`))
      .catch(err => {
        console.error("error inside seed DB");
        console.error(err);
      });
  };
}
