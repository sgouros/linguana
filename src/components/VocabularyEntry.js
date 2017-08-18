export default class VocabularyEntry {
  constructor(
    id,
    rev,
    nativeTerm,
    foreignTerm,
    foreignTermNotes,
    totalSuccesses,
    totalFailures,
    totalTimesSelected
  ) {
    if (id === null) {
      this._id = `${nativeTerm}-${foreignTerm}`;
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
    console.info(`    this.isCurrentlyCorrectlyTranslated: ${this.isCurrentlyCorrectlyTranslated}`);
  }

  success() {
    this.totalSuccesses += 1;
    this.isCurrentlyCorrectlyTranslated = true;
  }

  failure() {
    this.totalFailures += 1;
    this.isCurrentlyCorrectlyTranslated = false;
  }

  selected() {
    this.totalTimesSelected += 1;
  }

  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  // getUniqueID() {
  //   return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
  //     let r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
  //     return v.toString(16);
  //   });
  // }
}
