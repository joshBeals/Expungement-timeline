
/**
 * Joshua Alele-Beals
 * joshbeals22@gmail.com
 * github.com/joshBeals
 */

// Function to determine the correct temporal relation
function determineTemporalRelation(A, B) {
    if (A.yearType === "single" && B.yearType === "single") {
        let yearDiff = Math.abs(B.startYear - A.startYear);
        return [getTemporalLabel(yearDiff)];
    }

    if (A.yearType === "single" && B.yearType === "range") {
        let yearDiffStart = Math.abs(B.startYear - A.startYear);
        let yearDiffEnd = Math.abs(B.endYear - A.startYear);
        return [getTemporalLabel(yearDiffStart), getTemporalLabel(yearDiffEnd)];
    }

    if (A.yearType === "range" && B.yearType === "single") {
        console.log(A.startYear, A.endYear, B.startYear, );
        let yearDiffStart = Math.abs(B.startYear - A.startYear);
        let yearDiffEnd = Math.abs(B.startYear - A.endYear);
        console.log(yearDiffStart, yearDiffEnd);
        return [getTemporalLabel(yearDiffStart), getTemporalLabel(yearDiffEnd)];
    }

    if (A.yearType === "range" && B.yearType === "range") {
        let yearDiffStart = Math.abs(B.startYear - A.startYear);
        let yearDiffEnd = Math.abs(B.endYear - A.endYear);
        return [getTemporalLabel(yearDiffStart), getTemporalLabel(yearDiffEnd)];
    }

    return [];
}

// Function to classify temporal relations
function getTemporalLabel(diff) {
    if (diff < 3) return "withinThree";
    // if (diff >= 3 && diff < 5) return "beyondThree";
    if (diff < 5) return "withinFive";
    return "beyondFive";
}

export default determineTemporalRelation;