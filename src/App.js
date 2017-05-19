import React, { Component } from "react";
import "./App.css";
import Stats from "./components/Stats.js";

import TestArea from "./components/TestArea.js";

class Term {
  constructor(entriesArray, translationsArray) {
    this.entries = entriesArray;
    this.translations = translationsArray;
    this.totalSuccessfulTranslations = 0;
    this.totalFailedTranslations = 0;
    this.totalTimesSelected = 0;
    this.isCurrentlyCorrectTranslated = false;
  }

  success() {
    this.totalSuccessfulTranslations += 1;
    this.isCurrentlyCorrectTranslated = true;
  }

  failure() {
    this.totalFailedTranslations += 1;
    this.isCurrentlyCorrectTranslated = false;
  }

  selected() {
    this.totalTimesSelected += 1;
  }
}

const voc = [
  new Term(["ναι"], ["ja"]),
  new Term(["κατόπιν"], ["anschließend"]),
  new Term(["ευγενικός"], ["nett"]),
  new Term(["αυτοκίνητο"], ["das Auto"])
];

const voc1 = [
  new Term(["λάθος"], ["der Fehler"]),
  new Term(["όχι"], ["nein"]),
  new Term(["οθόνη"], ["der Monitor"]),
  new Term(["ηλεκτρονικός υπολογιστής"], ["der Rechner"]),
  new Term(["εγκατάσταση"], ["installieren"]),
  new Term(["σύνδεση"], ["einloggen"])
];

class App extends Component {
  state = { vocabulary: voc.slice() };

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
    console.log("FINISHED pressed");
    alert("Congratulations! Now restarting");
    this.restart();
  };

  restart = () => {
    console.log("now RESTARTING");
    this.setState({ vocabulary: voc1.slice() });
  };

  recordSuccessfulTranslation = vocabulary_index => {
    const new_vocabulary = this.state.vocabulary;
    // todo εδώ ίσως να πρέπει να κάνω σωστό αντίγραφο του vocabulary
    new_vocabulary[vocabulary_index].success();
    this.setState({ vocabulary: new_vocabulary });
  };

  recordFailedTranslation = vocabulary_index => {
    const new_vocabulary = this.state.vocabulary;
    // todo εδώ ίσως να πρέπει να κάνω σωστό αντίγραφο του vocabulary
    new_vocabulary[vocabulary_index].failure();
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
      return totalCount + (term.isCurrentlyCorrectTranslated === true);
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
