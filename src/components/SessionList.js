/* eslint-disable react/prop-types */
import React from 'react';

function SessionList(props) {
  const { sessions } = props;
  // const sessionDate = new Date(sessions.date).toLocaleDateString();
  // console.log(sessionDate);
  return (
    <div className="exercise-list">
      {sessions.map((session) => (
        <div className="exercise-preview" key={session.id}>
          <h2>{ session.name }</h2>
          <p>
            Range of Movement:
            { session.maxRange }
          </p>
          <p>
            Time for each rep:
            { session.repTime }
            sec
          </p>
        </div>
      ))}
    </div>
  );
}

export default SessionList;
