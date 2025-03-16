import React, { useEffect, useState } from "react";
import { Badge, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

// Define a set of distinct colors
const colors = {
    "conviction": "#398fa9",
    "felony": "#E0A899",
    "misdemeanor": "#7276b3",
};

function EventCardResult({ event, years, row, mode }) {

    const [startIndex, setStartIndex] = useState(0);
    const [span, setSpan] = useState(1);
    const [cardColor, setCardColor] = useState("#d4d7e3");
    const [show, setShow] = useState(false);
    const [modalData, setModalData] = useState([]);
  
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        let calculatedStartIndex = 2;
        let calculatedSpan = 1;
        let calculatedCardColor = "#d4d7e3";

        if (mode === "default") {
            calculatedStartIndex = years.indexOf(event?.originalStartYear) + 2;
            calculatedSpan = event?.originalEndYear - event?.originalStartYear + 1;
            calculatedCardColor = event?.originalEndYear ? colors[event?.type?.toLowerCase()]: "#d4d7e3";
        } else {
            calculatedStartIndex = years.indexOf(event?.startYear) + 2;
            calculatedSpan = event?.endYear - event?.startYear + 1;
            calculatedCardColor = event?.endYear ? colors[event?.name?.toLowerCase()]: "#d4d7e3";
        }

        setStartIndex(calculatedStartIndex);
        setSpan(calculatedSpan);
        setCardColor(calculatedCardColor);
    }, [event, mode, years]);

    const updateModal = (data) => {
        console.log(data);
        setModalData(data);
        handleShow();
    }
    
    const getReason = (violation) => {
        if (violation == "sec1_1bViolations") {
            return "No more than two assaultive felony convictions are eligible for expungement. This violation indicates that you have exceeded the allowable number of assaultive felony convictions for expungement under the law.";
        }
        
        if (violation == "sec1_1cViolations") {
            return "Only one felony with a 10-year waiting period is eligible for expungement. This violation suggests that you have attempted to expunge more than one such felony, which exceeds the permissible limit.";
        }
        
        if (violation == "sec1d_2Violations") {
            return "Only one Operating While Intoxicated (OWI) conviction is eligible for expungement. This violation indicates that you have more than one OWI conviction, surpassing the limit set by the law for expungement.";
        }
        

        if (violation == "sec1dTimingViolations") {
            return "A new conviction or expungement event occurred within the required waiting period. For misdemeanors, the mandatory waiting period is 3 years, while for felonies, it is 5 years. This timing violation indicates that the time elapsed between the convictions was insufficient to meet the legal expungement criteria.";
        }
        

        if (violation == "backwardWaitingViolations") {
            return "This expungement attempt violates the backward waiting period rule. A prior conviction occurred within the mandatory waiting period of this conviction, making it ineligible for expungement at this time. The required time gap between the conviction and any previous convictions must be observed to proceed with expungement. (3 years for Misdemeanors and 5 years for Felonies).";
        }
        
        if (violation == "forwardWaitingViolations") {
            return "This conviction violates the forward waiting period rule. A subsequent conviction occurred within the mandatory waiting period following this conviction. To qualify for expungement, no new convictions should occur within the specified waiting period after this conviction. (3 years for Misdemeanors and 5 years for Felonies).";
        }
        
    }
    
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            Click to view violations
        </Tooltip>
    );

    return (
        <>
            <div
                className={`event-card p-2 rounded ${
                    mode !== "default" 
                        ? event?.expunged 
                            ? "border-3 border-success"  // Green border for expunged events
                            : "border-3 border-danger"   // Red border for non-expunged events
                        : ""  // No border when mode is "default"
                }`}
                style={{
                    gridColumn: `${startIndex} / span ${span}`,
                    gridRow: row,
                    color: "white",
                    backgroundColor: cardColor,
                    opacity: mode === "default" ? 0.3 : 1,
                    zIndex: mode === "default" ? 1 : 10,
                }}
            >
                <div className="event-content">
                    {mode !== "default" && !event?.expunged ? (
                        <OverlayTrigger placement="top" overlay={renderTooltip}>
                            <span onClick={() => updateModal(event?.violations)} style={{ cursor: "pointer" }}>
                                <i className="bi bi-x-circle-fill" style={{ fontSize: "24px" }}></i>
                            </span>
                        </OverlayTrigger>
                    ) : (
                        <span>
                            {mode === "default" ? (
                                event?.type
                            ) : event?.expunged ? (
                                <i className="bi bi-check-circle-fill" style={{ fontSize: "24px" }}></i>
                            ) : (
                                <i className="bi bi-x-circle-fill" style={{ fontSize: "24px" }}></i>
                            )}
                        </span>
                    )}
                </div>
            </div>


            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Violation Reasons</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {Array.isArray(modalData) && modalData.length > 0 ? (
                        <ul>
                            {modalData.map((violation, idx) => (
                                <li key={idx}><span className="fw-bold">{violation.slice(0, -1)}:</span> {getReason(violation)}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No violations found.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default EventCardResult;
