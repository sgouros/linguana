import React, { Component } from "react";
import PropTypes from "prop-types";

import TranslationInputGR from "./TranslationInputGR.js";

import WordComparisonDialog from "./WordComparisonDialog.js";

export default class Testarea extends Component {
  static propTypes = {
    vocabulary: PropTypes.array,
    onSuccessfulTranslation: PropTypes.func,
    onFailedTranslation: PropTypes.func,
    onEscPress: PropTypes.func,
    onLastEscPress: PropTypes.func,
    onPlusPress: PropTypes.func
  };

  state = {
    currentTranslationInputValue: "",
    current_voc_index: 0,
    correctTranslation: false,
    showWordComparisonDialog: false
  };

  handleTranslationInputChange = event => {
    const translation_typed = event.target.value;
    this.setState({ currentTranslationInputValue: translation_typed });
    this.checkTranslation(translation_typed);
  };

  checkTranslation = translation_typed => {
    this.translationIsCorrect(translation_typed)
      ? this.highlightCorrectAnswer()
      : this.highlightWrongAnswer();
  };

  highlightCorrectAnswer = () => {
    this.setState({ correctTranslation: true });
    // ", linguanaFaceImgUrl: "/img/correct.png" });
  };

  highlightWrongAnswer = () => {
    this.setState({ correctTranslation: false });
    // this.setState({ cssBackground: "wrongTranslation", linguanaFaceImgUrl: "/img/wrong.png" });
  };

  handleSubmit = event => {
    let entry_index = this.state.current_voc_index;

    if (this.translationIsCorrect(this.state.currentTranslationInputValue)) {
      console.debug("correct translation");
      this.props.onSuccessfulTranslation(entry_index);
      this.loadNextEntry();
    } else {
      console.debug("wrong translation");
      this.showWordComparisonDialog();
      this.props.onFailedTranslation(entry_index);
    }
    event.preventDefault();
  };

  showWordComparisonDialog = () => {
    this.setState({ showWordComparisonDialog: true });
  };

  translationIsCorrect = translation_typed => {
    return translation_typed === this.getCorrectTranslation() ? true : false;
  };

  loadNextEntry = () => {
    const currentIndex = this.state.current_voc_index;
    const lastVocIndex = this.props.vocabulary.length - 1;
    const nextIndex = currentIndex === lastVocIndex ? 0 : currentIndex + 1;
    console.debug(`Advancing to next entry (index ${nextIndex})`);
    this.clearInput();
    this.setState({
      current_voc_index: nextIndex
    });
  };

  clearInput = () => {
    this.setState({
      currentTranslationInputValue: "",
      correctTranslation: false
    });
  };

  getTerm = () => {
    if (this.props.vocabulary.length > 0) {
      return this.props.vocabulary[this.state.current_voc_index].term;
    } else {
      return "";
    }
  };

  getNotes = () => {
    if (this.props.vocabulary.length > 0) {
      return this.props.vocabulary[this.state.current_voc_index].notes;
    } else {
      return "";
    }
  };

  getCorrectTranslation = () => {
    return this.props.vocabulary[this.state.current_voc_index].translation;
  };

  onEscPress = () => {
    const currentIndex = this.state.current_voc_index;
    const lastVocIndex = this.props.vocabulary.length - 1;
    console.debug("currentIndex:" + currentIndex);
    console.debug("lastVocIndex index:" + lastVocIndex);
    let newIndex = -1;
    if (lastVocIndex === 0) {
      newIndex = 0;
    } else if (currentIndex === lastVocIndex) {
      newIndex = lastVocIndex - 1;
    } else {
      newIndex = currentIndex;
    }
    console.debug("new index:" + newIndex);
    this.clearInput();
    this.setState({
      current_voc_index: newIndex
    });
    this.props.onEscPress(currentIndex);
  };

  onPlusPress = () => {
    const currentIndex = this.state.current_voc_index;
    this.clearInput();
    this.props.onPlusPress(currentIndex);
  };

  closeWordComparisonDialog = () => {
    this.setState({ showWordComparisonDialog: false });
    this.loadNextEntry();
    this.refs.translationInputGR.refs.input.focus();
  };

  getWordComparisonDialogContent = () => {
    let correct = this.getCorrectTranslation();
    let typed = this.state.currentTranslationInputValue;
    return (
      <div>
        <table className="wordComparisonDialog__Table">
          <tbody>
            <tr>
              <td>Correct answer:</td>
              <td>
                {correct}
              </td>
            </tr>
            <tr>
              <td>You typed:</td>
              <td>
                {typed}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  isSourceTermAlreadyCorrectlyTranslated = () => {
    if (typeof this.props.vocabulary[this.state.current_voc_index] !== "undefined") {
      return this.props.vocabulary[this.state.current_voc_index].isCurrentlyCorrectlyTranslated;
    } else {
      return false;
    }
  };

  render() {
    return (
      <div className="testArea__component">
        <img
          id="testArea__component__linguanaImg"
          src={this.state.correctTranslation ? "/img/correct.png" : "/img/wrong.png"}
          alt="linguana"
        />

        <form className="testArea__component__translationForm" onSubmit={this.handleSubmit}>
          {console.debug(`\nshowing vocabulary index: ${this.state.current_voc_index}`)}
          <div
            className={
              "testArea__component__translationForm__sourceTerm__alreadyCorrectlyTranslated__" +
              this.isSourceTermAlreadyCorrectlyTranslated()
            }
          >
            {this.getTerm()}
          </div>

          <div className="testArea__component__translationForm__notes">
            {this.getNotes()}
          </div>
          <TranslationInputGR
            ref="translationInputGR"
            currentInputValue={this.state.currentTranslationInputValue}
            onChange={this.handleTranslationInputChange}
            onEscPress={this.onEscPress}
            onPlusPress={this.onPlusPress}
            correctTranslation={this.state.correctTranslation}
            inputClassName="testArea__component__translationForm__translationInputGR"
          />
        </form>

        {this.state.showWordComparisonDialog
          ? <WordComparisonDialog
              title="hmmm, I don't think so..."
              content={this.getWordComparisonDialogContent()}
              onClose={this.closeWordComparisonDialog}
            />
          : null}
      </div>
    );
  }
}
