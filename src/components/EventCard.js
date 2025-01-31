import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { useAppState } from "../store/AppStateContext";
import { Badge, Button, Modal } from "react-bootstrap";

// Define a set of distinct colors
const colors = [
    "#A7C7E7", // Soft Sky Blue
    "#E6B8A2", // Warm Sand Beige
    "#D6E4AA", // Light Olive Green
    "#FFD3B6", // Peach Beige
    "#CABBE9", // Lavender Mist
    "#B5E2B3", // Light Sage Green
    "#F0D9FF", // Pastel Lilac
    "#D3D3D3", // Cool Silver Gray
    "#C1D3FE", // Soft Periwinkle Blue
];
  

function EventCard({ event, years, onResize, row, action }) {
    const { id, startYear, endYear } = event;
    const [isResizing, setIsResizing] = useState(false);

    const [show, setShow] = useState(false);

    const { deleteScenario } = useAppState();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const startIndex = years.indexOf(startYear) + 2;
    const span = endYear - startYear + 1;

    // Assign a unique color based on the event's ID (or cycle through colors)
    const cardColor = colors[id % colors.length];

    const [{ isDragging }, dragRef] = useDrag({
        type: "event",
        item: { id, startYear, endYear },
        canDrag: () => !isResizing,
        collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        }),
    });

    const handleResize = (direction, e) => {
        e.stopPropagation();
        setIsResizing(true);
        const initialX = e.clientX;

        const onMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - initialX;
        const yearChange = Math.round(deltaX / 100);

        if (direction === "left") {
            const newStart = Math.max(startYear + yearChange, years[0]);
            if (newStart <= endYear) onResize(id, newStart, endYear);
        } else if (direction === "right") {
            const newEnd = Math.min(endYear + yearChange, years[years.length - 1]);
            if (newEnd >= startYear) onResize(id, startYear, newEnd);
        }
        };

        const onMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const editEvent = () => {
        handleClose();
        action(event);
    }

    const deleteEvent = () => {
        deleteScenario(event?.id);
        handleClose();
    }

    return (
        <>
            <div
                ref={dragRef}
                className={`event-card ${isDragging ? "dragging" : ""}`}
                style={{
                    gridColumn: `${startIndex} / span ${span}`,
                    gridRow: row,
                    backgroundColor: cardColor, // Set unique background color
                    opacity: isDragging || isResizing ? 0.8 : 1,
                    zIndex: isDragging || isResizing ? 3 : 1,
                }}
                onClick={handleShow} // Will not trigger when resizing
            >
                <div className="event-content">
                    <span>{event.name}</span>

                    {/* Left Resize Handle */}
                    <div
                        className="resize-handle left"
                        onMouseDown={(e) => {
                            e.stopPropagation(); // Prevent triggering onClick
                            handleResize("left", e);
                        }}
                    ></div>

                    {/* Right Resize Handle */}
                    <div
                        className="resize-handle right"
                        onMouseDown={(e) => {
                            e.stopPropagation(); // Prevent triggering onClick
                            handleResize("right", e);
                        }}
                    ></div>
                </div>
            </div>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{event?.name || "Event Details"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {event ? (
                        <div>
                            <p><strong>Type:</strong> {event.name || "Unspecified"}</p>
                            <p><strong>Year:</strong> 
                                {`From ${event.startYear} to ${event.endYear}`}
                            </p>
                            <p><strong>Expunged Before? :</strong> {event.alreadyExpunged ? "Yes" : "No"}</p>

                            {/* Display Conviction Attributes as Bootstrap Badges */}
                            {(event.assaultive || event.tenner || event.owi) && (
                                <div className="mb-3">
                                    <strong>Attributes: </strong>
                                    {event.assaultive && <Badge bg="danger" pill className="me-2">Assaultive</Badge>}
                                    {event.tenner && <Badge bg="warning" pill className="me-2">Ten-Year Felony</Badge>}
                                    {event.owi && <Badge bg="info" pill className="me-2">OWI</Badge>}
                                </div>
                            )}

                            <p><strong>Question:</strong> {event.question || "Not specified"}</p>
                        </div>
                    ) : (
                        <p>No event details available.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={editEvent}>
                        Edit
                    </Button>
                    <Button variant="danger" onClick={deleteEvent}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

        </>
    );
}

export default EventCard;
