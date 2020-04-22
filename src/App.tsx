import React from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'

const endpoint = 'https://repl-api.bel-chime.com/stateful-long'

// Solarized theme from: https://ethanschoonover.com/solarized/
// Colors taken from: https://github.com/thomasf/solarized-css/blob/master/src/solarized-css/partials/solarized-colors.styl
const colors = {
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

const solarized = {
  light: {
    fg: colors.base00,
    bg: colors.base3,
    hl: colors.base2,
    emph: colors.base01,
    comment: colors.base1,
  },

  dark: {
    fg: colors.base0,
    bg: colors.base03,
    hl: colors.base02,
    emph: colors.base1,
    comment: colors.base01,
  },

  ...colors,
}

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
    flexGrow: 1,
    fontFamily: 'Monaco, Menlo, "Courier New", monospace',
    fontSize: "14px",
    display: "flex",
  },
} as {[name: string]: React.CSSProperties}

function Space(dims: {width?: string, height?: string}) {
  return <div style={dims} />
}

function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

function App() {
  const [belCode, setBelCode] = React.useState('(prn "Hello World!")')
  const [{output, replInput, requestOutstanding, replState}, setCombinedState] = React.useState({
    output: [] as {type: "input" | "output", text: string}[],
    replInput: "",
    requestOutstanding: false,
    replState: "",
  })
  const replInputField = React.useRef(null) as React.RefObject<HTMLTextAreaElement>
  React.useEffect(() => {
    if (!requestOutstanding) {
      replInputField.current?.focus()
    }
  }, [replInputField, requestOutstanding])

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
                replState,
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
              flexGrow: 1,
              background: solarized.light.bg,
              border: "none",
              outline: "none",
              fontSize: "inherit",
              padding: "15px",
              color: "inherit",
            }}
            spellCheck="false"
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
                default:
                  return assertNever(type)
              }
            })}
            {/* Repl */}
            <div style={{display: "flex"}}>
              {requestOutstanding ? null : <>
                >&nbsp; <textarea
                    rows={1}
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
                      if (event.keyCode === 13) {
                        event.preventDefault()
                        setCombinedState(({output}) => ({
                          output: [...output,  {type: "input", text: replInput}],
                          replInput: "",
                          requestOutstanding: true,
                          replState: "",
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
                    spellCheck="false"
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
