import determineTemporalRelation from "./determineTemporalRelation";

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
        if (index > 0) {
            const prevConviction = data[index - 1];
            const currentConviction = data[index];

            if (prevConviction.yearType !== "unspecified" && currentConviction.yearType !== "unspecified") {
                let relations = determineTemporalRelation(prevConviction, currentConviction);

                if (Array.isArray(relations)) {
                    if (relations?.length > 1) {
                        if (relations[0] == relations[1]) {
                            temporalConditions.push(`((${idMap[currentConviction.id]}.date in ${idMap[prevConviction.id]}.date.${relations[0]}) or (${idMap[currentConviction.id]}.date in ${idMap[prevConviction.id]}.date.${relations[1]}))`);
                        } else {
                            
                        }
                    } else {
                        temporalConditions.push(`${idMap[currentConviction.id]}.date in ${idMap[prevConviction.id]}.date.${relations[0]}`);
                    }
                }
            }
        }
    });

    // **Explicit Ordering Using `connections`**
    connections?.forEach(({ fromId, toId }) => {
        if (idMap[fromId] && idMap[toId]) {
            hbConditions.push(`happensBefore[${idMap[fromId]}, ${idMap[toId]}]`);
        }
    });

    data.forEach((conviction, i) => {
        hbConditions.push(`happensBefore[${idMap[conviction.id]}, exp]`);
    });

    data.forEach((conviction, i) => {
        let expungeRelation = determineTemporalRelation(conviction, {
            yearType: "single",
            startYear: currentYear,
        });

        if (Array.isArray(expungeRelation)) {
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

export default generateAlloyPredicate;
