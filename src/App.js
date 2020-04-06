import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const style = {
    display: "inline-block",
    width: "50%",
    height: "100vh",
    padding: "30px",
    // fontSize: "16px",
  }
  return (
    <div className="main">
      <div className="input-box" style={{background: "gray", ...style}}>
        <textarea
          style={{
            resize: "none",
            width: "100%",
            height: "100%",
            background: "gray",
            border: "none",
            outline: "none",
            fontSize: "inherit",
          }}
        >
          input text here
        </textarea>
      </div>
      <div className="output-box" style={{background: "tomato", verticalAlign: "top", ...style}}>
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
