import React, {useState, useEffect} from 'react';
import './App.css';

const CIRCLE_RADIUS = 400;

const [CX, CY] = [CIRCLE_RADIUS,CIRCLE_RADIUS]; 
const CIRCLE_DIAMETER = CIRCLE_RADIUS * 2;
const CIRCLE_AMPLITUDE_RAD = Math.PI * 2;
const KEYS_CIRCLE_PROPORTION = 0.7;
const MINORS_CIRCLE_PROPORTION = 0.4;
/* 0.99 TO AVOID DRAWING THE SVG BORDER*/
const OUTER_CIRCLE_PROPORTION = 0.99;
const CIRCLE_STROKE_WIDTH = 1;
const MAJOR_SCALE_FORMULA = [2,2,1,2,2,2];
const MAJOR_SCALE_STEPS = MAJOR_SCALE_FORMULA.map((steps, i) => MAJOR_SCALE_FORMULA.slice(0,i+1).reduce((totalSteps, currentSteps) => totalSteps + currentSteps, 0))

function App() {
  
  const [offset,setOffset] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [targetRotation, setTargetRotation] = useState(0);
  const [currentScale, setCurrentScale] = useState();
  // const [animateTransform, setAnimateTransform] = useState(null);
  const keys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  const circleOfFiths = keys.reduce((circle, key, i) => [...circle, keys[(keys.indexOf(circle[circle.length - 1]) + 7) % keys.length]], [keys[0]]).slice(0, keys.length);
  const chords = circleOfFiths.map(key => new Audio(`/chords/${key}.wav`)) 
  const relativeMinors = circleOfFiths.map((key, i) => keys[(keys.indexOf(key) + 9) % circleOfFiths.length] + 'm')
  const circleStep = (CIRCLE_AMPLITUDE_RAD) / keys.length;
  const setKeyIndex = (i) => {
    setOffset(i);
    chords[i].play();
  }


  useEffect(() => {
    setTargetRotation(offset * circleStep);
    // Disable animations for the time being...
    setCurrentRotation(offset * circleStep);
  }, [offset]);

  useEffect(() => {
    const keyIndex = keys.indexOf(circleOfFiths[offset]);
    const scale = [keys[keyIndex], ...MAJOR_SCALE_STEPS.map((steps) => keys[(keyIndex+steps)%keys.length])];
    setCurrentScale(scale);
  }, [offset]);
  useEffect(() => {
    console.log(currentScale);
    
  }, [currentScale]);

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
  
  const drawCircle = (p) => <circle cx={`${CX}`} cy={`${CY}`} r={`${CIRCLE_RADIUS * p}`} stroke="black" stroke-width={`${CIRCLE_STROKE_WIDTH}`} fill="white" fill-opacity="0" />;
  
  const drawLayer = (texts, outerProp, innerProp, drawOuter=false) => {
    const drawText = (i, sin, cos) =>  {
      const radius = CIRCLE_RADIUS*((outerProp-Math.abs(innerProp-outerProp)/2));
      return <text onClick={()=> setKeyIndex(i) } x={`${CX + radius * sin}`} y={`${CY - radius * cos}`} fill="green">{texts[i]}</text>;
    };
    const drawBound = (i, sin, cos, arc) =>  { 
      let deltaRad = -arc/2;
      // Addition formula: 
      // 1. sin(x + y) = sin x cos y + cos x sin y
      let totalSin = sin*Math.cos(deltaRad) + cos * Math.sin(deltaRad);
      // 2. cos(x + y) = cos x cos y - sin x sin y
      let totalCos = cos*Math.cos(deltaRad) - sin *Math.sin(deltaRad);

      const x1 = CX+innerProp*CIRCLE_RADIUS*totalSin;
      const y1 = CY+innerProp*CIRCLE_RADIUS*totalCos;
      const x2 = CX+outerProp*CIRCLE_RADIUS*totalSin;
      const y2 = CY+outerProp*CIRCLE_RADIUS*totalCos;

      deltaRad = arc/2;
      // Addition formula: 
      // 1. sin(x + y) = sin x cos y + cos x sin y
      totalSin = sin*Math.cos(deltaRad) + cos * Math.sin(deltaRad);
      // 2. cos(x + y) = cos x cos y - sin x sin y
      totalCos = cos*Math.cos(deltaRad) - sin *Math.sin(deltaRad);

      const x3 = CX+outerProp*CIRCLE_RADIUS*totalSin;
      const y3 = CY+outerProp*CIRCLE_RADIUS*totalCos;
      const x4 = CX+innerProp*CIRCLE_RADIUS*totalSin;
      const y4 = CY+innerProp*CIRCLE_RADIUS*totalCos;
      // console.log(currentScale && currentScale[i]);
      console.log(circleOfFiths[i], currentScale && currentScale.indexOf(circleOfFiths[i]));
      
      return (<g>
          <line x1={`${x1}`} y1={`${y1}`}  x2={`${x2}`} y2={`${y2}`} stroke="black" />
         {(currentScale && currentScale.indexOf(circleOfFiths[i]) >= 0) && <path xmlns="http://www.w3.org/2000/svg" fill="cyan" stroke="red" stroke-width="8" d={`M ${x1} ${y1} L ${x2} ${y2} A ${outerProp*CIRCLE_RADIUS} ${outerProp*CIRCLE_RADIUS} 0 0 0 ${x3} ${y3} L ${x4} ${y4} A ${innerProp*CIRCLE_RADIUS} ${innerProp*CIRCLE_RADIUS} 0 0 1 ${x1} ${y1}  Z`}/>} 
      </g>);
    }
    const drawBounds = (i, sin, cos) => <g>{drawBound(i, sin, cos, circleStep)}</g>;
    const radialFunctions = [drawBounds, drawText];
    return (<g>
      {drawOuter && drawCircle(outerProp)}
      {drawCircle(innerProp)}

      {radialFunctions.flatMap(f => texts.map((_, i) => {
        const angle = i*circleStep-currentRotation;
        return f(i, Math.sin(angle), Math.cos(angle));
        
       }))
      }
    </g>);
  }     
  return (
    <main>
      <svg height={`${CIRCLE_DIAMETER}`} width={`${CIRCLE_DIAMETER}`}>
        <g>
          {createAnimation()}
          {drawLayer(circleOfFiths, OUTER_CIRCLE_PROPORTION, KEYS_CIRCLE_PROPORTION, true)}
          {drawLayer(relativeMinors, KEYS_CIRCLE_PROPORTION, MINORS_CIRCLE_PROPORTION)}
          
        </g>
      </svg>
    </main>
  );
}

export default App;