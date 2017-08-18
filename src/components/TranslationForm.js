import React, { Component } from "react";
import TranslationInputGR from "./TranslationInputGR.js";

export default class TranslationForm extends Component {
  // todo:
  // * να διορθωθούν τα css class names
  // * πρέπει μόνο του να διαχειρίζεται το translation input και να διατηρεί στην state τα περιεχόμενά του

  render() {
    return (
      <form className="testArea__component__translationForm" onSubmit={this.props.onSubmit}>
        <div
          className={
            "testArea__component__translationForm__sourceTerm__alreadyCorrectlyTranslated__" +
            this.props.isEntryAlreadyCorrectlyTranslated
          }
        >
          {this.props.nativeTerm}
        </div>

        <div className="testArea__component__translationForm__notes">
          {this.props.foreignTermNotes}
        </div>

        <TranslationInputGR
          ref="translationInputGR"
          currentInputValue={this.props.currentTranslationInputValue}
          onChange={this.props.onTranslationInputChange}
          onEscPress={this.props.onEscPress}
          onPlusPress={this.props.onPlusPress}
          correctTranslation={this.props.correctTranslation}
          inputClassName="testArea__component__translationForm__translationInputGR"
        />
      </form>
    );
  }
}
