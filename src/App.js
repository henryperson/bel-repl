import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const style = {
    display: "inline-block",
    width: "50%",
    height: "100vh",
  }
  return (
    <div className="main">
      <div className="input-box" style={{background: "gray", ...style}}>
        input text here
      </div>
      <div className="output-box" style={{background: "tomato", ...style}}>
        output text here
      </div>
    </div>
  );
}

function Hello() {
  return (
    <p>hello</p>
  )
}

export default App;
