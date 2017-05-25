import React, { Component } from "react";
// import PropTypes from "prop-types";
import TranslationInput from "./TranslationInput.js";
// import WordComparisonDialog from "./WordComparisonDialog.js";

export default class TermManager extends Component {
  state = {
    currentTermManagerSourceInputValue: "",
    currentTermManagerTranslationInputValue: ""
  };

  handleTermManagerTranslationInputChange = event => {
    console.debug("setting TranslationInput to:");
    console.debug(event.target.value);

    this.setState({
      currentTermManagerTranslationInputValue: event.target.value
    });
  };

  handleTermManagerSourceInputChange = event => {
    console.debug("setting SourceInput to:");
    console.debug(event.target.value);
    this.setState({
      currentTermManagerSourceInputValue: event.target.value
    });
  };

  handleSubmit = event => {
    let sourceTerm = this.state.currentTermManagerSourceInputValue;
    let translatedTerm = this.state.currentTermManagerTranslationInputValue;
    this.props.onNewEntrySubmitted(sourceTerm, translatedTerm);
    event.preventDefault();
  };
  // todo: πρέπει το type="submit" να περνάει ως prop στο TranslationInput και μετά
  // να δω αν με enter παίρνει τον νέο όρο

  render() {
    return (
      <div id="term-manager-div">
        <form className="term-manager-form" onSubmit={this.handleSubmit}>

          <TranslationInput
            ref="termManagerSourceInput"
            currentInputValue={this.state.currentTermManagerSourceInputValue}
            onChange={this.handleTermManagerSourceInputChange}
            disableSpecialEscPress={true}
            disableSpecialPlusPress={true}
          />

          <TranslationInput
            ref="termManagerTranslationInput"
            currentInputValue={
              this.state.currentTermManagerTranslationInputValue
            }
            onChange={this.handleTermManagerTranslationInputChange}
            disableSpecialEscPress={true}
            disableSpecialPlusPress={true}
          />
        </form>

      </div>
    );
  }
}
