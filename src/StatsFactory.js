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

  constructStats = statsFromDatabase => {
    let newStats = statsFromDatabase.map(item => {
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

  traceDatabase = () => {
    this.localStatsDb
      .find({
        selector: {
          _id: { $exists: "true" }
        }
      })
      .then(responseFromDb => {
        let s = this.constructStats(responseFromDb.docs);
        this.traceStats(s);
      })
      .catch(err => {
        console.error("error inside traceStatsDatabase");
        console.error(err);
      });
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

  seedDatabase = () => {
    this.localStatsDb
      .bulkDocs([
        new StatsEntry("2017-06-1", null, 1),
        new StatsEntry("2017-06-1", null, 1),
        new StatsEntry("2017-06-2", null, 13),
        new StatsEntry("2017-06-3", null, 12),
        new StatsEntry("2017-06-4", null, 8),
        new StatsEntry("2017-06-5", null, 1),
        new StatsEntry("2017-06-6", null, 4),
        new StatsEntry("2017-06-8", null, 1),
        new StatsEntry("2017-06-11", null, 2),
        new StatsEntry("2017-06-15", null, 5)
      ])
      .then(() => console.info(`${this.localStatsDbName} database seeded`))
      .catch(err => {
        console.error("error inside Stats seed Database");
        console.error(err);
      });
  };

  resetDatabase = () => {
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
        console.info(`${this.localStatsDbName} database has been reset`);
      })
      .catch(err => {
        console.error("error inside Stats reset Database");
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
}
