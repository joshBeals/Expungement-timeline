/**
 * Joshua Alele-Beals
 * joshbeals22@gmail.com
 * github.com/joshBeals
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {

    const [showForm, setShowForm] = useState(false);
    
    const [scenarios, setScenarios] = useState(() => {
        const savedScenarios = localStorage.getItem('scenarios');
        return savedScenarios ? JSON.parse(savedScenarios) : [];
    });

    const [showResult, setShowResult] = useState(false);
    const [interpretation, setInterpretation] = useState('');

    useEffect(() => {
        localStorage.setItem('scenarios', JSON.stringify(scenarios));
    }, [scenarios]);


    const addScenario = (scenario) => {
        setScenarios([...scenarios, scenario]);
    };

    const deleteScenario = (index) => {
        const filteredRanges = scenarios.filter((_, idx) => idx !== index);
        setScenarios(filteredRanges);
    };

    // Value to be passed to consuming components
    const value = {
        showForm,
        setShowForm,
        scenarios,
        addScenario,
        deleteScenario,
        showResult,
        setShowResult,
        interpretation,
        setInterpretation,
    };

    return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => useContext(AppStateContext);
