import React, { Component } from "react";
import PropTypes from "prop-types";

export default class VocabularyTable extends Component {
  static propTypes = {
    vocabulary: PropTypes.array,
    title: PropTypes.string,
    onDelete: PropTypes.func
  };

  onDelete = event => {
    // let id = event.target.getAttribute("data-id"); // this is the id in the database
    let index = event.target.getAttribute("data-index"); //this is the index in props.vocabulary
    this.props.onDelete(this.props.vocabulary[index]);
  };

  render() {
    const htmlTable = this.props.vocabulary.map((entry, index) => {
      return (
        <tr key={entry._id}>
          {/*<td className="app__searchResults__table--tdID">
            {entry._id}
          </td>*/}
          <td className="app__searchResults__table--tdTranslation">
            {entry.translation}
          </td>
          <td className="app__searchResults__table--tdTerm">
            {entry.term}
          </td>

          <td className="app__searchResults__table--tdNotes">
            {entry.notes}
          </td>
          <td className="app__searchResults__table--tdNumber" title="total successes">
            <div className="app__searchResults__table__totalSuccesses__circle">115</div>
          </td>
          <td className="app__searchResults__table--tdNumber" title="total failures">
            <div className="app__searchResults__table__totalFailures__circle">
              {entry.totalFailures}
            </div>
          </td>
          <td className="app__searchResults__table--tdNumber" title="total times selected">
            <div className="app__searchResults__table__totalTimesSelected__circle">
              {entry.totalTimesSelected}
            </div>
          </td>
          <td
            className="app__searchResults__table--tdDelete"
            data-id={entry._id}
            data-index={index}
            onClick={this.onDelete}
            title="DELETE from database!"
          />
        </tr>
      );
    });

    return (
      <div className="app__searchResults">
        <p>
          {this.props.title}
        </p>
        <table className="app__searchResults__table">
          <tbody>
            {htmlTable}
          </tbody>
        </table>
      </div>
    );
  }
}
