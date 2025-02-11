
function determineYearType(startYear, endYear) {
    if (!endYear || endYear === "") return "unspecified";
    if (startYear === endYear) return "single";
    return "range";
}

export default determineYearType;