import React, { Component } from "react";
import PropTypes from "prop-types";

class Stats extends Component {
  static propTypes = {
    totalEntriesCount: PropTypes.number,
    correctTranslationsCount: PropTypes.number,
    wrongTranslationsCount: PropTypes.number
  };

  render() {
    return (
      <div id="stats">
        <div id="correctAnswers"> correct: {this.props.correctTranslationsCount}</div>
        <div id="totalEntries"> total: {this.props.totalEntriesCount}</div>
        <div id="wrongAnswers"> wrong: {this.props.wrongTranslationsCount}</div>
      </div>
    );
  }
}

export default Stats;
