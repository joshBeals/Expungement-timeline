/**
 * Joshua Alele-Beals
 * joshbeals22@gmail.com
 * github.com/joshBeals
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {

  const [showForm, setShowForm] = useState(false);

  // Value to be passed to consuming components
  const value = {
    showForm,
    setShowForm,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => useContext(AppStateContext);
