import React, { useState } from "react";
import { useDrag } from "react-dnd";

// Define a set of distinct colors
const colors = [
    "#A7C7E7", // Soft Sky Blue
    "#E6B8A2", // Warm Sand Beige
    "#CABBE9", // Lavender Mist
    "#B5E2B3", // Light Sage Green
    "#F0D9FF", // Pastel Lilac
    "#D3D3D3", // Cool Silver Gray
    "#C1D3FE", // Soft Periwinkle Blue
    "#D6E4AA", // Light Olive Green
    "#FFD3B6", // Peach Beige
];
  

function EventCard({ event, years, onResize, row }) {
  const { id, startYear, endYear } = event;
  const [isResizing, setIsResizing] = useState(false);

  const startIndex = years.indexOf(startYear) + 2;
  const span = endYear - startYear + 1;

  // Assign a unique color based on the event's ID (or cycle through colors)
  const cardColor = colors[id % colors.length - 1];

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

  return (
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
    >
      <div className="event-content">
        <span>{event.name}</span>
        <div
          className="resize-handle left"
          onMouseDown={(e) => handleResize("left", e)}
        ></div>
        <div
          className="resize-handle right"
          onMouseDown={(e) => handleResize("right", e)}
        ></div>
      </div>
    </div>
  );
}

export default EventCard;
