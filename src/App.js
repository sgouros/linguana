import React, { Component } from "react";
import "./App.css";
import Stats from "./components/Stats.js";
import TestArea from "./components/TestArea.js";
import StartModal from "./components/StartModal.js";
import FinishModal from "./components/FinishModal.js";
import VocabularyFactory from "./VocabularyFactory.js";
import StatsFactory from "./StatsFactory.js";
import VocabularyManager from "./components/VocabularyManager.js";
import Notifications from "react-notification-system";
import VocabularyTable from "./components/VocabularyTable.js";
import CalendarHeatmap from "./components/CalendarHeatmap/CalendarHeatmap.js";

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
      correctAnswersPerDay: this.CORRECT_ANSWERS_PER_DAY
    };

    this.maxCorectAnswersCount = this.countMaxCorrectAnswers(this.CORRECT_ANSWERS_PER_DAY);

    this.totalWordsLearnedForToday = [];
  }

  CORRECT_ANSWERS_PER_DAY = [
    { date: "2017-06-1", count: 1 },
    { date: "2017-06-2", count: 9 },
    { date: "2017-06-3", count: 16 },
    { date: "2017-06-6", count: 9 },
    { date: "2017-06-7", count: 3 },
    { date: "2017-06-8", count: 10 },
    { date: "2017-06-9", count: 10 },
    { date: "2017-06-10", count: 10 },
    { date: "2017-06-12", count: 7 },
    { date: "2017-06-13", count: 8 },
    { date: "2017-06-14", count: 20 },
    { date: "2017-06-15", count: 5 },
    { date: "2017-06-17", count: 23 },
    { date: "2017-06-18", count: 2 },
    { date: "2017-06-19", count: 4 },
    { date: "2017-06-20", count: 20 },
    { date: "2017-06-21", count: 2 },
    { date: "2017-06-24", count: 15 },
    { date: "2017-06-25", count: 22 },
    { date: "2017-06-29", count: 7 },
    { date: "2017-06-30", count: 6 }
  ];

  notifications = null;

  notificationsStyle = {
    NotificationItem: {
      DefaultStyle: {
        width: 420
      }
    }
  };

  vocabularyFactory = new VocabularyFactory(this);
  statsFactory = new StatsFactory(this);

  allSelectedEntries = [];

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
      showStatistics: true
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
    this.notifications = this.refs.notifications;
  };

  closeStartingSummaryModal = () => {
    this.setState({ showStartModal: false });
    this.refs.testArea.refs.translationInputGR.refs.input.focus();
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
      showVocabularyManager: false,
      currentSearchInputValue: "",
      showStatistics: false,
      searchResults: []
    });
  };

  traceTotalWordsLearnedForToday = () => {
    console.info("total words learned for today: " + this.totalWordsLearnedForToday.length);
    this.totalWordsLearnedForToday.map(item => {
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

  recordSuccessfulTranslation = entry_index => {
    const new_voc = this.state.vocabulary;
    console.info("RECORDING successful translation of: " + entry_index + " " + new_voc[entry_index]._id);
    new_voc[entry_index].success();
    this.vocabularyFactory.updateEntry(new_voc[entry_index]);
    this.setState({ vocabulary: new_voc });
  };

  recordFailedTranslation = entry_index => {
    const new_voc = this.state.vocabulary;
    new_voc[entry_index].failure();
    this.vocabularyFactory.updateEntry(new_voc[entry_index]);
    this.setState({ vocabulary: new_voc });
  };

  handleEscPress = currentIndex => {
    let entry = this.state.vocabulary[currentIndex];
    let thisIsTheLastVocWord = this.state.vocabulary.length === 1;

    if (entry.isCurrentlyCorrectlyTranslated) {
      console.debug(`esc pressed and ${entry._id} is correctly translated`);

      let wordLearned = {
        id: entry._id,
        term: entry.term,
        translation: entry.translation
      };

      if (!this.arrayIncludesWordLearned(this.totalWordsLearnedForToday, wordLearned)) {
        this.totalWordsLearnedForToday.push(wordLearned);
      }
      // todo this.StatsFactory.saveTotalWordsLearnedTodayToDB(this.totalWordsLearnedForToday);
    } else {
      console.debug(`esc pressed and ${entry._id} is NOT correctly translated`);
    }
    this.removeEntryFromVocabulary(currentIndex);

    if (thisIsTheLastVocWord) {
      this.setState({
        showFinishModal: true
      });
    }
  };

  arrayIncludesWordLearned = (theArray, wordLearned) => {
    let theResult = false;

    theArray.map(item => {
      if (item.id === wordLearned.id) {
        theResult = true;
        return item;
      }
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
            {entry.term}
          </td>
          <td>
            {entry.translation}
          </td>
          <td>
            {entry.notes}
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
          <img
            className="css-congratulations-img"
            src="/img/congratulations.jpg"
            alt="congratulations"
          />
        </div>
      </div>
    );
  };
  // todo να εμφανίζεται ένα μικρό check πανω δεξιά κάθε φορά που ΤΗΝ ΠΡΟΗΓΟΥΜΕΝΗ ΦΟΡΑ
  // η λέξη είχε μεταφραστεί σωστα
  // εναλλακτικά αν θέλω να έιμαι σίγουρος, ας κάνω να είμαι αναγκασμένος να πρασινίζω την λέξη
  // πριν πατήσω esc αν θέλω να καταγραφεί ως learned word
  closeFinishModal = () => {
    this.setState({
      showFinishModal: false,
      showTestArea: false,
      showStatistics: true
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

  newEntrySubmitted = (term, translation, notes, newEntrySaveSucceeded, newEntrySaveFailed) => {
    // console.debug(`submited ${term} with translation ${translation}`);

    this.vocabularyFactory.addEntry(
      term,
      translation,
      notes,
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
  };

  resetStatsDatabasePressed = () => {
    console.info("--------------- resetStatsDatabasePressed");
    this.statsFactory.resetDatabase();
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

  constructHeatmapCalendarTooltip = value => {
    if (value) {
      let date = value.date.split("-").reverse().join(".");
      return `On ${date} you've learned ${value.count} new words!`;
    } else {
      return null;
    }
  };

  countMaxCorrectAnswers = correctAnswersPerDay => {
    let maxCorrectAnswers = correctAnswersPerDay.reduce((maxItem, currentItem) => {
      return maxItem.count > currentItem.count ? maxItem : currentItem;
    });
    return maxCorrectAnswers.count;
  };

  getCSSClass = value => {
    if (!value || value.count === 0) {
      return "color-empty";
    }

    let maxCount = this.maxCorectAnswersCount;

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

  render() {
    return (
      <div className="app">
        <header className="app__header">
          <div className="app__header__logo" onClick={this.goToStartPage}>
            <img className="app__header__logo__logoImage" src="/img/logo.png" alt="linguana logo" />
            <div className="app__header__logo__logoText"> Linguana </div>
          </div>
          <div className="app__header__debugButtons">
            <div className="app__header__debugButtons__debugButton" onClick={this.resetDatabasePressed}>
              reset DB
            </div>
            <div className="app__header__debugButtons__debugButton" onClick={this.seedDatabasePressed}>
              seed DB
            </div>
            <div className="app__header__debugButtons__debugButton" onClick={this.traceDatabasePressed}>
              trace db
            </div>
            <div
              className="app__header__debugButtons__debugButton"
              onClick={this.traceVocabularyPressed}
            >
              trace voc
            </div>
            <div
              className="app__header__debugButtons__debugButton"
              onClick={this.traceTotalWordsLearnedForToday}
            >
              trace total words
            </div>

            <div
              className="app__header__debugButtons__debugButton"
              onClick={this.resetStatsDatabasePressed}
            >
              reset Stats DB
            </div>

            <div
              className="app__header__debugButtons__debugButton"
              onClick={this.seedStatsDatabasePressed}
            >
              seed Stats
            </div>

            <div
              className="app__header__debugButtons__debugButton"
              onClick={this.traceStatsDatabasePressed}
            >
              trace Stats
            </div>
          </div>

          <form className="app__header__searchForm" onSubmit={this.handleSearchSubmit}>
            <input
              ref="searchInput"
              className="app__header__searchForm__searchInput"
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
                numDays={300}
                values={this.state.correctAnswersPerDay}
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
            />}
          {this.state.showVocabularyManager &&
            <VocabularyManager ref="vocabularyManager" onNewEntrySubmitted={this.newEntrySubmitted} />}
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
              title="You have successfully finished a learning session!"
              content={this.constructFinishModalContent()}
              onClose={this.closeFinishModal}
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
