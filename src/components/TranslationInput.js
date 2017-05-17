import React, { Component } from "react";

//  {/*className={this.state.css_source_term_label}*/}
//             {/*name="translation_try_input"*/}
//             {/*value={this.state.translation_try}*/}

class TranslationInput extends Component {
  handleOnChange = event => {
    this.props.onChange(event);
  };

  render() {
    //const {} = this.props
    return (
      <input
        id="translation_input"
        name="translation_input"
        type="text"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="off"
        value={this.props.currentInputValue}
        onKeyDown={this.props.handleKeyDown}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default TranslationInput;
