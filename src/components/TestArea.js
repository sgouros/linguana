import React, { Component } from "react";
import PropTypes from "prop-types";

import TranslationInput from "./TranslationInputDE.js";

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
    cssBackground: "wrongTranslation",
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
    this.setState({ cssBackground: "correctTranslation" });
  };

  highlightWrongAnswer = () => {
    this.setState({ cssBackground: "wrongTranslation" });
  };

  handleSubmit = event => {
    let entry_index = this.state.current_voc_index;

    if (this.translationIsCorrect(this.state.currentTranslationInputValue)) {
      console.info("correct translation");
      this.props.onSuccessfulTranslation(entry_index);
      this.loadNextEntry();
    } else {
      console.info("wrong translation");
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
      cssBackground: "css_wrong_translation_background"
    });
  };

  getTerm = () => {
    if (this.props.vocabulary.length > 0) {
      return this.props.vocabulary[this.state.current_voc_index].term;
    } else {
      return "";
    }
  };

  getCorrectTranslation = () => {
    return this.props.vocabulary[this.state.current_voc_index].translation;
  };

  onEscPress = () => {
    if (this.props.vocabulary.length === 1) {
      console.info("ignoring esc key because only one entry remains");
      this.props.onLastEscPress();
    } else {
      const currentIndex = this.state.current_voc_index;
      const lastVocIndex = this.props.vocabulary.length - 1;
      console.info("currentIndex:" + currentIndex);
      console.info("lastVocIndex index:" + lastVocIndex);

      let newIndex = -1;

      if (lastVocIndex === 0) {
        newIndex = 0;
      } else if (currentIndex === lastVocIndex) {
        newIndex = lastVocIndex - 1;
      } else {
        newIndex = currentIndex;
      }
      console.info("new index:" + newIndex);
      this.clearInput();
      this.setState({
        current_voc_index: newIndex
      });
      this.props.onEscPress(currentIndex);
      console.info("vocabulary after entry removal:");
      console.info(this.props.vocabulary);
    }
  };

  onPlusPress = () => {
    const currentIndex = this.state.current_voc_index;
    this.clearInput();
    this.props.onPlusPress(currentIndex);
  };

  closeWordComparisonDialog = () => {
    this.setState({ showWordComparisonDialog: false });
    this.loadNextEntry();
    this.refs.translationInputDE.refs.input.focus();
  };

  getWordComparisonDialogContent = () => {
    let correct = this.getCorrectTranslation();
    let typed = this.state.currentTranslationInputValue;
    return (
      <div>
        <table className="wordComparisonTable">
          <tbody>
            <tr>
              <td>Correct answer:</td>
              <td>{correct}</td>
            </tr>
            <tr>
              <td>You typed:</td>
              <td>{typed}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  render() {
    return (
      <div id="testAreaDiv" className={this.state.cssBackground}>

        <form id="translationForm" onSubmit={this.handleSubmit}>
          {console.debug(`\nshowing vocabulary index: ${this.state.current_voc_index}`)}
          <div id="sourceTermDiv">
            {this.getTerm()}
          </div>
          <TranslationInput
            id="translationInputDiv"
            ref="translationInputDE"
            currentInputValue={this.state.currentTranslationInputValue}
            onChange={this.handleTranslationInputChange}
            onEscPress={this.onEscPress}
            onPlusPress={this.onPlusPress}
            cssBackgroundClassName={this.state.cssBackground}
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
