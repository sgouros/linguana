import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

// npm install react-router-dom
import App from "../App.js";

const StartPage = () => (
  <Router>
    <div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/start">(re)start</Link></li>
      </ul>
      <Route exact path="/start" component={App} />
    </div>
  </Router>
);

export default StartPage;
