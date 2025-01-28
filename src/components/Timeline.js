import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import EventCard from "./EventCard";
import "../styles/Timeline.css";

function Timeline() {
  const years = Array.from({ length: 20 }, (_, i) => 2015 + i); // Expand years from 2015-2034
  const [events, setEvents] = useState([
    { id: 1, name: "Event 1", startYear: 2016, endYear: 2019 },
    { id: 2, name: "Event 2", startYear: 2021, endYear: 2021 },
    { id: 3, name: "Event 3", startYear: 2015, endYear: 2017 },
  ]);

  // Handle resizing or updating event duration
  const handleCardResize = (id, newStart, newEnd) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, startYear: newStart, endYear: newEnd } : event
      )
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mt-5">
        <h2 className="text-center">Timeline Table</h2>

        {/* Scrollable Wrapper */}
        <div
          className="timeline-scroll-container"
          style={{
            overflowX: "auto", // Enable horizontal scrolling
          }}
        >
          {/* Grid Container for the Timeline */}
          <div
            className="timeline-grid"
            style={{
              gridTemplateColumns: `150px repeat(${years.length}, 100px)`, // Adjust grid columns dynamically
              gridTemplateRows: `50px repeat(${events.length}, 50px)`, // Adjust rows dynamically
              width: `${150 + years.length * 100}px`, // Dynamic width based on years
            }}
          >
            {/* Timeline Header */}
            <div className="grid-header" style={{ gridColumn: `1 / span ${years.length + 1}` }}>
              <div className="grid-row-label">Events</div>
              {years.map((year) => (
                <div key={year} className="grid-column-header">
                  {year}
                </div>
              ))}
            </div>

            {/* Event Rows */}
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                years={years}
                onResize={handleCardResize}
                row={index + 2} // Assign gridRow dynamically
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default Timeline;