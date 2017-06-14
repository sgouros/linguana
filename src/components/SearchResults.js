import React, { Component } from "react";
import { ModalContainer, ModalDialog } from "react-modal-dialog";
import PropTypes from "prop-types";

export default class SearchResults extends Component {
  static propTypes = {
    searchResults: PropTypes.array
  };

  onDelete = event => {
    console.log("deleting " + event.target.getAttribute("data-id"));
    //** todo εδώ πρέπει να στέλνει μήνυμα κάπου στον parent ώστε να σβήνεται από τη βάση δεδομένων
    // αλλά και από το searchResults που δεινεται αυτή τη στιγμή

    // ** το search box όταν γίνει submit, να αδειάζει
    // ** κάπου να δείχνεται: searching entries containing "searchTerm"
  };

  onEdit = event => {
    console.log("editing " + event.target.getAttribute("data-id"));
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
          <td className="td-delete" data-id={entry._id} onClick={this.onDelete}>delete</td>
          <td className="td-edit" data-id={entry._id} onClick={this.onEdit}>edit</td>
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
