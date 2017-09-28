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
import VocabularyTable from "./components/VocabularyTable.js";
import CalendarHeatmap from "./components/CalendarHeatmap/CalendarHeatmap.js";
import { getDateString, getShortDateString } from "./components/helpers.js";
import DebugButtons from "./components/DebugButtons.js";
import SearchForm from "./components/SearchForm.js";
import HeaderLogo from "./components/HeaderLogo.js";

// todo:
//      * να κάνεις σωστό extract των DBs
//      * να μπορείς να κάνεις edit
//      * όταν περνάς παρατήρηση σε λέξη, να μπορείς να έχεις οποιαδήποτε γλώσσα εκεί
//      * οταν πατάς enter στις αρχικές λέξεις που δείχνει να γίνεται dismiss το modal

//      * κάθε φορά που ανανεώνεται η βάση των stats να γίνεται κάτι trigger
//        και αυτά να απεικονίζονται στην αρχική οθόνη
//      * να κάνω refactor σε display components + layout components
//      * να βάλω στο παιχνίδι τις routes
//      * να χρησιμοποιήσω immutability
//      * να δω αρθρα που εκανα favorite στο twitter και να διαβάσω τα ενδιαφέροντα
//      * να διαλέγει με hash_tag

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
    this.fromNativeToForeign = false;
    this.totalWordsLearnedForTodayArray = [];
    this.submittedEntriesFromVocabularyManager = [];
  }

  passKeyAlreadyPressed = false;
  passKeyTimeout = 0;

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
      showStatistics: true
    });
    this.fromNativeToForeign = false; // όταν είναι true σημαίνει οτι είμαστε στο 2ο semisession
  };

  componentDidMount = () => {
    console.info("App.componentDidMount called!");

    this.statsFactory.requestStatsForCalendarHeatmap(this.daysInHeatmap, this.onStatsForCalendarHeatmapArrived);
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
    this.vocabularyFactory.oldVocabularyNeeded(this.onOldVocabularyArrived, 4);
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
    this.fromNativeToForeign = false;
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

      searchResults: []
    });
    this.fromNativeToForeign = true;

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
    this.vocabularyFactory.traceVocabulary(newVoc);
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

  onOldVocabularyArrived = (oldVoc, currentIndex) => {
    console.info("old voc arrived");
    this.vocabularyFactory.traceVocabulary(oldVoc);
    const updatedVocabulary = [
      ...this.state.vocabulary.slice(0, currentIndex),
      ...oldVoc,
      ...this.state.vocabulary.slice(currentIndex, this.state.vocabulary.length)
    ];
    this.allSelectedEntries.push(...oldVoc);

    this.setState({
      vocabulary: updatedVocabulary
    });
    this.vocabularyFactory.newVocabularyNeeded(this.onNewVocabularyArrived, 6, this.allSelectedEntries);
  };

  onStatsForCalendarHeatmapArrived = statsArray => {
    console.info("new stats for heatmap arrived");
    this.setState({ heatmapStats: statsArray });
  };

  recordSuccessfulTranslation = entry_index => {
    const new_voc = this.state.vocabulary;
    console.info("Successful translation of: " + entry_index + " " + new_voc[entry_index]._id);
    new_voc[entry_index].success();
    if (this.fromNativeToForeign === true) {
      console.info("Recording successful translation of: " + entry_index + " " + new_voc[entry_index]._id + " to DB");
      this.vocabularyFactory.updateEntry(new_voc[entry_index]);
    }
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

      if (this.fromNativeToForeign) {
        this.saveStatsOfLearnedWord(entry);
      }
    } else {
      console.info(`esc pressed and ${entry._id} is NOT correctly translated`);
    }
    this.removeEntryFromVocabulary(currentIndex);

    if (thisIsTheLastVocWord) {
      if (this.fromNativeToForeign) {
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
    this.statsFactory.requestStatsForCalendarHeatmap(this.daysInHeatmap, this.onStatsForCalendarHeatmapArrived);

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
    this.vocabularyFactory.newVocabularyNeeded(this.onNewVocabularyArrived, 1, this.allSelectedEntries, currentIndex);
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
          <td>{entry.nativeTerm}</td>
          <td>{entry.foreignTerm}</td>
          <td>{entry.foreignTermNotes}</td>
          <td className="td-correctTranslationsCount">{entry.totalSuccesses}</td>
          <td className="td-wrongTranslationsCount">{entry.totalFailures}</td>
          <td className="td-totalTimesSelected">{entry.totalTimesSelected}</td>
          <td className="td-lastDateCorrectlyTranslated">{getShortDateString(entry.lastDateCorrectlyTranslated)}</td>
        </tr>
      );
    });

    return (
      <div>
        <table className="modalDialogTable">
          <tbody>{htmlTable}</tbody>
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
      showStatistics: true
    });
    this.fromNativeToForeign = false;
  };

  openVocabularyManager = () => {
    this.setState({
      showVocabularyManager: true,
      showSearchResults: false,
      showTestArea: false,
      showStatistics: false
    });
  };

  newEntrySubmitted = (nativeTerm, foreignTerm, foreignTermNotes, newEntrySaveSucceeded, newEntrySaveFailed) => {
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
  };

  newEntrySaveToDbFailed = (nativeTerm, foreignTerm, error) => {
    console.info(`Failed to save ${nativeTerm}-${foreignTerm} to DB. Error description: ${JSON.stringify(error)}`);
  };

  extractVocDBPressed = () => {
    console.info("--------------- extractVocDBPressed");
    this.vocabularyFactory.extractVocDB();
  };

  seedVocDBPressed = () => {
    console.info("--------------- seedVocDBPressed");
    this.vocabularyFactory.seedVocDB();
  };

  resetVocDBPressed = () => {
    console.info("--------------- resetVocDBPressed");
    this.vocabularyFactory.resetVocDB();
  };

  traceVocDBPressed = () => {
    console.info("--------------- traceVocDBPressed");
    this.vocabularyFactory.traceVocDB();
  };

  traceStatsDBPressed = () => {
    console.info("--------------- traceStatsDBPressed");
    this.statsFactory.traceStatsDB();
  };

  extractStatsDBPressed = () => {
    console.info("--------------- extractStatsDBPressed");
    this.statsFactory.extractStatsDB();
  };

  resetStatsDBPressed = () => {
    console.info("--------------- resetStatsDBPressed");
    this.statsFactory.resetStatsDB();
    this.statsFactory.requestStatsForCalendarHeatmap(this.daysInHeatmap, this.onStatsForCalendarHeatmapArrived);
  };

  seedStatsDBPressed = () => {
    console.info("--------------- seedStatsDBPressed");
    this.statsFactory.seedStatsDB();
    this.statsFactory.requestStatsForCalendarHeatmap(this.daysInHeatmap, this.onStatsForCalendarHeatmapArrived);
  };

  traceVocabularyPressed = () => {
    console.info("--------------- traceVocabularyPressed");
    this.vocabularyFactory.traceVocabulary(this.state.vocabulary);
  };

  traceStatsPressed = () => {
    console.info("--------------- traceStatsDBPressed");
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
    let maxCorrectAnswers = correctAnswersPerDayArray.reduce((max, currentItem) => {
      // console.info(`max = ${max}`);
      // console.info(`currentItem.count = ${currentItem.count}`);
      return max > currentItem.count ? max : currentItem.count;
    }, 0);
    return maxCorrectAnswers;
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
              onExtractVocDBPressed={this.extractVocDBPressed}
              onResetVocDBPressed={this.resetVocDBPressed}
              onSeedVocDBPressed={this.seedVocDBPressed}
              onTraceVocDBPressed={this.traceVocDBPressed}
              onExtractStatsDBPressed={this.extractStatsDBPressed}
              onResetStatsDBPressed={this.resetStatsDBPressed}
              onSeedStatsDBPressed={this.seedStatsDBPressed}
              onTraceStatsDBPressed={this.traceStatsDBPressed}
              onTraceVocabularyPressed={this.traceVocabularyPressed}
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

            <button className="app__nav__navButton--openVocabularyManagerButton" onClick={this.openVocabularyManager}>
              open vocabulary manager
            </button>
          </nav>

          <main className="app__main">
            {this.state.showStatistics && (
              <div className="app__main__calendarHeatmap">
                <CalendarHeatmap
                  endDate={Date.now()}
                  numDays={this.daysInHeatmap}
                  values={this.state.heatmapStats}
                  titleForValue={this.constructHeatmapCalendarTooltip}
                  classForValue={this.getCSSClass}
                />
              </div>
            )}

            {this.state.showSearchResults && (
              <VocabularyTable vocabulary={this.state.searchResults} onDelete={this.deleteEntry} />
            )}
            {this.state.showTestArea && (
              <TestArea
                ref="testArea"
                vocabulary={this.state.vocabulary}
                onSuccessfulTranslation={this.recordSuccessfulTranslation}
                onFailedTranslation={this.recordFailedTranslation}
                onEscPress={this.handleEscPress}
                onPlusPress={this.addEntryToVocabulary}
                fromNativeToForeign={this.fromNativeToForeign}
              />
            )}
            {this.state.showVocabularyManager && (
              <VocabularyManager
                ref="vocabularyManager"
                onNewEntrySubmitted={this.newEntrySubmitted}
                alreadySubmittedEntries={this.submittedEntriesFromVocabularyManager}
              />
            )}
          </main>
          {this.state.showStartModal ? (
            <StartModal
              title="Welcome to Linguana! Your words for today:"
              content={this.constructStartingSummaryModalContent()}
              isLoading={this.state.isStartModalLoading}
              onClose={this.closeStartingSummaryModal}
              imageUrl="/img/start.png"
            />
          ) : null}
          {this.state.showFinishModal ? (
            <FinishModal
              title={`Today, you 've learned ${this.state.totalWordsLearnedForTodayCount} words in total!`}
              content={this.constructFinishModalContent()}
              onClose={this.closeFinishModal}
            />
          ) : null}
          {this.state.showSemiFinishModal ? (
            <SemiFinishModal title={`Ok now let's try the oposite!`} onClose={this.closeSemiFinishModal} />
          ) : null}

          {this.state.showTestArea && (
            <footer className="app__footer">
              <Stats
                totalEntriesCount={this.getTotalEntries()}
                correctTranslationsCount={this.getTotalCorrectTranslations()}
                wrongTranslationsCount={this.getTotalWrongTranslations()}
              />
            </footer>
          )}
        </div>
      );
    }
  }
}
