import React, { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import EventCard from "./EventCard";
import "../styles/Timeline.css";
import { useAppState } from "../store/AppStateContext";
import { Button } from "react-bootstrap";

function Timeline({ onEditScenario }) {
  const years = Array.from({ length: 20 }, (_, i) => 2005 + i); // Years from 2005-2025
  const { allscenarios, addScenario, editScenario } = useAppState(); // Get allscenarios, addScenario and editScenario

  // Initialize events from allscenarios
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (allscenarios && allscenarios.length > 0) {
      const mappedEvents = allscenarios.map((scenario, index) => {

        return {
          id: scenario.id ?? index,
          name: scenario.type || `Conviction`,
          startYear: parseInt(scenario.startYear) || 2005,
          endYear: parseInt(scenario.endYear) || 2005,
        };
      });

      setEvents(mappedEvents);
    }
  }, [allscenarios]); // Updates when allscenarios changes

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
              <div className="grid-row-label" style={{ gridRow: index + 2, gridColumn: "1" }}>
                <div>{event.name}</div>
                {/* <div className="btnGroup">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className=""
                    onClick={() => onEditScenario(event)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className=""
                    onClick={() => onEditScenario(event)}
                  >
                    Edit
                  </Button>
                </div> */}
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
