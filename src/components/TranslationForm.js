import React, { Component } from "react";
import TranslationInputGR from "./TranslationInputGR.js";
import TranslationInputDE from "./TranslationInputDE.js";

export default class TranslationForm extends Component {
  // todo: να διορθωθούν τα css class names

  getCssClassForSourceTerm = () => {
    return (
      "translationForm__entryAlreadyCorrectlyTranslated__" + this.props.isEntryAlreadyCorrectlyTranslated
    );
  };

  render() {
    let form;
    if (this.props.fromNativeToForeign) {
      form = (
        <form className="translationForm" onSubmit={this.props.onSubmit}>
          <div className={this.getCssClassForSourceTerm()}>
            {this.props.nativeTerm}
          </div>

          <div className="translationForm__foreignTermNotes">
            {this.props.foreignTermNotes}
          </div>

          <TranslationInputDE
            ref="translationInput"
            currentInputValue={this.props.currentInputValue}
            onChange={this.props.onTranslationInputChange}
            onEscPress={this.props.onEscPress}
            onPlusPress={this.props.onPlusPress}
            correctTranslation={this.props.correctTranslation}
            inputClassName="translationForm__translationInput"
            disableSpecialPlusPress={this.props.fromNativeToForeign}
          />
        </form>
      );
    } else {
      form = (
        <form className="translationForm" onSubmit={this.props.onSubmit}>
          <div className={this.getCssClassForSourceTerm()}>
            {this.props.foreignTerm}
          </div>

          <div className="translationForm__foreignTermNotes">
            {this.props.foreignTermNotes}
          </div>

          <TranslationInputGR
            ref="translationInput"
            currentInputValue={this.props.currentInputValue}
            onChange={this.props.onTranslationInputChange}
            onEscPress={this.props.onEscPress}
            onPlusPress={this.props.onPlusPress}
            correctTranslation={this.props.correctTranslation}
            inputClassName="translationForm__translationInput"
            disableSpecialPlusPress={this.props.fromNativeToForeign}
          />
        </form>
      );
    }

    return form;
  }
}
