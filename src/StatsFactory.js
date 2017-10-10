import StatsEntry from "./components/StatsEntry.js";
import PouchDB from "pouchdb";
import PouchFind from "pouchdb-find";
PouchDB.plugin(PouchFind);
PouchDB.plugin(require("pouchdb-upsert"));

export default class StatsFactory {
  constructor(app) {
    this.app = app;
    window.PouchDB = PouchDB; // for dev tools

    this.localStatsDbName = "linguana_stats";
    this.remoteStatsDbName = "http://83.212.105.237:5984/" + this.localStatsDbName;
    // this.remoteStatsDbName = "http://localhost:5984/" + this.localStatsDbName;
    this.localStatsDb = new PouchDB(this.localStatsDbName);
    this.remoteStatsDb = new PouchDB(this.remoteStatsDbName);

    this.localStatsDb
      .sync(this.remoteStatsDb, {
        live: true,
        retry: true
      })
      .on("change", function(change) {
        console.debug("Stats synced!");
      })
      .on("paused", function(info) {
        console.debug("Stats replication was paused, usually because of a lost connection");
      })
      .on("active", function(info) {
        console.debug("Stats replication resumed");
      })
      .on("error", function(err) {
        console.debug("Stats totally unhandeld replication error");
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
      .find({
        selector: {
          _id: { $exists: "true" }
        },
        limit: noOfDaysRequested
      })
      .then(responseFromDb => {
        let statsArray = this.massageStatsForCalendarHeatmap(responseFromDb.docs);
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

  constructDownloadDbString = (stringArray, onSuccess) => {
    this.localStatsDb
      .find({
        selector: {
          _id: { $exists: "true" }
        }
      })
      .then(responseFromDb => {
        let stats = this.constructNewStats(responseFromDb.docs);
        let downloadString = this.constructStatsDownloadString(stats, stringArray);
        downloadString.push(`Total stats entries: ${stats.length}`);
        onSuccess(downloadString);
      })
      .catch(err => {
        console.error("error inside stats constructDownloadDbString");
        console.error(err);
      });
  };

  constructStatsDownloadString = (stats, stringArray) => {
    stats.map(entry => entry.constructDownloadString(stringArray));
    return stringArray;
  };

  extractStats = stats => {
    console.info("************** extracting Stats DB ****************");
    stats.map(entry => entry.extract());
    console.info("************** end of Stats DB extraction ****************");
  };

  increaseTotalWordsLearnedForTodayCount = onSuccessCallback => {
    let today = new Date();
    let id = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    console.info("id=" + id);

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
        console.info(`${this.localStatsDbName} DB has been reset`);
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
      .bulkDocs([
        new StatsEntry("2017-10-2", null, 30),
        new StatsEntry("2017-10-3", null, 49),
        new StatsEntry("2017-10-4", null, 19),
        new StatsEntry("2017-10-5", null, 46),
        new StatsEntry("2017-10-6", null, 58),
        new StatsEntry("2017-10-9", null, 79),
        new StatsEntry("2017-10-10", null, 19),
        new StatsEntry("2017-9-18", null, 12),
        new StatsEntry("2017-9-19", null, 20),
        new StatsEntry("2017-9-20", null, 40),
        new StatsEntry("2017-9-21", null, 39),
        new StatsEntry("2017-9-22", null, 20),
        new StatsEntry("2017-9-25", null, 50),
        new StatsEntry("2017-9-26", null, 28),
        new StatsEntry("2017-9-27", null, 32),
        new StatsEntry("2017-9-28", null, 10),
        new StatsEntry("2017-9-29", null, 30)
      ])
      .then(() => console.info(`${this.localStatsDbName} DB seeded`))
      .catch(err => {
        console.error("error inside Stats seed DB");
        console.error(err);
      });
  };
}
