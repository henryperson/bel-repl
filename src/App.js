import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [belCode, setBelCode] = React.useState('(prn "Hello World!")')
  const [output, setOutput] = React.useState("")

  const panelStyle = {
    display: "flex",
    width: "50%",
    flexDirection: "column",
  }
  const barStyle = {
    height: "50px",
    width: "100%",
    display: "flex",
  }
  const bodyStyle = {
    flexGrow: "1",
  }
  return (
    // Main container
    <div style={{display: "flex", height: "100vh", width: "100vw"}}>
      {/* Left panel */}
      <div style={panelStyle}>
        {/* Left top bar */}
        <div style={{background: "plum", justifyContent: "space-between", ...barStyle}}>
          placeholder left
          <button style={{type: "button"}} onClick={() =>
            fetch("https://playground-jqd2vloq4a-uw.a.run.app", {
              method: 'POST',
              body: belCode,
          }).then(resp => resp.text()).then(setOutput)
          }>
            submit
          </button>
        </div>

        {/* Left body */}
        <div style={{background: "gray", ...bodyStyle}}>
          <textarea
            value={belCode}
            onChange={event => setBelCode(event.target.value)}
            style={{
              resize: "none",
              width: "100%",
              flexGrow: "1",
              background: "gray",
              border: "none",
              outline: "none",
              fontSize: "inherit",
              padding: "30px",
            }}
          >
            input text here
          </textarea>
        </div>
      </div>

      {/* Right panel */}
      <div style={panelStyle}>
        {/* Right top bar */}
        <div style={{background: "cyan", ...barStyle}}>
          placeholder right
        </div>

        {/* Right body */}
        <div style={{background: "tomato", ...bodyStyle}}>
          {/* Output window */}
          <div style={{padding: "30px"}}>
            {output}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
