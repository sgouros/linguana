import React, { Component } from "react";
// import PropTypes from "prop-types";
import TranslationInput from "./TranslationInput.js";
// import WordComparisonDialog from "./WordComparisonDialog.js";

export default class TermManager extends Component {
  render() {
    <div id="term-manager-div">

      <form className="translterm-manager-form" onSubmit={this.handleSubmit}>

        <TranslationInput
          ref="termManagerSourceInput"
          currentInputValue={this.state.currentTermManagerSourceInputValue}
          onChange={this.handleTermManagerSourceInputChange}
        />

        <TranslationInput
          ref="termManagerTranslationInput"
          currentInputValue={this.state.currentTermManagerTranslationInputValue}
          onChange={this.handleTermManagerTranslationInputChange}
        />
      </form>
      // todo αρχίζεις και βλέπεις πώς μπορείς να προσθέτεις λέξεις στο global dictionary
    </div>;
  }
}
