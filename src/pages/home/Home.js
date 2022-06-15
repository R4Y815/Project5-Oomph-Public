/* eslint-disable import/prefer-default-export */
import React, { useState } from 'react';
import ExerciseList from '../../components/ExerciseList.js';
import useFetch from '../../hooks/useFetch.js';
import Filter from './Filter.js';

// styles
import './Home.css';

export default function Home() {
  const [currentFilter, setCurrentFilter] = useState('All');
  const { error, isPending, data: exercises } = useFetch(`https://ap-southeast-1.aws.data.mongodb-api.com/app/proj5-ksddx/endpoint/${currentFilter}`);

  const changeFilter = (newFilter) => {
    setCurrentFilter(newFilter);
  };

  return (
    <div className="home">
      { error && <div>{ error }</div> }
      { isPending && <div>Loading...</div> }
      {exercises && (
      <Filter currentFilter={currentFilter} changeFilter={changeFilter} />)}
      { exercises && <ExerciseList exercises={exercises} /> }
    </div>
  );
}
