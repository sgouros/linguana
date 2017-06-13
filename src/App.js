import React, { Component } from "react";
import "./App.css";
import Stats from "./components/Stats.js";
import TestArea from "./components/TestArea.js";
import StartModal from "./components/StartModal.js";
import FinishModal from "./components/FinishModal.js";
import VocabularyFactory from "./VocabularyFactory.js";
import VocabularyManager from "./components/VocabularyManager.js";
import Notifications from "react-notification-system";

export default class App extends Component {
  state = {
    vocabulary: [],
    first_session: true,
    showStartModal: false,
    showFinishModal: false,
    showVocabularyManager: false,
    isStartModalLoading: false,
    showAddEntryLoading: false
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
    this.refs.testArea.refs.translationInput.refs.theInput.focus();
  };

  newSession = () => {
    console.info("\n\n-------- NEW SESSION:");
    this.vocabularyFactory.newVocabularyNeeded(this.onNewVocabularyArrived);

    this.allSelectedEntries = [];
    this.setState({
      vocabulary: [],
      showStartModal: true,
      isStartModalLoading: true
    });
  };

  onNewVocabularyArrived = (newVoc, currentIndex) => {
    console.info("new voc arrived");

    this.traceVocabulary(newVoc);
    const updatedVocabulary = [
      ...this.state.vocabulary.slice(0, currentIndex),
      ...newVoc,
      ...this.state.vocabulary.slice(currentIndex, this.state.vocabulary.length)
    ];
    this.allSelectedEntries.push(...newVoc);

    this.setState({
      first_session: false,
      isStartModalLoading: false,
      vocabulary: updatedVocabulary
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
      console.info(`${entry.term} - ${entry.translation}: ${entry.totalTimesSelected} times selected`);
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
      first_session: true
    });
  };

  openVocabularyManager = () => {
    this.setState({ showVocabularyManager: true });
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
    this.traceVocabulary(this.state.vocabulary);
  };

  traceDatabasePressed = () => {
    this.vocabularyFactory.traceDatabase();
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
          <Notifications ref="notifications" style={this.notificationsStyle} />
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
        <nav className="right-nav">

          <button className="new-session-button" onClick={this.newSession}>
            New session
          </button>

          <button className="open-vocabulary-manager-button" onClick={this.openVocabularyManager}>
            Vocabulary manager
          </button>

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
          </button>

        </nav>
        <footer>
          Διεύθυνση Αναπτυξιακού Προγραμματισμού Περιφέρειας ΑΜΘ
        </footer>
      </div>
    );
  }
}
