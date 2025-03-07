/**
 * Joshua Alele-Beals
 * joshbeals22@gmail.com
 * github.com/joshBeals
 */

import determineTemporalRelation from "./determineTemporalRelation";

function generateAlloyPredicate(data, connections) {
    if (data.length < 1) {
        throw new Error("The input data must contain at least one item.");
    }

    const currentYear = new Date().getFullYear();

    let alloyStringWithExpungement = "some ";
    let forced = [];
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

        if (conviction?.yearType == "unspecified") {
            temporalConditions.push(`(c${index + 1}.date in d2005.*ordering/next and d2025 in c${index + 1}.date.*ordering/next)`);
        }else if (conviction?.yearType == "single") {
            temporalConditions.push(`(c${index + 1}.date = d${conviction?.startYear})`);
        } else {
            temporalConditions.push(`(c${index + 1}.date in d${conviction?.startYear}.*ordering/next and d${conviction?.endYear} in c${index + 1}.date.*ordering/next)`);
        }

        // if (conviction?.startYear && conviction?.endYear) {
            
        // } else {
            
        // }

        // Determine temporal relations (excluding unspecified)
        if (index > 0 && data?.length > index) {
            const prevConviction = data[index - 1];
            const currentConviction = data[index];
        
            if (prevConviction && currentConviction) {
                let forcedTemp = [];
        
                // Ensure uniqueness without redundant conditions (c2 != c1 is implied by c1 != c2)
                for (let i = 0; i < index; i++) { // Loop only over previous convictions
                    forcedTemp.push(`(c${index + 1} != c${i + 1})`);
                }
        
                if (forcedTemp.length > 0) {
                    forced.push(`(${forcedTemp.join(' and ')})`);
                }
        
                // Only proceed if both convictions have a specified year type
                // if (prevConviction.yearType !== "unspecified" && currentConviction.yearType !== "unspecified") {
                //     console.log(prevConviction);
                //     console.log(currentConviction);
        
                //     let relations = determineTemporalRelation(prevConviction, currentConviction);
        
                //     if (Array.isArray(relations) && relations.length > 0) {
                //         if (relations.length > 1 && relations[0] !== relations[1]) {
                //             temporalConditions.push(
                //                 `(( ${idMap[currentConviction.id]}.date in ${idMap[prevConviction.id]}.date.${relations[0]} ) or ( ${idMap[currentConviction.id]}.date in ${idMap[prevConviction.id]}.date.${relations[1]} ))`
                //             );
                //         } else {
                //             temporalConditions.push(
                //                 `${idMap[currentConviction.id]}.date in ${idMap[prevConviction.id]}.date.${relations[0]}`
                //             );
                //         }
                //     }
                // }
            }
        }
        
    });
    
    temporalConditions.push(`exp.date = d2025`);

    // **Explicit Ordering Using `connections`**
    connections?.forEach(({ fromId, toId }) => {
        if (idMap[fromId] && idMap[toId]) {
            hbConditions.push(`happensBefore[${idMap[fromId]}, ${idMap[toId]}]`);
        }
    });

    data.forEach((conviction, i) => {
        if (conviction?.question == "expunged") {
            questions.push(`${idMap[conviction.id]} in exp.con`);
        }

        if (conviction?.question == "unexpunged") {
            questions.push(`not ${idMap[conviction.id]} in exp.con`);
        }
    });

    // if (questions.length <= 0) {
    //     data.forEach((conviction, i) => {
    //         questions.push(`(expungeable[${idMap[conviction.id]}, exp] implies ${idMap[conviction.id]} in exp.con)`);
    //     });
    // }

    if (forced.length > 0) alloyStringWithExpungement += forced.join(" and \n") + " and \n";
    if (conditions.length > 0) alloyStringWithExpungement += conditions.join(" and \n") + " and \n";
    if (hbConditions.length > 0) alloyStringWithExpungement += hbConditions.join(" and \n") + " and \n";
    if (temporalConditions.length > 0) alloyStringWithExpungement += temporalConditions.join(" and \n");
    if (expungementConditions.length > 0) alloyStringWithExpungement += " and \n" + expungementConditions.join(" and \n");
    if (questions.length > 0) alloyStringWithExpungement += " and \n" + questions.join(" and \n");

    return alloyStringWithExpungement + "\n";
}

export default generateAlloyPredicate;
