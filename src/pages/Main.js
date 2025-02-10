import React, { useState } from 'react';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Timeline from '../components/Timeline';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useAppState } from '../store/AppStateContext';
import ScenarioForm from '../components/ScenarioForm';
import generateAlloyPredicate from '../helpers/generateAlloy';
import Connections from '../components/Connections';

function Main() {
    const { showForm, setShowForm, allscenarios, connections } = useAppState();
    const [selectedScenario, setSelectedScenario] = useState(null);  // New state to track editing scenario

    const handleClose = () => {
        setShowForm(false);
        setSelectedScenario(null); // Reset scenario when closing
    };

    const handleShow = (scenario = null) => {
        console.log(scenario);
        setSelectedScenario(scenario);
        setShowForm(true);
    };

    const checkResult = () => {
        const sortedScenarios = allscenarios.sort((a, b) => {
            if (a.endYear === null) return 1;
            if (b.endYear === null) return -1;
            return a.startYear - b.startYear;
        });
        console.log(sortedScenarios);
        const result = generateAlloyPredicate(sortedScenarios, connections);
        console.log(result);
    }

    return (
        <DndProvider backend={HTML5Backend}>
            {/* Title Section */}
            <Alert variant="primary" className='m-3'>
                <Alert.Heading>Expungement Analyser</Alert.Heading>
                <p className='mt-3'>
                    Welcome to the Expungement Analyser. This interactive tool allows you to 
                    explore different conviction scenarios and determine their expungement eligibility. 
                    Add a conviction to the timeline, adjust its details, and analyze how the law 
                    applies in various situations.
                </p>
                <hr />
                <p className="mb-0">
                    <Button variant="primary" onClick={() => handleShow()}>
                        Add Conviction
                    </Button>

                    <Button variant="primary" onClick={checkResult}>
                        Check Result
                    </Button>
                </p>
            </Alert>

            {/* Timeline Section */}
            <Timeline onEditScenario={handleShow} /> {/* Pass the function to Timeline */}

            <Connections />

            {/* Offcanvas Section */}
            <Offcanvas show={showForm} onHide={handleClose} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{selectedScenario ? "Edit Conviction" : "Add Conviction"}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <ScenarioForm scenario={selectedScenario} />
                </Offcanvas.Body>  
            </Offcanvas>  
        </DndProvider>
    );
}

export default Main;
