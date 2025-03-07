function mergeAndCalculateYears(eventData, scenarioData) {
    // Sort eventData by Date key (ensuring it's in order)
    let sortedEvents = eventData
        .sort((a, b) => parseInt(a.date.replace(/d|\$0/g, "")) - parseInt(b.date.replace(/d|\$0/g, "")))
        .reverse(); // Start from the last event

    let calculatedYears = [];

    // Step 1: Work backwards and assign single-year values
    sortedEvents.forEach((event, index) => {
        let eventDate = parseInt(event.date.replace(/d|\$0/g, ""));

        // Store calculated year and move to the next one
        calculatedYears.unshift({ 
            id: event.id, 
            year: eventDate, 
            eventType: event.event, // ✅ Replace scenario.type with this
            originalStartYear: null, // Placeholder
            originalEndYear: null, // Placeholder
            ...event // Preserve all fields
        });
    });

    // Step 2: Merge with scenarioData (one-to-one match)
    let mergedData = calculatedYears.map((calculatedEvent, index) => {
        let scenario = scenarioData[calculatedEvent.id.split('c')[1] - 1] || {}; // Get matching calculated year

        return {
            ...scenario,
            expunged: calculatedEvent.expunged,
            name: calculatedEvent.eventType.split('$')[0] || scenario.type, // ✅ Replace scenario.type
            startYear: calculatedEvent.year, // ✅ Use extracted year
            endYear: calculatedEvent.year, // ✅ Use extracted year
            originalStartYear: parseInt(scenario.startYear) || 2005, // Keep original for reference
            originalEndYear: parseInt(scenario.endYear), // Keep original for reference
            violations: calculatedEvent.violations,
        };
    });

    return mergedData;
}

export default mergeAndCalculateYears;