/**
 * Joshua Alele-Beals
 * joshbeals22@gmail.com
 * github.com/joshBeals
 */

function determineYearType(startYear, endYear) {
    if (!endYear || endYear === "") return "unspecified";
    if (startYear === endYear) return "single";
    return "range";
}

export default determineYearType;