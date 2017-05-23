import React, { Component } from "react";
import PropTypes from "prop-types";

import TranslationInput from "./TranslationInput.js";

export default class Testarea extends Component {
  static propTypes = {
    vocabulary: PropTypes.array,
    onSuccessfulTranslation: PropTypes.func,
    onFailedTranslation: PropTypes.func,
    onEscPress: PropTypes.func
  };

  state = {
    currentTranslationInputValue: "",
    current_voc_index: 0,
    cssBackground: "css_wrong_translation_background"
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
    this.setState({ cssBackground: "css_correct_translation_background" });
  };

  highlightWrongAnswer = () => {
    this.setState({ cssBackground: "css_wrong_translation_background" });
  };

  handleSubmit = event => {
    let term_index = this.state.current_voc_index;

    if (this.translationIsCorrect(this.state.currentTranslationInputValue)) {
      console.info("correct translation");
      this.props.onSuccessfulTranslation(term_index);
    } else {
      console.info("wrong translation");
      this.props.onFailedTranslation(term_index);
      this.showWordComparison();
    }
    this.loadNextTerm();
    event.preventDefault();
  };

  showWordComparison = () => {
    let correct = this.getCorrectTranslation();
    let typed = this.state.currentTranslationInputValue;
    alert(`correct      :       ${correct}\nyou typed:       ${typed}`);
  };

  translationIsCorrect = translation_typed => {
    return translation_typed === this.getCorrectTranslation() ? true : false;
  };

  loadNextTerm = () => {
    const currentIndex = this.state.current_voc_index;
    const lastVocIndex = this.props.vocabulary.length - 1;
    const nextIndex = currentIndex === lastVocIndex ? 0 : currentIndex + 1;
    console.debug(`Advancing to next term (index ${nextIndex})`);
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

  getSourceTerm = () => {
    return this.props.vocabulary[this.state.current_voc_index].entries[0];
  };

  getCorrectTranslation = () => {
    return this.props.vocabulary[this.state.current_voc_index].translations[0];
  };

  onEscPress = () => {
    if (this.props.vocabulary.length === 1) {
      console.info("ignoring esc key because only one term remains");
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
      console.info("vocabulary after term removal:");
      console.info(this.props.vocabulary);
    }
  };

  render() {
    return (
      <div id="test-area-div" className={this.state.cssBackground}>
        <form className="translation_form" onSubmit={this.handleSubmit}>
          {console.info(
            `\nshowing vocabulary index: ${this.state.current_voc_index}`
          )}
          <div id="source_word_div">
            {this.getSourceTerm()}
          </div>
          <TranslationInput
            currentInputValue={this.state.currentTranslationInputValue}
            onChange={this.handleTranslationInputChange}
            onEscPress={this.onEscPress}
            cssBackgroundClassName={this.state.cssBackground}
          />
        </form>
      </div>
    );
  }
}
