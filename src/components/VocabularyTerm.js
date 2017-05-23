class VocabularyTerm {
  constructor(entriesArray, translationsArray, totalTimesSelected) {
    this.entries = entriesArray;
    this.translations = translationsArray;
    this.totalSuccessfulTranslations = Math.floor(Math.random() * 50 + 1);
    this.totalFailedTranslations = Math.floor(Math.random() * 50 + 1);
    this.totalTimesSelected = totalTimesSelected;
    this.isCurrentlyCorrectlyTranslated = false;
  }

  success() {
    this.totalSuccessfulTranslations += 1;
    this.isCurrentlyCorrectlyTranslated = true;
  }

  failure() {
    this.totalFailedTranslations += 1;
    this.isCurrentlyCorrectlyTranslated = false;
  }

  selected() {
    this.totalTimesSelected += 1;
  }
}

export default VocabularyTerm;
