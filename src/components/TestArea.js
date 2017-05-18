import React, { Component } from "react";
import PropTypes from "prop-types";

// props:
// vocabulary: array of objects

//  <div className="stats">
//       <br />
//       <ul>
//         <li>
//           Έχετε απαντήσει σωστά σε
//           {" "}
//           {this.count_total_correct_answers()}
//           {" "}
//           από
//           {" τις "}
//           {this.state.voc.length}
//           {" "}
//           συνολικά λέξεις προς εκμάθηση
//         </li>
//         <li>current word index: {this.state.current_voc_index}</li>
//       </ul>
//     </div>
//   </div>

import TranslationInput from "./TranslationInput.js";

class Testarea extends Component {
  static propTypes = {
    vocabulary: PropTypes.array
  };

  s_Timeout = 0;

  state = {
    currentTranslationInputValue: "",
    current_voc_index: 0,
    cssSourceTermLabel: "wrong_translation",
    correct_answers_array: new Array(this.props.vocabulary.length).fill(
      0,
      0,
      this.props.vocabulary.length
    )
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
    this.setState({ cssSourceTermLabel: "correct_translation" });
  };

  highlightWrongAnswer = () => {
    this.setState({ cssSourceTermLabel: "wrong_translation" });
  };

  handleSubmit = event => {
    let term_index = this.state.current_voc_index;

    if (this.translationIsCorrect(this.state.currentTranslationInputValue)) {
      console.info("CORRECT translation");
      this.props.onSuccessfulTranslation(term_index);
    } else {
      console.info("WRONG translation");
      this.props.onFailedTranslation(term_index);
      this.showWordComparison();
    }
    this.loadNextTerm();
    event.preventDefault();
  };

  showWordComparison = () => {
    let correct = this.getSourceTerm();
    let typed = this.state.currentTranslationInputValue;
    alert(`correct      :       ${correct}\nyou typed:       ${typed}`);
  };

  // recordSuccess = (term_index) => {
  // let  = this.state.current_voc_index;

  // const currentIndex = this.state.current_voc_index;
  // const ar = [
  //   ...this.state.correct_answers_array.slice(0, currentIndex),
  //   1,
  //   ...this.state.correct_answers_array.slice(
  //     currentIndex + 1,
  //     this.state.correct_answers_array.length
  //   )
  // ];
  // this.setState({
  //   correct_answers_array: ar
  // });
  // console.debug(ar);
  // };

  // recordFailure = () => {
  //   const currentIndex = this.state.current_voc_index;
  //   const ar = [
  //     ...this.state.correct_answers_array.slice(0, currentIndex),
  //     0,
  //     ...this.state.correct_answers_array.slice(
  //       currentIndex + 1,
  //       this.state.correct_answers_array.length
  //     )
  //   ];

  //   this.setState({
  //     correct_answers_array: ar
  //   });
  //   console.debug(ar);
  // };

  translationIsCorrect = translation_typed => {
    return translation_typed === this.getCorrectTranslation() ? true : false;
  };

  loadNextTerm = () => {
    const currentIndex = this.state.current_voc_index;
    const lastVocIndex = this.props.vocabulary.length - 1;
    const nextIndex = currentIndex === lastVocIndex ? 0 : currentIndex + 1;
    console.info(`----- I am advancing to next term (index ${nextIndex})`);
    this.clearInput();
    this.setState({
      current_voc_index: nextIndex,
      css_source_term_label: "wrong_translation"
    });
  };

  clearInput = () => {
    this.setState({ currentTranslationInputValue: "" });
  };

  specialKeyAlreadyPressed = () => {
    return this.s_Timeout === 0 ? false : true;
  };

  handleKeyDown = event => {
    const special_letter_substitutions = [
      ["s", "ß"],
      ["a", "ä"],
      ["u", "ü"],
      ["o", "ö"]
    ];
    const index_of_substitution_pair = special_letter_substitutions.findIndex(
      item => item[0] === event.key
    );
    console.debug(" ");
    console.debug(
      "index_of_special_letter_substitutions (-1 means no special letter): " +
        index_of_substitution_pair
    );
    if (index_of_substitution_pair >= 0) {
      if (this.specialKeyAlreadyPressed()) {
        console.debug("SPECIAL KEY PRESSED 2 TIMES");
        clearTimeout(this.s_Timeout);
        this.s_Timeout = 0;
        console.debug(`timeout reset! ${this.s_Timeout}`);
        const initial_value = event.target.value;
        const correct_input_box_value =
          initial_value.substr(0, initial_value.length - 1) +
          special_letter_substitutions[index_of_substitution_pair][1];
        event.target.value = correct_input_box_value;
        event.preventDefault();
      } else {
        console.debug(
          "SPECIAL KEY pressed for the first time! Setting timeout"
        );
        this.s_Timeout = setTimeout(this.tick, 190);
        console.debug(`timeout set! ${this.s_Timeout}`);
      }
    } else if (event.keyCode === 27) {
      console.info("\n--- esc key pressed.");

      const currentIndex = this.state.current_voc_index;

      if (this.state.voc.length === 1) {
        console.log("ignoring esc key because we have only the last word");
      } else {
        console.debug("removing item from correct_answers_array");
        const ar = [
          ...this.state.correct_answers_array.slice(0, currentIndex),
          ...this.state.correct_answers_array.slice(
            currentIndex + 1,
            this.state.correct_answers_array.length
          )
        ];

        console.info("removing item from voc array");
        const ar1 = [
          ...this.state.voc.slice(0, currentIndex),
          ...this.state.voc.slice(currentIndex + 1, this.state.voc.length)
        ];

        console.debug("current index check:" + currentIndex);
        const newIndex = currentIndex >= ar1.length
          ? ar1.length - 1
          : currentIndex;

        this.clearInput();
        this.setState({
          correct_answers_array: ar,
          voc: ar1,
          current_voc_index: newIndex
        });

        console.debug("new index:" + newIndex);
        console.debug("array1 length:" + ar1.length);
        console.debug("current index:" + currentIndex);
        console.debug(ar);
        console.debug(ar1);
      }
    } else {
      console.debug("normal key pressed");
    }
  };

  tick = () => {
    console.debug(`timeout cleared! ${this.s_Timeout}`);
    this.s_Timeout = 0;
    console.debug(`timeout reset! ${this.s_Timeout}`);
  };

  getSourceTerm = () => {
    return this.props.vocabulary[this.state.current_voc_index]
      .sourceTermsArray[0];
  };

  getCorrectTranslation = () => {
    return this.props.vocabulary[this.state.current_voc_index]
      .destinationTermsArray[0];
  };

  count_total_correct_answers = () => {
    return this.state.correct_answers_array.reduce(
      (prevItem, item) => prevItem + item,
      0
    );
  };

  total_word_number = () => {
    return this.state.voc.length;
  };

  count_total_wrong_answers = () => {
    return this.total_word_number() - this.count_total_correct_answers();
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          {console.info(
            `\n------------ showing voc index ${this.state.current_voc_index} -------------`
          )}
          <div id="source_word_div" className={this.state.cssSourceTermLabel}>
            {this.getSourceTerm()}
          </div>
          <TranslationInput
            currentInputValue={this.state.currentTranslationInputValue}
            onChange={this.handleTranslationInputChange}
          />

        </form>
      </div>
    );
  }
}

export default Testarea;
