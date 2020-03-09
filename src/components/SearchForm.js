import React, { Component } from "react";
import SearchInput from "./SearchInput.js";
import SessionTagInput from "./SessionTagInput.js";

export default class Searchform extends Component {
  render() {
    return (
      <form className="app__header__searchForm" onSubmit={this.props.onSubmitPressed}>
        <SearchInput ref="searchInput" value={this.props.currentSearchInputValue} onChange={this.props.onInputChange} />
        <SessionTagInput
          ref="sessionTagInput"
          value={this.props.currentSessionTagInputValue}
          onChange={this.props.onInputChange}
        />
      </form>
    );
  }
}
