export default class StatsEntry {
  constructor(id, rev, totalWordsLearned) {
    id === null ? (this._id = this.getToday()) : (this._id = id);
    this._rev = rev;
    this.totalWordsLearned = totalWordsLearned;
  }

  getToday() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();
    if (dd < 10) {
      dd = "0" + dd;
    }
    if (mm < 10) {
      mm = "0" + mm;
    }
    today = yyyy + "-" + mm + "-" + dd;
    return today;
  }

  constructDownloadString(stringArray, isLastItem) {
    if (isLastItem) {
      stringArray.push(`new StatsEntry("${this._id}", null, ${this.totalWordsLearned})`);
    } else {
      stringArray.push(`new StatsEntry("${this._id}", null, ${this.totalWordsLearned}),`);
    }
  }

  extract() {
    console.debug(`new StatsEntry("${this._id}", null, ${this.totalWordsLearned}),`);
  }

  trace() {
    console.info(`  tracing STATS for date: ${this._id}:`);
    console.info(`    this._rev: ${this._rev}`);
    console.info(`    this.totalWordsLearned: ${this.totalWordsLearned}`);
  }
}
