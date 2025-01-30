
function generateAlloyPredicate(data) {
    if (data.length < 1) {
        throw new Error("The input data must contain at least one item.");
    }

    const currentYear = new Date().getFullYear();
    const mostRecentYear = Math.max(
        ...data.map((conviction) => parseInt(conviction.year, 10))
    );

    let alloyStringWithExpungement = "some ";
    let conditions = [];
    let temporalConditions = [];
    let hbConditions = [];
    let expungementConditions = [];
    let questions = [];

    console.log(data);

    data.forEach((conviction, index) => {
        alloyStringWithExpungement += `c${index + 1}: Conviction`;
        if (index < data.length - 1) {
            alloyStringWithExpungement += ", ";
        } else {
            alloyStringWithExpungement += ", exp: Expungement | \n";
        }

        if (conviction?.type !== "") {
            let temp = `((c${index + 1} in ${conviction.type})`;
            if (conviction?.assaultive) {
                temp += ` and (c${index + 1} in Assaultive)`;
            } else {
                temp += ` and (not c${index + 1} in Assaultive)`;
            }
            if (conviction?.type == "Felony") {
                if(conviction?.tenner) {
                    temp += ` and (c${index + 1} in TenYearFelony)`;
                } else {
                    temp += ` and (not c${index + 1} in TenYearFelony)`;
                }
            }
            if (conviction?.type == "Misdemeanor") {
                if(conviction?.owi) {
                    temp += ` and (c${index + 1} in OWI)`;
                } else {
                    temp += ` and (not c${index + 1} in OWI)`;
                }
            }
            conditions.push(`${temp})`);
        }

        if (index > 0) {
            if (data[index].yearType == 'single' && data[index - 1].yearType == 'single') {
                const yearDifference = parseInt(data[index].year, 10) - parseInt(data[index - 1].year, 10);
                const temporalRelation = determineTemporalRelation(yearDifference);
                temporalConditions.push(
                    `c${index + 1}.date in c${index}.date.${temporalRelation}`
                );
                hbConditions.push(`happensBefore[c${index}, c${index + 1}]`);
            }else if (data[index].yearType == 'single' && data[index - 1].yearType == 'range') {
                const yearDifference1 = parseInt(data[index].year, 10) - parseInt(data[index - 1].startYear, 10);
                const yearDifference2 = Math.abs(parseInt(data[index].year, 10) - parseInt(data[index - 1].endYear, 10));
                let cond1 = `(c${index + 1}.date in c${index}.date.${determineTemporalRelation(yearDifference1)})`;
                let cond2 = '';
                let smaller = false;
                if (parseInt(data[index].year, 10) < parseInt(data[index - 1].endYear, 10)) {
                    smaller = true;
                    cond2 = `(c${index}.date in c${index + 1}.date.${determineTemporalRelation(yearDifference2)})`;
                }else{
                    cond2 = `(c${index + 1}.date in c${index}.date.${determineTemporalRelation(yearDifference2)})`;
                }
                temporalConditions.push(
                    `(${cond1} or ${cond2})`
                );

                if (smaller) {
                    hbConditions.push(`(happensBefore[c${index}, c${index + 1}] or happensBefore[c${index + 1}, c${index}])`);
                } else {
                    hbConditions.push(`happensBefore[c${index}, c${index + 1}]`);
                }
            }else if (data[index].yearType == 'range' && data[index - 1].yearType == 'single') {
                const yearDifference1 = parseInt(data[index].startYear, 10) - parseInt(data[index - 1].year, 10);
                const yearDifference2 = parseInt(data[index].endYear, 10) - parseInt(data[index - 1].year, 10);
                let cond1 = `(c${index + 1}.date in c${index}.date.${determineTemporalRelation(yearDifference1)})`;
                let cond2 = `(c${index + 1}.date in c${index}.date.${determineTemporalRelation(yearDifference2)})`;
                
                temporalConditions.push(
                    `(${cond1} or ${cond2})`
                );

                hbConditions.push(`happensBefore[c${index}, c${index + 1}]`);
            }else if (data[index].yearType == 'range' && data[index - 1].yearType == 'range') {
                const yearDifference1 = parseInt(data[index].startYear, 10) - parseInt(data[index - 1].startYear, 10);
                const yearDifference2 = Math.abs(parseInt(data[index].endYear, 10) - parseInt(data[index - 1].endYear, 10));
                let cond1 = `(c${index + 1}.date in c${index}.date.${determineTemporalRelation(yearDifference1)})`;
                let cond2 = '';
                let smaller = false;
                if (parseInt(data[index].endYear, 10) < parseInt(data[index - 1].endYear, 10)) {
                    smaller = true;
                    cond2 = `(c${index}.date in c${index + 1}.date.${determineTemporalRelation(yearDifference2)})`;
                }else{
                    cond2 = `(c${index + 1}.date in c${index}.date.${determineTemporalRelation(yearDifference2)})`;
                }
                temporalConditions.push(
                    `(${cond1} or ${cond2})`
                );

                if (smaller) {
                    hbConditions.push(`(happensBefore[c${index}, c${index + 1}] or happensBefore[c${index + 1}, c${index}])`);
                } else {
                    hbConditions.push(`happensBefore[c${index}, c${index + 1}]`);
                }
            } else {
                hbConditions.push(`happensBefore[c${index}, c${index + 1}]`);
            }
        }
    });

    hbConditions.push(`happensBefore[c${data.length}, exp]`);
    
    data.forEach((data, i) => {
        if (data?.yearType == 'single') {
            expungementConditions.push(`exp.date in c${i + 1}.date.${determineTemporalRelation(currentYear - data.year)}`);
        }

        if (data?.yearType == 'range') {
            expungementConditions.push(`((exp.date in c${i + 1}.date.${determineTemporalRelation(currentYear - data.startYear)}) or (exp.date in c${i + 1}.date.${determineTemporalRelation(currentYear - data.endYear)}))`);
        }

        if (data?.question == 'expungeable') {
            questions.push(`c${i + 1} in exp.con`);
        }

        if (data?.question == 'unexpungeable') {
            questions.push(`not c${i + 1} in exp.con`);
        }
    });

    if(conditions.length > 0) alloyStringWithExpungement += conditions.join(" and \n") + " and \n";
    if(hbConditions.length > 0) alloyStringWithExpungement += hbConditions.join(" and \n");
    if(temporalConditions.length > 0) alloyStringWithExpungement += " and \n" + temporalConditions.join(" and \n");
    if(expungementConditions.length > 0) alloyStringWithExpungement += " and \n" + expungementConditions.join(" and \n");
    if(questions.length > 0) alloyStringWithExpungement += " and \n" + questions.join(" and \n");

    return alloyStringWithExpungement + "\n";
}

function determineTemporalRelation(yearDifference) {
    if (yearDifference < 3) {
        return "withinThree";
    } else if (yearDifference < 5) {
        return "withinFive";
    } else {
        return "beyondFive";
    }
}

export default generateAlloyPredicate;