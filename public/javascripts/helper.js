const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
});
const moment = require('moment');

function dateToString(date) {
    return dateFormatter.format(Date.parse(date));
}

function toRelativeTime(time) {
    return moment(time).fromNow();
}

module.exports = {
    dateToString: dateToString,
    toRelativeTime: toRelativeTime
}