import React, { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import EventCard from "./EventCard";
import "../styles/Timeline.css";
import { useAppState } from "../store/AppStateContext";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import { Button } from "react-bootstrap";
import LineTo, { SteppedLineTo } from "react-lineto";
import determineTemporalRelation from "../helpers/determineTemporalRelation";
import determineYearType from "../helpers/determineYearType";

function Timeline({ onEditScenario }) {
  const years = Array.from({ length: 20 }, (_, i) => 2005 + i); // Years from 2005-2025
  const { allscenarios, addScenario, editScenario, connections, addConnection } = useAppState(); // Get allscenarios, addScenario and editScenario
  const [selectedEvent, setSelectedEvent] = useState(null); 

  // Initialize events from allscenarios
  const [events, setEvents] = useState([]);

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
    console.log("🖱 Event Clicked:", event); // ✅ Debugging Log

    if (!selectedEvent) {
        setSelectedEvent(event); // First event selected
        console.log("✅ Selected Event:", event.id);
        showMessage(`Selected #${event.id}`, "info");
    } else {
        if (selectedEvent.id !== event.id) {
            const selectedYearType = determineYearType(selectedEvent.startYear, selectedEvent.endYear);
            const eventYearType = determineYearType(event.startYear, event.endYear);

            // 🔍 Check if connection already exists
            const connectionExists = connections.some(
                (conn) => (conn.fromId === (selectedEvent.id) && conn.toId === event.id) || (conn.fromId === (event.id) && conn.toId === selectedEvent.id)
            );

            if (connectionExists) {
                console.log("⚠️ Connection Already Exists:", selectedEvent.id, "→", event.id);
                showMessage("Connection Already Exists", "warning");
            } else {
                // 🔍 Check if connection is valid
                const isValidConnection =
                    selectedYearType === "unspecified" ||
                    eventYearType === "unspecified" ||
                    (selectedYearType === "range" && eventYearType === "range" && doRangesOverlap(selectedEvent, event)) ||
                    (selectedYearType === "single" && eventYearType === "single" && selectedEvent.startYear <= event.startYear);

                if (isValidConnection) {
                  console.log("🔗 Creating connection:", selectedEvent.id, "→", event.id);
                  showMessage("Created connection!", "success");
                  addConnection(selectedEvent.id, event.id); // ✅ Add valid connection
                } else {
                  if (selectedYearType === "range" && eventYearType === "range" && !doRangesOverlap(selectedEvent, event)) {
                    console.log("⚠️ Order already implicitely defined:", selectedEvent.id, "→", event.id, );
                    showMessage("Order already implicitely defined", "error");
                  } else {
                    console.log("❌ Invalid Connection:", selectedEvent.id, "→", event.id, " (Cannot happen before)");
                    showMessage("Invalid Connection", "error");
                  }
                }
            }
        }
        setSelectedEvent(null); // Reset selection
    }
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
                className={`label-${event.id} grid-row-label`}
                style={{ gridRow: index + 2, gridColumn: "1", cursor: "pointer" }}
                onClick={() => handleEventClick(event)}
              >
                <div>{event.name}</div>
                <code>#{event.id}</code>
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
    </div>
  );
}

export default Timeline;
