import VocabularyEntry from "./components/VocabularyEntry.js";
import PouchDB from "pouchdb";
import { VOCABULARY_SEEDS } from "./databaseSeeds";
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
        downloadString.push(`// Total voc entries: ${voc.length}`);
        onSuccess(downloadString);
      })
      .catch(err => {
        console.error("error inside voc constructDownloadDbString");
        console.error(err);
      });
  };

  constructVocabularyDownloadString = (voc, stringArray) => {
    stringArray.push(`import VocabularyEntry from "./components/VocabularyEntry.js";`);
    stringArray.push(`import StatsEntry from "./components/StatsEntry.js";`);
    stringArray.push("");
    stringArray.push("export const VOCABULARY_SEEDS = [");
    voc.map((entry, index, vocArray) => {
      let lastItem = vocArray.length - 1 === index;
      entry.constructDownloadString(stringArray, lastItem);
    });
    stringArray.push("];");
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
      .bulkDocs(VOCABULARY_SEEDS)
      .then(() => console.info(`${this.localVocDbName} DB seeded`))
      .catch(err => {
        console.error("error inside seed DB");
        console.error(err);
      });
  };
}
