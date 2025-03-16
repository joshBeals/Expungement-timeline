import React, { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import EventCard from "./EventCard";
import "../styles/Timeline.css";
import { useAppState } from "../store/AppStateContext";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import LineTo, { SteppedLineTo } from "react-lineto";
import determineTemporalRelation from "../helpers/determineTemporalRelation";
import determineYearType from "../helpers/determineYearType";

function Timeline({ onEditScenario }) {
  const years = Array.from({ length: 20 }, (_, i) => 2005 + i); // Years from 2005-2025
  const { allscenarios, addScenario, editScenario, connections, addConnection, removeConnection } = useAppState(); // Get allscenarios, addScenario and editScenario
  const [selectedEvent, setSelectedEvent] = useState(null); 

  // Initialize events from allscenarios
  const [events, setEvents] = useState([]);

  // 🚀 Modal State for Conflict Handling
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    if (allscenarios && allscenarios.length > 0) {
      const mappedEvents = allscenarios.map((scenario, index) => ({
        id: scenario.id ?? index,
        name: scenario.type || `Conviction`,
        startYear: parseInt(scenario.startYear) || 2005,
        endYear: parseInt(scenario.endYear),
        assaultive: scenario?.assaultive,
        tenner: scenario?.tenner,
        owi: scenario?.owi,
        alreadyExpunged: scenario?.alreadyExpunged,
        question: scenario?.question
      }));
  
      // ✅ Sorting logic:
      // 1. If both scenarios have `endYear`, sort by ascending endYear
      // 2. If `endYear` is missing, move the scenario to the bottom
      mappedEvents.sort((a, b) => {
        if (a.endYear === null) return 1;  // Move a to the bottom
        if (b.endYear === null) return -1; // Move b to the bottom
        return a.startYear - b.startYear; // Sort by ascending endYear
      });
  
      setEvents(mappedEvents);
    }
  }, [allscenarios]); // Updates when allscenarios changes

  useEffect(() => {
    if (events.length > 0) {
      revalidateConnections();
    }
  }, [events]); // Runs every time `events` change


  const showMessage = (message, type) => {
    let config = {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    };

    if (type == "info") {
      toast.info(message, config);
    }

    if (type == "warning") {
      toast.warn(message, config);
    }

    if (type == "success") {
      toast.success(message, config);
    }

    if (type == "error") {
      toast.error(message, config);
    }

  }

  /** ✅ Handle clicking on an event to create a connection */
  const handleEventClick = (event) => {
    console.log("🖱 Event Clicked:", event);

    if (!selectedEvent) {
        setSelectedEvent(event);
        showMessage(`Selected #${event.id}`, "info");
    } else {
        if (selectedEvent.id !== event.id) {
            const selectedStart = selectedEvent.startYear;
            const otherStart = event.startYear;

            // 🚨 Conflict: The selected event starts earlier than the other event
            if (selectedStart > otherStart) {
                setModalData({ eventToAdjust: event, newStartYear: selectedStart, endYear: event.endYear, selectedEventId: selectedEvent.id });
                setShowModal(true);
                return; // Stop execution until the user confirms
            }

            // If no adjustment is needed, create the connection immediately
            createConnection(selectedEvent.id, event.id);
        }
        setSelectedEvent(null);
    }
  };

  const createConnection = (fromId, toId) => {
    const connectionExists = connections.some(
        (conn) => (conn.fromId === fromId && conn.toId === toId) || 
                  (conn.fromId === toId && conn.toId === fromId)
    );

    if (connectionExists) {
        showMessage("Connection Already Exists", "warning");
        return false;  // Connection was NOT added
    } else {
        addConnection(fromId, toId);
        showMessage("Created connection!", "success");
        return true;  // Connection was successfully added
    }
  };

  const handleConfirmAdjustment = () => {
    if (modalData) {
        // ✅ Attempt to create the connection first
        const connectionAdded = createConnection(modalData.selectedEventId, modalData.eventToAdjust.id);

        // ✅ Only adjust the event start year if the connection was successfully added
        if (connectionAdded) {
            handleCardResize(modalData.eventToAdjust.id, modalData.newStartYear, modalData.endYear);
            showMessage(`Adjusted start year to ${modalData.newStartYear}`, "success");
        }
    }
    setShowModal(false);
  };

  const handleCancelAdjustment = () => {
      setShowModal(false);
      showMessage("Connection cancelled due to conflicting dates", "error");
  };

  /**
   * 🔍 Determines if two ranges overlap.
   * Two date ranges [startA, endA] and [startB, endB] overlap if:
   *   - startA <= endB AND startB <= endA
   */
  function doRangesOverlap(eventA, eventB) {
    return eventA.startYear <= eventB.endYear && eventB.startYear <= eventA.endYear;
  }


  /** Update `allscenarios` when resizing an event */
  const handleCardResize = (id, newStart, newEnd) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, startYear: newStart, endYear: newEnd } : event
      )
    );

    // Find the scenario and update it
    const updatedScenario = allscenarios.find((scenario) => scenario.id === id);
    if (updatedScenario) {
      editScenario({
        ...updatedScenario,
        yearType: determineYearType(newStart.toString(), newEnd.toString()),
        startYear: newStart.toString(),
        endYear: newEnd.toString(),
      });
    }
  };

  /** Update `allscenarios` when moving an event */
  const handleCardMove = (id, newStartYear) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === id) {
          const duration = event.endYear - event.startYear;
          return {
            ...event,
            yearType: determineYearType(newStartYear, newStartYear + duration),
            startYear: newStartYear,
            endYear: newStartYear + duration,
          };
        }
        return event;
      })
    );

    // Find the scenario and update it
    const updatedScenario = allscenarios.find((scenario) => scenario.id === id);
    if (updatedScenario) {
      editScenario({
        ...updatedScenario,
        startYear: newStartYear.toString(),
        endYear: (newStartYear + (updatedScenario.endYear - updatedScenario.startYear)).toString(),
      });
    }
  };

  const [{ isOver }, dropRef] = useDrop({
    accept: "event",
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      const yearChange = Math.round(delta.x / 100);
      const newStartYear = Math.max(
        Math.min(item.startYear + yearChange, years[years.length - 1]),
        years[0]
      );
      handleCardMove(item.id, newStartYear);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const revalidateConnections = () => {
    const invalidConnections = connections.filter(({ fromId, toId }) => {
        const fromEvent = events.find(e => e.id === fromId);
        const toEvent = events.find(e => e.id === toId);

        if (!fromEvent || !toEvent) return true; // If an event is missing, the connection is invalid

        const fromYearType = determineYearType(fromEvent.startYear, fromEvent.endYear);
        const toYearType = determineYearType(toEvent.startYear, toEvent.endYear);

        // 🔍 Check if the connection is **invalid**
        return !(
            fromYearType === "unspecified" ||
            toYearType === "unspecified" ||
            (fromYearType === "range" && toYearType === "range" && doRangesOverlap(fromEvent, toEvent)) ||
            (fromYearType === "single" && toYearType === "single" && fromEvent.startYear <= toEvent.startYear)
        );
    });

    // 🔥 Remove invalid connections & show warnings
    if (invalidConnections.length > 0) {
        invalidConnections.forEach(({ fromId, toId }) => removeConnection(fromId, toId)); // ✅ Remove only invalid connections
        showMessage("Some connections were removed due to invalid changes", "warning");
    }
  };


  return (
    <div className="container-fluid">
      <ToastContainer />
      <div className="timeline-scroll-container m-2">
        <div
          className="timeline-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `150px repeat(${years.length}, 100px)`,
            gridTemplateRows: `50px repeat(${events.length}, 80px)`,
            width: `${150 + years.length * 100}px`,
          }}
          ref={dropRef}
        >
          {/* Timeline Header Row */}
          <div className="grid-header" style={{ gridColumn: `1 / span ${years.length + 1}` }}>
            <div className="grid-row-label"></div>
            {years.map((year) => (
              <div key={year} className="grid-column-header">
                {year}
              </div>
            ))}
          </div>

          {/* Event Rows */}
          {events.map((event, index) => (
            <React.Fragment key={event.id}>
                <div
                  className="grid-row-label"
                  style={{ gridRow: index + 2, gridColumn: "1", cursor: "pointer" }}
                  onClick={() => handleEventClick(event)}
                >
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-${event.id}`}>
                        {selectedEvent ? "Click to complete the connection." : "Click to start a connection."}
                      </Tooltip>
                    }
                  >
                    <span>
                      <div>{event.name}</div>
                      <code>#{event.id}</code>
                    </span>
                  </OverlayTrigger>
                </div>


              <EventCard
                event={event}
                years={years}
                onResize={handleCardResize}
                onMove={handleCardMove}
                row={index + 2}
                action={onEditScenario}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      <Modal show={showModal} onHide={handleCancelAdjustment} >
        <Modal.Header closeButton>
            <Modal.Title>Adjust Event Start Year?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>
                The selected event starts earlier than this event. To maintain a valid order,
                the start year of this event should be adjusted to {modalData?.newStartYear}.
                <br /><br />
                Would you like to automatically adjust the start year?
            </p>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleCancelAdjustment}>
                Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmAdjustment}>
                Yes, Adjust
            </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default Timeline;
