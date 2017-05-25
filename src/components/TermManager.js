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
    console.info("setting TranslationInput to key:");
    console.info(event.target.value);

    this.setState({
      currentTermManagerTranslationInputValue: event.target.value
    });
  };

  handleTermManagerSourceInputChange = event => {
    console.info("setting SourceInput to key:");
    console.info(event.target.value);
    this.setState({
      currentTermManagerSourceInputValue: event.target.value
    });
  };

  render() {
    return (
      <div id="term-manager-div">

        <form className="term-manager-form" onSubmit={this.handleSubmit}>

          <TranslationInput
            ref="termManagerSourceInput"
            currentInputValue={this.state.currentTermManagerSourceInputValue}
            onChange={this.handleTermManagerSourceInputChange}
          />

          <TranslationInput
            ref="termManagerTranslationInput"
            currentInputValue={
              this.state.currentTermManagerTranslationInputValue
            }
            onChange={this.handleTermManagerTranslationInputChange}
          />
        </form>

      </div>
    );
  }
}
