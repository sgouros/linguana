import React, { Component } from "react";
import SearchInput from "./SearchInput.js";
import PredifinedTagInput from "./PredifinedTagInput.js";
import OptionsInput from "./OptionsInput.js";

export default class HeaderForm extends Component {
  render() {
    return (
      <form className="app__header__headerForm">
        <SearchInput
          ref="headerForm_searchInput_ref"
          currentValueOfActualSearchInput={this.props.currentValueOfSearchInput}
          onChange={this.props.onSearchInputChange}
          onSearchSubmit={this.props.onSearchSubmit}
        />

        <OptionsInput
          ref="headerForm_optionsInput_ref"
          currentValueOfActualOptionsInput={this.props.currentValueOfOptionsInput}
          onOptionsChange={this.props.onOptionsInputChange}
        />

        <PredifinedTagInput
          ref="headerForm_predifinedTagInput_ref"
          currentValueOfActualPredifinedTagInput={this.props.currentValueOfPredifinedTagInput}
          onTagChange={this.props.onPredifinedTagInputChange}
          onPredifinedTagSubmit={this.props.onPredifinedTagSubmit}
        />
      </form>
    );
  }
}
