import React, { Component } from "react";
import { ModalContainer, ModalDialog } from "react-modal-dialog";
import PropTypes from "prop-types";

export default class SearchResults extends Component {
  static propTypes = {
    searchResults: PropTypes.array
  };
  render() {
    const htmlTable = this.props.searchResults.map(entry => {
      return (
        <tr key={entry._id}>
          <td>{entry._id}</td>
          <td>{entry.term}</td>
          <td>{entry.translation}</td>
          <td>{entry.totalSuccesses}</td>
          <td>{entry.totalFailures}</td>
          <td>{entry.totalTimesSelected}</td>
        </tr>
      );
    });

    return (
      <div>
        <table className="searchResultsTable">
          <tbody>
            <tr>
              <th>id</th>
              <th>Ελληνικά</th>
              <th>Γερμανικά</th>
              <th>Επιτυχίες</th>
              <th>Αποτυχίες</th>
              <th>Επιλέχθηκε</th>
            </tr>
            {htmlTable}
          </tbody>
        </table>

      </div>
    );
  }
}
