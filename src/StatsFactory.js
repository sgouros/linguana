import StatsEntry from "./components/StatsEntry.js";
import PouchDB from "pouchdb";
import PouchFind from "pouchdb-find";
import { STATS_SEEDS } from "./databaseSeeds";
import { addZero } from "./components/helpers";

PouchDB.plugin(PouchFind);
PouchDB.plugin(require("pouchdb-upsert"));

export default class StatsFactory {
  constructor(app) {
    this.app = app;
    window.PouchDB = PouchDB; // for dev tools

    this.localStatsDbName = "linguana_stats";
    // this.remoteStatsDbName = "http://83.212.105.237:5984/" + this.localStatsDbName;
    // this.remoteStatsDbName = "http://192.168.2.60:5984/" + this.localStatsDbName;
    // this.remoteStatsDbName = "http://sgourosboiler.dedyn.io:5984/" + this.localStatsDbName;
    // this.remoteStatsDbName = "http://localhost:5984/" + this.localStatsDbName;
    this.remoteStatsDbName = "http://sgouros.hopto.org:5984/" + this.localStatsDbName;
    this.localStatsDb = new PouchDB(this.localStatsDbName);
    this.remoteStatsDb = new PouchDB(this.remoteStatsDbName);

    this.localStatsDb
      .sync(this.remoteStatsDb, {
        // live: true,
        retry: true
      })
      .on("change", change => {
        console.debug("Stats synced! Changes:");
        console.debug(change);
        this.app.statsDbUpdated();
      })
      .on("paused", info => {
        console.debug("Stats replication was paused, usually because of a lost connection");
      })
      .on("active", info => {
        console.debug("Stats replication resumed");
      })
      .on("error", err => {
        console.debug("Stats totally unhandeld replication error");
        console.debug(err);
      })
      .on("complete", info => {
        console.info("Stats DB replication completed! Starting live sync");
        this.app.showAlert(
          "Stats synced!",
          {
            position: "bottom-left",
            effect: "stackslide",
            timeout: 6000
          },
          "success"
        );
        this.localStatsDb
          .sync(this.remoteStatsDb, {
            live: true,
            retry: true
          })
          .on("change", change => {
            console.debug("Stats synced! Changes:");
            console.debug(change);
            this.app.statsDbUpdated();
          })
          .on("paused", info => {
            console.debug("Stats replication was paused, usually because of a lost connection");
          })
          .on("active", info => {
            console.debug("Stats replication resumed");
          })
          .on("error", err => {
            console.debug("Stats totally unhandeld replication error");
            console.debug(err);
          });
      });
  }

  constructStats = statsFromDB => {
    let newStats = statsFromDB.map(item => {
      return new StatsEntry(item._id, item._rev, item.totalWordsLearned);
    });
    return newStats;
  };

  requestStatsForCalendarHeatmap = (noOfDaysRequested, onSuccessCallback) => {
    this.localStatsDb
      .createIndex({
        index: {
          fields: ["_id"]
        }
      })
      .then(() => {
        return this.localStatsDb.find({
          selector: {
            _id: { $exists: "true" }
          },
          sort: [{ _id: "desc" }],
          limit: noOfDaysRequested
        });
      })
      .then(responseFromDb => {
        // console.info(responseFromDb);
        let statsArray = this.massageStatsForCalendarHeatmap(responseFromDb.docs);
        // console.info(statsArray);
        onSuccessCallback(statsArray);
      })
      .catch(err => {
        console.error("error inside requestStatsForCalendarHeatmap:");
        console.error(err);
        console.error("(end of error trace)");
      });
  };

  massageStatsForCalendarHeatmap = dbDocs => {
    return dbDocs.map(doc => {
      return { date: doc._id, count: doc.totalWordsLearned };
    });
  };

  traceStatsDB = () => {
    this.localStatsDb
      .find({
        selector: {
          _id: { $exists: "true" }
        }
      })
      .then(responseFromDb => {
        let s = this.constructNewStats(responseFromDb.docs);
        this.traceStats(s);
      })
      .catch(err => {
        console.error("error inside traceStatsDB");
        console.error(err);
      });
  };

  constructNewStats = statsFromDB => {
    let newStats = statsFromDB.map(item => {
      return new StatsEntry(item._id, item._rev, item.totalWordsLearned);
    });
    return newStats;
  };

  extractStatsDB = () => {
    this.localStatsDb
      .find({
        selector: {
          _id: { $exists: "true" }
        }
      })
      .then(responseFromDb => {
        let s = this.constructNewStats(responseFromDb.docs);
        this.extractStats(s);
      })
      .catch(err => {
        console.error("error inside extractStatsDB");
        console.error(err);
      });
  };

  constructDownloadDbString = (stringArray, numberOFVocEntries, onSuccess) => {
    this.localStatsDb
      .find({
        selector: {
          _id: { $exists: "true" }
        }
      })
      .then(responseFromDb => {
        let stats = this.constructNewStats(responseFromDb.docs);
        let downloadString = this.constructStatsDownloadString(stats, stringArray);
        onSuccess(downloadString, numberOFVocEntries, stats.length);
      })
      .catch(err => {
        console.error("error inside stats constructDownloadDbString");
        console.error(err);
      });
  };

  constructStatsDownloadString = (stats, stringArray) => {
    stringArray.push("export const STATS_SEEDS = [");
    stats.map((entry, index, statsArray) => {
      let lastItem = statsArray.length - 1 === index;
      return entry.constructDownloadString(stringArray, lastItem);
    });
    stringArray.push("];");
    return stringArray;
  };

  extractStats = stats => {
    console.debug("************** extracting Stats DB ****************");
    stats.map(entry => entry.extract());
    console.debug("************** end of Stats DB extraction ****************");
  };

  increaseTotalWordsLearnedForTodayCount = onSuccessCallback => {
    let today = new Date();
    let yy = today.getFullYear();
    let mm = addZero(today.getMonth() + 1);
    let dd = addZero(today.getDate());
    let id = yy + "-" + mm + "-" + dd;
    console.debug("id=" + id);

    let total = 0;
    this.localStatsDb
      .upsert(id, doc => {
        if (!doc.totalWordsLearned) {
          doc.totalWordsLearned = 0;
        }
        doc.totalWordsLearned++;
        total = doc.totalWordsLearned;
        return doc;
      })
      .then(res => {
        onSuccessCallback(total);
      })
      .catch(err => {
        console.error("error inside increaseTotalWordsLearnedForTodayCount");
        console.error(err);
      });
  };

  resetStatsDB = () => {
    let theDB = this.localStatsDb;
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
        console.debug(`${this.localStatsDbName} DB has been reset`);
      })
      .catch(err => {
        console.error("error inside Stats reset DB");
        console.error(err);
      });
  };

  traceStats = (stats, logMessage = `tracing stats (length: ${stats.length})`) => {
    console.info(logMessage);
    stats.map(item => item.trace());
  };

  updateStat = stat => {
    this.localStatsDb
      .put(stat)
      .then(response => {
        console.debug("the following stat was updated to db:");
        console.debug(stat);
        console.debug("response:");
        console.debug(response);
      })
      .catch(err => {
        console.error("error inside updateStat");
        console.error(err);
      });
  };

  seedStatsDB = () => {
    this.localStatsDb
      .bulkDocs(STATS_SEEDS)
      .then(() => console.info(`${this.localStatsDbName} DB seeded`))
      .catch(err => {
        console.error("error inside Stats seed DB");
        console.error(err);
      });
  };
}
