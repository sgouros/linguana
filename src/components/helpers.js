export const MONTHS = {
  0: "Ιαν",
  1: "Φεβ",
  2: "Μαρ",
  3: "Απρ",
  4: "Μαι",
  5: "Ιουν",
  6: "Ιουλ",
  7: "Αυγ",
  8: "Σεπτ",
  9: "Οκτ",
  10: "Νοε",
  11: "Δεκ"
};

export const WEEKDAYS = {
  0: "Κυριακή",
  1: "Δευτέρα",
  2: "Τρίτη",
  3: "Τετάρτη",
  4: "Πέμπτη",
  5: "Παρασκευή",
  6: "Σάββατο"
};

export const ARTICLES = {
  0: "την",
  1: "την",
  2: "την",
  3: "την",
  4: "την",
  5: "την",
  6: "το"
};

export const MONTHS_GEN = {
  0: "Ιανουαρίου",
  1: "Φεβρουαρίου",
  2: "Μαρτίου",
  3: "Απριλίου",
  4: "Μαίου",
  5: "Ιουνίου",
  6: "Ιουλίου",
  7: "Αυγούστου",
  8: "Σεπτεμβρίου",
  9: "Οκτωβρίου",
  10: "Νοεμβρίου",
  11: "Δεκεμβρίου"
};

export function getDateString(requestedDate, article = false) {
  // console.log("requestedDate = " + requestedDate);
  let date = new Date(requestedDate);

  let dateString = "";
  if (article) {
    dateString += ARTICLES[date.getDay()];
  }
  dateString += " ";
  dateString += WEEKDAYS[date.getDay()];
  dateString += " ";
  dateString += date.getDate();
  dateString += " ";
  dateString += MONTHS_GEN[date.getMonth()];
  dateString += " ";
  dateString += date.getFullYear();
  return dateString;
}

export function getShortDateString(requestedDate) {
  let date = new Date(requestedDate);

  let dateString = "";
  dateString += date.getDate();
  dateString += ".";
  dateString += date.getMonth() + 1;
  dateString += ".";
  dateString += date
    .getYear()
    .toString()
    .substr(-2);
  return dateString;
}

export function addZero(number) {
  if (number < 10) {
    number = "0" + number;
  }
  return number;
}

export function getTodayDateTimeString() {
  let today = new Date();
  let dd = addZero(today.getDate());
  let mm = addZero(today.getMonth() + 1);
  let yyyy = today.getFullYear();
  let h = addZero(today.getHours());
  let m = addZero(today.getMinutes());
  let s = addZero(today.getSeconds());

  today = yyyy + "." + mm + "." + dd + "_" + h + "." + m + "." + s;
  return today;
}
