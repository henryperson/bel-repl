import CodeMirror from 'codemirror'

CodeMirror.defineMode("bel", () => {
    // Regex for characters
    const characterRE = new RegExp(`\\\\(${escapeChars.join("|")}|.)`)
    // Regexs for numbers
    const numberRE = (() => {
        const real = String.raw`(([0-9]+\/[0-9]+)|([0-9]*\.?[0-9]+))`
        const imaginary = `(${real}i)`
        const complex = `(${real}[+-]${imaginary})`
        return new RegExp(`[+-]?(${complex}|${imaginary}|${real})`)
    })()
    const simpleSymbolRE = (() => {
        const word = "[\\w$%&*+\\-/<=>?@^_{}]+"
        return new RegExp(`¦(${word})¦|(${word})`)
    })()

    const token = {
        pair: "operator",
        comment: "comment",
        misc: "quote",
        sharedList: "variable-2",
        string: "string",
        squareBracket: "bracket",
        character: "string-2",
        number: "number",
        symbol: {
            constant: "number",
            primitive: "keyword",
            builtInVar: "meta",
            specialForm: "special",
            predefinedOp: "property",
            underscore: "bracket",
            userDefined: null,
        },
        intraSymbolOperator: null,
    }

    const defaultMode = (stream, state) => {
        if (stream.eatSpace()) {
            return null
        }
        // Pair syntax
        if (stream.match(/[()]|\. /)) {
            return token.pair
        }
        // Comments
        if (stream.match(/;.*/)) {
            return token.comment
        }
        // Misc
        if (stream.match(/,@|,|`|'/)) {
            return token.misc
        }
        // Shared list
        if (stream.match(/#[0-9]+=?/)) {
            return token.sharedList
        }
        // Strings
        if (stream.match(/"/)) {
            state.stringMode = true
            return token.string
        }
        // Function literals
        if (stream.eat(/\[/)) {
            state.literalDepth += 1
            return token.squareBracket
        }
        if (stream.eat(/\]/)) {
            if (state.literalDepth > 0) {
                state.literalDepth -= 1
            }
            return token.squareBracket
        }
        // Characters
        if (stream.match(characterRE)) {
            return token.character
        }
        // Numbers
        if (stream.match(numberRE)) {
            if (stream.eat(/\w/)) {
                stream.backUp(stream.current().length)
            } else {
                return token.number
            }
        }
        // Symbols
        const res = stream.match(simpleSymbolRE)
        if (res) {
            const word = res[1] || res[2]
            switch (true) {
                case constants.has(word):
                    return token.symbol.constant
                case primitives.has(word):
                    return token.symbol.primitive
                case builtInVars.has(word):
                    return token.symbol.builtInVar
                case specialForms.has(word):
                    return token.symbol.specialForm
                case predefinedOps.has(word):
                    return token.symbol.predefinedOp
                case word === "_" && state.literalDepth > 0:
                    return token.symbol.underscore
                default:
                    return token.symbol.userDefined
            }
        }
        // Symbols
        if (stream.eat(/¦/)) {
            state.complexSymbolMode = true
            return token.symbol.userDefined
        }
        if (stream.eat(/\.|!|:|~|\|/)) {
            return token.intraSymbolOperator
        }
        stream.next()
        return null
    }
    const stringMode = (stream, state) => {
        if (stream.eat(/"/)) {
            state.stringMode = false
            return token.string
        }
        if (stream.match(characterRE)) {
            return token.character
        }
        stream.next()
        return token.string
    }
    const complexSymbolMode = (stream, state) => {
        if (stream.eat(/¦/)) {
            state.complexSymbolMode = false
        } else {
            stream.next()
        }
        return token.symbol.userDefined
    }
    return {
        startState: () => ({
            stringMode: false,
            complexSymbolMode: false,
            counter: 0,
            literalDepth: 0,
        }),
        token: (stream, state) => {
            if (state.stringMode) {
                return stringMode(stream, state)
            } else if (state.complexSymbolMode) {
                return complexSymbolMode(stream, state)
            } else {
                return defaultMode(stream, state)
            }
        }
    }
})

const escapeChars = [
    "tab",
    "nul",
    "soh",
    "stx",
    "etx",
    "eot",
    "enq",
    "ack",
    "bel",
    "dle",
    "dc1",
    "dc2",
    "dc3",
    "dc4",
    "nak",
    "syn",
    "etb",
    "can",
    "del",
    "sub",
    "esc",
    "em",
    "fs",
    "gs",
    "rs",
    "us",
    "sp",
    "bs",
    "ht",
    "lf",
    "vt",
    "ff",
    "cr",
    "so",
    "si",
]

const constants = new Set(["t", "o", "nil"])
const primitives = new Set(["id", "join", "car", "cdr", "type", "xar", "xdr", "sym", "nom", "wrb", "rdb", "ops", "cls", "stat", "coin", "sys"])
const builtInVars = new Set(["chars", "globe", "scope", "ins", "outs"])
const specialForms = new Set(["quote", "lit", "if", "apply", "where", "din", "after", "ccc", "thread"])

const predefinedOps = new Set([
    "readas",
    "inst",
    "make",
    "tem",
    "templates",
    "tabrem",
    "tabloc",
    "tabref",
    "table",
    "aref",
    "array",
    "prs",
    "record",
    "readall",
    "to",
    "from",
    "withfile",
    "round",
    "min",
    "max",
    "best",
    "sort",
    "insert",
    "dedup",
    "pushnew",
    "adjoin",
    "swap",
    "clean",
    "pop",
    "wipe",
    "rand",
    "randlen",
    "clog2",
    "^w",
    "drain",
    "nof",
    "accum",
    "poll",
    "repeat",
    "for",
    "til",
    "while",
    "loop",
    "whilet",
    "mod",
    "ceil",
    "only",
    "trap",
    "part",
    "flip",
    "each",
    "awhen",
    "whenlet",
    "cut",
    "catch",
    "first",
    "nchar",
    "drop",
    "prnice",
    "pr",
    "prn",
    "prelts",
    "prpair",
    "intchar",
    "irep",
    "rrep",
    "prnum",
    "prsymbol",
    "prsimple",
    "presc",
    "prstring",
    "ustring",
    "prc",
    "cells",
    "namedups",
    "print",
    "bqexpair",
    "bqthru",
    "bqex",
    "parseno",
    "parsecom",
    "parseslist",
    "parset",
    "charint",
    "parseint",
    "parsed",
    "parsesr",
    "parsei",
    "validd",
    "validr",
    "validi",
    "parseword",
    "rdword",
    "rdtarget",
    "rddelim",
    "rdwrap",
    "namecs",
    "hard-rdex",
    "rddot",
    "rdlist",
    "syn",
    "syntax",
    "charstil",
    "eatwhite",
    "rdex",
    "saferead",
    "read",
    "source",
    "intrac",
    "signc",
    "breakc",
    "digit",
    "bbuf",
    "rdc",
    "peek",
    "close",
    "open",
    "cbuf",
    "pull",
    "push",
    "--",
    "++",
    "zap",
    "deq",
    "enq",
    "newq",
    "last",
    "lastcdr",
    "dock",
    "tail",
    "atomic",
    "bind",
    "withs",
    "check",
    "consif",
    "gets",
    "do1",
    "simple",
    "dups",
    "tokens",
    "whitec",
    "runs",
    "wait",
    "afn",
    "rfn",
    "yc",
    "pint",
    "whole",
    "int",
    "com",
    "comfns",
    "bin<",
    "list<",
    "charn",
    "len",
    "pos",
    "dec",
    "inc",
    "/",
    "buildnum",
    "common",
    "factor",
    "simplify",
    "abs",
    "inv",
    "real",
    "ipart",
    "rpart",
    "numi",
    "numr",
    "litnum",
    "c*",
    "c+",
    "srden",
    "srnum",
    "sr<",
    "srrecip",
    "sr/",
    "sr*",
    "srinv",
    "sr-",
    "sr+",
    "srone",
    "srzero",
    "r/",
    "r*",
    "r-",
    "r+",
    "i^",
    "i/",
    "i*",
    "i-",
    "i+",
    "i<",
    "i16",
    "i10",
    "i2",
    "i1",
    "i0",
    "unless",
    "when",
    "split",
    "match",
    "pcase",
    "letu",
    "fuse",
    "pairwise",
    "upon",
    "of",
    "foldr",
    "foldl",
    "cor",
    "cand",
    "combine",
    "compose",
    "con",
    "function",
    "protected",
    "applycont",
    "destructure",
    "typecheck",
    "pass",
    "applyclo",
    "applyprim",
    "prims",
    "oktoparm",
    "okparms",
    "okstack",
    "okenv",
    "loc",
    "locfns",
    "vir",
    "virfns",
    "applylit",
    "applyf",
    "applym",
    "evcall2",
    "evcall",
    "dyn2",
    "if2",
    "parameters",
    "formfn",
    "form",
    "forms",
    "evmark",
    "fu",
    "sigerr",
    "binding",
    "lookup",
    "inwhere",
    "smark",
    "vref",
    "ev",
    "sched",
    "mev",
    "bel",
    "isa",
    "variable",
    "literal",
    "safe",
    "onerr",
    "eif",
    "is",
    "idfn",
    "udrop",
    "snap",
    "rev",
    "put",
    "get",
    "rem",
    "keep",
    "with",
    "hug",
    "caris",
    "begins",
    "find",
    "aif",
    "iflet",
    "case",
    "caddr",
    "cddr",
    "cadr",
    "in",
    "mem",
    "string",
    "proper",
    "stream",
    "char",
    "pair",
    "symbol",
    "macro",
    "let",
    "do",
    "uvar",
    "map",
    "list",
    "snoc",
    "reduce",
    "some",
    "all",
    "atom",
    "vmark",
    "spa",
    "spd",
    "+",
    "-",
    "*",
    "recip",
    "odd",
    "even",
    ">",
    ">=",
    "<",
    "<=",
    "=",
    "cons",
    "append",
    "nth",
    "bitc",
    "parsenum",
    "floor",
    "number",
    "load",
    "no",
    "debug",
    "time",
    "set",
    "def",
    "mac",
    "bquote",
    "comma",
    "comma-at",
    "splice",
    "or",
    "and",
    "fn",
])
