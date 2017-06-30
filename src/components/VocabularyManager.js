import React, { Component } from "react";
// import PropTypes from "prop-types";
import TranslationInputDE from "./TranslationInputDE.js";
import TranslationInputGR from "./TranslationInputGR.js";

// *** todo Κάποτε πρέπει να κάνω ένα refactor στο οποίο να δημιουργήσω το Vocabulary ως class (τώρα έχω πίνακες)

export default class VocabularyManager extends Component {
  state = {
    currentTermInputValue: "",
    currentTranslationInputValue: "",
    currentNotesInputValue: ""
  };

  handleTranslationInputChange = event => {
    this.setState({
      currentTranslationInputValue: event.target.value
    });
  };

  handleTermInputChange = event => {
    this.setState({
      currentTermInputValue: event.target.value
    });
  };

  handleNotesInputChange = event => {
    this.setState({
      currentNotesInputValue: event.target.value
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    let term = this.state.currentTermInputValue;
    let translation = this.state.currentTranslationInputValue;
    let notes = this.state.currentNotesInputValue;
    this.props.onNewEntrySubmitted(term, translation, notes);
    this.clearInputs();
    this.refs.vocabularyManagerTermInputDE.refs.input.focus();
  };

  clearInputs = () => {
    this.setState({
      currentTermInputValue: "",
      currentTranslationInputValue: "",
      currentNotesInputValue: ""
    });
  };

  render() {
    return (
      <div className="app__vocabularyManagerComponent">
        <form className="app__vocabularyManagerComponent__form" onSubmit={this.handleSubmit}>
          <div className="app__vocabularyManagerComponent__form__germanFlag" />

          <div>
            <TranslationInputDE
              ref="vocabularyManagerTermInputDE"
              currentInputValue={this.state.currentTermInputValue}
              onChange={this.handleTermInputChange}
              disableSpecialEscPress={true}
              disableSpecialPlusPress={true}
              inputClassName="app__vocabularyManagerComponent__form__termInputDE"
            />
            {
              <TranslationInputDE
                ref="vocabularyManagerNotesInput"
                currentInputValue={this.state.currentNotesInputValue}
                onChange={this.handleNotesInputChange}
                disableSpecialEscPress={true}
                disableSpecialPlusPress={true}
                inputClassName="app__vocabularyManagerComponent__form__notes"
              />
            }
          </div>

          <div className="app__vocabularyManagerComponent__form__greekFlag" />
          <div>
            <TranslationInputGR
              ref="vocabularyManagerTranslationInputGR"
              currentInputValue={this.state.currentTranslationInputValue}
              onChange={this.handleTranslationInputChange}
              disableSpecialEscPress={true}
              disableSpecialPlusPress={true}
              inputClassName="app__vocabularyManagerComponent__form__translationInputGR"
            />
          </div>
          <input type="submit" id="VocabularyManagerSubmitButton" value="submit" />
        </form>
      </div>
    );
  }
}
