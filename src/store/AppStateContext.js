/**
 * Joshua Alele-Beals
 * joshbeals22@gmail.com
 * github.com/joshBeals
 */
import React, { createContext, useContext, useEffect, useState } from 'react';

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {

    const [showForm, setShowForm] = useState(false);
    
    const [allscenarios, setAllScenarios] = useState(() => {
        const savedScenarios = localStorage.getItem('allscenarios');
        return savedScenarios ? JSON.parse(savedScenarios) : [];
    });

    const [showResult, setShowResult] = useState(false);
    const [interpretation, setInterpretation] = useState('');

    const [connections, setConnections] = useState([]);

    useEffect(() => {
        localStorage.setItem('allscenarios', JSON.stringify(allscenarios));
    }, [allscenarios]);

    /** ✅ `addScenario` updates an existing scenario instead of adding a new one */
    const addScenario = (scenario) => {
        setAllScenarios([...allscenarios, scenario]);
    };

    /** ✅ `editScenario` updates an existing scenario instead of adding a new one */
    const editScenario = (updatedScenario) => {
        setAllScenarios((prevScenarios) =>
            prevScenarios.map((scenario) =>
                scenario.id === updatedScenario.id ? updatedScenario : scenario
            )
        );
    };

    /** ✅ `deleteScenario` removes a scenario by its unique `id` */
    const deleteScenario = (id) => {
        setAllScenarios((prevScenarios) => prevScenarios.filter((scenario) => scenario.id !== id));
    };

    /** ✅ Function to add a connection */
    const addConnection = (fromId, toId) => {
        setConnections((prev) => {
            const newConnections = [...prev, { fromId, toId }];
            console.log("📌 New Connection Added:", newConnections); // ✅ Debugging Log
            return newConnections;
        });
    };
    

    /** ✅ Function to remove a connection */
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
