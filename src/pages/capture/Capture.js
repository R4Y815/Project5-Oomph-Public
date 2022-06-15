/* eslint-disable prefer-const */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

// imports
import React, { useRef, useState } from 'react';
import './Capture.css';
import * as poseDetection from '@tensorflow-models/pose-detection';
// register one of the TF.js backends
import '@tensorflow/tfjs-backend-webgl';
import Webcam from 'react-webcam';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { v4 as uuidv4 } from 'uuid';
import Box from '@mui/material/Box'; // for exercise info display
import TextField from '@mui/material/TextField'; // for exercise info display
import Stack from '@mui/material/Stack'; // for exercise info display
import Button from '@mui/material/Button'; // for exercise info display
import axios from 'axios';
import { drawModelOnCanvas } from './drawingUtilities.js';

// ENUMS for True/False use
const TRUE = 'true';
const FALSE = 'false';
const NEW = 'new';
const RUNNING = 'running';

// Time Codes
let timeStart;
let timeEnd;

// model code
let detector;
let detectorConfig;
let poses;
let angle;
let maxAngle = 0;
let reps = 0;
let upPosition = FALSE;
let downPosition = FALSE;
const resultsArr = []; // stores maxAngle per rep
const UPthreshold = 25; // threshold to count 1 rep
const DNthreshold = 12; // threshold to count hand being down
const jointA = 8;
const jointB = 6;

// confidence level (.score) of keypoints required before measurement begins
const kpConfidence = 0.53;

export default function LatArmRaiseRmaxTimer() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [WebCamFeed, setWebCamFeed] = useState(TRUE);
  const [CanvasFeed, setCanvasFeed] = useState(TRUE);
  const [DispReps, setDispReps] = useState(0);
  const [DispAngle, setDispAngle] = useState(0);
  const [DispMaxAngle, setDispMaxAngle] = useState(0);
  const [DispRepTime, setDispRepTime] = useState(0);
  const [DispResultsArr, setDispResultsArr] = useState(resultsArr);
  const [captureStatus, setCaptureStatus] = useState(NEW);

  /* ******************************** *
   * CODE BELOW: SPECIFIC TO EXERCISE *
   * ******************************** */

  // Draw Indicators on Canvas based on exercise.
  // [VARIES BY EXercise]
  function drawVisualIndicators(ctx) {
    if ((angle >= 0) && (angle <= 110)) {
      // Draw Effort Container
      ctx.beginPath();
      ctx.rect(55, 200, 25, -100);
      ctx.strokeStyle = 'white';
      ctx.stroke();
      // Draw Effort Bar
      const height = (angle / 90) * 100;
      ctx.fillStyle = 'white';
      ctx.fillRect(55, 200, 25, -height);
    }
  }

  // FN: Set points for reading position of arm in min position
  // [VARIES BY EXercise]
  function inDownPosition() {
    // down position is when angle is zero and the wrist is lower than the waist(wasit must be seen)
    if ((angle >= 0) && (angle < DNthreshold)) {
      if (upPosition === TRUE) {
        reps += 1;
        // get End Time
        timeEnd = new Date().getTime();
        // calculate time for this rep in Seconds
        const timeElapsed = Math.round((timeEnd - timeStart) / 1000);
        // create results object for this rep
        const repResult = {
          maxRange: maxAngle,
          repTime: timeElapsed,
        };
        // push rep results object into results array
        resultsArr.push(repResult); // resultsArr extraneous?
        const resultsArrClone = Array.from(resultsArr); // <- extraneous?
        setDispResultsArr(resultsArrClone);
        setDispRepTime(timeElapsed);
      }
      downPosition = TRUE;
      upPosition = FALSE;
      maxAngle = angle + 1;
      setDispMaxAngle(maxAngle);
      timeStart = new Date().getTime();
    }
  }

  // FN: Set points for reading position of arm in max position
  // [VARIES BY EXercise]
  function inUpPosition() {
    if (angle > UPthreshold) {
      downPosition = FALSE;
      upPosition = TRUE;
    }
  }

  function findMaxAngle() {
    if (angle > maxAngle) {
      maxAngle = angle;
      setDispMaxAngle(maxAngle);
    }
  }

  // Update Angle angle the skeletal line makes, based on 2 specific points
  function updateAngle(keypoint1, keypoint2) { // pose[0].keypoints[index of joint]
    const dX = keypoint2.x - keypoint1.x;
    const dY = keypoint2.y - keypoint1.y;
    return (Math.floor((Math.atan2(dX, dY) * 180) / (Math.PI)));
  }

  function postData() {
    console.log(DispResultsArr);

    const payload = {
      DispResultsArr,
    };
    console.log('payload', payload);

    axios({
      url: 'https://ap-southeast-1.aws.data.mongodb-api.com/app/proj5-ksddx/endpoint/addSessionStat',
      method: 'post',
      data: payload,
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Exercise Block [VARIES BY EXercise]
  function exerciseBlockCode() {
    // only measure angle when keypoints are clearly visible:
    if ((poses[0].keypoints[`${jointA}`].score > kpConfidence) && (poses[0].keypoints[`${jointB}`].score > kpConfidence)) {
    // find angle of left upper arm and Count  [VARIES BY EXercise]
      angle = 180 - updateAngle(poses[0].keypoints[`${jointA}`], poses[0].keypoints[`${jointB}`]);
    }

    // Update Max Angle:
    findMaxAngle();
    // check if limb is in UP position
    inUpPosition();
    // check if limb is in DOWN position
    inDownPosition();

    // set values for display
    setDispAngle(angle);
    setDispReps(reps);
    // generate visual indicator based on angle
    drawVisualIndicators(canvasRef.current.getContext('2d'));
  }

  /* ******************************** *
   * CODE ABOVE: SPECIFIC TO EXERCISE *
   * ******************************** */

  /* ******************************** *
   *  CODE BELOW:  FOR Tf Model USAGE *
   *           DO NOT EDIT!           *
   * ******************************** */

  // variables Keypoints and Skeleton appearance
  const ptBorder = 'black';
  const ptColor = 'white';
  const radius = 3; // radius of keypoint drawn by drawPoint
  const minConfidence = 0.5; // min confidence required to draw keypt.
  const lineWidth = 2; // thickness of skeletal lines (drawSegment)
  const lineColor = 'black'; // colour of skeletal lines (drawSegment)
  const confiThreshold = 0.5; // min. confidence required for skeleton line

  // Detection of Keypoints and drawing Keypoints onto Canvas
  async function getPoses() {
    if (typeof webcamRef.current !== 'undefined' && webcamRef.current !== null && webcamRef.current.video.readyState === 4) {
      // Get Video Properties
      const { video } = webcamRef.current;
      const { videoWidth } = webcamRef.current.video;
      const { videoHeight } = webcamRef.current.video;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // trigger tensorFlow movenet model
      poses = await detector.estimatePoses(video);
      setTimeout(getPoses, 0);
      // draw movenet model onto canvas based on video input
      drawModelOnCanvas(poses, video, videoWidth, videoHeight, canvasRef, minConfidence, radius, ptColor, ptBorder, confiThreshold, lineWidth, lineColor);

      // run code block based on specifc exercise chosen
      exerciseBlockCode(poses);
    }
  }

  // Creating Detector based on Tfjs MoveNet
  async function init() {
    if (captureStatus === NEW) {
    // Trigger spinner:
      setDispMaxAngle('0');

      // reset DisMaxArr, maxAngleArr to 0;
      setDispResultsArr([]);
      resultsArr.length = 0;

      // set webCam Display to true
      setWebCamFeed(TRUE);

      // set CanvasFeed to true
      setCanvasFeed(TRUE);

      // creating the Tf Detector
      detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
      detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
      await getPoses();

      // switch CaptureMode to 'Running'
      setCaptureStatus(RUNNING);
    }
  }

  // Function to stop code from running
  function stopInit() {
    if (captureStatus === RUNNING) {
      // post data to sessionStat collection
      postData();

      // reset DispAngle, Max Angle and DispMaxAngle;
      setDispAngle(0);
      angle = 0;
      maxAngle = 0;
      setDispMaxAngle(0);

      // reset Timer
      timeStart = 0;
      setDispRepTime(0);

      // stop webcam feed
      setWebCamFeed(FALSE);

      // stop CanvasFeed
      setCanvasFeed(FALSE);

      // clear all drawings on canvas
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, 640, 480);

      // reset reps and DispReps
      reps = 0;
      setDispReps(0);

      // shut off poses output from tensor flow model
      /* poses = 0; */

      // stop tensorflow back end from running.
      detector = 0;
      detectorConfig = 0;

      // set CaptureStatus to NEW
      setCaptureStatus(NEW);
    }
  }

  return (
    <div>
      <div className="exercise-preview">
        <h2>Lateral Arm Raises</h2>
      </div>
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <div>
          <TextField
            id="display"
            label="Current Angle"
            value={DispAngle}
            onChange={setDispAngle}
          />
          <TextField
            id="display"
            label="Reps"
            value={DispReps}
            onChange={setDispReps}
          />
        </div>
        <div>
          <TextField
            id="display"
            label="Max Angle"
            value={DispMaxAngle}
            onChange={setDispMaxAngle}
          />
          <TextField
            id="display"
            label="Time for reps"
            value={DispRepTime}
            onChange={setDispRepTime}
          />
        </div>
      </Box>
      <Stack spacing={2} direction="row">
        <Button
          variant="contained"
          className="b1"
          onClick={() => { init(); }}
        >
          Start
        </Button>
        <Button
          variant="contained"
          className="b1"
          onClick={() => { stopInit(); }}
        >
          Stop
        </Button>
      </Stack>
      <Container>
        <br />
        <Col>
          <Container>
            <Row>
              <br />
              <Col>
                {DispResultsArr.map((result, index) => (
                  <div key={uuidv4()}>
                    Rep
                    {index + 1}
                    {' '}
                    Max
                    :
                    {' '}
                    {result.maxRange}
                    {' '}
                    Deg
                    {' '}
                    -
                    {' '}
                    Time
                    :
                    {' '}
                    {result.repTime}
                    {' '}
                    secs
                  </div>
                ))}
              </Col>
            </Row>
          </Container>
          { DispMaxAngle === '0' && (
          <div className="frntlyr">
            <div className="lds-spinner">
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
          </div>
          )}
        </Col>
        <Row>
          <Col> </Col>
          <Col md={6}>
            { WebCamFeed === TRUE && (
            <div>
              <Webcam
                ref={webcamRef}
                style={{
                  position: 'absolute',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  zindex: 9,
                  width: 640,
                  height: 480,
                }}
              />
            </div>
            )}
            { CanvasFeed === TRUE && (
            <div>
              <canvas
                ref={canvasRef}
                className="mainDisp"
                style={{
                  position: 'absolute',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  zindex: 9,
                  width: 640,
                  height: 480,
                }}
              />
            </div>
            )}
          </Col>
        </Row>
      </Container>

    </div>
  );
}
