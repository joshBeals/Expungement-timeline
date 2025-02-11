import React from 'react';
import "./styles/App.css";
import Main from './pages/Main';
import Result from './pages/Result';
import { Route, BrowserRouter, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter >
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/result" element={<Result />} />
        <Route path="*" element={<Main />} />
      </Routes>
    </BrowserRouter >
  );
}

export default App;
