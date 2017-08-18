import React, { Component } from "react";

export default class Headerlogo extends Component {
  render() {
    return (
      <div className="app__header__logo" onClick={this.props.ifClicked}>
        <img className="app__header__logo__logoImage" src="/img/logo.png" alt="linguana logo" />
        <div className="app__header__logo__logoText"> Linguana </div>
      </div>
    );
  }
}
