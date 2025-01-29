import React, { useState } from "react";
import { useDrop } from "react-dnd";
import EventCard from "./EventCard";
import "../styles/Timeline.css";

function Timeline() {
  const years = Array.from({ length: 20 }, (_, i) => 2005 + i); // Years from 2005-2025
  const [events, setEvents] = useState([
    { id: 1, name: "Event 1", startYear: 2016, endYear: 2019 },
    { id: 2, name: "Event 2", startYear: 2021, endYear: 2021 },
    { id: 3, name: "Event 3", startYear: 2015, endYear: 2017 },
  ]);

  const handleCardResize = (id, newStart, newEnd) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, startYear: newStart, endYear: newEnd } : event
      )
    );
  };

  const handleCardMove = (id, newStartYear) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === id) {
          const duration = event.endYear - event.startYear; // Preserve event duration
          return {
            ...event,
            startYear: newStartYear,
            endYear: newStartYear + duration,
          };
        }
        return event;
      })
    );
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
      {/* <h2 className="text-center mb-5">Conviction History Timeline</h2> */}

      {/* Scrollable Wrapper */}
      <div className="timeline-scroll-container m-2">
        {/* Grid Container */}
        <div
          className="timeline-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `150px repeat(${years.length}, 100px)`, // First column for event titles
            gridTemplateRows: `50px repeat(${events.length}, 80px)`,
            width: `${150 + years.length * 100}px`,
          }}
          ref={dropRef} // Attach drop ref
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

          {/* Event Rows (Title + Event Bar) */}
          {events.map((event, index) => (
            <React.Fragment key={event.id}>
              {/* Row Title (Event Name) in the First Column */}
              <div
                className="grid-row-label"
                style={{
                  gridRow: index + 2, // Aligns with the correct row
                  gridColumn: "1", // Stays in the first column
                }}
              >
                {event.name}
              </div>

              {/* Event Card */}
              <EventCard
                event={event}
                years={years}
                onResize={handleCardResize}
                onMove={handleCardMove}
                row={index + 2}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Timeline;
