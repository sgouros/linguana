import React, { Component } from "react";
import SearchInput from "./SearchInput.js";
import PredifinedTagInput from "./PredifinedTagInput.js";

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
