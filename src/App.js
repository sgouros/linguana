import React, { Component } from "react";
import Stats from "./components/Stats.js";
import TestArea from "./components/TestArea.js";
import StartModal from "./components/StartModal.js";
import CustomModal from "./components/CustomModal.js";
import FinishModal from "./components/FinishModal.js";
import VocabularyFactory from "./VocabularyFactory.js";
import StatsFactory from "./StatsFactory.js";
import VocabularyManager from "./components/VocabularyManager.js";
import VocabularyTable from "./components/VocabularyTable.js";
import CalendarHeatmap from "./components/CalendarHeatmap/CalendarHeatmap.js";
import { getDateString, getTodayDateTimeString, getShortDate } from "./components/helpers.js";
import DebugButtons from "./components/DebugButtons.js";
import HeaderForm from "./components/HeaderForm.js";
import HeaderLogo from "./components/HeaderLogo.js";
import Alert from "react-s-alert";
import "react-s-alert/dist/s-alert-default.css";
import "react-s-alert/dist/s-alert-css-effects/slide.css";
import "react-s-alert/dist/s-alert-css-effects/scale.css";
import "react-s-alert/dist/s-alert-css-effects/bouncyflip.css";
import "react-s-alert/dist/s-alert-css-effects/flip.css";
import "react-s-alert/dist/s-alert-css-effects/genie.css";
import "react-s-alert/dist/s-alert-css-effects/jelly.css";
import "react-s-alert/dist/s-alert-css-effects/stackslide.css";

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      vocabulary: [],
      showSessionAlreadyRunningModal: false,
      showTestArea: false,
      showStartModal: false,
      showFinishModal: false,
      showVocabularyManager: false,
      isStartModalLoading: false,
      showAddEntryLoading: false,
      currentValueOfSearchInput: "",
      currentValueOfPredifinedTagInput: "",
      searchResults: [],
      showSearchResults: false,
      showDebugButons: false,
      showStatistics: true,
      heatmapStats: [],
      totalWordsLearnedForTodayCount: 0, // Το count είναι διαφορετικό με το array για την ώρα γιατί αποθηκεύεται στη βάση
      pageNotFound: true,
      showInvalidTagModal: false,
      cssSkin: "./normalSkin.css"
    };
    this.fromNativeToForeign = false;
    this.totalWordsLearnedForTodayArray = [];
    this.submittedEntriesFromVocabularyManager = [];
    this.sessionIsRunning = false;
  }
  NUMBER_OF_NEW_VOC_ENTRIES = 3;
  NUMBER_OF_OLD_VOC_ENTRIES = 7;
  NUMBER_OF_PREDEFINED_VOC_ENTRIES = 10;

  passKeyAlreadyPressed = false;
  passKeyTimeout = 0;

  daysInHeatmap = 260; // how many days will the heatmap show
  vocabularyFactory = new VocabularyFactory(this);
  statsFactory = new StatsFactory(this);

  allSelectedEntries = []; // the selected vocabulary entries for the current session

  goToStartPage = () => {
    console.info("Went to Start Page");
    if (this.sessionIsRunning === true) {
      this.setState({ showSessionAlreadyRunningModal: true });
    } else {
      this.allSelectedEntries = [];
      this.setState({
        vocabulary: [],
        showTestArea: false,
        showStartModal: false,
        showSessionAlreadyRunningModal: false,
        showFinishModal: false,
        showVocabularyManager: false,
        isStartModalLoading: false,
        showAddEntryLoading: false,
        searchResults: [],
        showSearchResults: false,
        showStatistics: true,
        currentValueOfSearchInput: "",
        currentValueOfPredifinedTagInput: "",
        showInvalidTagModal: false
      });
      this.fromNativeToForeign = false; // όταν είναι true σημαίνει οτι είμαστε στο 2ο semisession
    }
  };

  componentDidMount = () => {
    console.info("App.componentDidMount called!");
    if (this.refs.passwordInput) {
      this.refs.passwordInput.focus();
    }
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

  newPredifinedSession = vocabularyTag => {
    console.info("\n\n-------- new Predifined Session with tag: " + vocabularyTag);
    this.vocabularyFactory.predifinedVocabularyNeeded(
      vocabularyTag,
      this.onPredifinedVocabularyArrived,
      this.NUMBER_OF_PREDEFINED_VOC_ENTRIES
    );
    this.allSelectedEntries = [];
    this.setState({
      vocabulary: [],
      showStartModal: true,
      isStartModalLoading: true,
      showSearchResults: false,
      showVocabularyManager: false,
      currentValueOfSearchInput: "",
      currentValueOfPredifinedTagInput: "",
      showStatistics: false,
      searchResults: []
    });
    this.fromNativeToForeign = false;
    this.sessionIsRunning = true;
  };

  newSession = () => {
    console.info("\n\n-------- new Session:");
    if (this.sessionIsRunning === true) {
      console.info("newSession: New session already running!");
      this.setState({ showSessionAlreadyRunningModal: true });
    } else {
      this.vocabularyFactory.oldVocabularyNeeded(this.onOldVocabularyArrived, this.NUMBER_OF_OLD_VOC_ENTRIES);
      this.allSelectedEntries = [];
      this.setState({
        vocabulary: [],
        showStartModal: true,
        isStartModalLoading: true,
        showSearchResults: false,
        showVocabularyManager: false,
        showStatistics: false,
        searchResults: [],
        currentValueOfSearchInput: "",
        currentValueOfPredifinedTagInput: ""
      });
      this.sessionIsRunning = true;
      this.fromNativeToForeign = false;
    }
  };

  newSemiSession = () => {
    console.info("\n\n-------- new SEMI Session:");
    let correctWordsFromPreviousSemiSession = this.filterSuccessfullSelectedEntries();

    this.setState({
      showStartModal: false,
      isStartModalLoading: false,
      showSearchResults: false,
      showVocabularyManager: false,
      currentValueOfSearchInput: "",
      currentValueOfPredifinedTagInput: "",

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

    this.vocabularyFactory.newVocabularyNeeded(
      this.onNewVocabularyArrived,
      this.NUMBER_OF_NEW_VOC_ENTRIES,
      this.allSelectedEntries
    );
  };

  onPredifinedVocabularyArrived = (predifinedVoc, currentIndex) => {
    console.info("predifined voc arrived");
    this.vocabularyFactory.traceVocabulary(predifinedVoc);

    if (predifinedVoc.length > 0) {
      const updatedVocabulary = [
        ...this.state.vocabulary.slice(0, currentIndex),
        ...predifinedVoc,
        ...this.state.vocabulary.slice(currentIndex, this.state.vocabulary.length)
      ];
      this.allSelectedEntries.push(...predifinedVoc);

      this.setState({
        showTestArea: true,
        isStartModalLoading: false,
        vocabulary: updatedVocabulary
      });
    } else {
      console.info("no words for this tag");
      this.setState({ showInvalidTagModal: true });
    }
  };

  sessionAlreadyRunningModalOnClose = () => {
    this.setState({
      showSessionAlreadyRunningModal: false
    });
  };

  invalidTagModalOnClose = () => {
    this.sessionIsRunning = false;
    this.goToStartPage();
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
    console.debug(`esc pressed`);
    let entry = this.state.vocabulary[currentIndex];
    let thisIsTheLastVocWord = this.state.vocabulary.length === 1;

    // αυτό είναι true ακόμη και αν ο όρος είχε μεταφραστεί σωστά την ΠΡΟΗΓΟΥΜΕΝΗ φορά
    if (entry.isCurrentlyCorrectlyTranslated) {
      console.debug(`${entry._id} is correctly translated. Saving stat`);
      if (this.fromNativeToForeign) {
        this.saveStatsOfLearnedWord(entry);
      }
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
          <td className="td-lastDateCorrectlyTranslated">{getShortDate(entry.lastDateCorrectlyTranslated)}</td>
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

  closeFinishModal = () => {
    this.downloadDB();
    this.sessionIsRunning = false;
    this.goToStartPage();
  };

  openVocabularyManager = () => {
    if (this.sessionIsRunning === true) {
      this.setState({ showSessionAlreadyRunningModal: true });
    } else {
      this.setState({
        showVocabularyManager: true,
        showSearchResults: false,
        showTestArea: false,
        showStatistics: false
      });
    }
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

    this.submittedEntriesFromVocabularyManager.unshift(`${nativeTerm}-${foreignTerm}`);
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

  statsDbUpdated = () => {
    console.info("stats DB informed of an update");
    this.statsFactory.requestStatsForCalendarHeatmap(this.daysInHeatmap, this.onStatsForCalendarHeatmapArrived);
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
    this.statsFactory.traceStats();
    console.info(this.state.heatmapStats);
  };

  onSearchCompleted = voc => {
    this.setState({
      showSearchResults: true,
      searchResults: voc,
      showVocabularyManager: false,
      showTestArea: false,
      showStatistics: false,
      currentValueOfSearchInput: "",
      currentValueOfPredifinedTagInput: ""
    });
  };

  handleSearchInputOnChange = event => {
    this.setState({
      currentValueOfSearchInput: this.refs.headerForm_ref.refs.headerForm_searchInput_ref.refs.actual_input_ref.value
    });
  };

  handlePredifinedTagInputOnChange = event => {
    const newValue = event.target.value;
    console.info("------------ new value: " + newValue);
    this.setState({
      currentValueOfPredifinedTagInput: newValue
    });
  };

  handleSearchOnSubmit = event => {
    console.info("search submit pressed");
    event.preventDefault();
    if (this.sessionIsRunning === true) {
      this.setState({
        showSessionAlreadyRunningModal: true,
        currentValueOfSearchInput: "",
        currentValueOfPredifinedTagInput: ""
      });
    } else {
      let searchTerm = this.state.currentValueOfSearchInput;
      let callBack = this.onSearchCompleted;
      this.startSearch(searchTerm, callBack);
    }
  };

  startSearch = (searchTerm, callBack) => {
    this.vocabularyFactory.search(searchTerm, callBack);
  };

  handlePredifinedTagOnSubmit = event => {
    event.preventDefault();
    if (this.sessionIsRunning === true) {
      console.info("handlePredifinedTagOnSubmit: New session already running!");
      this.setState({ showSessionAlreadyRunningModal: true });
    } else {
      const tag = event.target.value;
      console.info(`\n\n "predifined tag submit pressed. Tag: ${tag}`);
      if (tag !== "") {
        this.newPredifinedSession(tag);
      } else {
        console.info("Empty tag!");
        this.setState({ showInvalidTagModal: true });
      }
    }
  };

  editEntry = changedEntry => {
    this.vocabularyFactory.editEntry(changedEntry);
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
      if (value.count > 0) {
        return `${dateString} έμαθες ${value.count} λέξεις!`;
      } else {
        return `${dateString} δεν έμαθες κάτι`;
      }
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
    let threshold_2 = (maxCount / 4) * 2;
    let threshold_3 = (maxCount / 4) * 3;

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

  // initial password
  handlePassKeyDown = event => {
    if (event.keyCode === 71) {
      if (this.passKeyAlreadyPressed) {
        this.resetPassKeyPress();
        this.setState({ pageNotFound: false });
      } else {
        this.passKeyAlreadyPressed = true;
        this.passKeyTimeout = setTimeout(this.resetPassKeyPress, 145);
      }
    }
  };

  resetPassKeyPress = () => {
    clearTimeout(this.passKeyTimeout);
    this.passKeyTimeout = 0;
    this.passKeyAlreadyPressed = false;
  };

  shortcuts = event => {
    if (event.keyCode === 192) {
      // ` key
      event.preventDefault();
      if (this.state.cssSkin === "./blackSkin.css") {
        this.setState({ cssSkin: "./normalSkin.css" });
      } else {
        this.setState({ cssSkin: "./blackSkin.css" });
      }
    }

    if (event.keyCode === 45) {
      // insert key
      event.preventDefault();
      if (this.state.showDebugButons === true) {
        this.setState({ showDebugButons: false });
      } else {
        this.setState({ showDebugButons: true });
      }
    }
  };

  downloadDB = () => {
    console.info("download DB Pressed");
    let dbStringArray = [];
    this.vocabularyFactory.constructDownloadDbString(dbStringArray, this.onVocDbDowloadStringCreated);
  };

  onVocDbDowloadStringCreated = (dbStringArray, numberOfVocEntries) => {
    console.info("download DB string created!");
    dbStringArray.push("\n");
    this.statsFactory.constructDownloadDbString(dbStringArray, numberOfVocEntries, this.onStatsDbDownloadStringCreated);
  };

  onStatsDbDownloadStringCreated = (dbStringArray, numberOfVocEntries, numberOfStatsEntries) => {
    dbStringArray.unshift("");
    dbStringArray.unshift(`import StatsEntry from "./components/StatsEntry.js";`);
    dbStringArray.unshift(`import VocabularyEntry from "./components/VocabularyEntry.js";`);
    dbStringArray.unshift("");
    dbStringArray.unshift(`// Total stats entries: ${numberOfStatsEntries}`);
    dbStringArray.unshift(`// Total voc entries  : ${numberOfVocEntries}`);
    dbStringArray.unshift(`// copy this to file: databaseSeeds.js then reset and seed both DBs`);

    let element = document.createElement("a");
    let file = new Blob([dbStringArray.join("\n")], { type: "text/plain" });
    let filename = "linguanaDB_" + getTodayDateTimeString() + ".txt";
    element.href = URL.createObjectURL(file);
    element.download = filename;
    element.click();
  };

  showAlert = (message, options, type = "info") => {
    console.log("alert:" + message);
    switch (type) {
      case "success":
        Alert.success(message, options);
        break;
      case "warning":
        Alert.warning(message, options);
        break;
      case "error":
        Alert.error(message, options);
        break;
      default:
        Alert.info(message, options);
    }
  };

  render() {
    if (this.state.pageNotFound) {
      return (
        <div>
          <h1> Under Costruction!</h1>
          <img src="/img/construction.png" alt="page under construction" />
          <p>Page is under construction. Please leave us your email and we will get back to you!</p>
          <input ref="passwordInput" type="text" onKeyDown={this.handlePassKeyDown} />
          <Alert stack={{ limit: 5 }} />
        </div>
      );
    } else {
      return (
        <div className="app" tabIndex="0" onKeyDown={this.shortcuts}>
          <link rel="stylesheet" type="text/css" href={this.state.cssSkin} />
          <header className="app__header">
            <HeaderLogo ifClicked={this.goToStartPage} />
            {this.state.showDebugButons && (
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
                onDownloadDBPressed={this.downloadDB}
              />
            )}

            <HeaderForm
              ref="headerForm_ref"
              currentValueOfSearchInput={this.state.currentValueOfSearchInput}
              onSearchInputChange={this.handleSearchInputOnChange}
              currentValueOfPredifinedTagInput={this.state.currentValueOfPredifinedTagInput}
              onPredifinedTagInputChange={this.handlePredifinedTagInputOnChange}
              onPredifinedTagSubmit={this.handlePredifinedTagOnSubmit}
              onSearchSubmit={this.handleSearchOnSubmit}
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
              <VocabularyTable
                vocabulary={this.state.searchResults}
                onEditSubmitted={this.editEntry}
                onDelete={this.deleteEntry}
              />
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

          {this.state.showSessionAlreadyRunningModal ? (
            <CustomModal
              title="You are in the middle of a running session!"
              text="Please finish with your current translation session first."
              onClose={this.sessionAlreadyRunningModalOnClose}
            />
          ) : null}

          {this.state.showInvalidTagModal ? (
            <CustomModal
              title="Invalid tag!"
              text="Please provide a valid word teaming tag."
              onClose={this.invalidTagModalOnClose}
            />
          ) : null}

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
              onClose={this.closeFinishModal}
            />
          ) : null}

          {this.state.showSemiFinishModal ? (
            <CustomModal title="Great!" text="Now let's try the opposite." onClose={this.closeSemiFinishModal} />
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
          <Alert stack={{ limit: 5 }} />
        </div>
      );
    }
  }
}
