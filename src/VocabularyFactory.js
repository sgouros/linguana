import VocabularyTerm from "./components/VocabularyTerm.js";

const GLOBAL_VOC = [
  new VocabularyTerm(["εγκατάσταση"], ["installieren"], 0),
  new VocabularyTerm(["ναι"], ["ja"], 1),
  new VocabularyTerm(["οθόνη"], ["der Monitor"], 1),
  new VocabularyTerm(["κατόπιν"], ["anschließend"], 5),
  new VocabularyTerm(["ευγενικός"], ["nett"], 7),
  new VocabularyTerm(["αυτοκίνητο"], ["das Auto"], 12),
  new VocabularyTerm(["λάθος"], ["der Fehler"], 5),
  new VocabularyTerm(["όχι"], ["nein"], 3),
  new VocabularyTerm(["ηλεκτρονικός υπολογιστής"], ["der Rechner"], 2),
  new VocabularyTerm(["hardly μετα βίας"], ["kaum"], 7),
  new VocabularyTerm(["πόνος"], ["der Schmerz"], 12),
  new VocabularyTerm(["ασφαλισμένος"], ["versichert"], 17),
  new VocabularyTerm(["προφανώς"], ["offensichtlich"], 8),
  new VocabularyTerm(["εκφράζω"], ["ausdrücken"], 7),
  new VocabularyTerm(["αξία"], ["der Wert"], 4),
  new VocabularyTerm(["διατήρηση"], ["die Erhaltung"], 16),
  new VocabularyTerm(["μεταφόρτωση (download)"], ["runterladen"], 7),
  new VocabularyTerm(["ανέκδοτο"], ["der Witz"], 4),
  new VocabularyTerm(["τρόφιμα"], ["das Lebensmittel"], 8),
  new VocabularyTerm(["σύνδεση"], ["einloggen"], 20)
];

export default class VocabularyFactory {
  getNewVocabulary = (numberOfTerms, allSelectedTerms = []) => {
    let totalTermsSelected = 0;

    let sortedVocabulary = this.sortGlobalVocabulary();

    let filteredVocabulary = sortedVocabulary.filter(term => {
      if (allSelectedTerms.indexOf(term) >= 0) {
        return false;
      } else {
        if (totalTermsSelected >= numberOfTerms) {
          return false;
        } else {
          totalTermsSelected += 1;
          return true;
        }
      }
    });

    let updatedVocabulary = filteredVocabulary.map(item => {
      item.selected();
      return item;
    });

    return updatedVocabulary;
  };

  sortGlobalVocabulary = () => {
    return GLOBAL_VOC.sort(function(term_a, term_b) {
      return term_a.totalTimesSelected - term_b.totalTimesSelected;
    });
  };
}
