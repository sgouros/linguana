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
    console.debug(`  tracing ${this._id}:`);
    console.debug(`    this._rev: ${this._rev}`);
    console.debug(`    this.nativeTerm: ${this.nativeTerm}`);
    console.debug(`    this.foreignTerm: ${this.foreignTerm}`);
    console.debug(`    this.foreignTermNotes: ${this.foreignTermNotes}`);
    console.debug(`    this.totalFailures: ${this.totalFailures}`);
    console.debug(`    this.totalSuccesses: ${this.totalSuccesses}`);
    console.debug(`    this.totalTimesSelected: ${this.totalTimesSelected}`);
    console.debug(`    this.lastDateCorrectlyTranslated: ${this.lastDateCorrectlyTranslated}`);
    console.debug(`    this.isCurrentlyCorrectlyTranslated: ${this.isCurrentlyCorrectlyTranslated}`);
  }

  extract() {
    console.debug(
      `new VocabularyEntry("${this.foreignTerm}_${this.nativeTerm}", null, "${this.nativeTerm}", "${this.foreignTerm}", "${this
        .foreignTermNotes}", ${this.totalSuccesses}, ${this.totalFailures}, ${this.totalTimesSelected}, "${this
        .lastDateCorrectlyTranslated}"),`
    );
  }

  constructDownloadString(stringArray, isLastItem) {
    if (isLastItem) {
      stringArray.push(
        `new VocabularyEntry("${this.foreignTerm}_${this.nativeTerm}", null, "${this.nativeTerm}", "${this.foreignTerm}", "${this
          .foreignTermNotes}", ${this.totalSuccesses}, ${this.totalFailures}, ${this.totalTimesSelected}, "${this
          .lastDateCorrectlyTranslated}")`
      );
    } else {
      stringArray.push(
        `new VocabularyEntry("${this.foreignTerm}_${this.nativeTerm}", null, "${this.nativeTerm}", "${this.foreignTerm}", "${this
          .foreignTermNotes}", ${this.totalSuccesses}, ${this.totalFailures}, ${this.totalTimesSelected}, "${this
          .lastDateCorrectlyTranslated}"),`
      );
    }
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
