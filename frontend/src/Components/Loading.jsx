import React from 'react';
import { ProgressBar } from 'react-bootstrap';


function Loading() {
  return (
    <ProgressBar active now={100} />
  );
}


export default Loading;
