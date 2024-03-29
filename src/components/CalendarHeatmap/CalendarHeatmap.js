import React from "react";
import range from "lodash.range";
import reduce from "lodash.reduce";
import { DAYS_IN_WEEK, MILLISECONDS_IN_ONE_DAY, MONTH_LABELS } from "./constants.js";
import { shiftDate, getBeginningTimeForDate, convertToDate } from "./dateHelpers.js";
import ReactTooltip from "react-tooltip";
import PropTypes from "prop-types";
// import { getDateString, getTodayDateTimeString } from "../helpers.js";

const SQUARE_SIZE = 10;
const MONTH_LABEL_GUTTER_SIZE = 4;

export default class CalendarHeatmap extends React.Component {
  constructor(props) {
    super(props);
    // console.info(props.values);
    this.state = {
      valueCache: this.getValueCache(props.values),
      tooltip: null
    };
  }

  getValueCache(values) {
    return reduce(
      values,
      (memo, value) => {
        const index = this.getIndexForDate(value.date);
        // console.info("reducing index " + index);
        memo[index] = {
          value,
          className: this.props.classForValue(value),
          title: this.props.titleForValue ? this.props.titleForValue(value) : null,
          tooltipDataAttrs: this.getTooltipDataAttrsForValue(value)
        };
        // console.info(`memo[${index}] = [${memo[index].value.date} , ${memo[index].value.count}]`);
        // console.info(values);
        return memo;
      },
      {}
    );
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      valueCache: this.getValueCache(nextProps.values)
    });
  }

  getSquareSizeWithGutter() {
    return SQUARE_SIZE + this.props.gutterSize;
  }

  getMonthLabelSize() {
    if (!this.props.showMonthLabels) {
      return 0;
    } else if (this.props.horizontal) {
      return SQUARE_SIZE + MONTH_LABEL_GUTTER_SIZE;
    }
    return 2 * (SQUARE_SIZE + MONTH_LABEL_GUTTER_SIZE);
  }

  getStartDate() {
    let d = shiftDate(this.getEndDate(), -this.props.numDays + 1); // +1 because endDate is inclusive
    return d;
  }

  getEndDate() {
    let d = getBeginningTimeForDate(convertToDate(this.props.endDate));
    return d;
  }

  getStartDateWithEmptyDays() {
    return shiftDate(this.getStartDate(), -this.getNumEmptyDaysAtStart());
  }

  getNumEmptyDaysAtStart() {
    return this.getStartDate().getDay();
  }

  getNumEmptyDaysAtEnd() {
    let s = DAYS_IN_WEEK - 1 - this.getEndDate().getDay();
    return s;
  }

  getWeekCount() {
    const numDaysRoundedToWeek = this.props.numDays + this.getNumEmptyDaysAtStart() + this.getNumEmptyDaysAtEnd();
    return Math.ceil(numDaysRoundedToWeek / DAYS_IN_WEEK);
  }

  getWeekWidth() {
    return DAYS_IN_WEEK * this.getSquareSizeWithGutter();
  }

  getWidth() {
    return this.getWeekCount() * this.getSquareSizeWithGutter() - this.props.gutterSize;
  }

  getHeight() {
    return this.getWeekWidth() + (this.getMonthLabelSize() - this.props.gutterSize);
  }

  getIndexForDate(date) {
    let index = Math.round((convertToDate(date) - this.getStartDateWithEmptyDays()) / MILLISECONDS_IN_ONE_DAY);
    return index;
  }

  getDateForIndex(index) {
    let date = this.getStartDateWithEmptyDays();
    date.setDate(date.getDate() + index);
    return date.toString("yyyy-mm-dd");
  }

  getValueForIndex(index) {
    if (this.state.valueCache[index]) {
      return this.state.valueCache[index].value;
    }
    return null;
  }

  getClassNameForIndex(index) {
    if (this.state.valueCache[index]) {
      return this.state.valueCache[index].className;
    }
    return this.props.classForValue(null);
  }

  getTitleForIndex(index) {
    if (this.state.valueCache[index]) {
      return this.state.valueCache[index].title;
    }
    return this.props.titleForValue ? this.props.titleForValue(null) : null;
  }

  getTooltipDataAttrsForIndex(index) {
    if (this.state.valueCache[index]) {
      return this.state.valueCache[index].tooltipDataAttrs;
    }
    return this.getTooltipDataAttrsForValue({ date: null, count: null });
  }

  getTooltipDataAttrsForValue(value) {
    const { tooltipDataAttrs } = this.props;

    if (typeof tooltipDataAttrs === "function") {
      return tooltipDataAttrs(value);
    }
    return tooltipDataAttrs;
  }

  getTransformForWeek(weekIndex) {
    if (this.props.horizontal) {
      return `translate(${weekIndex * this.getSquareSizeWithGutter()}, 0)`;
    }
    return `translate(0, ${weekIndex * this.getSquareSizeWithGutter()})`;
  }

  getTransformForMonthLabels() {
    if (this.props.horizontal) {
      return null;
    }
    return `translate(${this.getWeekWidth() + MONTH_LABEL_GUTTER_SIZE}, 0)`;
  }

  getTransformForAllWeeks() {
    if (this.props.horizontal) {
      return `translate(0, ${this.getMonthLabelSize()})`;
    }
    return null;
  }

  getViewBox() {
    if (this.props.horizontal) {
      return `0 0 ${this.getWidth()} ${this.getHeight()}`;
    }
    return `0 0 ${this.getHeight()} ${this.getWidth()}`;
  }

  getSquareCoordinates(dayIndex) {
    if (this.props.horizontal) {
      return [0, dayIndex * this.getSquareSizeWithGutter()];
    }
    return [dayIndex * this.getSquareSizeWithGutter(), 0];
  }

  getMonthLabelCoordinates(weekIndex) {
    if (this.props.horizontal) {
      return [weekIndex * this.getSquareSizeWithGutter(), this.getMonthLabelSize() - MONTH_LABEL_GUTTER_SIZE];
    }
    const verticalOffset = -2;
    return [0, (weekIndex + 1) * this.getSquareSizeWithGutter() + verticalOffset];
  }

  handleClick(value) {
    if (this.props.onClick) {
      this.props.onClick(value);
    }
  }

  renderSquare(dayIndex, index, weekIndex) {
    // console.info("rendering day " + dayIndex + " of week " + weekIndex + " (index= " + index +")");
    const indexOutOfRange = index < this.getNumEmptyDaysAtStart() || index >= this.getNumEmptyDaysAtStart() + this.props.numDays;
    if (indexOutOfRange && !this.props.showOutOfRangeDays) {
      return null;
    }
    const [x, y] = this.getSquareCoordinates(dayIndex);

    let value = this.getValueForIndex(index);
    if (value === null) {
      value = {
        date: this.getDateForIndex(index),
        count: 0
      };
    }

    let the_key = index;
    let the_data_tip = this.props.titleForValue(value);
    let the_title = this.getTitleForIndex(index);
    let the_className = this.getClassNameForIndex(index);

    return (
      <rect
        key={the_key}
        width={SQUARE_SIZE}
        height={SQUARE_SIZE}
        x={x}
        y={y}
        data-tip={the_data_tip}
        title={the_title}
        className={the_className}
        onClick={this.handleClick.bind(this, value)}
        {...this.getTooltipDataAttrsForIndex(index)}
      />
    );
  }

  renderWeek(weekIndex) {
    return (
      <g key={weekIndex} transform={this.getTransformForWeek(weekIndex)}>
        {range(DAYS_IN_WEEK).map(dayIndex => this.renderSquare(dayIndex, weekIndex * DAYS_IN_WEEK + dayIndex, weekIndex))}
      </g>
    );
  }

  renderAllWeeks() {
    return range(this.getWeekCount()).map(weekIndex => this.renderWeek(weekIndex));
  }

  renderMonthLabels() {
    if (!this.props.showMonthLabels) {
      return null;
    }
    const weekRange = range(this.getWeekCount() - 1); // don't render for last week, because label will be cut off
    return weekRange.map(weekIndex => {
      const endOfWeek = shiftDate(this.getStartDateWithEmptyDays(), (weekIndex + 1) * DAYS_IN_WEEK);
      const [x, y] = this.getMonthLabelCoordinates(weekIndex);
      return endOfWeek.getDate() >= 1 && endOfWeek.getDate() <= DAYS_IN_WEEK ? (
        <text key={weekIndex} x={x} y={y}>
          {MONTH_LABELS[endOfWeek.getMonth()]}
        </text>
      ) : null;
    });
  }

  render() {
    // console.info("---------------- values ------------------");
    // console.info(this.props.values);
    // console.info("---------------- values END ------------------");
    return (
      <div>
        <svg className="react-calendar-heatmap" viewBox={this.getViewBox()}>
          <g transform={this.getTransformForMonthLabels()}>{this.renderMonthLabels()}</g>
          <g transform={this.getTransformForAllWeeks()}>{this.renderAllWeeks()}</g>
        </svg>
        <ReactTooltip type="success" className="calendar__heatmap__tooltip" />
      </div>
    );
  }
}

CalendarHeatmap.propTypes = {
  values: PropTypes.arrayOf(
    // array of objects with date and arbitrary metadata
    PropTypes.shape({
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]).isRequired
    }).isRequired
  ).isRequired,
  numDays: PropTypes.number, // number of days back from endDate to show
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]), // end of date range
  gutterSize: PropTypes.number, // size of space between squares
  horizontal: PropTypes.bool, // whether to orient horizontally or vertically
  showMonthLabels: PropTypes.bool, // whether to show month labels
  showOutOfRangeDays: PropTypes.bool, // whether to render squares for extra days in week after endDate, and before start date
  tooltipDataAttrs: PropTypes.oneOfType([PropTypes.object, PropTypes.func]), // data attributes to add to square for setting 3rd party tooltips, e.g. { 'data-toggle': 'tooltip' } for bootstrap tooltips
  titleForValue: PropTypes.func, // function which returns title text for value
  classForValue: PropTypes.func, // function which returns html class for value
  onClick: PropTypes.func // callback function when a square is clicked
};

CalendarHeatmap.defaultProps = {
  numDays: 200,
  endDate: new Date(),
  gutterSize: 1,
  horizontal: true,
  showMonthLabels: true,
  showOutOfRangeDays: false,
  classForValue: value => (value ? "color-filled" : "color-empty")
};
