import React, { Component } from "react";
import { ModalContainer, ModalDialog } from "react-modal-dialog";
import PropTypes from "prop-types";
import TranslationInputDE from "./TranslationInputDE.js";
import TranslationInputGR from "./TranslationInputGR.js";

export default class EditEntryModal extends Component {
  static propTypes = {
    title: PropTypes.string,
    nativeTerm: PropTypes.string,
    foreignTerm: PropTypes.string,
    foreignTermNotes: PropTypes.string,
    onForeignTermChanged: PropTypes.func,
    onNativeTermChanged: PropTypes.func,
    onForeignTermNotesChanged: PropTypes.func,
    onSubmit: PropTypes.func
  };

  handleNativeTermInputChange = event => {
    this.props.onNativeTermChanged(event.target.value);
  };

  handleForeignTermInputChange = event => {
    this.props.onForeignTermChanged(event.target.value);
  };

  handleForeignTermNotesInputChange = event => {
    this.props.onForeignTermNotesChanged(event.target.value);
  };

  handleSubmit = event => {
    event.preventDefault();
    this.props.onSubmit();
  };

  render() {
    return (
      <ModalContainer onClose={this.closed} id="editEntryModal">
        <ModalDialog onClose={this.closed} id="editEntryModal" dismissOnBackgroundClick={true} width="60%">
          <div className="app__vocabularyManagerComponent">
            <form className="app__vocabularyManagerComponent__form" onSubmit={this.handleSubmit}>
              <div className="app__vocabularyManagerComponent__form__germanFlag" />

              <div>
                <TranslationInputDE
                  ref="vocabularyManagerTermInputDE"
                  currentInputValue={this.props.foreignTerm}
                  onChange={this.handleForeignTermInputChange}
                  disableSpecialEscPress={true}
                  disableSpecialPlusPress={true}
                  inputClassName="app__vocabularyManagerComponent__form__termInputDE"
                />
                {
                  <TranslationInputDE
                    ref="vocabularyManagerNotesInput"
                    currentInputValue={this.props.foreignTermNotes}
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
                  currentInputValue={this.props.nativeTerm}
                  onChange={this.handleNativeTermInputChange}
                  disableSpecialEscPress={true}
                  disableSpecialPlusPress={true}
                  inputClassName="app__vocabularyManagerComponent__form__translationInputGR"
                />
              </div>

              <input type="submit" id="VocabularyManagerSubmitButton" value="submit" />
            </form>
          </div>
        </ModalDialog>
      </ModalContainer>
    );
  }
}
