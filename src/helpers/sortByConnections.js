function sortByConnections(scenarioData, connections) {
    // Step 1: Convert scenarioData into a Map for quick lookup
    const scenarioMap = new Map(scenarioData.map(s => [s.id, s]));

    // Step 2: Build adjacency list (dependency graph) & inDegree map
    const adjacencyList = new Map();
    const inDegree = new Map();

    // Initialize adjacency list and inDegree for all scenarios
    scenarioData.forEach(s => {
        adjacencyList.set(s.id, []);
        inDegree.set(s.id, 0);
    });

    // Populate graph based on connections
    connections.forEach(({ fromId, toId }) => {
        if (adjacencyList.has(fromId) && adjacencyList.has(toId)) {
            adjacencyList.get(fromId).push(toId);
            inDegree.set(toId, (inDegree.get(toId) || 0) + 1);
        }
    });

    // Step 3: Perform Topological Sort using Kahn’s Algorithm
    let sortedIds = [];
    let queue = [];

    // Add nodes with inDegree 0 (no dependencies) to queue
    inDegree.forEach((count, id) => {
        if (count === 0) queue.push(id);
    });

    while (queue.length > 0) {
        let current = queue.shift();
        sortedIds.push(current);

        // Reduce in-degree of neighbors and add to queue if zero
        adjacencyList.get(current).forEach(neighbor => {
            inDegree.set(neighbor, inDegree.get(neighbor) - 1);
            if (inDegree.get(neighbor) === 0) queue.push(neighbor);
        });
    }

    // Step 4: Ensure all IDs from `scenarioData` are included
    let remainingIds = scenarioData.map(s => s.id).filter(id => !sortedIds.includes(id));
    sortedIds.push(...remainingIds); // Append remaining elements in their original order

    // Step 5: Reorder `scenarioData` based on sorted order
    return sortedIds.map(id => scenarioMap.get(id));
}

export default sortByConnections;