import React, { Component } from "react";
import TranslationInputGR from "./TranslationInputGR.js";
import TranslationInputDE from "./TranslationInputDE.js";
import ReactFitText from "./ReactFitText.js";

export default class TranslationForm extends Component {
  getCssClassForSourceTerm = () => {
    return "translationForm__entryAlreadyCorrectlyTranslated__" + this.props.isEntryAlreadyCorrectlyTranslated;
  };

  componentDidMount = () => {
    // από εδώ
    // να δεις πόσο padding έχει
    // να δείς γιατί το κόκκινο γίνεται τόσο μικρό
    // console.info(this.refs.initialTermDiv.offsetWidth);
    // console.info(this.refs.resize.offsetWidth);
    // let parentDivWidth=this.refs.initialTermDiv.offsetWidth;
    // let childDivWidth=this.refs.resize.offsetWidth;
    // let division = parentDivWidth/childDivWidth;
    // let node = this.refs.initialTermDiv.childNodes[0];
    // let nodeStyle = window.getComputedStyle(node)
    // let slideMarginRight = nodeStyle.getPropertyValue('margin-right')
    // console.info(slideMarginRight);
    // this.refs.resize.style.transform = `scale(${division})`;
  }

  render() {
    let form;
    if (this.props.fromNativeToForeign) {
      form = (
        <form className="translationForm" onSubmit={this.props.onSubmit}>
          <div ref="initialTermDiv" className={this.getCssClassForSourceTerm()}>{this.props.nativeTerm}</div>
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
          
          <div ref="initialTermDiv" className={this.getCssClassForSourceTerm()}><span ref="resize">{this.props.foreignTerm}</span></div>
       
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
