import React, { Component } from "react";

export default class Debugbuttons extends Component {
  render() {
    return (
      <div className="app__header__debugButtons">
        <div
          className="app__header__debugButtons__debugButton"
          onClick={this.props.onResetDatabasePressed}
        >
          reset DB
        </div>
        <div
          className="app__header__debugButtons__debugButton"
          onClick={this.props.onSeedDatabasePressed}
        >
          seed DB
        </div>
        <div
          className="app__header__debugButtons__debugButton"
          onClick={this.props.onTraceDatabasePressed}
        >
          trace db
        </div>
        <div
          className="app__header__debugButtons__debugButton"
          onClick={this.props.onTraceVocabularyPressed}
        >
          trace voc
        </div>
        <div
          className="app__header__debugButtons__debugButton"
          onClick={this.props.onTraceTotalWordsLearnedForTodayPressed}
        >
          trace total words
        </div>

        <div className="app__header__debugButtons__debugButton" onClick={this.props.onTraceStatsPressed}>
          trace stats
        </div>

        <div
          className="app__header__debugButtons__debugButton"
          onClick={this.props.onResetStatsDatabasePressed}
        >
          reset Stats DB
        </div>

        <div
          className="app__header__debugButtons__debugButton"
          onClick={this.props.onSeedStatsDatabasePressed}
        >
          seed Stats DB
        </div>

        <div
          className="app__header__debugButtons__debugButton"
          onClick={this.props.onTraceStatsDatabasePressed}
        >
          trace Stats DB
        </div>
      </div>
    );
  }
}
