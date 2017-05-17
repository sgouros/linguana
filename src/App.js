import React, { Component } from "react";
import "./App.css";

import TestArea from "./components/TestArea.js";

const voc = [
  {
    greek_terms_array: ["ναι", "ok"],
    deutsch_terms_array: ["ja", "in ordnung"]
  },
  {
    greek_terms_array: ["κατόπιν"],
    deutsch_terms_array: ["danach", "anschließend"]
  },
  {
    greek_terms_array: ["ευγενικός"],
    deutsch_terms_array: ["nett"]
  },
  {
    greek_terms_array: ["αυτοκίνητο", "αμάξι", "ΙΧ"],
    deutsch_terms_array: ["das Auto", "das Wagen"]
  }
];

class App extends Component {
  state = { vocabulary: voc.slice() };

  construct_alert_message = () => {
    let flatArray = this.state.vocabulary.map(item => {
      return (
        item.greek_terms_array[0] + ": " + item.deutsch_terms_array[0] + "\n"
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
