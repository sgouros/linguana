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
      <div className="stats__component">
        <div>
          <div className="stats__component__totalCorrectAnswers">
            <img className="stats__component__footerImg" src="/img/yes.png" alt="correct answers" />
            <div className="stats__component__circledNumber stats__component--greenCircle">
              {this.props.correctTranslationsCount}
            </div>
          </div>
        </div>
        <div>
          <div className="stats__component__totalEntries">
            {/*<img className="stats__component__footerImg" src="/img/total.png" alt="total entries" />*/}
            <div className="stats__component__circledNumber stats__component--blueCircle">
              {this.props.totalEntriesCount}
            </div>
          </div>
        </div>
        <div>
          <div className="stats__component__totalWrongAnswers">
            <div className="stats__component__circledNumber stats__component--redCircle">
              {this.props.wrongTranslationsCount}
            </div>
            <img className="stats__component__footerImg" src="/img/no.png" alt="wrong answers" />
          </div>
        </div>
      </div>
    );
  }
}

export default Stats;
