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

    // Value to be passed to consuming components
    const value = {
        showForm,
        setShowForm,
        allscenarios,
        addScenario,
        editScenario, // Replaces `addScenario`
        deleteScenario,
        showResult,
        setShowResult,
        interpretation,
        setInterpretation,
    };

    return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => useContext(AppStateContext);
