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
      <div>
        <ul>
          <li>correct: {this.props.correctTranslationsCount}</li>
          <li>wrong: {this.props.wrongTranslationsCount}</li>
          <li>total: {this.props.totalEntriesCount}</li>
        </ul>
      </div>
    );
  }
}

export default Stats;
