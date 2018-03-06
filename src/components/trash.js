// TO REPRODUCE: type letters until input box fills up. The input box does not scroll-to-cursor as you continue to type
// Now press letter 'a' (which I deliberately left out of my substitutions so no processing takes place). event.preventDefault() is not called so the input scrolls-to-cursor

class MyTest extends React.Component {
  state = {
    currentInputValue: ""
  };

  handleInputChange = event => {
    const textTyped = event.target.value;
    this.setState({ currentInputValue: textTyped });
  };

  render() {
    return <InputGR currentInputValue={this.state.currentInputValue} onChange={this.handleInputChange} />;
  }
}

class InputGR extends React.Component {
  // key 'a' is deliberately missing
  κeySubstitutions = {
    87: "ς",
    69: "ε",
    82: "ρ",
    84: "τ",
    89: "υ",
    85: "θ",
    73: "ι",
    79: "ο",
    80: "π",
    83: "σ",
    68: "δ",
    70: "φ",
    71: "γ",
    72: "η",
    74: "ξ",
    75: "κ",
    76: "λ",
    90: "ζ",
    88: "χ",
    67: "ψ",
    86: "ω",
    66: "β",
    78: "ν",
    77: "μ"
  };

  handleKeyDown = event => {
    if (this.κeySubstitutions[event.keyCode]) {
      this.substituteKey(event);
    }
  };

  substituteKey = event => {
    let letterToAdd = this.κeySubstitutions[event.keyCode];
    event.target.value += letterToAdd;
    this.handleOnChange(event);
    // ******************** the following line prevents input scrolling
    event.preventDefault();
  };

  handleOnChange = event => {
    this.props.onChange(event);
  };

  render() {
    return (
      <input type="text" value={this.props.currentInputValue} onKeyDown={this.handleKeyDown} onChange={this.handleOnChange} />
    );
  }
}

ReactDOM.render(<MyTest />, document.getElementById("container"));
