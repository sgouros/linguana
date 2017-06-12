import React, { Component } from "react";
// import PropTypes from "prop-types";
import TranslationInput from "./TranslationInput.js";
// import WordComparisonDialog from "./WordComparisonDialog.js";

export default class VocabularyManager extends Component {
  state = {
    currentTermInputValue: "",
    currentTranslationInputValue: ""
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

  // todo να αλλάζει αυτόματα γλώσσα όταν περνάω λέξεις
  // todo να μπορώ να τις κάνω και search
  // todo να μπορώ να τις κάνω και edit

  handleSubmit = event => {
    event.preventDefault();
    let term = this.state.currentTermInputValue;
    let translation = this.state.currentTranslationInputValue;
    this.props.onNewEntrySubmitted(term, translation);
    this.clearInputs();
  };

  clearInputs = () => {
    this.setState({
      currentTermInputValue: "",
      currentTranslationInputValue: ""
    });
  };

  render() {
    return (
      <div id="vocabulary-manager-div">

        <form className="vocabulary-manager-form" onSubmit={this.handleSubmit}>

          <TranslationInput
            ref="vocabularyManagerTermInput"
            currentInputValue={this.state.currentTermInputValue}
            onChange={this.handleTermInputChange}
            disableSpecialEscPress={true}
            disableSpecialPlusPress={true}
            placeholder="Ελληνικά"
          />

          <TranslationInput
            ref="vocabularyManagerTranslationInput"
            currentInputValue={this.state.currentTranslationInputValue}
            onChange={this.handleTranslationInputChange}
            disableSpecialEscPress={true}
            disableSpecialPlusPress={true}
            placeholder="Deutsch"
          />
          <input type="submit" id="VocabularyManagerSubmitButton" value="submit" />
        </form>

      </div>
    );
  }
}
