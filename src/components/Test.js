import React, { useState } from 'react';
import Timeline from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';

const Test = () => {
  const [items, setItems] = useState([
    { id: 1, group: 1, title: 'Event 1', start_time: moment('2020-01-01'), end_time: moment('2021-01-01') },
    { id: 2, group: 2, title: 'Event 2', start_time: moment('2022-01-01'), end_time: moment('2023-01-01') },
  ]);

  const [groups] = useState([
    { id: 1, title: 'Group 1' },
    { id: 2, title: 'Group 2' },
  ]);

  const handleItemMove = (itemId, dragTime, newGroupOrder) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const duration = moment(item.end_time).diff(moment(item.start_time), 'years');
        return {
          ...item,
          start_time: moment(dragTime),
          end_time: moment(dragTime).add(duration, 'years'),
          group: newGroupOrder,
        };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handleItemResize = (itemId, time, edge) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        if (edge === 'left') {
          return { ...item, start_time: moment(time) };
        } else {
          return { ...item, end_time: moment(time) };
        }
      }
      return item;
    });
    setItems(updatedItems);
  };

  return (
    <div>
      <h1>Yearly Timeline</h1>
      <Timeline
        groups={groups}
        items={items}
        onItemMove={handleItemMove}
        onItemResize={handleItemResize}
        defaultTimeStart={moment('2018-01-01')}
        defaultTimeEnd={moment('2025-01-01')}
        timeSteps={{
          second: 0,
          minute: 0,
          hour: 0,
          day: 0,
          month: 0,
          year: 1, // Display only years
        }}
        itemRenderer={({ item, itemContext, getItemProps, getResizeProps }) => (
          <div
            {...getItemProps()}
            style={{
              ...itemContext.style,
              backgroundColor: '#007bff',
              color: '#fff',
              borderRadius: '4px',
              textAlign: 'center',
              padding: '5px',
            }}
          >
            {item.title}
            <div {...getResizeProps('left')} />
            <div {...getResizeProps('right')} />
          </div>
        )}
      />
    </div>
  );
};

export default Test;
