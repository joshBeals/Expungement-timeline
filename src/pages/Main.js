import React from 'react';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Timeline from '../components/Timeline';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useAppState } from '../store/AppStateContext';

function Main() {
    const { showForm, setShowForm } = useAppState();
  
    const handleClose = () => setShowForm(false);
    const handleShow = () => setShowForm(true);

    return (
        <DndProvider backend={HTML5Backend}>
            {/* Title Section */}
            <Alert variant="success" className='m-3'>
                <Alert.Heading>Expungement Sandbox</Alert.Heading>
                <p>
                Aww yeah, you successfully read this important alert message. This
                example text is going to run a bit longer so that you can see how
                spacing within an alert works with this kind of content.
                </p>
                <hr />
                <p className="mb-0">
                    <Button variant="primary" onClick={handleShow}>
                        Launch
                    </Button>
                </p>
            </Alert>

            {/* Timeline Section */}
            <Timeline />

            {/* Offcanvas Section */}
            <Offcanvas
                show={showForm}
                onHide={handleClose}
                placement="top"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Offcanvas</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    Some text as placeholder. In real life you can have the elements you
                    have chosen. Like, text, images, lists, etc.
                </Offcanvas.Body>
            </Offcanvas>
        
        </DndProvider>
    );
}

export default Main;
