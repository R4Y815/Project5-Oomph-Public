/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
// Helper Function- draw a single keypoint
export function drawPoint(ctx, y, x, r, ptColor, ptBorder) {
  ctx.fillStyle = ptColor;
  ctx.strokeStyle = ptBorder;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}

// Helper Function- draw keypoints based on confidence
export function drawKeypoints(pose, ctx, minConfidence, radius, ptColor, ptBorder) {
  // destructuring to make keypoints available from poses array returned by model
  const { keypoints } = pose[0]; // keypoints = poses[0].keypoints

  if (pose && pose.length > 0) {
    console.log('keypoints =', keypoints);
    keypoints.forEach((keypoint, index) => {
      const { x, y, score } = keypoint;
      if (score > minConfidence) {
        // index 0 - 4 are points on the face
        // we only want to show the body
        if (index > 4) {
          drawPoint(ctx, y, x, radius, ptColor, ptBorder);
        }
      }
    });
  }
}

// Helper Function: Draws a line on  a canvas, i.e. a joint
export function drawSegment([ay, ax], [by, bx], ctx, lineWidth, lineColor, scale = 1) {
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = lineColor;
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.stroke();
}

// Helper Function - draw lines between the keypoints to form skeleton pushUpCode
export function drawSkeleton(pose, ctx, confiThreshold, lineWidth, lineColor) {
  // destructuring to make keypoints available from poses array returned by model
  const { keypoints } = pose[0];

  // edge definition for draw skeletion
  const edges = {
    '5,7': 'm', // left upper arm
    '7,9': 'm', // left forearm
    '6,8': 'c', // right upper arm
    '8,10': 'c', // right forearm
    '5,6': 'y', // shoulder span
    '5,11': 'm', // left torso side
    '6,12': 'c', // right torso side
    '11,12': 'y', // hip span
    '11,13': 'm', // left thigh
    '13,15': 'm', // left lower leg
    '12,14': 'c', // right thigh
    '14,16': 'c', // right lower leg
  };
  if (pose && pose.length > 0) {
    // change object key-value pair into array form
    const edgesArr = Object.entries(edges);
    edgesArr.forEach((edge) => {
      // destructure array to work on index position of the hardcoded adj keypoints in the model
      const [key, value] = edge;
      const p = key.split(',');
      // p1 is the earlier point,
      const p1 = p[0];
      // p2 is the next point
      const p2 = p[1];

      // grab the coordinates and scores of each point
      const y1 = keypoints[p1].y;
      const x1 = keypoints[p1].x;
      const c1 = keypoints[p1].score;
      const y2 = keypoints[p2].y;
      const x2 = keypoints[p2].x;
      const c2 = keypoints[p2].score;

      // condition for drawing the line
      if ((c1 > confiThreshold) && (c2 > confiThreshold)) {
        drawSegment([y1, x1], [y2, x2], ctx, lineWidth, lineColor);
      }
    });
  }
}

// Helper Function - draw keypoints onto canvas
export function drawModelOnCanvas(pose, video, videoWidth, videoHeight, canvas, minConfidence, radius, ptColor, ptBorder, confiThreshold, lineWidth, lineColor) {
  const ctx = canvas.current.getContext('2d');
  canvas.current.width = videoWidth;
  canvas.current.height = videoHeight;

  drawKeypoints(pose, ctx, minConfidence, radius, ptColor, ptBorder);
  drawSkeleton(pose, ctx, confiThreshold, lineWidth, lineColor);
}
