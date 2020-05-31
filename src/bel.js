import CodeMirror from 'codemirror'

CodeMirror.defineMode("bel", () => {
    return {
        token: (stream, state) => {
            stream.eatSpace()
            if (stream.eat(/[\(\)]/)) {
                return null
            }
            const real = String.raw`(([0-9]+\/[0-9]+)|([0-9]*\.?[0-9]+))`
            const imaginary = `(${real}?i)`
            const complex = `(${real}[+-]${imaginary})`
            const re = new RegExp(`[+-]?(${complex}|${imaginary}|${real})`)
            if (stream.match(re)) {
                return "number"
            }
            stream.next()
            return null
        }
    }
})