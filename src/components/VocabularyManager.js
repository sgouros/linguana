import React, { Component } from "react";
// import PropTypes from "prop-types";
import TranslationInputDE from "./TranslationInputDE.js";
import TranslationInputGR from "./TranslationInputGR.js";

export default class VocabularyManager extends Component {
  state = {
    currentNativeTermInputValue: "",
    currentForeignTermInputValue: "",
    currentForeignTermNotesInputValue: ""
  };

  handleForeignTermInputChange = event => {
    this.setState({
      currentForeignTermInputValue: event.target.value
    });
  };

  handleNativeTermInputChange = event => {
    this.setState({
      currentNativeTermInputValue: event.target.value
    });
  };

  handleForeignTermNotesInputChange = event => {
    this.setState({
      currentForeignTermNotesInputValue: event.target.value
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    let nativeTerm = this.state.currentNativeTermInputValue;
    let foreignTerm = this.state.currentForeignTermInputValue;
    let foreignTermNotes = this.state.currentForeignTermNotesInputValue;
    this.props.onNewEntrySubmitted(nativeTerm, foreignTerm, foreignTermNotes);
    this.clearInputs();
    this.refs.vocabularyManagerTermInputDE.refs.input.focus();
  };

  clearInputs = () => {
    this.setState({
      currentNativeTermInputValue: "",
      currentForeignTermInputValue: "",
      currentForeignTermNotesInputValue: ""
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
              currentInputValue={this.state.currentForeignTermInputValue}
              onChange={this.handleForeignTermInputChange}
              disableSpecialEscPress={true}
              disableSpecialPlusPress={true}
              inputClassName="app__vocabularyManagerComponent__form__termInputDE"
            />
            {
              <TranslationInputDE
                ref="vocabularyManagerNotesInput"
                currentInputValue={this.state.currentForeignTermNotesInputValue}
                onChange={this.handleForeignTermNotesInputChange}
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
              currentInputValue={this.state.currentNativeTermInputValue}
              onChange={this.handleNativeTermInputChange}
              disableSpecialEscPress={true}
              disableSpecialPlusPress={true}
              inputClassName="app__vocabularyManagerComponent__form__translationInputGR"
            />
          </div>

          <input type="submit" id="VocabularyManagerSubmitButton" value="submit" />
          <div className="app__vocabularyManagerComponent__form__alreadySubmittedEntries">
            {this.props.alreadySubmittedEntries.join(" | ")}
          </div>
        </form>
      </div>
    );
  }
}
