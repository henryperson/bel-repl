import React from 'react';
import './App.css';

const endpoint = 'https://repl-api.bel-chime.com/stateful'

function App() {
  const [belCode, setBelCode] = React.useState('(prn "Hello World!")')
  const [{output, replInput, requestOutstanding}, setCombinedState] = React.useState({
    output: [],
    replInput: "",
    requestOutstanding: false,
  })
  const replInputField = React.useRef(null)
  React.useEffect(() => {
    if (!requestOutstanding) {
      replInputField.current.focus()
    }
  }, [requestOutstanding])

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
          <button
            style={{type: "button"}}
            onClick={() => {
              setCombinedState(({output}) => ({
                replInput: "",
                requestOutstanding: true,
                output,
              }))
              fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({
                  expr: belCode,
                  state: "",
                }),
              }).then(resp => resp.json()).then(({result}) => setCombinedState({
                output: [{type: "output", text: result}],
                replInput: "",
                requestOutstanding: false,
              }))
            }}
          >
            submit
          </button>
        </div>

        {/* Left body */}
        <div style={{background: "gray", ...bodyStyle}}>
          <textarea
            value={belCode}
            onChange={(event) => setBelCode(event.target.value)}
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
            {output.map(({type, text}, index) => {
              switch (type) {
                case "input":
                  return <div key={index}>> {text}</div>
                case "output":
                  return <div key={index}>{text}</div>
              }
            })}
            <div style={{display: "flex"}}>
              {requestOutstanding ? null : <>
                >&nbsp; <textarea
                    rows="1"
                    value={replInput}
                    ref={replInputField}
                    onChange={(event) => {
                      // https://stackoverflow.com/a/44708693
                      const value = event.target.value
                      setCombinedState((currentState) => ({
                        ...currentState,
                        replInput: value,
                      })
                    )}}
                    onKeyDown={(event) => {
                      if (event.keyCode == 13) {
                        event.preventDefault()
                        setCombinedState(({output}) => ({
                          output: [...output,  {type: "input", text: replInput}],
                          replInput: "",
                          requestOutstanding: true,
                        }))
                        fetch(endpoint, {
                          method: 'POST',
                          body: JSON.stringify({
                            expr: replInput,
                            state: "",
                          })
                        })
                        .then((resp) => resp.json())
                        .then(({result}) => setCombinedState(({output}) => ({
                          output: [...output, {type: "output", text: result}],
                          requestOutstanding: false,
                          replInput: "",
                        })))
                      }
                    }}
                    style={{
                      flex: "1",
                      background: "tomato",
                      border: "none",
                      outline: "none",
                      resize: "none",
                      fontSize: "inherit",
                      padding: "0",
                    }}
                ></textarea>
              </>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
