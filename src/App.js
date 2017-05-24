import React, { Component } from "react";
import "./App.css";
import Stats from "./components/Stats.js";
import TestArea from "./components/TestArea.js";
import StartModal from "./components/StartModal.js";
import VocabularyFactory from "./VocabularyFactory.js";

export default class App extends Component {
  state = {
    vocabulary: [],
    first_session: true,
    showStartModal: false
  };

  vocabularyFactory = new VocabularyFactory();
  initialVocabularyLength = 10;
  allSelectedTerms = [];

  closeStartingSummaryModal = () => {
    this.setState({ showStartModal: false });
    this.refs.testArea.refs.translationInput.refs.theInput.focus();
  };

  start = () => {
    console.info("\n\n-------------------- now STARTING --------------");
    const newConstructedVocabulary = this.vocabularyFactory.getNewVocabulary(
      this.initialVocabularyLength,
      this.allSelectedTerms
    );
    this.allSelectedTerms = [...newConstructedVocabulary];

    console.info(
      `adding ${this.initialVocabularyLength} new terms to vocabulary array`
    );
    this.traceVocabulary(newConstructedVocabulary);
    this.setState({
      vocabulary: newConstructedVocabulary,
      first_session: false,
      showStartModal: true
    });
  };

  traceVocabulary = voc => {
    console.info("------- tracing vocabulary ---------");
    voc.map(item => {
      console.info(`${item.entries[0]}: ${item.totalTimesSelected}`);
      return item;
    });
    console.info("----- end tracing vocabulary -------");
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
    console.info("removing term from vocabulary array");
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

  addTermToVocabulary = currentIndex => {
    const vocabularyToAdd = this.vocabularyFactory.getNewVocabulary(
      1,
      this.allSelectedTerms
    );
    console.info(`adding 1 new term to vocabulary array`);
    this.traceVocabulary(vocabularyToAdd);
    const updatedVocabulary = [
      ...this.state.vocabulary.slice(0, currentIndex),
      ...vocabularyToAdd,
      ...this.state.vocabulary.slice(currentIndex, this.state.vocabulary.length)
    ];
    this.allSelectedTerms.push(...vocabularyToAdd);
    console.info("+++++++++++++tracing allSelectedTerms");
    this.traceVocabulary(this.allSelectedTerms);

    this.setState({
      vocabulary: updatedVocabulary
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
              onPlusPress={this.addTermToVocabulary}
            />}
        </main>
        {this.state.showStartModal
          ? <StartModal
              title="Welcome to Linguana! Here are your words for today:"
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
