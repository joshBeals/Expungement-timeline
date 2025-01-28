import React from "react";
import { useDrag } from "react-dnd";

function EventCard({ event, years, onResize, row }) {
  const { id, startYear, endYear } = event;

  const [{ isDragging }, dragRef] = useDrag({
    type: "event",
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Calculate grid positions
  const startIndex = years.indexOf(startYear) + 2; // +2 to account for row label column
  const span = endYear - startYear + 1;

  const handleResizeLeft = () => {
    if (startYear > years[0]) onResize(id, startYear - 1, endYear);
  };

  const handleResizeRight = () => {
    if (endYear < years[years.length - 1]) onResize(id, startYear, endYear + 1);
  };

  return (
    <div
      ref={dragRef}
      className={`event-card ${isDragging ? "dragging" : ""}`}
      style={{
        gridColumn: `${startIndex} / span ${span}`, // Span columns
        gridRow: row, // Assign event to its specific row
      }}
    >
      <div className="event-content">
        <button
          className="btn btn-primary btn-sm w-100"
          onClick={() => alert(`Clicked on Event ID: ${id}`)}
        >
          Event
        </button>
        <div
          className="resize-handle left"
          onClick={handleResizeLeft}
        ></div>
        <div
          className="resize-handle right"
          onClick={handleResizeRight}
        ></div>
      </div>
    </div>
  );
}

export default EventCard;
