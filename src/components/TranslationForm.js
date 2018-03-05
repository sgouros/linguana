import React, { Component } from "react";
import TranslationInputGR from "./TranslationInputGR.js";
import TranslationInputDE from "./TranslationInputDE.js";
import ReactFitText from "./ReactFitText.js";

export default class TranslationForm extends Component {
  getCssClassForSourceTerm = () => {
    return "translationForm__entryAlreadyCorrectlyTranslated__" + this.props.isEntryAlreadyCorrectlyTranslated;
  };

  componentDidMount = () => {
    window.addEventListener("resize", this.scaleTextToFit);
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.scaleTextToFit);
  }

  scaleTextToFit = () => {
    // find width needed scaling
    let initialTermDivCssStyle = window.getComputedStyle(this.refs.initialTermDiv);
    let initialTermDivWidth =
      this.refs.initialTermDiv.offsetWidth -
      parseFloat(initialTermDivCssStyle.getPropertyValue("padding-right")) -
      parseFloat(initialTermDivCssStyle.getPropertyValue("padding-left"));
    let textWidth = this.refs.resize.offsetWidth;
    let widthScale = initialTermDivWidth / textWidth;

    // find height needed scaling
    let initialTermDivHeight =
      this.refs.initialTermDiv.offsetHeight -
      parseFloat(initialTermDivCssStyle.getPropertyValue("padding-top")) -
      parseFloat(initialTermDivCssStyle.getPropertyValue("padding-bottom"));
    let textHeight = this.refs.resize.offsetHeight;
    let heightScale = initialTermDivHeight / textHeight;

    // choose min scaling from the two
    let scale = widthScale < heightScale ? widthScale : heightScale;
    this.refs.resize.style.transform = `scale(${scale})`;
  };

  render() {
    let form;
    if (this.props.fromNativeToForeign) {
      form = (
        <form className="translationForm" onSubmit={this.props.onSubmit}>
          <div ref="initialTermDiv" className={this.getCssClassForSourceTerm()}>
            {this.props.nativeTerm}
          </div>
          <div className="translationForm__foreignTermNotes">{this.props.foreignTermNotes}</div>

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
          <div ref="initialTermDiv" className={this.getCssClassForSourceTerm()}>
            <span ref="resize">{this.props.foreignTerm}</span>
          </div>

          <div className="translationForm__foreignTermNotes">{this.props.foreignTermNotes}</div>

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
