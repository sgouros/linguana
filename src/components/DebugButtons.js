import React, { Component } from "react";

export default class Debugbuttons extends Component {
  render() {
    return (
      <div className="app__header__debugButtons">

        <div className="app__header__debugButtons__debugButton debugButton--blue" onClick={this.props.onResetVocDBPressed}>
          reset Voc DB
        </div>

        <div className="app__header__debugButtons__debugButton debugButton--purple" onClick={this.props.onResetStatsDBPressed}>
          reset Stats DB
        </div>
        
        {/* <div className="app__header__debugButtons__debugButton" onClick={this.props.onExtractVocDBPressed}>
          extract Voc DB
        </div>  */}


        <div className="app__header__debugButtons__debugButton debugButton--blue" onClick={this.props.onSeedVocDBPressed}>
          seed Voc DB
        </div>


        <div className="app__header__debugButtons__debugButton debugButton--purple" onClick={this.props.onSeedStatsDBPressed}>
          seed Stats DB
        </div>



  

        <div className="app__header__debugButtons__debugButton" onClick={this.props.onTraceVocabularyPressed}>
          trace current voc
        </div>

        {/* <div className="app__header__debugButtons__debugButton" onClick={this.props.onTraceVocDBPressed}>
          trace Voc DB
        </div>

        <div className="app__header__debugButtons__debugButton" onClick={this.props.onTraceStatsDBPressed}>
          trace Stats DB
        </div> */}

  

        <div className="app__header__debugButtons__debugButton debugButton--green" onClick={this.props.onDownloadDBPressed}>
          DOWNLOAD DB
        </div>


   
     {/* <div className="app__header__debugButtons__debugButton" onClick={this.props.onExtractStatsDBPressed}>
          extract Stats DB
        </div> */}

      </div>
    );
  }
}
