import React, { Component } from "react";
import PropTypes from "prop-types";
import WordComparisonDialog from "./WordComparisonDialog.js";
import TranslationForm from "./TranslationForm.js";

export default class Testarea extends Component {
  static propTypes = {
    vocabulary: PropTypes.array,
    onSuccessfulTranslation: PropTypes.func,
    onFailedTranslation: PropTypes.func,
    onEscPress: PropTypes.func,
    onLastEscPress: PropTypes.func,
    onPlusPress: PropTypes.func,
    fromNativeToForeign: PropTypes.bool
  };

  state = {
    currentTranslationInputValue: "",
    current_voc_index: 0,
    correctTranslation: false,
    showWordComparisonDialog: false
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
    this.setState({ correctTranslation: true });
    // ", linguanaFaceImgUrl: "/img/correct.png" });
  };

  highlightWrongAnswer = () => {
    this.setState({ correctTranslation: false });
    // this.setState({ cssBackground: "wrongTranslation", linguanaFaceImgUrl: "/img/wrong.png" });
  };

  handleSubmit = event => {
    let entry_index = this.state.current_voc_index;

    if (this.translationIsCorrect(this.state.currentTranslationInputValue)) {
      console.info("correct translation");
      this.props.onSuccessfulTranslation(entry_index);
      this.loadNextEntry();
    } else {
      console.debug("wrong translation");
      this.showWordComparisonDialog();
      this.props.onFailedTranslation(entry_index);
    }
    event.preventDefault();
  };

  showWordComparisonDialog = () => {
    this.setState({ showWordComparisonDialog: true });
  };

  translationIsCorrect = translation_typed => {
    if (this.props.fromNativeToForeign) {
      return translation_typed === this.getCorrectForeignTerm() ? true : false;
    } else {
      return translation_typed === this.getCorrectNativeTerm() ? true : false;
    }
  };

  loadNextEntry = () => {
    const currentIndex = this.state.current_voc_index;
    const lastVocIndex = this.props.vocabulary.length - 1;
    const nextIndex = currentIndex === lastVocIndex ? 0 : currentIndex + 1;
    console.debug(`inside loadNextEntry: Advancing to next entry (index ${nextIndex})`);
    this.clearInput();
    this.setState({
      current_voc_index: nextIndex
    });
  };

  clearInput = () => {
    this.setState({
      currentTranslationInputValue: "",
      correctTranslation: false
    });
  };

  getNativeTerm = () => {
    if (this.props.vocabulary.length > 0) {
      return this.props.vocabulary[this.state.current_voc_index].nativeTerm;
    } else {
      return "";
    }
  };

  getForeignTerm = () => {
    if (this.props.vocabulary.length > 0) {
      return this.props.vocabulary[this.state.current_voc_index].foreignTerm;
    } else {
      return "";
    }
  };

  getForeignTermNotes = () => {
    if (this.props.vocabulary.length > 0) {
      return this.props.vocabulary[this.state.current_voc_index].foreignTermNotes;
    } else {
      return "";
    }
  };

  getCorrectForeignTerm = () => {
    return this.props.vocabulary[this.state.current_voc_index].foreignTerm;
  };

  getCorrectNativeTerm = () => {
    return this.props.vocabulary[this.state.current_voc_index].nativeTerm;
  };

  onEscPress = () => {
    const currentIndex = this.state.current_voc_index;
    const lastVocIndex = this.props.vocabulary.length - 1;
    console.debug("currentIndex:" + currentIndex);
    console.debug("lastVocIndex index:" + lastVocIndex);
    let newIndex = -1;
    if (lastVocIndex === 0) {
      newIndex = 0;
    } else if (currentIndex === lastVocIndex) {
      newIndex = lastVocIndex - 1;
    } else {
      newIndex = currentIndex;
    }
    console.debug("new index:" + newIndex);
    this.clearInput();
    this.setState({
      current_voc_index: newIndex
    });
    this.props.onEscPress(currentIndex);
  };

  onPlusPress = () => {
    const currentIndex = this.state.current_voc_index;
    this.clearInput();
    this.props.onPlusPress(currentIndex);
  };

  closeWordComparisonDialog = () => {
    this.setState({ showWordComparisonDialog: false });
    this.loadNextEntry();
    this.refs.translationForm.refs.translationInput.refs.input.focus();
  };

  getWordComparisonDialogContent = () => {
    let correct = this.props.fromNativeToForeign
      ? this.getCorrectForeignTerm()
      : this.getCorrectNativeTerm();
    let typed = this.state.currentTranslationInputValue;
    return (
      <div>
        <table className="wordComparisonDialog__Table">
          <tbody>
            <tr>
              <td>Correct answer:</td>
              <td>
                {correct}
              </td>
            </tr>
            <tr>
              <td>You typed:</td>
              <td>
                {typed}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  isEntryAlreadyCorrectlyTranslated = () => {
    if (typeof this.props.vocabulary[this.state.current_voc_index] !== "undefined") {
      return this.props.vocabulary[this.state.current_voc_index].isCurrentlyCorrectlyTranslated;
    } else {
      return false;
    }
  };

  render() {
    return (
      <div className="testArea__component">
        <img
          id="testArea__component__linguanaImg"
          src={this.state.correctTranslation ? "/img/correct.png" : "/img/wrong.png"}
          alt="linguana"
        />
        <TranslationForm
          ref="translationForm"
          onSubmit={this.handleSubmit}
          isEntryAlreadyCorrectlyTranslated={this.isEntryAlreadyCorrectlyTranslated()}
          nativeTerm={this.getNativeTerm()}
          foreignTerm={this.getForeignTerm()}
          foreignTermNotes={this.getForeignTermNotes()}
          currentInputValue={this.state.currentTranslationInputValue}
          onTranslationInputChange={this.handleTranslationInputChange}
          onEscPress={this.onEscPress}
          onPlusPress={this.onPlusPress}
          correctTranslation={this.state.correctTranslation}
          fromNativeToForeign={this.props.fromNativeToForeign}
        />

        {this.state.showWordComparisonDialog
          ? <WordComparisonDialog
              title="hmmm, I don't think so..."
              content={this.getWordComparisonDialogContent()}
              onClose={this.closeWordComparisonDialog}
            />
          : null}
      </div>
    );
  }
}
