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
    this.failedTranslations += 1;
    this.isCurrentlyCorrectTranslated = false;
  }

  selected() {
    this.timesSelected += 1;
  }
}

const voc = [
  new Term(["ναι"], ["ja"]),
  new Term(["κατόπιν"], ["anschließend"]),
  new Term(["ευγενικός"], ["nett"]),
  new Term(["αυτοκίνητο"], ["das Auto"])
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

  restart = () => {
    // console.log("restart called");
    // this.setState({ vocabulary: voc.slice() });
  };

  recordSuccessfulTranslation = vocabulary_index => {
    console.info("recording success");
    this.getTerm(vocabulary_index).success();
  };

  recordFailedTranslation = vocabulary_index => {
    console.info("recording failure");
    this.getTerm(vocabulary_index).failure();
  };

  getTerm = term_index => {
    console.info(this.state.vocabulary);
    return this.state.vocabulary[term_index];
  };

  removeTermFromVocabulary = currentIndex => {
    if (this.state.vocabulary.length === 1) {
      console.log("ignoring esc key because only one term remains");
    } else {
      console.debug("removing item from vocabulary array");
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
    }
  };

  getTotalTerms = () => {
    return this.state.vocabulary.length;
  };

  getTotalCorrectTranslatedTerms = () => {
    let total = this.state.vocabulary.reduce((totalCount, term) => {
      return totalCount + (term.isCurrentlyCorrectTranslated === true);
    }, 0);
    console.info(total);
    return total;
  };

  getTotalWrongTranslatedTerms = () => {
    return 8;
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
          <button onClick={this.restart}>new</button>
        </nav>
        <footer>
          Διεύθυνση Αναπτυξιακού Προγραμματισμού Περιφέρειας ΑΜΘ
        </footer>
      </div>
    );
  }
}

export default App;
