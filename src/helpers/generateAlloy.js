function generateAlloyPredicate(data, connections) {
    if (data.length < 1) {
        throw new Error("The input data must contain at least one item.");
    }

    const currentYear = new Date().getFullYear();

    let alloyStringWithExpungement = "some ";
    let conditions = [];
    let temporalConditions = [];
    let hbConditions = [];
    let expungementConditions = [];
    let questions = [];

    console.log(data);

    // Assign dynamic IDs for matching with connections
    let idMap = {};
    data.forEach((conviction, index) => {
        idMap[conviction.id] = `c${index + 1}`;
    });

    data.forEach((conviction, index) => {
        alloyStringWithExpungement += `${idMap[conviction.id]}: Conviction`;
        if (index < data.length - 1) {
            alloyStringWithExpungement += ", ";
        } else {
            alloyStringWithExpungement += ", exp: Expungement | \n";
        }

        if (conviction?.type !== "" && conviction?.type !== "Conviction") {
            let temp = `((c${index + 1} in ${conviction.type})`;
            if (conviction?.assaultive) {
                temp += ` and (c${index + 1} in Assaultive)`;
            } else {
                temp += ` and (not c${index + 1} in Assaultive)`;
            }
            if (conviction?.type == "Felony") {
                if (conviction?.tenner) {
                    temp += ` and (c${index + 1} in TenYearFelony)`;
                } else {
                    temp += ` and (not c${index + 1} in TenYearFelony)`;
                }
            }
            if (conviction?.type == "Misdemeanor") {
                if (conviction?.owi) {
                    temp += ` and (c${index + 1} in OWI)`;
                } else {
                    temp += ` and (not c${index + 1} in OWI)`;
                }
            }
            conditions.push(`${temp})`);
        }

        // Determine temporal relations (excluding unspecified)
        // if (index > 0) {
        //     const prevConviction = data[index - 1];
        //     const currentConviction = data[index];

        //     if (prevConviction.yearType !== "unspecified" && currentConviction.yearType !== "unspecified") {
        //         if (prevConviction.yearType === "single" && currentConviction.yearType === "single") {
        //             const yearDiff = parseInt(currentConviction.year, 10) - parseInt(prevConviction.year, 10);
        //             const relation = determineTemporalRelation(yearDiff);
        //             temporalConditions.push(
        //                 `${idMap[currentConviction.id]}.date in ${idMap[prevConviction.id]}.date.${relation}`
        //             );
        //             hbConditions.push(`happensBefore[${idMap[prevConviction.id]}, ${idMap[currentConviction.id]}]`);
        //         } else if (prevConviction.yearType === "single" && currentConviction.yearType === "range") {
        //             const yearDiff1 = parseInt(currentConviction.startYear, 10) - parseInt(prevConviction.year, 10);
        //             const yearDiff2 = Math.abs(parseInt(currentConviction.endYear, 10) - parseInt(prevConviction.year, 10));
                    
        //             let cond1 = `(${idMap[currentConviction.id]}.date in ${idMap[prevConviction.id]}.date.${determineTemporalRelation(yearDiff1)})`;
        //             let cond2 = '';
        //             let smaller = false;

        //             if (parseInt(currentConviction.endYear, 10) > parseInt(prevConviction.year, 10)) {
        //                 smaller = true;
        //                 cond2 = `(${idMap[prevConviction.id]}.date in ${idMap[currentConviction.id]}.date.${determineTemporalRelation(yearDiff2)})`;
        //             } else {
        //                 cond2 = `(${idMap[currentConviction.id]}.date in ${idMap[prevConviction.id]}.date.${determineTemporalRelation(yearDiff2)})`;
        //             }
        //             temporalConditions.push(`(${cond1} or ${cond2})`);

        //             if (smaller) {
        //                 hbConditions.push(`(happensBefore[${idMap[prevConviction.id]}, ${idMap[currentConviction.id]}] or happensBefore[${idMap[currentConviction.id]}, ${idMap[prevConviction.id]}])`);
        //             } else {
        //                 hbConditions.push(`happensBefore[${idMap[prevConviction.id]}, ${idMap[currentConviction.id]}]`);
        //             }
        //         }
        //     }
        // }
    });

    // **Explicit Ordering Using `connections`**
    connections?.forEach(({ fromId, toId }) => {
        if (idMap[fromId] && idMap[toId]) {
            hbConditions.push(`happensBefore[${idMap[fromId]}, ${idMap[toId]}]`);
        }
    });

    // Ensure only valid convictions are used in happensBefore
    // if (data[data.length - 1].yearType !== "unspecified") {
    //     hbConditions.push(`happensBefore[${idMap[data[data.length - 1].id]}, exp]`);
    // }

    data.forEach((conviction, i) => {
        let expungeRelation = determineTemporalRelation(conviction, {
            yearType: "single",
            startYear: currentYear,
        });

        if (conviction.yearType === "single") {
            expungementConditions.push(`exp.date in ${idMap[conviction.id]}.date.${expungeRelation[0]}`);
        } else if (conviction.yearType === "range") {
            if (expungeRelation[0] == expungeRelation[1]) {
                expungementConditions.push(`exp.date in ${idMap[conviction.id]}.date.${expungeRelation[0]}`);
            } else {
                expungementConditions.push(
                    `((exp.date in ${idMap[conviction.id]}.date.${expungeRelation[0]}) or (exp.date in ${idMap[conviction.id]}.date.${expungeRelation[1]}))`
                );
            }
        }

        if (conviction?.question == "expungeable") {
            questions.push(`${idMap[conviction.id]} in exp.con`);
        }

        if (conviction?.question == "unexpungeable") {
            questions.push(`not ${idMap[conviction.id]} in exp.con`);
        }
    });

    if (conditions.length > 0) alloyStringWithExpungement += conditions.join(" and \n") + " and \n";
    if (hbConditions.length > 0) alloyStringWithExpungement += hbConditions.join(" and \n");
    if (temporalConditions.length > 0) alloyStringWithExpungement += " and \n" + temporalConditions.join(" and \n");
    if (expungementConditions.length > 0) alloyStringWithExpungement += " and \n" + expungementConditions.join(" and \n");
    if (questions.length > 0) alloyStringWithExpungement += " and \n" + questions.join(" and \n");

    return alloyStringWithExpungement + "\n";
}

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

export default generateAlloyPredicate;
