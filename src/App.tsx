import React from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'

const api = 'https://repl-api.bel-chime.com'

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
    flex: 1,
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

// Adapted from https://usehooks.com/useWindowSize/
function useWindowSize() {
  function getSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  const [windowSize, setWindowSize] = React.useState(getSize)

  React.useEffect(() => {
    function handleResize() {
      setWindowSize(getSize())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, []) // Empty array ensures that effect is only run on mount and unmount

  return windowSize
}

function getP() {
  return new URLSearchParams(document.location.search).get("p")
}

const shareID = getP()

const cachedPrograms = {} as {[key: string]: string}

function App() {
  const [[belCode, pristine], setBelCode] = React.useState(
    shareID ? ["", true] : ["(cons 'hello 'world)", false])
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
  React.useEffect(() => {
    if (shareID) {
      fetch(`https://storage.googleapis.com/download/storage/v1/b/chime-snippets/o/${shareID}?alt=media`)
        .then(resp => resp.text())
        .then(code => {
          cachedPrograms[shareID] = code
          setBelCode([code, true])
        })
    }
    window.addEventListener("popstate", _ => {
      const p = getP()
      if (p) {
        const code = cachedPrograms[p]
        if (code !== undefined) {
          setBelCode([code, true])
        }
      }
    })
  }, [])
  React.useEffect(() => {
    if (!pristine) {
      window.history.pushState(null, '', '/')
    }
  }, [pristine])
  const windowSize = useWindowSize()

  return (
    // Main container
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: windowSize.width > windowSize.height ? "row" : "column",
      }}
    >
      {/* Left panel */}
      <div style={{color: solarized.light.fg, ...style.panel}}>
        {/* Left top bar */}
        <div style={{background: solarized.light.hl, justifyContent: "space-between", ...style.bar}}>
          <span style={style.barTitle}>editor</span>
          {/* Buttons */}
          <div style={{display: "flex"}}>
            {/* Share */}
            <div
              style={{
                textTransform: "uppercase",
                cursor: "pointer",
              }}
              onClick={() => {
                fetch(`${api}/share`, {
                  method: 'POST',
                  body: belCode,
                }).then(resp => resp.json()).then(({share_id}) => {
                  cachedPrograms[share_id] = belCode
                  window.history.pushState(null, '', `/?p=${share_id}`)
                  setBelCode([belCode, true])
                })
              }}
            >
              share
            </div>
            <Space width="15px"/>
            {/* Run */}
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
                fetch(`${api}/stateful-long`, {
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
        </div>

        {/* Left body */}
        <div style={{background: solarized.light.bg, ...style.body}}>
          {/* Text editor */}
          <textarea
            value={belCode}
            onChange={(event) => {
              setBelCode([event.target.value, false])
            }}
            style={{
              resize: "none",
              width: "100%",
              margin: 0,
              flexGrow: 1,
              border: "none",
              outline: "none",
              fontSize: "inherit",
              padding: "15px",
              color: "inherit",
              backgroundColor: "inherit",
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
                  return <pre style={{marginTop: 0}} key={index}>{text}</pre>
                default:
                  return assertNever(type)
              }
            })}
            {/* Repl */}
            <div style={{display: "flex", alignItems: "center"}}>
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
                        fetch(`${api}/stateful`, {
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
                      margin: 0,
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
