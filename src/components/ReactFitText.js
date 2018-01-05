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
    console.info(element);
    var width = element.offsetWidth;
    console.info(element.offsetWidth);

    let stringLength = this.props.children.props.children.length;

    if (stringLength <= 20) {
      element.style.fontSize = "12vh";
      element.style.padding = "1vh 1vh 2.5vh 1vh";
    } else if (stringLength > 20 && stringLength <= 27) {
      element.style.fontSize = "10vh";
      element.style.padding = "2vh 1vh 3.5vh 1vh";
    } else if (stringLength > 27 && stringLength <= 35) {
      element.style.fontSize = "8vh";
      element.style.padding = "3vh 1vh 4.5vh 1vh";
    } else {
      element.style.fontSize = "6vh";
      element.style.padding = "3.5vh 1vh 5vh 1vh";
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
