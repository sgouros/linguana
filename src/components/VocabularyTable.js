import React, { Component } from "react";
import PropTypes from "prop-types";
import ConfirmDialog from "react-confirm-dialog";
import EditEntryModal from "./EditEntryModal.js";

export default class VocabularyTable extends Component {
  static propTypes = {
    vocabulary: PropTypes.array,
    title: PropTypes.string,
    onDelete: PropTypes.func,
    onEditSubmitted: PropTypes.func,
  };

  constructor() {
    super();
    this.state = {
      showEditDialog: false,
      entryBeingEdited: null,
      initialNativeTerm: null,
      initialForeignTerm: null,
      initialForeignTermNotes: null,
    };
  }

  onEditRequested = (indexInVocabulary) => {
    let requestedEntryForEdit = this.props.vocabulary[indexInVocabulary];

    this.setState({
      initialNativeTerm: requestedEntryForEdit.nativeTerm,
      initialForeignTerm: requestedEntryForEdit.foreignTerm,
      initialForeignTermNotes: requestedEntryForEdit.foreignTermNotes,
      showEditDialog: true,
      entryBeingEdited: requestedEntryForEdit,
    });
  };

  onNativeTermChanged = (term) => {
    console.debug("onNativeTermChanged " + term);
    let newEntry = this.state.entryBeingEdited;
    newEntry.nativeTerm = term;
    this.setState({ entryBeingEdited: newEntry });
  };

  onForeignTermChanged = (term) => {
    console.debug("onForeignTermChanged");
    let newEntry = this.state.entryBeingEdited;
    newEntry.foreignTerm = term;
    this.setState({ entryBeingEdited: newEntry });
  };

  onForeignTermNotesChanged = (term) => {
    console.debug("onForeignTermNotesChanged");
    let newEntry = this.state.entryBeingEdited;
    newEntry.foreignTermNotes = term;
    this.setState({ entryBeingEdited: newEntry });
  };

  onEditSubmitted = () => {
    console.debug("submitted Entry!");
    this.props.onEditSubmitted(this.state.entryBeingEdited);
    this.setState({
      showEditDialog: false,
      entryBeingEdited: null,
      initialNativeTerm: null,
      initialForeignTerm: null,
      initialForeignTermNotes: null,
    });
  };

  onEditClosed = () => {
    console.debug("edit cancelled (closed)! Resetting to values:");
    let entryBeingEdited = this.state.entryBeingEdited;
    entryBeingEdited.nativeTerm = this.state.initialNativeTerm;
    entryBeingEdited.foreignTerm = this.state.initialForeignTerm;
    entryBeingEdited.foreignTermNotes = this.state.initialForeignTermNotes;

    console.debug(entryBeingEdited.nativeTerm);
    console.debug(entryBeingEdited.foreignTerm);
    console.debug(entryBeingEdited.foreignTermNotes);

    this.setState({
      showEditDialog: false,
      entryBeingEdited: null,
      initialNativeTerm: null,
      initialForeignTerm: null,
      initialForeignTermNotes: null,
    });
  };

  onDelete = (args) => {
    this.props.onDelete(this.props.vocabulary[args.indexInVocabulary]);
  };

  getHtmlTable = () => {
    let htmlTable = "Search: Sorry, could not find anything.";
    if (this.props.vocabulary.length > 0) {
      htmlTable = this.props.vocabulary.map((entry, index) => {
        return (
          <tr key={entry._id}>
            <td className="app__searchResults__table--tdTranslation">{entry.foreignTerm}</td>
            <td className="app__searchResults__table--tdTerm">{entry.nativeTerm}</td>
            <td className="app__searchResults__table--tdNotes">{entry.foreignTermNotes}</td>
            <td className="app__searchResults__table--tdNumber" title="total successes">
              <div className="app__searchResults__table__totalSuccesses__circle">{entry.totalSuccesses}</div>
            </td>
            <td className="app__searchResults__table--tdNumber" title="total failures">
              <div className="app__searchResults__table__totalFailures__circle">{entry.totalFailures}</div>
            </td>
            <td className="app__searchResults__table--tdNumber" title="total times selected">
              <div className="app__searchResults__table__totalTimesSelected__circle">{entry.totalTimesSelected}</div>
            </td>

            <td className="app__searchResults__table--tdEdit" onClick={() => this.onEditRequested(index)} />
            <td className="app__searchResults__table--tdDelete">
              <ConfirmDialog
                confirmMessage="This will delete the entry PERMANENTLY from the database. Are you sure?"
                confirmText="Yes, delete it!"
                cancelText="Cancel"
                action={this.onDelete}
                actionArgs={{ indexInVocabulary: index }}
              />
            </td>
          </tr>
        );
      });
    }
    return htmlTable;
  };

  render() {
    return (
      <div className="app__searchResults">
        <p>{this.props.title}</p>
        <table className="app__searchResults__table">
          <tbody>{this.getHtmlTable()}</tbody>
        </table>
        {this.state.showEditDialog && (
          <EditEntryModal
            title={`Editing:`}
            nativeTerm={this.state.entryBeingEdited.nativeTerm}
            foreignTerm={this.state.entryBeingEdited.foreignTerm}
            foreignTermNotes={this.state.entryBeingEdited.foreignTermNotes}
            onNativeTermChanged={this.onNativeTermChanged}
            onForeignTermChanged={this.onForeignTermChanged}
            onForeignTermNotesChanged={this.onForeignTermNotesChanged}
            onSubmit={this.onEditSubmitted}
            onClose={this.onEditClosed}
          />
        )}
      </div>
    );
  }
}
