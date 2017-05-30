export default class VocabularyEntry {
  constructor(term, translation, totalTimesSelected) {
    this._id = this.getUniqueID();
    this.term = term;
    this.translation = translation;
    this.totalSuccesses = 0;
    this.totalFailures = 0;
    this.totalTimesSelected = totalTimesSelected;
    this.isCurrentlyCorrectlyTranslated = false;
    console.log(this._id);
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
  getUniqueID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      let r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
