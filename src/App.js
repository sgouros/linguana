import React, { Component } from "react";
import "./App.css";
import Stats from "./components/Stats.js";
import TestArea from "./components/TestArea.js";
import StartModal from "./components/StartModal.js";
import FinishModal from "./components/FinishModal.js";
import VocabularyFactory from "./VocabularyFactory.js";
import VocabularyManager from "./components/VocabularyManager.js";

export default class App extends Component {
  state = {
    vocabulary: [],
    first_session: true,
    showStartModal: false,
    showFinishModal: false,
    showVocabularyManager: false
  };

  vocabularyFactory = new VocabularyFactory();
  initialVocabularyLength = 10;
  allSelectedEntries = [];

  closeStartingSummaryModal = () => {
    this.setState({ showStartModal: false });
    this.refs.testArea.refs.translationInput.refs.theInput.focus();
  };

  start = () => {
    console.info("\n\n-------------------- now STARTING -----------------");
    const newConstructedVocabulary = this.vocabularyFactory.getNewVocabulary(
      this.initialVocabularyLength,
      this.allSelectedEntries
    );
    this.allSelectedEntries = [...newConstructedVocabulary];

    console.info(
      `adding ${newConstructedVocabulary.length} new entries to vocabulary array`
    );
    // this.traceVocabulary(newConstructedVocabulary);
    this.setState({
      vocabulary: newConstructedVocabulary,
      first_session: false,
      showStartModal: true
    });
  };

  finish = () => {
    this.setState({
      showFinishModal: true
    });
  };

  // todo: αυτό πρέπει να διορθωθεί και να φύγει και από εδώ
  traceVocabulary = voc => {
    console.info("------- tracing vocabulary ---------");
    voc.map(entry => {
      console.info(
        `${entry.term} - ${entry.translation}: ${entry.totalTimesSelected} times selected`
      );
      return entry;
    });
    console.info("----- end tracing vocabulary -------");
  };

  recordSuccessfulTranslation = entry_index => {
    const new_voc = this.state.vocabulary;
    new_voc[entry_index].success();
    this.setState({ vocabulary: new_voc });
  };

  recordFailedTranslation = entry_index => {
    const new_voc = this.state.vocabulary;
    new_voc[entry_index].failure();
    this.setState({ vocabulary: new_voc });
  };

  removeEntryFromVocabulary = currentIndex => {
    console.info("removing entry from vocabulary array");
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

  addEntryToVocabulary = currentIndex => {
    const vocabularyToAdd = this.vocabularyFactory.getNewVocabulary(
      1,
      this.allSelectedEntries
    );

    // todo ό,τι υπάρχει από εδώ και πέρα πρέπει να καλείται (callback) όταν έχουμε πλέον νέο vocabulary
    console.info(`adding 1 new entry to vocabulary array`);
    this.traceVocabulary(vocabularyToAdd);
    const updatedVocabulary = [
      ...this.state.vocabulary.slice(0, currentIndex),
      ...vocabularyToAdd,
      ...this.state.vocabulary.slice(currentIndex, this.state.vocabulary.length)
    ];
    this.allSelectedEntries.push(...vocabularyToAdd);
    console.info("tracing allSelectedEntries");
    this.traceVocabulary(this.allSelectedEntries);

    this.setState({
      vocabulary: updatedVocabulary
    });
  };

  getTotalEntries = () => {
    return this.state.vocabulary.length;
  };

  getTotalCorrectTranslations = () => {
    return this.state.vocabulary.reduce((totalCount, entry) => {
      return totalCount + (entry.isCurrentlyCorrectlyTranslated === true);
    }, 0);
  };

  getTotalWrongTranslations = () => {
    return this.getTotalEntries() - this.getTotalCorrectTranslations();
  };

  constructStartingSummaryModalContent = () => {
    const htmlTable = this.state.vocabulary.map(entry => {
      return (
        <tr key={entry._id}>
          <td>{entry.term}</td>
          <td>{entry.translation}</td>
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

  constructFinishModalContent = () => {
    return (
      <img
        className="css-congratulations-img"
        src="/img/congratulations.jpg"
        alt="congratulations"
      />
    );
  };

  closeFinishModal = () => {
    this.setState({
      showFinishModal: false,
      first_session: true
    });
  };

  openVocabularyManager = () => {
    console.info("------- opening vocabulary manager ----------");
    this.setState({ showVocabularyManager: true });
  };

  newEntrySubmitted = (term, translation) => {
    let updatedGlobalVoc = this.vocabularyFactory.addNewEntry(
      term,
      translation
    );
    this.traceVocabulary(updatedGlobalVoc);
  };

  seedDatabase = () => {
    this.vocabularyFactory.seedDatabase();
  };

  resetDatabase = () => {
    this.vocabularyFactory.resetDatabase();
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
              totalEntriesCount={this.getTotalEntries()}
              correctTranslationsCount={this.getTotalCorrectTranslations()}
              wrongTranslationsCount={this.getTotalWrongTranslations()}
            />}
        </nav>
        <main>
          {!this.state.first_session &&
            <TestArea
              ref="testArea"
              vocabulary={this.state.vocabulary}
              onSuccessfulTranslation={this.recordSuccessfulTranslation}
              onFailedTranslation={this.recordFailedTranslation}
              onEscPress={this.removeEntryFromVocabulary}
              onLastEscPress={this.finish}
              onPlusPress={this.addEntryToVocabulary}
            />}
          {this.state.showVocabularyManager &&
            <VocabularyManager
              ref="vocabularyManager"
              onNewEntrySubmitted={this.newEntrySubmitted}
            />}
        </main>
        {this.state.showStartModal
          ? <StartModal
              title="Welcome to Linguana! Here are your words for today:"
              content={this.constructStartingSummaryModalContent()}
              onClose={this.closeStartingSummaryModal}
            />
          : null}
        {this.state.showFinishModal
          ? <FinishModal
              title=""
              content={this.constructFinishModalContent()}
              onClose={this.closeFinishModal}
            />
          : null}
        <nav className="right-nav">
          <button className="new-session-button" onClick={this.start}>
            new session
          </button>
          <button
            className="open-vocabulary-manager-button"
            onClick={this.openVocabularyManager}
          >
            vocabulary manager
          </button>
          <button className="debug-button" onClick={this.seedDatabase}>
            seed database
          </button>
          <button className="debug-button" onClick={this.resetDatabase}>
            reset database
          </button>
        </nav>
        <footer>
          Διεύθυνση Αναπτυξιακού Προγραμματισμού Περιφέρειας ΑΜΘ
        </footer>
      </div>
    );
  }
}
