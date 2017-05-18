import React, { Component } from "react";
import PropTypes from "prop-types";

import TranslationInput from "./TranslationInput.js";

class Testarea extends Component {
  static propTypes = {
    vocabulary: PropTypes.array
  };

  state = {
    currentTranslationInputValue: "",
    current_voc_index: 0,
    cssSourceTermLabel: "wrong_translation",
    correct_answers_array: new Array(this.props.vocabulary.length).fill(
      0,
      0,
      this.props.vocabulary.length
    )
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
    this.setState({ cssSourceTermLabel: "correct_translation" });
  };

  highlightWrongAnswer = () => {
    this.setState({ cssSourceTermLabel: "wrong_translation" });
  };

  handleSubmit = event => {
    let term_index = this.state.current_voc_index;

    if (this.translationIsCorrect(this.state.currentTranslationInputValue)) {
      console.info("CORRECT translation");
      this.props.onSuccessfulTranslation(term_index);
    } else {
      console.info("WRONG translation");
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
    console.info(`Advancing to next term (index ${nextIndex})`);
    this.clearInput();
    this.setState({
      current_voc_index: nextIndex,
      css_source_term_label: "wrong_translation"
    });
  };

  clearInput = () => {
    this.setState({ currentTranslationInputValue: "" });
  };

  getSourceTerm = () => {
    return this.props.vocabulary[this.state.current_voc_index].entries[0];
  };

  getCorrectTranslation = () => {
    return this.props.vocabulary[this.state.current_voc_index].translations[0];
  };

  onEscPress = () => {
    const currentIndex = this.state.current_voc_index;
    this.props.onEscPress(currentIndex);
    console.debug("current index check:" + currentIndex);
    const newIndex = currentIndex >= this.props.vocabulary.length
      ? this.props.vocabulary.length - 1
      : currentIndex;
    this.clearInput(); // todo αυτό να πάει πιο κάτω στην ιεραρχία των components
    this.setState({
      current_voc_index: newIndex
    });
    console.info(this.props.vocabulary);
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          {console.info(
            `\n------------ showing vocabulary index ${this.state.current_voc_index} -------------`
          )}
          <div id="source_word_div" className={this.state.cssSourceTermLabel}>
            {this.getSourceTerm()}
          </div>
          <TranslationInput
            currentInputValue={this.state.currentTranslationInputValue}
            onChange={this.handleTranslationInputChange}
            onEscPress={this.onEscPress}
          />

        </form>
      </div>
    );
  }
}

export default Testarea;
