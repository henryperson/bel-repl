(this["webpackJsonpchime-playground"]=this["webpackJsonpchime-playground"]||[]).push([[0],{13:function(e,t,n){e.exports=n(25)},18:function(e,t,n){},19:function(e,t,n){},25:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),o=n(10),l=n.n(o),u=(n(18),n(8)),i=n(7),c=n(2),s=(n(19),n(11)),p=n(12),d="https://repl-api.bel-chime.com/stateful-long",b={base03:"#002b36",base02:"#073642",base01:"#586e75",base00:"#657b83",base0:"#839496",base1:"#93a1a1",base2:"#eee8d5",base3:"#fdf6e3",yellow:"#b58900",orange:"#cb4b16",red:"#dc322f",magenta:"#d33682",violet:"#6c71c4",blue:"#268bd2",cyan:"#2aa198",green:"#859900"},f=Object(c.a)({light:{fg:b.base00,bg:b.base3,hl:b.base2,emph:b.base01,comment:b.base1},dark:{fg:b.base0,bg:b.base03,hl:b.base02,emph:b.base1,comment:b.base01}},b),h={bar:{height:"50px",width:"100%",display:"flex",alignItems:"center",padding:"15px"},barTitle:{textTransform:"uppercase"},panel:{display:"flex",width:"50%",flexDirection:"column"},body:{flexGrow:1,fontFamily:'Monaco, Menlo, "Courier New", monospace',fontSize:"14px",display:"flex"}};function m(e){return r.a.createElement("div",{style:e})}var g=function(){var e=r.a.useState('(prn "Hello World!")'),t=Object(i.a)(e,2),n=t[0],a=t[1],o=r.a.useState({output:[],replInput:"",requestOutstanding:!1,replState:""}),l=Object(i.a)(o,2),b=l[0],g=b.output,y=b.replInput,v=b.requestOutstanding,x=b.replState,w=l[1],E=r.a.useRef(null);return r.a.useEffect((function(){var e;v||(null===(e=E.current)||void 0===e||e.focus())}),[E,v]),r.a.createElement("div",{style:{display:"flex",height:"100vh",width:"100vw"}},r.a.createElement("div",{style:Object(c.a)({color:f.light.fg},h.panel)},r.a.createElement("div",{style:Object(c.a)({background:f.light.hl,justifyContent:"space-between"},h.bar)},r.a.createElement("span",{style:h.barTitle},"editor"),r.a.createElement("div",{style:{textTransform:"uppercase",display:"flex",alignItems:"center",cursor:"pointer"},onClick:function(){w((function(e){return{replInput:"",requestOutstanding:!0,output:e.output,replState:x}})),fetch(d,{method:"POST",body:JSON.stringify({expr:n,state:""})}).then((function(e){return e.json()})).then((function(e){var t=e.result,n=e.state;return w({output:[{type:"output",text:t}],replInput:"",requestOutstanding:!1,replState:n})}))}},"run ",r.a.createElement(m,{width:"7px"}),r.a.createElement(s.a,{style:{fontSize:"small"},icon:p.a}))),r.a.createElement("div",{style:h.body},r.a.createElement("textarea",{value:n,onChange:function(e){return a(e.target.value)},style:{resize:"none",width:"100%",height:"100%",flexGrow:1,background:f.light.bg,border:"none",outline:"none",fontSize:"inherit",padding:"15px",color:"inherit"},spellCheck:"false"}))),r.a.createElement("div",{style:Object(c.a)({color:f.dark.fg},h.panel)},r.a.createElement("div",{style:Object(c.a)({background:f.dark.hl},h.bar)},r.a.createElement("span",{style:{textTransform:"uppercase"}},"repl")),r.a.createElement("div",{style:Object(c.a)({background:f.dark.bg},h.body)},r.a.createElement("div",{style:{padding:"15px",width:"100%"}},g.map((function(e,t){var n=e.type,a=e.text;switch(n){case"input":return r.a.createElement("div",{key:t},"> ",a);case"output":return r.a.createElement("div",{key:t},a);default:return function(e){throw new Error("Unexpected object: "+e)}(n)}})),r.a.createElement("div",{style:{display:"flex"}},v?null:r.a.createElement(r.a.Fragment,null,">\xa0 ",r.a.createElement("textarea",{rows:1,value:y,ref:E,onChange:function(e){var t=e.target.value;w((function(e){return Object(c.a)({},e,{replInput:t})}))},onKeyDown:function(e){13===e.keyCode&&(e.preventDefault(),w((function(e){var t=e.output;return{output:[].concat(Object(u.a)(t),[{type:"input",text:y}]),replInput:"",requestOutstanding:!0,replState:""}})),fetch(d,{method:"POST",body:JSON.stringify({expr:y,state:x})}).then((function(e){return e.json()})).then((function(e){var t=e.result,n=e.state;return w((function(e){var a=e.output;return{output:[].concat(Object(u.a)(a),[{type:"output",text:t}]),requestOutstanding:!1,replInput:"",replState:n}}))})))},style:{flex:"1",background:f.dark.bg,border:"none",outline:"none",resize:"none",fontSize:"inherit",padding:"0",color:"inherit"},spellCheck:"false"})))))))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(g,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[13,1,2]]]);
//# sourceMappingURL=main.cd4ce1dd.chunk.js.map