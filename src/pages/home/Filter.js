/* eslint-disable react/prop-types */
/* eslint-disable react/button-has-type */
import React from 'react';

const filterList = ['All', 'Elbow', 'Ankle', 'Hip', 'Knee', 'Shoulders'];

function Filter({ currentFilter, changeFilter }) {
  const handleClick = (newFilter) => {
    changeFilter(newFilter);
  };

  return (
    <div className="exercise-filter">
      <nav>
        <p>Filter by:</p>
        {filterList.map((f) => (
          <button
            key={f}
            onClick={() => handleClick(f)}
            className={currentFilter === f ? 'active' : ''}
          >
            {f}
          </button>
        ))}
      </nav>

    </div>
  );
}

export default Filter;
