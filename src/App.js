import React, { Component } from "react";
import "./App.css";
import Stats from "./components/Stats.js";

import TestArea from "./components/TestArea.js";
// import StartPage from "./components/StartPage.js";

// import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class Term {
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

const GLOBAL_VOC = [
  new Term(["ναι"], ["ja"], 1),
  new Term(["κατόπιν"], ["anschließend"], 5),
  new Term(["ευγενικός"], ["nett"], 7),
  new Term(["αυτοκίνητο"], ["das Auto"], 12),
  new Term(["λάθος"], ["der Fehler"], 5),
  new Term(["όχι"], ["nein"], 3),
  new Term(["οθόνη"], ["der Monitor"], 1),
  new Term(["ηλεκτρονικός υπολογιστής"], ["der Rechner"], 2),
  new Term(["εγκατάσταση"], ["installieren"], 0),
  new Term(["σύνδεση"], ["einloggen"], 20),
  new Term(["hardly μετα βίας"]["kaum"], 7),
  new Term(["πόνος"], ["der Schmerz"], 12),
  new Term(["ασφαλισμένος"], ["versichert"], 17),
  new Term(["προφανώς"], ["offensichtlich"], 8),
  new Term(["εκφράζω"], ["ausdrücken"], 7),
  new Term(["αξία"], ["der Wert"], 4),
  new Term(["διατήρηση"], ["die Erhaltung"], 16),
  new Term(["μεταφόρτωση (download)"], ["runterladen"], 7),
  new Term(["ανέκδοτο"], ["der Witz"], 4),
  new Term(["τρόφιμα"], ["das Lebensmittel"], 8)
];

class App extends Component {
  state = { vocabulary: GLOBAL_VOC };

  // {alert(this.construct_alert_message())}
  construct_alert_message = () => {
    let flatArray = this.state.vocabulary.map(item => {
      return (
        item.sourceTermsArray[0] + ": " + item.destinationTermsArray[0] + "\n"
      );
    });
    return (
      "Καλημέρα!\n\nΈχετε να μάθετε τις παρακάτω λέξεις:\n\n" +
      " " +
      flatArray.join(" ")
    );
  };

  finish = () => {
    // alert("Congratulations! Now restarting");
    this.restart();
  };

  restart = () => {
    console.log("\n\n=====================now RESTARTING");
    const newConstructedVocabulary = this.constructNewVocabulary();

    this.traceVocabulary(newConstructedVocabulary);
    this.setState({ vocabulary: newConstructedVocabulary });
  };

  // από εδώ. Πρέπει να μπορείς να κάνεις σωστά trace το global voc και μετά το sliced voc που κάνεις construct
  traceVocabulary = () => {
    //  console.info(theVoc);
    GLOBAL_VOC.map(item => {
      console.log(`${item.entries[0]}: ${item.totalTimesSelected}`);
      return item;
    });
  };

  constructNewVocabulary = () => {
    const maxNumberOfWords = 4;
    let sortedVocabulary = GLOBAL_VOC.sort(function(term_a, term_b) {
      return term_a.totalTimesSelected - term_b.totalTimesSelected;
    });
    let slicedVocabulary = sortedVocabulary.slice(0, maxNumberOfWords);

    let updatedVocabulary = slicedVocabulary.map(item => {
      item.selected();
      return item;
    });
    return updatedVocabulary;
  };

  recordSuccessfulTranslation = vocabulary_index => {
    const new_vocabulary = this.state.vocabulary[vocabulary_index].success();
    this.setState({ vocabulary: new_vocabulary });
  };

  recordFailedTranslation = vocabulary_index => {
    const new_vocabulary = this.state.vocabulary[vocabulary_index].failure();
    this.setState({ vocabulary: new_vocabulary });
  };

  removeTermFromVocabulary = currentIndex => {
    console.info("removing item from vocabulary array");
    const new_voc = [
      ...this.state.vocabulary.slice(0, currentIndex),
      ...this.state.vocabulary.slice(
        currentIndex + 1,
        this.state.vocabulary.length
      )
    ];

    this.setState({
      vocabulary: new_voc
    });
  };

  getTotalTerms = () => {
    return this.state.vocabulary.length;
  };

  getTotalCorrectTranslatedTerms = () => {
    return this.state.vocabulary.reduce((totalCount, term) => {
      return totalCount + (term.isCurrentlyCorrectlyTranslated === true);
    }, 0);
  };

  getTotalWrongTranslatedTerms = () => {
    return this.getTotalTerms() - this.getTotalCorrectTranslatedTerms();
  };

  render() {
    return (
      <div id="page">
        <header>
          Planner: ΟΠΣ Παρακολούθησης Αναπτυξιακών Εργων Περιφέρειας ΑΜΘ
        </header>
        <nav className="left-nav">
          <Stats
            totalTermsCount={this.getTotalTerms()}
            correctTranslatedTermsCount={this.getTotalCorrectTranslatedTerms()}
            wrongTranslatedTermsCount={this.getTotalWrongTranslatedTerms()}
          />
        </nav>
        <main>
          <TestArea
            vocabulary={this.state.vocabulary}
            onSuccessfulTranslation={this.recordSuccessfulTranslation}
            onFailedTranslation={this.recordFailedTranslation}
            onEscPress={this.removeTermFromVocabulary}
          />
        </main>
        <nav className="right-nav">
          <button onClick={this.finish}>Finished</button>
        </nav>
        <footer>
          Διεύθυνση Αναπτυξιακού Προγραμματισμού Περιφέρειας ΑΜΘ
        </footer>
      </div>
    );
  }
}

export default App;
