import React from 'react';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Timeline from './components/Timeline';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Timeline />
    </DndProvider>
  );
}

export default App;
