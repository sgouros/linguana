import React, { Component } from "react";
import "./App.css";
import Stats from "./components/Stats.js";
import TestArea from "./components/TestArea.js";
import StartModal from "./components/StartModal.js";
import FinishModal from "./components/FinishModal.js";
import VocabularyFactory from "./VocabularyFactory.js";
import VocabularyManager from "./components/VocabularyManager.js";
import Notifications from "react-notification-system";
import VocabularyTable from "./components/VocabularyTable.js";

export default class App extends Component {
  state = {
    vocabulary: [],
    showTestArea: false,
    showStartModal: false,
    showFinishModal: false,
    showVocabularyManager: false,
    isStartModalLoading: false,
    showAddEntryLoading: false,
    currentSearchInputValue: "",
    searchResults: [],
    showSearchResults: false
  };

  notifications = null;

  notificationsStyle = {
    NotificationItem: {
      DefaultStyle: {
        width: 420
      }
    }
  };

  vocabularyFactory = new VocabularyFactory(this);

  allSelectedEntries = [];

  addErrorNotification = (title, message, secondsToDismiss = 0) => {
    this.notifications.addNotification({
      title: title,
      message: message,
      level: "error",
      position: "bl",
      autoDismiss: secondsToDismiss
    });
  };

  addInfoNotification = (title, message, secondsToDismiss) => {
    this.notifications.addNotification({
      title: title,
      message: message,
      level: "info",
      position: "bl",
      autoDismiss: secondsToDismiss
    });
  };

  addSuccessNotification = (title, message, secondsToDismiss = 0) => {
    this.notifications.addNotification({
      title: title,
      message: message,
      level: "success",
      position: "bl",
      autoDismiss: secondsToDismiss
    });
  };

  componentDidMount = () => {
    this.notifications = this.refs.notifications;
  };

  closeStartingSummaryModal = () => {
    this.setState({ showStartModal: false });
    this.refs.testArea.refs.translationInputDE.refs.input.focus();
  };

  newSession = () => {
    console.info("\n\n-------- NEW SESSION:");
    this.vocabularyFactory.newVocabularyNeeded(this.onNewVocabularyArrived);
    this.allSelectedEntries = [];
    this.setState({
      vocabulary: [],
      showStartModal: true,
      isStartModalLoading: true,
      showSearchResults: false,
      currentSearchInputValue: "",
      searchResults: []
    });
  };

  onNewVocabularyArrived = (newVoc, currentIndex) => {
    console.info("new voc arrived");
    // this.vocabularyFactory.traceVocabulary(newVoc);
    const updatedVocabulary = [
      ...this.state.vocabulary.slice(0, currentIndex),
      ...newVoc,
      ...this.state.vocabulary.slice(currentIndex, this.state.vocabulary.length)
    ];
    this.allSelectedEntries.push(...newVoc);

    this.setState({
      showTestArea: true,
      isStartModalLoading: false,
      vocabulary: updatedVocabulary
    });
  };

  finish = () => {
    this.setState({
      showFinishModal: true
    });
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
      ...this.state.vocabulary.slice(currentIndex + 1, this.state.vocabulary.length)
    ];
    this.setState({
      vocabulary: new_voc
    });
  };

  // increase current Voc by 1
  addEntryToVocabulary = currentIndex => {
    this.vocabularyFactory.newVocabularyNeeded(
      this.onNewVocabularyArrived,
      1,
      this.allSelectedEntries,
      currentIndex
    );
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
      <img className="css-congratulations-img" src="/img/congratulations.jpg" alt="congratulations" />
    );
  };

  closeFinishModal = () => {
    this.setState({
      showFinishModal: false,
      showTestArea: false
    });
  };

  openVocabularyManager = () => {
    this.setState({
      showVocabularyManager: true,
      showSearchResults: false,
      showTestArea: false
    });
  };

  newEntrySubmitted = (term, translation, newEntrySaveSucceeded, newEntrySaveFailed) => {
    // console.debug(`submited ${term} with translation ${translation}`);
    this.vocabularyFactory.addEntry(
      term,
      translation,
      this.newEntrySaveToDbSucceeded,
      this.newEntrySaveToDbFailed
    );
  };

  newEntrySaveToDbSucceeded = (term, translation, response) => {
    console.info(`${term}-${translation} saved to DB. Response: ${JSON.stringify(response)}`);
    this.addSuccessNotification(`Success!`, `Added ${term}-${translation} to database.`, 3);
  };

  newEntrySaveToDbFailed = (term, translation, error) => {
    console.info(
      `Failed to save ${term}-${translation} to DB. Error description: ${JSON.stringify(error)}`
    );

    this.addErrorNotification(
      `Failed to save ${term}-${translation}`,
      `Error: ${JSON.stringify(error)}`
    );
  };

  seedDatabasePressed = () => {
    this.vocabularyFactory.seedDatabase();
  };

  resetDatabasePressed = () => {
    this.vocabularyFactory.resetDatabase();
  };

  traceVocabularyPressed = () => {
    this.vocabularyFactory.traceVocabulary(this.state.vocabulary);
  };

  traceDatabasePressed = () => {
    this.vocabularyFactory.traceDatabase();
  };

  onSearchCompleted = voc => {
    this.setState({
      showSearchResults: true,
      searchResults: voc,
      showVocabularyManager: false,
      showTestArea: false
    });
  };

  handleSearchInputOnChange = event => {
    this.setState({ currentSearchInputValue: this.refs.searchInput.value });
  };

  handleSearchSubmit = event => {
    event.preventDefault();
    let searchTerm = this.state.currentSearchInputValue;
    let callBack = this.onSearchCompleted;
    this.vocabularyFactory.search(searchTerm, callBack);
  };

  deleteEntry = vocabularyEntry => {
    console.info(`------- deleting entry: ${vocabularyEntry._id}`);

    // delete entry from db
    this.vocabularyFactory.deleteEntryFromDb(vocabularyEntry);

    // delete entry from allSelectedEntries
    console.info("--- deleting from allSelectedEntries");
    let a = this.allSelectedEntries.indexOf(vocabularyEntry);
    let newSelectedEntries = this.allSelectedEntries.filter((entry, index) => index !== a);
    this.allSelectedEntries = newSelectedEntries;
    // this.vocabularyFactory.traceVocabulary(this.allSelectedEntries, "tracing this.allSelectedEntries");

    // delete entry from searchResults
    console.info("--- deleting entry from searchResults");
    let b = this.state.searchResults.indexOf(vocabularyEntry);
    let newSearchResults = this.state.searchResults.filter((entry, index) => index !== b);
    // this.vocabularyFactory.traceVocabulary(newSearchResults, "tracing newSearchResults");
    this.setState({
      searchResults: newSearchResults
    });

    // delete entry from state vocabulary
    console.info("--- deleting term from state vocabulary");
    let c = this.state.vocabulary.indexOf(vocabularyEntry);
    let newVocabulary = this.state.vocabulary.filter((entry, index) => index !== c);
    // this.vocabularyFactory.traceVocabulary(newVocabulary, "tracing newVocabulary");
    this.setState({
      vocabulary: newVocabulary
    });
  };

  editEntry = entryId => {
    console.info("App.entryEdit() not yet implemented");
  };

  render() {
    return (
      <div id="page">
        <header>
          <div id="logo">
            <img id="logoImage" src="/img/logo.png" alt="linguana logo" />
            <p id="logoText"> Linguana </p>
          </div>
          <form id="searchForm" onSubmit={this.handleSearchSubmit}>
            <input
              ref="searchInput"
              id="searchInput"
              name="searchInput"
              type="text"
              autoCorrect="off"
              spellCheck="off"
              value={this.state.currentSearchInputValue}
              placeholder="αναζήτηση..."
              onChange={this.handleSearchInputOnChange}
            />
          </form>
        </header>

        <nav>
          <button id="newSessionButton" className="navButton" onClick={this.newSession}>
            start new session !
          </button>

          <button
            id="vocabularyManagerButton"
            className="navButton"
            onClick={this.openVocabularyManager}
          >
            open vocabulary manager
          </button>

          {/*
          <button className="debug-button" onClick={this.seedDatabasePressed}>
            seed database
          </button>

          <button className="debug-button" onClick={this.resetDatabasePressed}>
            reset database
          </button>
          <button className="debug-button" onClick={this.traceVocabularyPressed}>
            trace vocabulary
          </button>
          <button className="debug-button" onClick={this.traceDatabasePressed}>
            trace database
          </button>*/}

        </nav>

        <main>
          <Notifications ref="notifications" style={this.notificationsStyle} />

          {this.state.showSearchResults &&
            <VocabularyTable
              title="Search results:"
              vocabulary={this.state.searchResults}
              onEdit={this.editEntry}
              onDelete={this.deleteEntry}
            />}
          {this.state.showTestArea &&
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
            <VocabularyManager ref="vocabularyManager" onNewEntrySubmitted={this.newEntrySubmitted} />}
        </main>

        {this.state.showStartModal
          ? <StartModal
              title="Welcome to Linguana! Here are your words for today:"
              content={this.constructStartingSummaryModalContent()}
              isLoading={this.state.isStartModalLoading}
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

        <footer>
          footer
          {this.state.showTestArea &&
            <Stats
              totalEntriesCount={this.getTotalEntries()}
              correctTranslationsCount={this.getTotalCorrectTranslations()}
              wrongTranslationsCount={this.getTotalWrongTranslations()}
            />}
        </footer>
      </div>
    );
  }
}
