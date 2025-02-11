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
import { useNavigate } from 'react-router-dom';

function Main() {
    const { showForm, setShowForm, allscenarios, connections } = useAppState();
    const [selectedScenario, setSelectedScenario] = useState(null);  // New state to track editing scenario

    const navigate = useNavigate();

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
        navigate("/result");
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
                <div className="d-flex justify-content-between w-100">
                    <Button variant="outline-primary" onClick={() => handleShow()}>
                        Add Conviction
                    </Button>

                    <Button variant="outline-primary" onClick={checkResult}>
                        Check Result
                    </Button>
                </div>
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
