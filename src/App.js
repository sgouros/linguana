import React, { Component } from "react";
import "./App.css";
import Stats from "./components/Stats.js";
import TestArea from "./components/TestArea.js";
import StartModal from "./components/StartModal.js";
import GLOBAL_VOC from "./Globals.js";

export default class App extends Component {
  state = {
    vocabulary: GLOBAL_VOC,
    first_session: true,
    showStartModal: false
  };

  closeStartingSummaryModal = () => {
    this.setState({ showStartModal: false });
    console.log(this.refs);
    this.refs.testArea.refs.translationInput.refs.theInput.focus();
  };

  start = () => {
    console.log("\n\n-------------------- now STARTING --------------");
    const newConstructedVocabulary = this.constructNewVocabulary();
    this.traceVocabulary(newConstructedVocabulary);
    this.setState({
      vocabulary: newConstructedVocabulary,
      first_session: false,
      showStartModal: true
    });
  };

  traceGlobalVocabulary = () => {
    console.log("------- tracing GLOBAL_VOC ---------");
    GLOBAL_VOC.map(item => {
      console.log(`${item.entries[0]}: ${item.totalTimesSelected}`);
      return item;
    });
  };

  traceVocabulary = voc => {
    console.log("\n\n------- tracing vocabulary ---------");
    voc.map(item => {
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

  constructStartingSummaryModalContent = () => {
    const htmlTable = this.state.vocabulary.map(term => {
      return (
        <tr key={term.entries[0]}>
          <td>{term.entries[0]}</td>
          <td>{term.translations[0]}</td>
        </tr>
      );
    });

    return (
      <div>
        <p>Here are the words you need to learn:</p>
        <table className="modalDialogTable">
          <tbody>
            {htmlTable}
          </tbody>
        </table>

      </div>
    );
  };

  render() {
    return (
      <div id="page">
        <header>
          Planner: ΟΠΣ Παρακολούθησης Αναπτυξιακών Εργων Περιφέρειας ΑΜΘ
        </header>
        <nav className="left-nav">
          {!this.state.first_session &&
            <Stats
              totalTermsCount={this.getTotalTerms()}
              correctTranslatedTermsCount={this.getTotalCorrectTranslatedTerms()}
              wrongTranslatedTermsCount={this.getTotalWrongTranslatedTerms()}
            />}
        </nav>
        <main>
          {!this.state.first_session &&
            <TestArea
              ref="testArea"
              vocabulary={this.state.vocabulary}
              onSuccessfulTranslation={this.recordSuccessfulTranslation}
              onFailedTranslation={this.recordFailedTranslation}
              onEscPress={this.removeTermFromVocabulary}
            />}
        </main>
        {this.state.showStartModal
          ? <StartModal
              title="Welcome to Linguana!"
              content={this.constructStartingSummaryModalContent()}
              onClose={this.closeStartingSummaryModal}
            />
          : null}
        <nav className="right-nav">
          <button className="new-session-button" onClick={this.start}>
            new session
          </button>
        </nav>
        <footer>
          Διεύθυνση Αναπτυξιακού Προγραμματισμού Περιφέρειας ΑΜΘ
        </footer>
      </div>
    );
  }
}
