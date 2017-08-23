import React, { Component } from "react";
import "./App.css";
import Stats from "./components/Stats.js";
import TestArea from "./components/TestArea.js";
import StartModal from "./components/StartModal.js";
import FinishModal from "./components/FinishModal.js";
import SemiFinishModal from "./components/SemiFinishModal.js";
import VocabularyFactory from "./VocabularyFactory.js";
import StatsFactory from "./StatsFactory.js";
import VocabularyManager from "./components/VocabularyManager.js";
import Notifications from "react-notification-system";
import VocabularyTable from "./components/VocabularyTable.js";
import CalendarHeatmap from "./components/CalendarHeatmap/CalendarHeatmap.js";
import { getDateString } from "./components/helpers.js";
import DebugButtons from "./components/DebugButtons.js";
import SearchForm from "./components/SearchForm.js";
import HeaderLogo from "./components/HeaderLogo.js";

// todo:
//        * να ανεβεί στο επίσημο site
//        * να δω αν συγχρονίζουν οι βάσεις δεδομένων
//        * να κάνω refactor σε display components + layout components
//        * να βάλω στο παιχνίδι τις routes
//        * να χρησιμοποιήσω immutability
//        * να δω αρθρα που εκανα favorite στο twitter και να διαβάσω τα ενδιαφέροντα

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      vocabulary: [],
      showTestArea: false,
      showStartModal: false,
      showFinishModal: false,
      showVocabularyManager: false,
      isStartModalLoading: false,
      showAddEntryLoading: false,
      currentSearchInputValue: "",
      searchResults: [],
      showSearchResults: false,
      showStatistics: true,
      heatmapStats: [],
      // Το count είναι διαφορετικό με το array για την ώρα γιατί αποθηκεύεται στη βάση
      totalWordsLearnedForTodayCount: 0,
      pageNotFound: true
    };

    this.totalWordsLearnedForTodayArray = [];
    this.submittedEntriesFromVocabularyManager = [];
  }

  notifications = null;

  passKeyAlreadyPressed = false;
  passKeyTimeout = 0;

  notificationsStyle = {
    NotificationItem: {
      DefaultStyle: {
        width: 350
      }
    }
  };

  daysInHeatmap = 280; // how many days will the heatmap show
  vocabularyFactory = new VocabularyFactory(this);
  statsFactory = new StatsFactory(this);

  allSelectedEntries = []; // the selected vocabulary entries for the current session

  goToStartPage = () => {
    this.allSelectedEntries = [];
    this.setState({
      vocabulary: [],
      showTestArea: false,
      showStartModal: false,
      showFinishModal: false,
      showVocabularyManager: false,
      isStartModalLoading: false,
      showAddEntryLoading: false,
      currentSearchInputValue: "",
      searchResults: [],
      showSearchResults: false,
      showStatistics: true,
      fromNativeToForeign: false
    });
  };

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
    console.info("App.componentDidMount called!");
    this.notifications = this.refs.notifications;
    this.statsFactory.requestStatsForCalendarHeatmap(
      this.daysInHeatmap,
      this.onStatsForCalendarHeatmapArrived
    );
  };

  closeStartingSummaryModal = () => {
    this.setState({ showStartModal: false });
    this.refs.testArea.refs.translationForm.refs.translationInput.refs.input.focus();
  };

  closeSemiFinishModal = () => {
    this.setState({ showSemiFinishModal: false });
    this.refs.testArea.refs.translationForm.refs.translationInput.refs.input.focus();
  };

  newSession = () => {
    console.info("\n\n-------- new Session:");
    this.vocabularyFactory.newVocabularyNeeded(this.onNewVocabularyArrived);
    this.allSelectedEntries = [];
    this.setState({
      vocabulary: [],
      showStartModal: true,
      isStartModalLoading: true,
      showSearchResults: false,
      showVocabularyManager: false,
      currentSearchInputValue: "",
      showStatistics: false,
      searchResults: []
    });
  };

  newSemiSession = () => {
    console.info("\n\n-------- new SEMI Session:");
    let correctWordsFromPreviousSemiSession = this.filterSuccessfullSelectedEntries();

    this.setState({
      showStartModal: false,
      isStartModalLoading: false,
      showSearchResults: false,
      showVocabularyManager: false,
      currentSearchInputValue: "",
      fromNativeToForeign: true,
      searchResults: []
    });

    if (correctWordsFromPreviousSemiSession.length > 0) {
      this.setState({
        vocabulary: correctWordsFromPreviousSemiSession,
        showSemiFinishModal: true,
        showTestArea: true,
        showStatistics: false,
        showFinishModal: false
      });
    } else {
      this.setState({
        vocabulary: [],
        showTestArea: false,
        showStatistics: true,
        showFinishModal: true
      });
    }
  };

  filterSuccessfullSelectedEntries = () => {
    let filteredEntries = this.allSelectedEntries.filter(entry => entry.isCurrentlyCorrectlyTranslated);
    filteredEntries.map(entry => entry.failure());
    return filteredEntries;
  };

  traceTotalWordsLearnedForTodayPressed = () => {
    console.info(`total words learned for today length: ${this.totalWordsLearnedForTodayArray.length}`);
    this.totalWordsLearnedForTodayArray.map(item => {
      console.info("  " + item.id);
      return item;
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

  onStatsForCalendarHeatmapArrived = statsArray => {
    console.info("new stats for heatmap arrived");
    this.setState({ heatmapStats: statsArray });
  };

  recordSuccessfulTranslation = entry_index => {
    const new_voc = this.state.vocabulary;
    console.info("Recording successful translation of: " + entry_index + " " + new_voc[entry_index]._id);
    new_voc[entry_index].success();
    this.vocabularyFactory.updateEntry(new_voc[entry_index]);
    this.setState({ vocabulary: new_voc });
  };

  recordFailedTranslation = entry_index => {
    const new_voc = this.state.vocabulary;
    console.info("Recording failed translation of: " + entry_index + " " + new_voc[entry_index]._id);
    new_voc[entry_index].failure();
    this.vocabularyFactory.updateEntry(new_voc[entry_index]);
    this.setState({ vocabulary: new_voc });
  };

  handleEscPress = currentIndex => {
    let entry = this.state.vocabulary[currentIndex];
    let thisIsTheLastVocWord = this.state.vocabulary.length === 1;

    // αυτό είναι true ακόμη και αν ο όρος είχε μεταφραστεί σωστά την ΠΡΟΗΓΟΥΜΕΝΗ φορά
    if (entry.isCurrentlyCorrectlyTranslated) {
      console.info(`esc pressed and ${entry._id} is correctly translated`);

      if (this.state.fromNativeToForeign) {
        this.saveStatsOfLearnedWord(entry);
      }
    } else {
      console.info(`esc pressed and ${entry._id} is NOT correctly translated`);
    }
    this.removeEntryFromVocabulary(currentIndex);

    if (thisIsTheLastVocWord) {
      if (this.state.fromNativeToForeign) {
        this.setState({
          showFinishModal: true
        });
      } else {
        this.newSemiSession();
      }
    }
  };

  saveStatsOfLearnedWord = entry => {
    let wordLearned = {
      id: entry._id,
      nativeTerm: entry.nativeTerm,
      foreignTerm: entry.foreignTerm
    };

    if (!this.arrayIncludesWordLearned(this.totalWordsLearnedForTodayArray, wordLearned)) {
      this.totalWordsLearnedForTodayArray.push(wordLearned);
      this.statsFactory.increaseTotalWordsLearnedForTodayCount(this.onTotalWordsLearnedForTodayCountUpdated);
    }
  };

  onTotalWordsLearnedForTodayCountUpdated = totalWordsLearned => {
    this.statsFactory.requestStatsForCalendarHeatmap(
      this.daysInHeatmap,
      this.onStatsForCalendarHeatmapArrived
    );

    this.setState({
      totalWordsLearnedForTodayCount: totalWordsLearned
    });
  };

  arrayIncludesWordLearned = (theArray, wordLearned) => {
    let theResult = false;

    theArray.map(item => {
      if (item.id === wordLearned.id) {
        theResult = true;
      }
      return item;
    });
    return theResult;
  };

  removeEntryFromVocabulary = currentIndex => {
    let entry = this.state.vocabulary[currentIndex];
    console.info(`removing entry ${entry._id} from vocabulary array`);
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
          <td>
            {entry.nativeTerm}
          </td>
          <td>
            {entry.foreignTerm}
          </td>
          <td>
            {entry.foreignTermNotes}
          </td>
          <td className="td-correctTranslationsCount">
            {entry.totalSuccesses}
          </td>
          <td className="td-wrongTranslationsCount">
            {entry.totalFailures}
          </td>
          <td className="td-totalTimesSelected">
            {entry.totalTimesSelected}
          </td>
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
      <div>
        <div className="finishModalImages">
          <img className="finishModalLinguanaFaceImg" src="/img/correct.png" alt="happy linguana" />
          <img className="css-congratulations-img" src="/img/congratulations.jpg" alt="congratulations" />
        </div>
      </div>
    );
  };

  closeFinishModal = () => {
    this.setState({
      showFinishModal: false,
      showTestArea: false,
      showStatistics: true,
      fromNativeToForeign: false
    });
  };

  openVocabularyManager = () => {
    this.setState({
      showVocabularyManager: true,
      showSearchResults: false,
      showTestArea: false,
      showStatistics: false
    });
  };

  newEntrySubmitted = (
    nativeTerm,
    foreignTerm,
    foreignTermNotes,
    newEntrySaveSucceeded,
    newEntrySaveFailed
  ) => {
    // console.debug(`submited ${nativeTerm} with translation ${foreignTerm}`);

    this.vocabularyFactory.addEntry(
      nativeTerm,
      foreignTerm,
      foreignTermNotes,
      this.newEntrySaveToDbSucceeded,
      this.newEntrySaveToDbFailed
    );

    this.submittedEntriesFromVocabularyManager.push(`${nativeTerm}-${foreignTerm}`);
  };

  newEntrySaveToDbSucceeded = (nativeTerm, foreignTerm, response) => {
    console.info(`${nativeTerm}-${foreignTerm} saved to DB. Response: ${JSON.stringify(response)}`);
    this.addSuccessNotification(`Success!`, `Added ${nativeTerm}-${foreignTerm} to database.`, 3);
  };

  newEntrySaveToDbFailed = (nativeTerm, foreignTerm, error) => {
    console.info(
      `Failed to save ${nativeTerm}-${foreignTerm} to DB. Error description: ${JSON.stringify(error)}`
    );

    this.addErrorNotification(
      `Failed to save ${nativeTerm}-${foreignTerm}`,
      `Error: ${JSON.stringify(error)}`
    );
  };

  seedDatabasePressed = () => {
    console.info("--------------- seedDatabasePressed");
    this.vocabularyFactory.seedDatabase();
  };

  resetDatabasePressed = () => {
    console.info("--------------- resetDatabasePressed");
    this.vocabularyFactory.resetDatabase();
  };

  traceVocabularyPressed = () => {
    console.info("--------------- traceVocabularyPressed");
    this.vocabularyFactory.traceVocabulary(this.state.vocabulary);
  };

  traceDatabasePressed = () => {
    console.info("--------------- traceDatabasePressed");
    this.vocabularyFactory.traceDatabase();
  };

  traceStatsDatabasePressed = () => {
    console.info("--------------- traceStatsDatabasePressed");
    this.statsFactory.traceDatabase();
  };

  seedStatsDatabasePressed = () => {
    console.info("--------------- seedStatsDatabasePressed");
    this.statsFactory.seedDatabase();
    this.statsFactory.requestStatsForCalendarHeatmap(
      this.daysInHeatmap,
      this.onStatsForCalendarHeatmapArrived
    );
  };

  resetStatsDatabasePressed = () => {
    console.info("--------------- resetStatsDatabasePressed");
    this.statsFactory.resetDatabase();
    this.statsFactory.requestStatsForCalendarHeatmap(
      this.daysInHeatmap,
      this.onStatsForCalendarHeatmapArrived
    );
  };

  traceStatsPressed = () => {
    console.info("--------------- traceStatsDatabasePressed");
    console.info(this.state.heatmapStats);
  };

  onSearchCompleted = voc => {
    this.setState({
      showSearchResults: true,
      searchResults: voc,
      showVocabularyManager: false,
      showTestArea: false,
      showStatistics: false
    });
  };

  handleSearchInputOnChange = event => {
    this.setState({ currentSearchInputValue: this.refs.searchForm.refs.searchInput.value });
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
    console.info("--- deleting entry from state vocabulary");
    let c = this.state.vocabulary.indexOf(vocabularyEntry);
    let newVocabulary = this.state.vocabulary.filter((entry, index) => index !== c);
    // this.vocabularyFactory.traceVocabulary(newVocabulary, "tracing newVocabulary");
    this.setState({
      vocabulary: newVocabulary
    });
  };

  constructHeatmapCalendarTooltip = value => {
    if (value) {
      let dateString = getDateString(value.date, true);
      return `${dateString} έμαθες ${value.count} λέξεις!`;
    } else {
      return "";
    }
  };

  countMaxCorrectAnswers = correctAnswersPerDayArray => {
    let maxCorrectAnswers = correctAnswersPerDayArray.reduce((maxItem, currentItem) => {
      return maxItem.count > currentItem.count ? maxItem : currentItem;
    }, 0);
    return maxCorrectAnswers.count;
  };

  getCSSClass = value => {
    if (!value || value.count === 0) {
      return "color-empty";
    }

    let maxCount = this.countMaxCorrectAnswers(this.state.heatmapStats);

    let threshold_1 = maxCount / 4;
    let threshold_2 = maxCount / 4 * 2;
    let threshold_3 = maxCount / 4 * 3;

    if (value.count > threshold_3) {
      return "color-github-4";
    }

    if (value.count > threshold_2) {
      return "color-github-3";
    }

    if (value.count > threshold_1) {
      return "color-github-2";
    }

    return "color-github-1";
  };

  handlePassKeyDown = event => {
    if (event.keyCode === 71) {
      console.info("pressed");
      if (this.passKeyAlreadyPressed) {
        this.resetPassKeyPress();
        this.setState({ pageNotFound: false });
      } else {
        this.passKeyAlreadyPressed = true;
        this.passKeyTimeout = setTimeout(this.resetPassKeyPress, 190);
      }
    }
  };

  resetPassKeyPress = () => {
    clearTimeout(this.passKeyTimeout);
    this.passKeyTimeout = 0;
    this.passKeyAlreadyPressed = false;
  };

  render() {
    if (this.state.pageNotFound) {
      return (
        <div>
          <h1> Under Costruction!</h1>
          <img src="/img/construction.png" alt="page under construction" />
          <p>Page is under construction. Please leave us your email and we will get back to you!</p>
          <input type="text" onKeyDown={this.handlePassKeyDown} />
        </div>
      );
    } else {
      return (
        <div className="app">
          <header className="app__header">
            <HeaderLogo ifClicked={this.goToStartPage} />

            <DebugButtons
              onResetDatabasePressed={this.resetDatabasePressed}
              onSeedDatabasePressed={this.seedDatabasePressed}
              onTraceDatabasePressed={this.traceDatabasePressed}
              onTraceVocabularyPressed={this.traceVocabularyPressed}
              onTraceTotalWordsLearnedForTodayPressed={this.traceTotalWordsLearnedForTodayPressed}
              onResetStatsDatabasePressed={this.resetStatsDatabasePressed}
              onSeedStatsDatabasePressed={this.seedStatsDatabasePressed}
              onTraceStatsDatabasePressed={this.traceStatsDatabasePressed}
            />

            <SearchForm
              ref="searchForm"
              currentSearchInputValue={this.state.currentSearchInputValue}
              onInputChange={this.handleSearchInputOnChange}
              onSubmitPressed={this.handleSearchSubmit}
            />
          </header>

          <nav className="app__nav">
            <button className="app__nav__navButton--startNewSessionButton" onClick={this.newSession}>
              start new session !
            </button>

            <button
              className="app__nav__navButton--openVocabularyManagerButton"
              onClick={this.openVocabularyManager}
            >
              open vocabulary manager
            </button>
          </nav>

          <main className="app__main">
            <Notifications ref="notifications" style={this.notificationsStyle} />
            {this.state.showStatistics &&
              <div className="app__main__calendarHeatmap">
                <CalendarHeatmap
                  endDate={Date.now()}
                  numDays={this.daysInHeatmap}
                  values={this.state.heatmapStats}
                  titleForValue={this.constructHeatmapCalendarTooltip}
                  classForValue={this.getCSSClass}
                />
              </div>}

            {this.state.showSearchResults &&
              <VocabularyTable vocabulary={this.state.searchResults} onDelete={this.deleteEntry} />}
            {this.state.showTestArea &&
              <TestArea
                ref="testArea"
                vocabulary={this.state.vocabulary}
                onSuccessfulTranslation={this.recordSuccessfulTranslation}
                onFailedTranslation={this.recordFailedTranslation}
                onEscPress={this.handleEscPress}
                onPlusPress={this.addEntryToVocabulary}
                fromNativeToForeign={this.state.fromNativeToForeign}
              />}
            {this.state.showVocabularyManager &&
              <VocabularyManager
                ref="vocabularyManager"
                onNewEntrySubmitted={this.newEntrySubmitted}
                alreadySubmittedEntries={this.submittedEntriesFromVocabularyManager}
              />}
          </main>
          {this.state.showStartModal
            ? <StartModal
                title="Welcome to Linguana! Your words for today:"
                content={this.constructStartingSummaryModalContent()}
                isLoading={this.state.isStartModalLoading}
                onClose={this.closeStartingSummaryModal}
                imageUrl="/img/start.png"
              />
            : null}
          {this.state.showFinishModal
            ? <FinishModal
                title={`Today, you 've learned ${this.state.totalWordsLearnedForTodayCount} words in total!`}
                content={this.constructFinishModalContent()}
                onClose={this.closeFinishModal}
              />
            : null}
          {this.state.showSemiFinishModal
            ? <SemiFinishModal
                title={`Ok now let's try the oposite!`}
                content=""
                onClose={this.closeSemiFinishModal}
              />
            : null}

          {this.state.showTestArea &&
            <footer className="app__footer">
              <Stats
                totalEntriesCount={this.getTotalEntries()}
                correctTranslationsCount={this.getTotalCorrectTranslations()}
                wrongTranslationsCount={this.getTotalWrongTranslations()}
              />
            </footer>}
        </div>
      );
    }
  }
}
