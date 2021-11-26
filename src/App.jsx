import React, {useState, useEffect} from 'react';
import './App.css';

const CIRCLE_RADIUS = 400;
const CIRCLE_DIAMETER = CIRCLE_RADIUS * 2;
const CIRCLE_AMPLITUDE_RAD = Math.PI * 2;
const KEYS_CIRCLE_PROPORTION = 0.7;
const MINORS_CIRCLE_PROPORTION = 0.4;
const CIRCLE_STROKE_WIDTH = 1;

function App() {
  
  const [offset,setOffset] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [targetRotation, setTargetRotation] = useState(0);
  // const [animateTransform, setAnimateTransform] = useState(null);
  const keys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  const circleOfFiths = keys.reduce((circle, key, i) => [...circle, keys[(keys.indexOf(circle[circle.length - 1]) + 7) % keys.length]], [keys[0]]).slice(0, keys.length);
  const chords = circleOfFiths.map(key => new Audio(`/chords/${key}.wav`)) 
  const relativeMinors = circleOfFiths.map((key, i) => keys[(keys.indexOf(key) + 9) % circleOfFiths.length] + 'm')
  const circleStep = (CIRCLE_AMPLITUDE_RAD) / keys.length;
  const setKeyIndex = (i) => {
    setOffset(i);
    // console.log(circleOfFiths[i]);
    // console.log(chords);
    // setTargetRotation(-i * circleStep * 57);
    chords[i].play();
  }
  const drawTexts = (circle, x, y, radius) => circle.map((k, i) => <text onClick={()=> setKeyIndex(i) } x={`${x + radius * Math.sin(i*circleStep-currentRotation)}`} y={`${y - radius * Math.cos(i*circleStep-currentRotation)}`} fill="red">{k}</text>
  );

  useEffect(() => {
    setTargetRotation(offset * circleStep);
    // Disable animations for the time being...
    setCurrentRotation(offset * circleStep);
  }
  , [offset]);

  // useEffect(() => {
  //   if(currentRotation === targetRotation) {
  //     return;
  //   }
  //   const animateTransform = ;
  //   console.log(animateTransform);

    
  //   setAnimateTransform(animateTransform);
  // }
  // , [targetRotation] );
  useEffect(() =>  document.querySelector("animateTransform") && document.querySelector("animateTransform").addEventListener('repeatEvent', () => {
      console.log("Repeat Event", "currentRoration", currentRotation, "targetRotation", targetRotation);
      setCurrentRotation(targetRotation);
      // setAnimateTransform(null);
    }),[targetRotation]);
  console.log(currentRotation, targetRotation);
  // console.log(`${Math.abs(targetRotation-currentRotation)/CIRCLE_AMPLITUDE_RAD*10}s`);
  const createAnimation = () => targetRotation !== currentRotation && (<animateTransform key={`${targetRotation}`} attributeName="transform"
                            attributeType="XML"
                            type="rotate"
                            from={`${-currentRotation*57} ${CIRCLE_RADIUS} ${CIRCLE_RADIUS}`}
                            to={`${-targetRotation*57} ${CIRCLE_RADIUS} ${CIRCLE_RADIUS}`}
                            dur={`${Math.abs(targetRotation-currentRotation)/CIRCLE_AMPLITUDE_RAD*10}s`}
                            repeatCount="indefinite"
                            fill="freeze"
                            />);
           
  return (
    <main>
      <svg height={`${CIRCLE_DIAMETER}`} width={`${CIRCLE_DIAMETER}`}>
        <g>
         {createAnimation()}
          {/* - CIRCLE_STROKE_WIDTH TO AVOID DRAWING THE SVG BORDER*/}
          <circle cx={`${CIRCLE_RADIUS}`} cy={`${CIRCLE_RADIUS}`} r={`${CIRCLE_RADIUS - CIRCLE_STROKE_WIDTH}`} stroke="black" stroke-width="1" fill-opacity="0" />
          <circle cx={`${CIRCLE_RADIUS}`} cy={`${CIRCLE_RADIUS}`} r={`${CIRCLE_RADIUS * KEYS_CIRCLE_PROPORTION}`} stroke="black" stroke-width="1" fill="white" fill-opacity="0" />
          {drawTexts(circleOfFiths, CIRCLE_RADIUS, CIRCLE_RADIUS, CIRCLE_RADIUS*((1-Math.abs(KEYS_CIRCLE_PROPORTION-1)/2)))}
          <circle cx={`${CIRCLE_RADIUS}`} cy={`${CIRCLE_RADIUS}`} r={`${CIRCLE_RADIUS * MINORS_CIRCLE_PROPORTION}`} stroke="black" stroke-width="1" fill="white" fill-opacity="0" />
          {drawTexts(relativeMinors, CIRCLE_RADIUS, CIRCLE_RADIUS, CIRCLE_RADIUS*((KEYS_CIRCLE_PROPORTION-Math.abs(MINORS_CIRCLE_PROPORTION-KEYS_CIRCLE_PROPORTION)/2)))}
        </g>
      </svg>
    </main>
  );
}

export default App;