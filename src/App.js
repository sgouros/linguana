import React, { Component } from "react";
import "./App.css";

import TestArea from "./components/TestArea.js";

const voc = [
  {
    sourceTermsArray: ["ναι"],
    destinationTermsArray: ["ja"]
  },
  {
    sourceTermsArray: ["κατόπιν"],
    destinationTermsArray: ["danach", "anschließend"]
  },
  {
    sourceTermsArray: ["ευγενικός"],
    destinationTermsArray: ["nett"]
  },
  {
    sourceTermsArray: ["αυτοκίνητο", "αμάξι", "ΙΧ"],
    destinationTermsArray: ["das Auto", "das Wagen"]
  }
];

class App extends Component {
  state = { vocabulary: voc.slice() };

  // {alert(this.construct_alert_message())}
  construct_alert_message = () => {
    let flatArray = this.state.vocabulary.map(item => {
      return (
        item.sourceTermsArray[0] + ": " + item.destinationTermsArray[0] + "\n"
      );
    });
    return (
      "Καλημέρα!\n\nΈχετε να μάθετε τις παρακάτω λέξεις:\n\n" +
      " " +
      flatArray.join(" ")
    );
  };

  restart = () => {
    // console.log("restart called");
    // this.setState({ vocabulary: voc.slice() });
  };

  recordSuccessfulTranslation = () => {
    console.info("------successful translation received");
  };

  recordFailedTranslation = () => {
    console.info("------failed translation received");
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
          <TestArea
            vocabulary={this.state.vocabulary}
            onSuccessfulTranslation={this.recordSuccessfulTranslation}
            onFailedTranslation={this.recordFailedTranslation}
          />
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
