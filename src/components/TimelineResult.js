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
import EventCardResult from "./EventCardResult";
import sortByConnections from "../helpers/sortByConnections";
import mergeAndCalculateYears from "../helpers/mergeAndCalculateYears";

function TimelineResult({ result }) {
    const years = Array.from({ length: 20 }, (_, i) => 2005 + i); // Years from 2005-2025
    const { allscenarios, connections } = useAppState(); // Get allscenarios, addScenario and editScenario
    const [selectedEvent, setSelectedEvent] = useState(null); 

    // Initialize events from allscenarios
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (allscenarios && allscenarios.length > 0) {

            const mergedArray = mergeAndCalculateYears(result, allscenarios);
            console.log("test", mergedArray);
        
            setEvents(mergedArray);
        }
    }, [allscenarios, result]);

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
                        >
                            <div>{event.name}</div>
                            <code>#{event.id}</code>
                        </div>

                        <EventCardResult
                            event={event}
                            years={years}
                            row={index + 2}
                            mode="default"
                        />

                        <EventCardResult
                            event={event}
                            years={years}
                            row={index + 2}
                            mode="not"
                        />
                        
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TimelineResult;
