import React, { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import EventCard from "./EventCard";
import "../styles/Timeline.css";
import { useAppState } from "../store/AppStateContext";
import { Button } from "react-bootstrap";
import LineTo, { SteppedLineTo } from "react-lineto";

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
        return a.endYear - b.endYear; // Sort by ascending endYear
      });
  
      setEvents(mappedEvents);
    }
  }, [allscenarios]); // Updates when allscenarios changes

  /** ✅ Handle clicking on an event to create a connection */
  const handleEventClick = (event) => {
    console.log("🖱 Event Clicked:", event); // ✅ Debugging Log

    if (!selectedEvent) {
        setSelectedEvent(event); // First event selected
        console.log("✅ Selected Event:", event.id);
    } else {
        if (selectedEvent.id !== event.id) {
            console.log("🔗 Creating connection:", selectedEvent.id, "→", event.id);
            addConnection(selectedEvent.id, event.id); // ✅ Attempt to add connection
        }
        setSelectedEvent(null); // Reset selection
    }
  };
  

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
                style={{ gridRow: index + 2, gridColumn: "1" }}
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

        {connections.map(({ fromId, toId }, index) => (
              <LineTo
                  key={index}
                  from={`label-${fromId}`}
                  to={`label-${toId}`}
                  borderColor="black"
                  borderWidth={2}
                  borderStyle="solid"
                  path="arc"
                  delay={0}
              />
          ))}
      </div>
    </div>
  );
}

export default Timeline;
