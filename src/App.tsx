import React from 'react'
import './App.css'
import examples from './Examples'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import {Controlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import {Helmet} from "react-helmet";


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
  button: isHovered => ({
    textTransform: "uppercase",
    cursor: "pointer",
    padding: "9px",
    borderRadius: "3px",
    background: isHovered ? "#dfdac7" : "",
  }),
} as any

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

// Copied from https://usehooks.com/useOnClickOutside/
function useOnClickOutside(ref, handler) {
  React.useEffect(
    () => {
      const listener = event => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }

        handler(event);
      };

      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);

      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  );
}

// Copied from https://usehooks.com/useHover/
function useHover(): [React.RefObject<HTMLDivElement>, boolean] {
  const [value, setValue] = React.useState(false);

  const ref = React.useRef() as React.RefObject<HTMLDivElement>;

  const handleMouseOver = () => setValue(true);
  const handleMouseOut = () => setValue(false);

  React.useEffect(
    () => {
      const node = ref.current;
      if (node) {
        node.addEventListener('mouseover', handleMouseOver);
        node.addEventListener('mouseout', handleMouseOut);

        return () => {
          node.removeEventListener('mouseover', handleMouseOver);
          node.removeEventListener('mouseout', handleMouseOut);
        };
      }
    },
    [ref.current] // Recall only if ref changes
  );

  return [ref, value];
}

function getP() {
  return new URLSearchParams(document.location.search).get("p")
}

const shareID = getP()

const cachedPrograms = {} as {[key: string]: string}

function App() {
  const [[belCode, pristine], setBelCode] = React.useState(
    shareID ? ["", true] : [examples[0].code, false])
  const [{output, replInput, requestOutstanding, replState}, setCombinedState] = React.useState({
    output: [] as {type: "input" | "output", text: string}[],
    replInput: "",
    requestOutstanding: false,
    replState: "",
  })
  const [showExamplesDiv, setShowExamplesDiv] = React.useState(false)
  const [shareButton, shareHovered] = useHover()
  const [runButton, runHovered] = useHover()
  const [examplesButton, examplesHovered] = useHover()

  const replInputField = React.useRef() as React.RefObject<HTMLTextAreaElement>
  React.useEffect(() => {
    if (!requestOutstanding) {
      replInputField.current?.focus()
    }
  }, [replInputField, requestOutstanding])
  const examplesDropdown = React.useRef() as React.RefObject<HTMLDivElement>
  useOnClickOutside(examplesDropdown, () => setShowExamplesDiv(false))

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

  let locals = {} as any
  const setLocal = (varName: string, val: any) => (locals[varName] = val) && null

  return (
    // Main container
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: windowSize.width > windowSize.height ? "row" : "column",
        position: "relative",
      }}
    >
      {/* Left panel */}
      <div style={{color: solarized.light.fg, ...style.panel}}>
        {/* Left top bar */}
        <div style={{background: solarized.light.hl, justifyContent: "space-between", ...style.bar}}>
          <span style={style.barTitle}>editor</span>
          {/* Buttons */}
          <div style={{display: "flex"}}>
            {setLocal("buttonWidth", "25px")}
            {/* Share */}
            <div
              style={style.button(shareHovered)}
              ref={shareButton}
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
            <Space width={locals.buttonWidth}/>
            {/* Examples */}
            <div
              style={{display: "flex", flexDirection: "column", alignItems: "center"}}
              ref={examplesDropdown}
            >
              <div
                style={style.button(examplesHovered)}
                ref={examplesButton}
                onClick={() => {
                  setShowExamplesDiv(!showExamplesDiv)
                }}
              >
                examples
              </div>
              {showExamplesDiv &&
              <div style={{
                position: "absolute",
                textTransform: "none",
                top: style.bar.height,
                background: "white",
                display: "flex",
                flexDirection: "column",
                border: `1px solid ${solarized.light.fg}`,
                borderRadius: "2px",
                zIndex: 1,
              }}>
                {examples.map(({title, code}, i) => (
                  <div
                    key={i}
                    style={{
                      height: "45px",
                      width: "150px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderBottom: i !== examples.length-1 ? `1px solid ${solarized.light.fg}` : "",
                      cursor: "pointer",
                      ...(code === belCode ? {
                        fontWeight: "bold",
                        cursor: "default",
                      } : {})
                    }}
                    onClick= {() => {
                      setBelCode([code, false])
                    }}
                  >
                    {title}
                  </div>
                ))}
              </div>
              }
            </div>
            <Space width={locals.buttonWidth}/>
            {/* Run */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                ...style.button(runHovered),
              }}
              ref={runButton}
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
          <Helmet>
            <style>{`
              .react-codemirror2 {
                width: 100%;
                flex-grow: 1;
              }

              .CodeMirror {
                height: 100%;
                background: inherit;
                color: inherit;
                font-family: inherit;
                padding: 0 15px 15px 0;
                z-index: 0;
              }

              .CodeMirror-cursor {
                border-left: 1px solid ${solarized.light.fg};
              }

              .CodeMirror-lines {
                padding-top: 15px;
              }
            `}</style>
          </Helmet>
          <CodeMirror
            value={belCode}
            options={{
              lineNumbers: true,
            }}
            onBeforeChange={(_editor, _data, value) => {
              setBelCode([value, false])
            }}
          />
          {/* <textarea
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
          </textarea> */}
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
                  return <div style={{marginTop: 0, whiteSpace: "pre-wrap"}} key={index}>{text}</div>
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
