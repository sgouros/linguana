import React, { Component } from "react";
import PropTypes from "prop-types";

export default class VocabularyTable extends Component {
  static propTypes = {
    vocabulary: PropTypes.array,
    title: PropTypes.string,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func
  };

  onDelete = event => {
    // let id = event.target.getAttribute("data-id"); // this is the id in the database
    let index = event.target.getAttribute("data-index"); //this is the index in props.vocabulary
    this.props.onDelete(this.props.vocabulary[index]);
  };

  onEdit = event => {
    // let id = event.target.getAttribute("data-id"); // this is the id in the database
    let index = event.target.getAttribute("data-index"); //this is the index in props.vocabulary
    this.props.onEdit(this.props.vocabulary[index]);
  };

  render() {
    const htmlTable = this.props.vocabulary.map((entry, index) => {
      return (
        <tr key={entry._id}>
          <td>{entry._id}</td>
          <td>{entry.term}</td>
          <td>{entry.translation}</td>
          <td>{entry.totalSuccesses}</td>
          <td>{entry.totalFailures}</td>
          <td>{entry.totalTimesSelected}</td>
          <td className="td-delete" data-id={entry._id} data-index={index} onClick={this.onDelete}>
            delete
          </td>
          <td className="td-edit" data-id={entry._id} data-index={index} onClick={this.onEdit}>edit</td>
        </tr>
      );
    });

    return (
      <div>
        <p>{this.props.title}</p>
        <table className="searchResultsTable">
          <tbody>
            <tr>
              <th>id</th>
              <th>Ελληνικά</th>
              <th>Γερμανικά</th>
              <th>Παρατηρήσεις</th>
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
