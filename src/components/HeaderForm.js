import React, { Component } from "react";
import SearchInput from "./SearchInput.js";
import PredifinedTagInput from "./PredifinedTagInput.js";

export default class HeaderForm extends Component {
  // onSubmit={this.props.onHeaderFormSubmitPressed }

  render() {
    return (
      <form className="app__header__headerForm">
        <SearchInput
          ref="headerForm_searchInput_ref"
          value={this.props.currentValueOfSearchInput}
          onChange={this.props.onSearchInputChange}
          onSearchSubmit={this.props.onSearchSubmit}
        />
        <PredifinedTagInput
          ref="headerForm_predifinedTagInput_ref"
          value={this.props.currentValueOfPredifinedTagInput}
          onChange={this.props.onPredifinedTagInputChange}
          onPredifinedTagSubmit={this.props.onPredifinedTagSubmit}
        />
      </form>
    );
  }
}
