export default class VocabularyEntry {
  constructor(
    id,
    rev,
    nativeTerm,
    foreignTerm,
    foreignTermNotes,
    totalSuccesses,
    totalFailures,
    totalTimesSelected,
    lastDateCorrectlyTranslated = this.getOldestDate()
  ) {
    if (id === null) {
      this._id = `${foreignTerm}_${nativeTerm}`;
    } else {
      this._id = id;
    }
    this._rev = rev;
    this.nativeTerm = nativeTerm;
    this.foreignTerm = foreignTerm;
    this.foreignTermNotes = foreignTermNotes;
    this.totalSuccesses = totalSuccesses;
    this.totalFailures = totalFailures;
    this.totalTimesSelected = totalTimesSelected;
    this.lastDateCorrectlyTranslated = lastDateCorrectlyTranslated;
    this.isCurrentlyCorrectlyTranslated = false;
  }

  trace() {
    console.info(`  tracing ${this._id}:`);
    console.info(`    this._rev: ${this._rev}`);
    console.info(`    this.nativeTerm: ${this.nativeTerm}`);
    console.info(`    this.foreignTerm: ${this.foreignTerm}`);
    console.info(`    this.foreignTermNotes: ${this.foreignTermNotes}`);
    console.info(`    this.totalFailures: ${this.totalFailures}`);
    console.info(`    this.totalSuccesses: ${this.totalSuccesses}`);
    console.info(`    this.totalTimesSelected: ${this.totalTimesSelected}`);
    console.info(`    this.lastDateCorrectlyTranslated: ${this.lastDateCorrectlyTranslated}`);
    console.info(`    this.isCurrentlyCorrectlyTranslated: ${this.isCurrentlyCorrectlyTranslated}`);
  }

  extract() {
    console.info(
      `new VocabularyEntry("${this.foreignTerm}_${this.nativeTerm}", null, "${this.nativeTerm}", "${this.foreignTerm}", "${this
        .foreignTermNotes}", ${this.totalSuccesses}, ${this.totalFailures}, ${this.totalTimesSelected}, "${this
        .lastDateCorrectlyTranslated}"),`
    );
  }

  success() {
    this.totalSuccesses += 1;
    this.isCurrentlyCorrectlyTranslated = true;
    this.lastDateCorrectlyTranslated = this.getToday();
  }

  failure() {
    this.totalFailures += 1;
    this.isCurrentlyCorrectlyTranslated = false;
  }

  selected() {
    this.totalTimesSelected += 1;
  }

  getToday() {
    return new Date().toISOString();
  }

  getOldestDate() {
    return new Date("2000-01-01T00:00:00.000Z").toISOString();
  }

  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  // getUniqueID() {
  //   return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
  //     let r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
  //     return v.toString(16);
  //   });
  // }
}
