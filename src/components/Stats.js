import React, { Component } from "react";
import PropTypes from "prop-types";

class Stats extends Component {
  static propTypes = {
    totalTermsCount: PropTypes.number,
    correctTranslatedTermsCount: PropTypes.number,
    wrongTranslatedTermsCount: PropTypes.number
  };

  render() {
    return (
      <div>
        <ul>
          <li>correct: {this.props.correctTranslatedTermsCount}</li>
          <li>wrong: {this.props.wrongTranslatedTermsCount}</li>
          <li>total: {this.props.totalTermsCount}</li>
        </ul>
      </div>
    );
  }
}

export default Stats;
