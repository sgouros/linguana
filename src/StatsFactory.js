import StatsEntry from "./components/StatsEntry.js";
import PouchDB from "pouchdb";
PouchDB.plugin(require("pouchdb-find"));

export default class StatsFactory {
  constructor(app) {
    this.app = app;
    window.PouchDB = PouchDB; // for dev tools

    this.localStatsDbName = "linguanaStats";
    this.remoteStatsDbName = "http://localhost:5984/" + this.localStatsDbName;
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

  // loadStats = numberOfDaysNeeded => {
  //   this.localStatsDb
  //     .createIndex({
  //       index: {
  //         fields: ["date"]
  //       }
  //     })
  //     .then(() => {
  //       return this.localVocDb.find({
  //         selector: {
  //           date: { $between: "specific dates" }
  //         },
  //         sort: [{ date: "asc" }],
  //         limit: numberOfDaysNeeded
  //       });
  //     })
  //     .then(resultFromDb => {
  //       let newStats = this.constructStats(resultFromDb.docs);
  //       return newStats;
  //     })
  //     .then(result => {
  //       onSuccess(newStats);
  //     })
  //     .catch(console.log.bind(console));
  // };

  constructStats = statsFromDatabase => {
    let newStats = statsFromDatabase.map(item => {
      return new StatsEntry(item._id, item._rev, item.totalWordsLearned);
    });
    return newStats;
  };

  // addStat = totalWordsLearned => {
  //   let newStat = new StatsEntry(null, null, totalWordsLearned);
  //   this.localVocDb
  //     .put(newStat)
  //     .then(response => {
  //       onSuccess(newStats);
  //     })
  //     .catch(error => {
  //       onFailure(newStats, error);
  //     });
  // };

  // saveTotalWordsLearnedTodayToDB = wordsArray => {
  //   let stats = new StatsEntry();
  //   stats.wordsArray = wordsArray;
  //   stats.total; // todo: construct stats object

  //   this.localStatsDb
  //     .put(stats)
  //     .then(response => {
  //       console.debug("stats saved");
  //     })
  //     .catch(err => {
  //       console.error("error updating words stat");
  //       console.error(err);
  //     });
  // };

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

  // αυτή τη στιγμή γίνονται σωστά seed τα stats στη βάση δεδομένων. Δεν έχουν συνδεθεί όμως
  // με το heatmap component (για την ώρα το component
  // τροφοδοτείται από μία const μεταβλητή πίνακα μέσα στην app. Χρειάζεται
  // να μπορώ να διαβάζω όλα τα stats από τη βάση δεδομένων στην αρχή της εφαρμογής
  // και να σετάρω με αυτά το state της app (σημ: έτοιμος κώδικας για το διάβασμα όλων
  // υπάρχει στην StatsFactory.traceDatabase)
  // Κατόπιν πρέπει κάθε φορά που έχουμε μία learned word (όταν πατιέται esc)
  // να αυξάνεται κατά ένα το count της υπάρχουσας date και να προποποιείται η statentry
  // στη βάση δεδομένων
  // σε δεύτερο στάδιο ίσως θα ήταν καλό να αποθηκεύεται όχι μόνο ο αριθμός των learned words
  // αλλά και το ποιές είναι αυτές (τα ids) και αντί για μεταβλητή count στη βάση δεδομένων
  // να επιστρέφεται το length του πινακα που περιέχει τα ids των learned words
  // ίσως αυτή η προσέγγιση να είναι και η καλύτερη γιατί μετά στο onclick του heatmap
  // μπορείς σε ένα παραθυράκι να εμφανίζει ποιές λέξεις έμαθες κάθε μέρα

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
