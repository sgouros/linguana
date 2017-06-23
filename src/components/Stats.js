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
        <div>
          <div id="correctAnswers">
            <img className="footerImg" src="/img/greenCheck.png" alt="correct answers" />
            <div className="circledNumber greenCircle">
              {this.props.correctTranslationsCount}
            </div>
          </div>
        </div>
        <div>
          <div id="totalEntries">
            <img className="footerImg" src="/img/total.png" alt="total entries" />
            <div className="circledNumber blueCircle">
              {this.props.totalEntriesCount}
            </div>
          </div>
        </div>
        <div>
          <div id="wrongAnswers">
            <img className="footerImg" src="/img/redCross.png" alt="wrong answers" />
            <div className="circledNumber redCircle">
              {this.props.wrongTranslationsCount}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Stats;
