/* eslint-disable react/prop-types */
import React from 'react';
import { Link } from 'react-router-dom';

function ExerciseList(props) {
  const { exercises } = props;

  return (
    <div className="exercise-list">
      {exercises.map((exercise) => (
        <div className="exercise-preview" key={exercise.id}>
          <Link to="/capture">
            <h2>{ exercise.name }</h2>
          </Link>
          <p>
            { exercise.description }
          </p>
        </div>
      ))}
    </div>
  );
}

export default ExerciseList;
