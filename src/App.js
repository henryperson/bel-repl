import React from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'

const endpoint = 'https://repl-api.bel-chime.com/stateful-long'

// Solarized theme from: https://ethanschoonover.com/solarized/
// Colors taken from: https://github.com/thomasf/solarized-css/blob/master/src/solarized-css/partials/solarized-colors.styl
let solarized = {
  base03: "#002b36",
  base02: "#073642",
  base01: "#586e75",
  base00: "#657b83",
  base0: "#839496",
  base1: "#93a1a1",
  base2: "#eee8d5",
  base3: "#fdf6e3",

  yellow: "#b58900",
  orange: "#cb4b16",
  red: "#dc322f",
  magenta: "#d33682",
  violet: "#6c71c4",
  blue: "#268bd2",
  cyan: "#2aa198",
  green: "#859900",
}

solarized = Object.assign(solarized, {
  light: {
    fg: solarized.base00,
    bg: solarized.base3,
    hl: solarized.base2,
    emph: solarized.base01,
    comment: solarized.base1,
  },

  dark: {
    fg: solarized.base0,
    bg: solarized.base03,
    hl: solarized.base02,
    emph: solarized.base1,
    comment: solarized.base01,
  },
})

const style = {
  bar: {
    height: "50px",
    width: "100%",
    display: "flex",
    alignItems: "center",
    padding: "15px",
  },
  barTitle: {
    textTransform: "uppercase",
  },
  panel: {
    display: "flex",
    width: "50%",
    flexDirection: "column",
  },
  body: {
    flexGrow: "1",
    fontFamily: 'Monaco, Menlo, "Courier New", monospace',
    fontSize: "14px",
    display: "flex",
  },
}

function Space({width, height}) {
  return <div style={{width, height}}/>
}

function App() {
  const [belCode, setBelCode] = React.useState('(prn "Hello World!")')
  const [{output, replInput, requestOutstanding, replState}, setCombinedState] = React.useState({
    output: [],
    replInput: "",
    requestOutstanding: false,
    replState: "",
  })
  const replInputField = React.useRef(null)
  React.useEffect(() => {
    if (!requestOutstanding) {
      replInputField.current.focus()
    }
  }, [requestOutstanding])

  return (
    // Main container
    <div style={{display: "flex", height: "100vh", width: "100vw"}}>
      {/* Left panel */}
      <div style={{color: solarized.light.fg, ...style.panel}}>
        {/* Left top bar */}
        <div style={{background: solarized.light.hl, justifyContent: "space-between", ...style.bar}}>
          <span style={style.barTitle}>editor</span>
          {/* Submit button */}
          <div
            style={{
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
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
              }).then(resp => resp.json()).then(({result, state}) => setCombinedState({
                output: [{type: "output", text: result}],
                replInput: "",
                requestOutstanding: false,
                replState: state,
              }))
            }}
          >
            run <Space width="7px"/><FontAwesomeIcon style={{fontSize: "small"}} icon={faPlay} />
          </div>
        </div>

        {/* Left body */}
        <div style={style.body}>
          {/* Text editor */}
          <textarea
            value={belCode}
            onChange={(event) => setBelCode(event.target.value)}
            style={{
              resize: "none",
              width: "100%",
              height: "100%",
              flexGrow: "1",
              background: solarized.light.bg,
              border: "none",
              outline: "none",
              fontSize: "inherit",
              padding: "15px",
              color: "inherit",
            }}
            spellcheck="false"
          >
          </textarea>
        </div>
      </div>

      {/* Right panel */}
      <div style={{color: solarized.dark.fg, ...style.panel}}>
        {/* Right top bar */}
        <div style={{background: solarized.dark.hl, ...style.bar}}>
        <span style={{textTransform: "uppercase"}}>repl</span>
        </div>

        {/* Right body */}
        <div style={{background: solarized.dark.bg, ...style.body}}>
          {/* Output window */}
          <div style={{padding: "15px", width: "100%"}}>
            {output.map(({type, text}, index) => {
              switch (type) {
                case "input":
                  return <div key={index}>> {text}</div>
                case "output":
                  return <div key={index}>{text}</div>
              }
            })}
            {/* Repl */}
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
                            state: replState,
                          })
                        })
                        .then((resp) => resp.json())
                        .then(({result, state}) => setCombinedState(({output}) => ({
                          output: [...output, {type: "output", text: result}],
                          requestOutstanding: false,
                          replInput: "",
                          replState: state,
                        })))
                      }
                    }}
                    style={{
                      flex: "1",
                      background: solarized.dark.bg,
                      border: "none",
                      outline: "none",
                      resize: "none",
                      fontSize: "inherit",
                      padding: "0",
                      color: "inherit",
                    }}
                    spellcheck="false"
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
