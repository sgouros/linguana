import React, { Component } from "react";

export default class Searchform extends Component {
  render() {
    return (
      <form className="app__header__searchForm" onSubmit={this.props.onSubmitPressed}>
        <input
          ref="searchInput"
          className="app__header__searchForm__searchInput"
          name="searchInput"
          type="text"
          autoCorrect="off"
          spellCheck="off"
          value={this.props.currentSearchInputValue}
          placeholder="αναζήτηση..."
          onChange={this.props.onInputChange}
        />
      </form>
    );
  }
}
