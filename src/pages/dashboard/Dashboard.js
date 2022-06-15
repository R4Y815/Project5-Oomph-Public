/* eslint-disable consistent-return */
import React, { useEffect, useState } from 'react';

// Badge components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import VerifiedIcon from '@mui/icons-material/Verified';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import LocalPoliceSharpIcon from '@mui/icons-material/LocalPoliceSharp';
import Badge from '@mui/material/Badge';

import axios from 'axios';
import SessionList from '../../components/SessionList.js';

function Dashboard() {
  const [sessions, setSessions] = useState(null);
  const [sessionCount, setSessionCount] = useState(null);
  const [rep, setRep] = useState(null);

  // to get collection from sessionStat
  useEffect(() => {
    axios
      .get('https://ap-southeast-1.aws.data.mongodb-api.com/app/proj5-ksddx/endpoint/userSession')
      .then((res) => {
        setSessions(res.data[0].DispResultsArr);
        console.log(res.data[0].DispResultsArr);
      });
  }, []);

  // to get session count from sessionStat
  useEffect(() => {
    axios
      .get('https://ap-southeast-1.aws.data.mongodb-api.com/app/proj5-ksddx/endpoint/countUserSession')
      .then((res) => {
        console.log(res.data);
        setSessionCount(res.data);
      });
  }, []);

  // to get rep count from sessionStat
  useEffect(() => {
    axios
      .get('https://ap-southeast-1.aws.data.mongodb-api.com/app/proj5-ksddx/endpoint/countUserRep')
      .then((res) => {
        console.log(res.data[0].DispResultsArr);
        setRep(res.data[0].DispResultsArr);
      });
  }, []);

  return (
    <div className="home">
      <Box>
        <Button>
          <Paper elevation={3}>
            Reps done!
            <Badge anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} badgeContent={rep} color="secondary">
              <LocalPoliceSharpIcon sx={{ color: '#f1356d', fontSize: 80 }} />
            </Badge>
          </Paper>
        </Button>
        <Button>
          <Paper elevation={3}>
            Completed!
            <Badge anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} badgeContent={sessionCount} color="secondary">
              <VerifiedIcon sx={{ color: '#f1356d', fontSize: 80 }} />
            </Badge>
          </Paper>
        </Button>
        <Button>
          <Paper elevation={3}>
            5th Day!
            <MilitaryTechIcon sx={{ color: '#333', fontSize: 80 }} />
          </Paper>
        </Button>
      </Box>
      { sessions && <SessionList sessions={sessions} /> }
    </div>
  );
}

export default Dashboard;
