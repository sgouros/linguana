import React, { Component } from "react";
import "./App.css";

import TestArea from "./components/testarea/TestArea.js";

const voc1 = [
  ["ποσοστό", "der Anteil", "", "", ""],
  ["επεξεργασμένος", "behandelt", "", "", ""],
  ["κατόπιν", "danach", "hernach", "anschließend", ""],
  ["καλός", "gut", "", "", ""],
  ["όμορφος", "schön", "", "", ""],
  ["έρχομαι", "kommen", "", "", ""]
];

const voc2 = [
  ["ναι", "ja", "", "", ""],
  ["ποσ", "der Anteil", "", "", ""],
  ["επεξ", "behandelt", "", "", ""],
  ["κατόπιν", "danach", "hernach", "anschließend", ""],
  ["καλός", "gut", "", "", ""],
  ["όμορφος", "schön", "", "", ""],
  ["έρχομαι", "kommen", "", "", ""]
];

class App extends Component {
  state = { vocabulary: voc1.slice() };

  construct_alert_message = () => {
    let flatArray = this.state.vocabulary.map(item => {
      return (
        item[0] +
        ": " +
        item[1] +
        " " +
        item[2] +
        " " +
        item[3] +
        item[4] +
        " " +
        "\n"
      );
    });
    return (
      "Καλημέρα!\n\nΈχετε να μάθετε τις παρακάτω λέξεις:\n\n" +
      " " +
      flatArray.join(" ")
    );
  };

  restart = () => {
    console.log("restart called");
    this.setState({ vocabulary: voc2.slice() });
  };

  render() {
    return (
      <div id="page">
        <header>
          Planner: ΟΠΣ Παρακολούθησης Αναπτυξιακών Εργων Περιφέρειας ΑΜΘ
        </header>
        <nav className="left-nav">
          left nav
        </nav>
        <main>
          {alert(this.construct_alert_message())}
          <TestArea vocabulary={this.state.vocabulary} />
        </main>
        <nav className="right-nav">
          <button onClick={this.restart}>new</button>
        </nav>
        <footer>
          Διεύθυνση Αναπτυξιακού Προγραμματισμού Περιφέρειας ΑΜΘ
        </footer>
      </div>
    );
  }
}

export default App;
