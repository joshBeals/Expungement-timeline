/**
 * Joshua Alele-Beals
 * joshbeals22@gmail.com
 * github.com/joshBeals
 */
import React, { createContext, useContext, useEffect, useState } from 'react';

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
    const [showForm, setShowForm] = useState(false);

    /** ✅ Load scenarios from `localStorage`, default to `[]` */
    const [allscenarios, setAllScenarios] = useState(() => {
        const savedScenarios = localStorage.getItem('allscenarios');
        return savedScenarios ? JSON.parse(savedScenarios) : [];
    });

    /** ✅ Load connections from `localStorage`, default to `[]` */
    const [connections, setConnections] = useState(() => {
        const savedConnections = localStorage.getItem('connections');
        return savedConnections ? JSON.parse(savedConnections) : [];
    });

    const [showResult, setShowResult] = useState(false);
    const [interpretation, setInterpretation] = useState('');

    /** ✅ Save scenarios and connections to `localStorage` */
    useEffect(() => {
        localStorage.setItem('allscenarios', JSON.stringify(allscenarios));
    }, [allscenarios]);

    useEffect(() => {
        localStorage.setItem('connections', JSON.stringify(connections));
    }, [connections]);

    /** ✅ `addScenario` appends a new scenario */
    const addScenario = (scenario) => {
        setAllScenarios([...allscenarios, scenario]);
    };

    /** ✅ `editScenario` updates an existing scenario */
    const editScenario = (updatedScenario) => {
        setAllScenarios((prevScenarios) =>
            prevScenarios.map((scenario) =>
                scenario.id === updatedScenario.id ? updatedScenario : scenario
            )
        );
    };

    /** ✅ `deleteScenario` removes a scenario and its connections */
    const deleteScenario = (id) => {
        setAllScenarios((prevScenarios) => prevScenarios.filter((scenario) => scenario.id !== id));

        // ✅ Remove all connections related to the deleted scenario
        setConnections((prevConnections) =>
            prevConnections.filter((c) => c.fromId !== id && c.toId !== id)
        );
    };

    /** ✅ Function to add a connection (avoids duplicates) */
    const addConnection = (fromId, toId) => {
        setConnections((prev) => {
            // Prevent duplicate connections
            if (!prev.some((c) => c.fromId === fromId && c.toId === toId)) {
                const newConnections = [...prev, { fromId, toId }];
                console.log("📌 New Connection Added:", newConnections); // ✅ Debugging Log
                return newConnections;
            }
            return prev; // No duplicate additions
        });
    };

    /** ✅ Function to remove a specific connection */
    const removeConnection = (fromId, toId) => {
        setConnections((prev) => prev.filter((c) => !(c.fromId === fromId && c.toId === toId)));
    };

    // Value to be passed to consuming components
    const value = {
        showForm,
        setShowForm,
        allscenarios,
        addScenario,
        editScenario,
        deleteScenario,
        showResult,
        setShowResult,
        interpretation,
        setInterpretation,
        connections,
        addConnection,
        removeConnection,
    };

    return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => useContext(AppStateContext);
