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
  new Term(["εγκατάσταση"], ["installieren"], 0),
  new Term(["ναι"], ["ja"], 1),
  new Term(["οθόνη"], ["der Monitor"], 1),
  new Term(["κατόπιν"], ["anschließend"], 5),
  new Term(["ευγενικός"], ["nett"], 7),
  new Term(["αυτοκίνητο"], ["das Auto"], 12),
  new Term(["λάθος"], ["der Fehler"], 5),
  new Term(["όχι"], ["nein"], 3),
  new Term(["ηλεκτρονικός υπολογιστής"], ["der Rechner"], 2),
  new Term(["hardly μετα βίας"], ["kaum"], 7),
  new Term(["πόνος"], ["der Schmerz"], 12),
  new Term(["ασφαλισμένος"], ["versichert"], 17),
  new Term(["προφανώς"], ["offensichtlich"], 8),
  new Term(["εκφράζω"], ["ausdrücken"], 7),
  new Term(["αξία"], ["der Wert"], 4),
  new Term(["διατήρηση"], ["die Erhaltung"], 16),
  new Term(["μεταφόρτωση (download)"], ["runterladen"], 7),
  new Term(["ανέκδοτο"], ["der Witz"], 4),
  new Term(["τρόφιμα"], ["das Lebensmittel"], 8),
  new Term(["σύνδεση"], ["einloggen"], 20)
];

class App extends Component {
  state = {
    vocabulary: GLOBAL_VOC,
    first_session: true
  };

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
    console.log("\n\n=========== now RESTARTING");
    const newConstructedVocabulary = this.constructNewVocabulary();
    this.traceGlobalVocabulary(newConstructedVocabulary);
    this.setState({
      vocabulary: newConstructedVocabulary,
      first_session: false
    });
  };

  traceGlobalVocabulary = () => {
    //  console.info(theVoc);
    console.log("\n\n------- tracing GLOBAL_VOC ---------");
    GLOBAL_VOC.map(item => {
      console.log(`${item.entries[0]}: ${item.totalTimesSelected}`);
      return item;
    });
  };

  traceVocabulary = () => {
    console.log("\n\n------- tracing vocabulary ---------");
    this.state.vocabulary.map(item => {
      console.log(`${item.entries[0]}: ${item.totalTimesSelected}`);
      return item;
    });
    console.log("----- end tracing vocabulary -------");
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

  recordSuccessfulTranslation = term_index => {
    const new_voc = this.state.vocabulary;
    new_voc[term_index].success();
    this.setState({ vocabulary: new_voc });
  };

  recordFailedTranslation = term_index => {
    const new_voc = this.state.vocabulary;
    new_voc[term_index].failure();
    this.setState({ vocabulary: new_voc });
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
          {this.state.first_session
            ? <p>Olease press start to begin</p>
            : <TestArea
                vocabulary={this.state.vocabulary}
                onSuccessfulTranslation={this.recordSuccessfulTranslation}
                onFailedTranslation={this.recordFailedTranslation}
                onEscPress={this.removeTermFromVocabulary}
              />}
        </main>
        <nav className="right-nav">
          <button onClick={this.restart}>start</button>
          <br /><br />
          <button onClick={this.traceVocabulary}>trace voc</button>
        </nav>
        <footer>
          Διεύθυνση Αναπτυξιακού Προγραμματισμού Περιφέρειας ΑΜΘ
        </footer>
      </div>
    );
  }
}

export default App;
