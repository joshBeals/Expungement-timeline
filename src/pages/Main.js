import React, { useState } from 'react';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Timeline from '../components/Timeline';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useAppState } from '../store/AppStateContext';
import ScenarioForm from '../components/ScenarioForm';
import generateAlloyPredicate from '../helpers/generateAlloy';
import Connections from '../components/Connections';
import { useNavigate } from 'react-router-dom';

function Main() {
    const { showForm, setShowForm, allscenarios, connections, interpretation, setInterpretation } = useAppState();
    const [selectedScenario, setSelectedScenario] = useState(null);  // New state to track editing scenario
    const [showModal, setShowModal] = useState(false);

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

    const handleCheckResult = () => {
        setShowModal(true); // Show the modal when the button is clicked
    };

    const handleConfirm = () => {
        setShowModal(false);
        navigate("/result"); // Navigate after selection
    };

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

                    <Button variant="outline-primary" onClick={handleCheckResult}>
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

            {/* Modal for Interpretation Selection */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Select Interpretation Type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Choose an interpretation method:</Form.Label>
                            <Form.Select 
                                value={interpretation} 
                                onChange={(e) => setInterpretation(e.target.value)}
                            >
                                <option value="forward">Forward</option>
                                <option value="backward">Backward</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        Confirm & Proceed
                    </Button>
                </Modal.Footer>
            </Modal>
        </DndProvider>
    );
}

export default Main;
