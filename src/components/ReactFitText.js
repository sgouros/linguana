var React = require("react");
var ReactDOM = require("react-dom");
var ReactPropTypes = require("prop-types");
var createClass = require("create-react-class");

module.exports = createClass({
  displayName: "ReactFitText",

  propTypes: {
    children: ReactPropTypes.element.isRequired,
    compressor: ReactPropTypes.number,
    minFontSize: ReactPropTypes.number,
    maxFontSize: ReactPropTypes.number
  },

  getDefaultProps: function() {
    return {
      compressor: 1.0,
      minFontSize: Number.NEGATIVE_INFINITY,
      maxFontSize: Number.POSITIVE_INFINITY
    };
  },

  componentDidMount: function() {
    window.addEventListener("resize", this._onBodyResize);
    this._onBodyResize();
  },

  componentWillUnmount: function() {
    window.removeEventListener("resize", this._onBodyResize);
  },

  componentDidUpdate: function() {
    this._onBodyResize();
  },

  _onBodyResize: function() {
    var element = ReactDOM.findDOMNode(this);
    let stringLength = this.props.children.props.children.length;
    if (stringLength <= 15) {
      element.style.fontSize = "calc(80vw / 0.625 / 15)";
    } else if (stringLength > 15 && stringLength <= 20) {
      element.style.fontSize = "calc(80vw / 0.625 / " + (stringLength - 1);
    } else if (stringLength > 20 && stringLength <= 28) {
      element.style.fontSize = "calc(80vw / 0.625 / " + (stringLength - 3);
    } else {
      element.style.fontSize = "calc(80vw / 0.625 / " + (stringLength - 5);
    }
    console.debug("****** stringLength: " + stringLength);
    console.debug("****** element.style.fontSize: " + element.style.fontSize);
    console.debug("****** this.props.children.props.children: " + this.props.children.props.children);
  },
  _renderChildren: function() {
    var _this = this;

    return React.Children.map(this.props.children, function(child) {
      return React.cloneElement(child, {
        ref: function ref(c) {
          return (_this._childRef = c);
        }
      });
    });
  },
  render: function() {
    return this._renderChildren()[0];
  }
});
