// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
window.parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"I2x8":[function(require,module,exports) {
'use strict';
/*::
export type AST = Element[]
export type Element = string | Placeholder
export type Placeholder = Plural | Styled | Typed | Simple
export type Plural = [ string, 'plural' | 'selectordinal', number, SubMessages ]
export type Styled = [ string, string, string | SubMessages ]
export type Typed = [ string, string ]
export type Simple = [ string ]
export type SubMessages = { [string]: AST }
export type Token = [ TokenType, string ]
export type TokenType = 'text' | 'space' | 'id' | 'type' | 'style' | 'offset' | 'number' | 'selector' | 'syntax'
type Context = {|
  pattern: string,
  index: number,
  tagsType: ?string,
  tokens: ?Token[]
|}
*/

var ARG_OPN = '{';
var ARG_CLS = '}';
var ARG_SEP = ',';
var NUM_ARG = '#';
var TAG_OPN = '<';
var TAG_CLS = '>';
var TAG_END = '</';
var TAG_SELF_CLS = '/>';
var ESC = '\'';
var OFFSET = 'offset:';
var simpleTypes = ['number', 'date', 'time', 'ordinal', 'duration', 'spellout'];
var submTypes = ['plural', 'select', 'selectordinal'];
/**
 * parse
 *
 * Turns this:
 *  `You have { numBananas, plural,
 *       =0 {no bananas}
 *      one {a banana}
 *    other {# bananas}
 *  } for sale`
 *
 * into this:
 *  [ "You have ", [ "numBananas", "plural", 0, {
 *       "=0": [ "no bananas" ],
 *      "one": [ "a banana" ],
 *    "other": [ [ '#' ], " bananas" ]
 *  } ], " for sale." ]
 *
 * tokens:
 *  [
 *    [ "text", "You have " ],
 *    [ "syntax", "{" ],
 *    [ "space", " " ],
 *    [ "id", "numBananas" ],
 *    [ "syntax", ", " ],
 *    [ "space", " " ],
 *    [ "type", "plural" ],
 *    [ "syntax", "," ],
 *    [ "space", "\n     " ],
 *    [ "selector", "=0" ],
 *    [ "space", " " ],
 *    [ "syntax", "{" ],
 *    [ "text", "no bananas" ],
 *    [ "syntax", "}" ],
 *    [ "space", "\n    " ],
 *    [ "selector", "one" ],
 *    [ "space", " " ],
 *    [ "syntax", "{" ],
 *    [ "text", "a banana" ],
 *    [ "syntax", "}" ],
 *    [ "space", "\n  " ],
 *    [ "selector", "other" ],
 *    [ "space", " " ],
 *    [ "syntax", "{" ],
 *    [ "syntax", "#" ],
 *    [ "text", " bananas" ],
 *    [ "syntax", "}" ],
 *    [ "space", "\n" ],
 *    [ "syntax", "}" ],
 *    [ "text", " for sale." ]
 *  ]
 **/

exports = module.exports = function parse(pattern
/*: string */
, options
/*:: ?: { tagsType?: string, tokens?: Token[] } */
)
/*: AST */
{
  return parseAST({
    pattern: String(pattern),
    index: 0,
    tagsType: options && options.tagsType || null,
    tokens: options && options.tokens || null
  }, '');
};

function parseAST(current
/*: Context */
, parentType
/*: string */
)
/*: AST */
{
  var pattern = current.pattern;
  var length = pattern.length;
  var elements
  /*: AST */
  = [];
  var start = current.index;
  var text = parseText(current, parentType);
  if (text) elements.push(text);
  if (text && current.tokens) current.tokens.push(['text', pattern.slice(start, current.index)]);

  while (current.index < length) {
    if (pattern[current.index] === ARG_CLS) {
      if (!parentType) throw expected(current);
      break;
    }

    if (parentType && current.tagsType && pattern.slice(current.index, current.index + TAG_END.length) === TAG_END) break;
    elements.push(parsePlaceholder(current));
    start = current.index;
    text = parseText(current, parentType);
    if (text) elements.push(text);
    if (text && current.tokens) current.tokens.push(['text', pattern.slice(start, current.index)]);
  }

  return elements;
}

function parseText(current
/*: Context */
, parentType
/*: string */
)
/*: string */
{
  var pattern = current.pattern;
  var length = pattern.length;
  var isHashSpecial = parentType === 'plural' || parentType === 'selectordinal';
  var isAngleSpecial = !!current.tagsType;
  var isArgStyle = parentType === '{style}';
  var text = '';

  while (current.index < length) {
    var char = pattern[current.index];

    if (char === ARG_OPN || char === ARG_CLS || isHashSpecial && char === NUM_ARG || isAngleSpecial && char === TAG_OPN || isArgStyle && isWhitespace(char.charCodeAt(0))) {
      break;
    } else if (char === ESC) {
      char = pattern[++current.index];

      if (char === ESC) {
        // double is always 1 '
        text += char;
        ++current.index;
      } else if ( // only when necessary
      char === ARG_OPN || char === ARG_CLS || isHashSpecial && char === NUM_ARG || isAngleSpecial && char === TAG_OPN || isArgStyle) {
        text += char;

        while (++current.index < length) {
          char = pattern[current.index];

          if (char === ESC && pattern[current.index + 1] === ESC) {
            // double is always 1 '
            text += ESC;
            ++current.index;
          } else if (char === ESC) {
            // end of quoted
            ++current.index;
            break;
          } else {
            text += char;
          }
        }
      } else {
        // lone ' is just a '
        text += ESC; // already incremented
      }
    } else {
      text += char;
      ++current.index;
    }
  }

  return text;
}

function isWhitespace(code
/*: number */
)
/*: boolean */
{
  return code >= 0x09 && code <= 0x0D || code === 0x20 || code === 0x85 || code === 0xA0 || code === 0x180E || code >= 0x2000 && code <= 0x200D || code === 0x2028 || code === 0x2029 || code === 0x202F || code === 0x205F || code === 0x2060 || code === 0x3000 || code === 0xFEFF;
}

function skipWhitespace(current
/*: Context */
)
/*: void */
{
  var pattern = current.pattern;
  var length = pattern.length;
  var start = current.index;

  while (current.index < length && isWhitespace(pattern.charCodeAt(current.index))) {
    ++current.index;
  }

  if (start < current.index && current.tokens) {
    current.tokens.push(['space', current.pattern.slice(start, current.index)]);
  }
}

function parsePlaceholder(current
/*: Context */
)
/*: Placeholder */
{
  var pattern = current.pattern;

  if (pattern[current.index] === NUM_ARG) {
    if (current.tokens) current.tokens.push(['syntax', NUM_ARG]);
    ++current.index; // move passed #

    return [NUM_ARG];
  }

  var tag = parseTag(current);
  if (tag) return tag;
  /* istanbul ignore if should be unreachable if parseAST and parseText are right */

  if (pattern[current.index] !== ARG_OPN) throw expected(current, ARG_OPN);
  if (current.tokens) current.tokens.push(['syntax', ARG_OPN]);
  ++current.index; // move passed {

  skipWhitespace(current);
  var id = parseId(current);
  if (!id) throw expected(current, 'placeholder id');
  if (current.tokens) current.tokens.push(['id', id]);
  skipWhitespace(current);
  var char = pattern[current.index];

  if (char === ARG_CLS) {
    // end placeholder
    if (current.tokens) current.tokens.push(['syntax', ARG_CLS]);
    ++current.index; // move passed }

    return [id];
  }

  if (char !== ARG_SEP) throw expected(current, ARG_SEP + ' or ' + ARG_CLS);
  if (current.tokens) current.tokens.push(['syntax', ARG_SEP]);
  ++current.index; // move passed ,

  skipWhitespace(current);
  var type = parseId(current);
  if (!type) throw expected(current, 'placeholder type');
  if (current.tokens) current.tokens.push(['type', type]);
  skipWhitespace(current);
  char = pattern[current.index];

  if (char === ARG_CLS) {
    // end placeholder
    if (current.tokens) current.tokens.push(['syntax', ARG_CLS]);

    if (type === 'plural' || type === 'selectordinal' || type === 'select') {
      throw expected(current, type + ' sub-messages');
    }

    ++current.index; // move passed }

    return [id, type];
  }

  if (char !== ARG_SEP) throw expected(current, ARG_SEP + ' or ' + ARG_CLS);
  if (current.tokens) current.tokens.push(['syntax', ARG_SEP]);
  ++current.index; // move passed ,

  skipWhitespace(current);
  var arg;

  if (type === 'plural' || type === 'selectordinal') {
    var offset = parsePluralOffset(current);
    skipWhitespace(current);
    arg = [id, type, offset, parseSubMessages(current, type)];
  } else if (type === 'select') {
    arg = [id, type, parseSubMessages(current, type)];
  } else if (simpleTypes.indexOf(type) >= 0) {
    arg = [id, type, parseSimpleFormat(current)];
  } else {
    // custom placeholder type
    var index = current.index;
    var format
    /*: string | SubMessages */
    = parseSimpleFormat(current);
    skipWhitespace(current);

    if (pattern[current.index] === ARG_OPN) {
      current.index = index; // rewind, since should have been submessages

      format = parseSubMessages(current, type);
    }

    arg = [id, type, format];
  }

  skipWhitespace(current);
  if (pattern[current.index] !== ARG_CLS) throw expected(current, ARG_CLS);
  if (current.tokens) current.tokens.push(['syntax', ARG_CLS]);
  ++current.index; // move passed }

  return arg;
}

function parseTag(current
/*: Context */
)
/*: ?Placeholder */
{
  var tagsType = current.tagsType;
  if (!tagsType || current.pattern[current.index] !== TAG_OPN) return;

  if (current.pattern.slice(current.index, current.index + TAG_END.length) === TAG_END) {
    throw expected(current, null, 'closing tag without matching opening tag');
  }

  if (current.tokens) current.tokens.push(['syntax', TAG_OPN]);
  ++current.index; // move passed <

  var id = parseId(current, true);
  if (!id) throw expected(current, 'placeholder id');
  if (current.tokens) current.tokens.push(['id', id]);
  skipWhitespace(current);

  if (current.pattern.slice(current.index, current.index + TAG_SELF_CLS.length) === TAG_SELF_CLS) {
    if (current.tokens) current.tokens.push(['syntax', TAG_SELF_CLS]);
    current.index += TAG_SELF_CLS.length;
    return [id, tagsType];
  }

  if (current.pattern[current.index] !== TAG_CLS) throw expected(current, TAG_CLS);
  if (current.tokens) current.tokens.push(['syntax', TAG_CLS]);
  ++current.index; // move passed >

  var children = parseAST(current, tagsType);
  var end = current.index;
  if (current.pattern.slice(current.index, current.index + TAG_END.length) !== TAG_END) throw expected(current, TAG_END + id + TAG_CLS);
  if (current.tokens) current.tokens.push(['syntax', TAG_END]);
  current.index += TAG_END.length;
  var closeId = parseId(current, true);
  if (closeId && current.tokens) current.tokens.push(['id', closeId]);

  if (id !== closeId) {
    current.index = end; // rewind for better error message

    throw expected(current, TAG_END + id + TAG_CLS, TAG_END + closeId + TAG_CLS);
  }

  skipWhitespace(current);
  if (current.pattern[current.index] !== TAG_CLS) throw expected(current, TAG_CLS);
  if (current.tokens) current.tokens.push(['syntax', TAG_CLS]);
  ++current.index; // move passed >

  return [id, tagsType, {
    children: children
  }];
}

function parseId(current
/*: Context */
, isTag
/*:: ?: boolean */
)
/*: string */
{
  var pattern = current.pattern;
  var length = pattern.length;
  var id = '';

  while (current.index < length) {
    var char = pattern[current.index];
    if (char === ARG_OPN || char === ARG_CLS || char === ARG_SEP || char === NUM_ARG || char === ESC || isWhitespace(char.charCodeAt(0)) || isTag && (char === TAG_OPN || char === TAG_CLS || char === '/')) break;
    id += char;
    ++current.index;
  }

  return id;
}

function parseSimpleFormat(current
/*: Context */
)
/*: string */
{
  var start = current.index;
  var style = parseText(current, '{style}');
  if (!style) throw expected(current, 'placeholder style name');
  if (current.tokens) current.tokens.push(['style', current.pattern.slice(start, current.index)]);
  return style;
}

function parsePluralOffset(current
/*: Context */
)
/*: number */
{
  var pattern = current.pattern;
  var length = pattern.length;
  var offset = 0;

  if (pattern.slice(current.index, current.index + OFFSET.length) === OFFSET) {
    if (current.tokens) current.tokens.push(['offset', 'offset'], ['syntax', ':']);
    current.index += OFFSET.length; // move passed offset:

    skipWhitespace(current);
    var start = current.index;

    while (current.index < length && isDigit(pattern.charCodeAt(current.index))) {
      ++current.index;
    }

    if (start === current.index) throw expected(current, 'offset number');
    if (current.tokens) current.tokens.push(['number', pattern.slice(start, current.index)]);
    offset = +pattern.slice(start, current.index);
  }

  return offset;
}

function isDigit(code
/*: number */
)
/*: boolean */
{
  return code >= 0x30 && code <= 0x39;
}

function parseSubMessages(current
/*: Context */
, parentType
/*: string */
)
/*: SubMessages */
{
  var pattern = current.pattern;
  var length = pattern.length;
  var options
  /*: SubMessages */
  = {};

  while (current.index < length && pattern[current.index] !== ARG_CLS) {
    var selector = parseId(current);
    if (!selector) throw expected(current, 'sub-message selector');
    if (current.tokens) current.tokens.push(['selector', selector]);
    skipWhitespace(current);
    options[selector] = parseSubMessage(current, parentType);
    skipWhitespace(current);
  }

  if (!options.other && submTypes.indexOf(parentType) >= 0) {
    throw expected(current, null, null, '"other" sub-message must be specified in ' + parentType);
  }

  return options;
}

function parseSubMessage(current
/*: Context */
, parentType
/*: string */
)
/*: AST */
{
  if (current.pattern[current.index] !== ARG_OPN) throw expected(current, ARG_OPN + ' to start sub-message');
  if (current.tokens) current.tokens.push(['syntax', ARG_OPN]);
  ++current.index; // move passed {

  var message = parseAST(current, parentType);
  if (current.pattern[current.index] !== ARG_CLS) throw expected(current, ARG_CLS + ' to end sub-message');
  if (current.tokens) current.tokens.push(['syntax', ARG_CLS]);
  ++current.index; // move passed }

  return message;
}

function expected(current
/*: Context */
, expected
/*:: ?: ?string */
, found
/*:: ?: ?string */
, message
/*:: ?: string */
) {
  var pattern = current.pattern;
  var lines = pattern.slice(0, current.index).split(/\r?\n/);
  var offset = current.index;
  var line = lines.length;
  var column = lines.slice(-1)[0].length;
  found = found || (current.index >= pattern.length ? 'end of message pattern' : parseId(current) || pattern[current.index]);
  if (!message) message = errorMessage(expected, found);
  message += ' in ' + pattern.replace(/\r?\n/g, '\n');
  return new SyntaxError(message, expected, found, offset, line, column);
}

function errorMessage(expected
/*: ?string */
, found
/* string */
) {
  if (!expected) return 'Unexpected ' + found + ' found';
  return 'Expected ' + expected + ' but found ' + found;
}
/**
 * SyntaxError
 *  Holds information about bad syntax found in a message pattern
 **/


function SyntaxError(message
/*: string */
, expected
/*: ?string */
, found
/*: ?string */
, offset
/*: number */
, line
/*: number */
, column
/*: number */
) {
  Error.call(this, message);
  this.name = 'SyntaxError';
  this.message = message;
  this.expected = expected;
  this.found = found;
  this.offset = offset;
  this.line = line;
  this.column = column;
}

SyntaxError.prototype = Object.create(Error.prototype);
exports.SyntaxError = SyntaxError;
},{}],"84aB":[function(require,module,exports) {
var LONG = 'long';
var SHORT = 'short';
var NARROW = 'narrow';
var NUMERIC = 'numeric';
var TWODIGIT = '2-digit';
/**
 * formatting information
 **/

module.exports = {
  number: {
    decimal: {
      style: 'decimal'
    },
    integer: {
      style: 'decimal',
      maximumFractionDigits: 0
    },
    currency: {
      style: 'currency',
      currency: 'USD'
    },
    percent: {
      style: 'percent'
    },
    default: {
      style: 'decimal'
    }
  },
  date: {
    short: {
      month: NUMERIC,
      day: NUMERIC,
      year: TWODIGIT
    },
    medium: {
      month: SHORT,
      day: NUMERIC,
      year: NUMERIC
    },
    long: {
      month: LONG,
      day: NUMERIC,
      year: NUMERIC
    },
    full: {
      month: LONG,
      day: NUMERIC,
      year: NUMERIC,
      weekday: LONG
    },
    default: {
      month: SHORT,
      day: NUMERIC,
      year: NUMERIC
    }
  },
  time: {
    short: {
      hour: NUMERIC,
      minute: NUMERIC
    },
    medium: {
      hour: NUMERIC,
      minute: NUMERIC,
      second: NUMERIC
    },
    long: {
      hour: NUMERIC,
      minute: NUMERIC,
      second: NUMERIC,
      timeZoneName: SHORT
    },
    full: {
      hour: NUMERIC,
      minute: NUMERIC,
      second: NUMERIC,
      timeZoneName: SHORT
    },
    default: {
      hour: NUMERIC,
      minute: NUMERIC,
      second: NUMERIC
    }
  },
  duration: {
    default: {
      hours: {
        minimumIntegerDigits: 1,
        maximumFractionDigits: 0
      },
      minutes: {
        minimumIntegerDigits: 2,
        maximumFractionDigits: 0
      },
      seconds: {
        minimumIntegerDigits: 2,
        maximumFractionDigits: 3
      }
    }
  },
  parseNumberPattern: function (pattern
  /*: ?string */
  ) {
    if (!pattern) return;
    var options = {};
    var currency = pattern.match(/\b[A-Z]{3}\b/i);
    var syms = pattern.replace(/[^¤]/g, '').length;
    if (!syms && currency) syms = 1;

    if (syms) {
      options.style = 'currency';
      options.currencyDisplay = syms === 1 ? 'symbol' : syms === 2 ? 'code' : 'name';
      options.currency = currency ? currency[0].toUpperCase() : 'USD';
    } else if (pattern.indexOf('%') >= 0) {
      options.style = 'percent';
    }

    if (!/[@#0]/.test(pattern)) return options.style ? options : undefined;
    options.useGrouping = pattern.indexOf(',') >= 0;

    if (/E\+?[@#0]+/i.test(pattern) || pattern.indexOf('@') >= 0) {
      var size = pattern.replace(/E\+?[@#0]+|[^@#0]/gi, '');
      options.minimumSignificantDigits = Math.min(Math.max(size.replace(/[^@0]/g, '').length, 1), 21);
      options.maximumSignificantDigits = Math.min(Math.max(size.length, 1), 21);
    } else {
      var parts = pattern.replace(/[^#0.]/g, '').split('.');
      var integer = parts[0];
      var n = integer.length - 1;

      while (integer[n] === '0') --n;

      options.minimumIntegerDigits = Math.min(Math.max(integer.length - 1 - n, 1), 21);
      var fraction = parts[1] || '';
      n = 0;

      while (fraction[n] === '0') ++n;

      options.minimumFractionDigits = Math.min(Math.max(n, 0), 20);

      while (fraction[n] === '#') ++n;

      options.maximumFractionDigits = Math.min(Math.max(n, 0), 20);
    }

    return options;
  },
  parseDatePattern: function (pattern
  /*: ?string */
  ) {
    if (!pattern) return;
    var options = {};

    for (var i = 0; i < pattern.length;) {
      var current = pattern[i];
      var n = 1;

      while (pattern[++i] === current) ++n;

      switch (current) {
        case 'G':
          options.era = n === 5 ? NARROW : n === 4 ? LONG : SHORT;
          break;

        case 'y':
        case 'Y':
          options.year = n === 2 ? TWODIGIT : NUMERIC;
          break;

        case 'M':
        case 'L':
          n = Math.min(Math.max(n - 1, 0), 4);
          options.month = [NUMERIC, TWODIGIT, SHORT, LONG, NARROW][n];
          break;

        case 'E':
        case 'e':
        case 'c':
          options.weekday = n === 5 ? NARROW : n === 4 ? LONG : SHORT;
          break;

        case 'd':
        case 'D':
          options.day = n === 2 ? TWODIGIT : NUMERIC;
          break;

        case 'h':
        case 'K':
          options.hour12 = true;
          options.hour = n === 2 ? TWODIGIT : NUMERIC;
          break;

        case 'H':
        case 'k':
          options.hour12 = false;
          options.hour = n === 2 ? TWODIGIT : NUMERIC;
          break;

        case 'm':
          options.minute = n === 2 ? TWODIGIT : NUMERIC;
          break;

        case 's':
        case 'S':
          options.second = n === 2 ? TWODIGIT : NUMERIC;
          break;

        case 'z':
        case 'Z':
        case 'v':
        case 'V':
          options.timeZoneName = n === 1 ? SHORT : LONG;
          break;
      }
    }

    return Object.keys(options).length ? options : undefined;
  }
};
},{}],"+I8B":[function(require,module,exports) {
// "lookup" algorithm http://tools.ietf.org/html/rfc4647#section-3.4
// assumes normalized language tags, and matches in a case sensitive manner
module.exports = function lookupClosestLocale(locale
/*: string | string[] | void */
, available
/*: { [string]: any } */
)
/*: ?string */
{
  if (typeof locale === 'string' && available[locale]) return locale;
  var locales = [].concat(locale || []);

  for (var l = 0, ll = locales.length; l < ll; ++l) {
    var current = locales[l].split('-');

    while (current.length) {
      var candidate = current.join('-');
      if (available[candidate]) return candidate;
      current.pop();
    }
  }
};
},{}],"AlWV":[function(require,module,exports) {
'use strict';
/*:: export type Rule = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other' */

var zero = 'zero',
    one = 'one',
    two = 'two',
    few = 'few',
    many = 'many',
    other = 'other';
var f = [function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 1 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return 0 <= n && n <= 1 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var n = +s;
  return i === 0 || n === 1 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 0 ? zero : n === 1 ? one : n === 2 ? two : 3 <= n % 100 && n % 100 <= 10 ? few : 11 <= n % 100 && n % 100 <= 99 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var v = (s + '.').split('.')[1].length;
  return i === 1 && v === 0 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n % 10 === 1 && n % 100 !== 11 ? one : 2 <= n % 10 && n % 10 <= 4 && (n % 100 < 12 || 14 < n % 100) ? few : n % 10 === 0 || 5 <= n % 10 && n % 10 <= 9 || 11 <= n % 100 && n % 100 <= 14 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n % 10 === 1 && n % 100 !== 11 && n % 100 !== 71 && n % 100 !== 91 ? one : n % 10 === 2 && n % 100 !== 12 && n % 100 !== 72 && n % 100 !== 92 ? two : (3 <= n % 10 && n % 10 <= 4 || n % 10 === 9) && (n % 100 < 10 || 19 < n % 100) && (n % 100 < 70 || 79 < n % 100) && (n % 100 < 90 || 99 < n % 100) ? few : n !== 0 && n % 1000000 === 0 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var v = (s + '.').split('.')[1].length;
  var f = +(s + '.').split('.')[1];
  return v === 0 && i % 10 === 1 && i % 100 !== 11 || f % 10 === 1 && f % 100 !== 11 ? one : v === 0 && 2 <= i % 10 && i % 10 <= 4 && (i % 100 < 12 || 14 < i % 100) || 2 <= f % 10 && f % 10 <= 4 && (f % 100 < 12 || 14 < f % 100) ? few : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var v = (s + '.').split('.')[1].length;
  return i === 1 && v === 0 ? one : 2 <= i && i <= 4 && v === 0 ? few : v !== 0 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 0 ? zero : n === 1 ? one : n === 2 ? two : n === 3 ? few : n === 6 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var t = +('' + s).replace(/^[^.]*.?|0+$/g, '');
  var n = +s;
  return n === 1 || t !== 0 && (i === 0 || i === 1) ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var v = (s + '.').split('.')[1].length;
  var f = +(s + '.').split('.')[1];
  return v === 0 && i % 100 === 1 || f % 100 === 1 ? one : v === 0 && i % 100 === 2 || f % 100 === 2 ? two : v === 0 && 3 <= i % 100 && i % 100 <= 4 || 3 <= f % 100 && f % 100 <= 4 ? few : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  return i === 0 || i === 1 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var v = (s + '.').split('.')[1].length;
  var f = +(s + '.').split('.')[1];
  return v === 0 && (i === 1 || i === 2 || i === 3) || v === 0 && i % 10 !== 4 && i % 10 !== 6 && i % 10 !== 9 || v !== 0 && f % 10 !== 4 && f % 10 !== 6 && f % 10 !== 9 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 1 ? one : n === 2 ? two : 3 <= n && n <= 6 ? few : 7 <= n && n <= 10 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 1 || n === 11 ? one : n === 2 || n === 12 ? two : 3 <= n && n <= 10 || 13 <= n && n <= 19 ? few : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var v = (s + '.').split('.')[1].length;
  return v === 0 && i % 10 === 1 ? one : v === 0 && i % 10 === 2 ? two : v === 0 && (i % 100 === 0 || i % 100 === 20 || i % 100 === 40 || i % 100 === 60 || i % 100 === 80) ? few : v !== 0 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var v = (s + '.').split('.')[1].length;
  var n = +s;
  return i === 1 && v === 0 ? one : i === 2 && v === 0 ? two : v === 0 && (n < 0 || 10 < n) && n % 10 === 0 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var t = +('' + s).replace(/^[^.]*.?|0+$/g, '');
  return t === 0 && i % 10 === 1 && i % 100 !== 11 || t !== 0 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 1 ? one : n === 2 ? two : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 0 ? zero : n === 1 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var n = +s;
  return n === 0 ? zero : (i === 0 || i === 1) && n !== 0 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var f = +(s + '.').split('.')[1];
  var n = +s;
  return n % 10 === 1 && (n % 100 < 11 || 19 < n % 100) ? one : 2 <= n % 10 && n % 10 <= 9 && (n % 100 < 11 || 19 < n % 100) ? few : f !== 0 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var v = (s + '.').split('.')[1].length;
  var f = +(s + '.').split('.')[1];
  var n = +s;
  return n % 10 === 0 || 11 <= n % 100 && n % 100 <= 19 || v === 2 && 11 <= f % 100 && f % 100 <= 19 ? zero : n % 10 === 1 && n % 100 !== 11 || v === 2 && f % 10 === 1 && f % 100 !== 11 || v !== 2 && f % 10 === 1 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var v = (s + '.').split('.')[1].length;
  var f = +(s + '.').split('.')[1];
  return v === 0 && i % 10 === 1 && i % 100 !== 11 || f % 10 === 1 && f % 100 !== 11 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var v = (s + '.').split('.')[1].length;
  var n = +s;
  return i === 1 && v === 0 ? one : v !== 0 || n === 0 || n !== 1 && 1 <= n % 100 && n % 100 <= 19 ? few : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 1 ? one : n === 0 || 2 <= n % 100 && n % 100 <= 10 ? few : 11 <= n % 100 && n % 100 <= 19 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var v = (s + '.').split('.')[1].length;
  return i === 1 && v === 0 ? one : v === 0 && 2 <= i % 10 && i % 10 <= 4 && (i % 100 < 12 || 14 < i % 100) ? few : v === 0 && i !== 1 && 0 <= i % 10 && i % 10 <= 1 || v === 0 && 5 <= i % 10 && i % 10 <= 9 || v === 0 && 12 <= i % 100 && i % 100 <= 14 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  return 0 <= i && i <= 1 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var v = (s + '.').split('.')[1].length;
  return v === 0 && i % 10 === 1 && i % 100 !== 11 ? one : v === 0 && 2 <= i % 10 && i % 10 <= 4 && (i % 100 < 12 || 14 < i % 100) ? few : v === 0 && i % 10 === 0 || v === 0 && 5 <= i % 10 && i % 10 <= 9 || v === 0 && 11 <= i % 100 && i % 100 <= 14 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var n = +s;
  return i === 0 || n === 1 ? one : 2 <= n && n <= 10 ? few : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var f = +(s + '.').split('.')[1];
  var n = +s;
  return n === 0 || n === 1 || i === 0 && f === 1 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  var v = (s + '.').split('.')[1].length;
  return v === 0 && i % 100 === 1 ? one : v === 0 && i % 100 === 2 ? two : v === 0 && 3 <= i % 100 && i % 100 <= 4 || v !== 0 ? few : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return 0 <= n && n <= 1 || 11 <= n && n <= 99 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 1 || n === 5 || n === 7 || n === 8 || n === 9 || n === 10 ? one : n === 2 || n === 3 ? two : n === 4 ? few : n === 6 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  return i % 10 === 1 || i % 10 === 2 || i % 10 === 5 || i % 10 === 7 || i % 10 === 8 || i % 100 === 20 || i % 100 === 50 || i % 100 === 70 || i % 100 === 80 ? one : i % 10 === 3 || i % 10 === 4 || i % 1000 === 100 || i % 1000 === 200 || i % 1000 === 300 || i % 1000 === 400 || i % 1000 === 500 || i % 1000 === 600 || i % 1000 === 700 || i % 1000 === 800 || i % 1000 === 900 ? few : i === 0 || i % 10 === 6 || i % 100 === 40 || i % 100 === 60 || i % 100 === 90 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return (n % 10 === 2 || n % 10 === 3) && n % 100 !== 12 && n % 100 !== 13 ? few : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 1 || n === 3 ? one : n === 2 ? two : n === 4 ? few : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 0 || n === 7 || n === 8 || n === 9 ? zero : n === 1 ? one : n === 2 ? two : n === 3 || n === 4 ? few : n === 5 || n === 6 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n % 10 === 1 && n % 100 !== 11 ? one : n % 10 === 2 && n % 100 !== 12 ? two : n % 10 === 3 && n % 100 !== 13 ? few : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 1 ? one : n === 2 || n === 3 ? two : n === 4 ? few : n === 6 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 1 || n === 5 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 11 || n === 8 || n === 80 || n === 800 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  return i === 1 ? one : i === 0 || 2 <= i % 100 && i % 100 <= 20 || i % 100 === 40 || i % 100 === 60 || i % 100 === 80 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n % 10 === 6 || n % 10 === 9 || n % 10 === 0 && n !== 0 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var i = Math.floor(Math.abs(+s));
  return i % 10 === 1 && i % 100 !== 11 ? one : i % 10 === 2 && i % 100 !== 12 ? two : (i % 10 === 7 || i % 10 === 8) && i % 100 !== 17 && i % 100 !== 18 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 1 ? one : n === 2 || n === 3 ? two : n === 4 ? few : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return 1 <= n && n <= 4 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 1 || n === 5 || 7 <= n && n <= 9 ? one : n === 2 || n === 3 ? two : n === 4 ? few : n === 6 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n === 1 ? one : n % 10 === 4 && n % 100 !== 14 ? many : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return (n % 10 === 1 || n % 10 === 2) && n % 100 !== 11 && n % 100 !== 12 ? one : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n % 10 === 6 || n % 10 === 9 || n === 10 ? few : other;
}, function (s
/*: string | number */
)
/*: Rule */
{
  var n = +s;
  return n % 10 === 3 && n % 100 !== 13 ? few : other;
}];
module.exports = {
  af: {
    cardinal: f[0]
  },
  ak: {
    cardinal: f[1]
  },
  am: {
    cardinal: f[2]
  },
  ar: {
    cardinal: f[3]
  },
  ars: {
    cardinal: f[3]
  },
  as: {
    cardinal: f[2],
    ordinal: f[34]
  },
  asa: {
    cardinal: f[0]
  },
  ast: {
    cardinal: f[4]
  },
  az: {
    cardinal: f[0],
    ordinal: f[35]
  },
  be: {
    cardinal: f[5],
    ordinal: f[36]
  },
  bem: {
    cardinal: f[0]
  },
  bez: {
    cardinal: f[0]
  },
  bg: {
    cardinal: f[0]
  },
  bh: {
    cardinal: f[1]
  },
  bn: {
    cardinal: f[2],
    ordinal: f[34]
  },
  br: {
    cardinal: f[6]
  },
  brx: {
    cardinal: f[0]
  },
  bs: {
    cardinal: f[7]
  },
  ca: {
    cardinal: f[4],
    ordinal: f[37]
  },
  ce: {
    cardinal: f[0]
  },
  cgg: {
    cardinal: f[0]
  },
  chr: {
    cardinal: f[0]
  },
  ckb: {
    cardinal: f[0]
  },
  cs: {
    cardinal: f[8]
  },
  cy: {
    cardinal: f[9],
    ordinal: f[38]
  },
  da: {
    cardinal: f[10]
  },
  de: {
    cardinal: f[4]
  },
  dsb: {
    cardinal: f[11]
  },
  dv: {
    cardinal: f[0]
  },
  ee: {
    cardinal: f[0]
  },
  el: {
    cardinal: f[0]
  },
  en: {
    cardinal: f[4],
    ordinal: f[39]
  },
  eo: {
    cardinal: f[0]
  },
  es: {
    cardinal: f[0]
  },
  et: {
    cardinal: f[4]
  },
  eu: {
    cardinal: f[0]
  },
  fa: {
    cardinal: f[2]
  },
  ff: {
    cardinal: f[12]
  },
  fi: {
    cardinal: f[4]
  },
  fil: {
    cardinal: f[13],
    ordinal: f[0]
  },
  fo: {
    cardinal: f[0]
  },
  fr: {
    cardinal: f[12],
    ordinal: f[0]
  },
  fur: {
    cardinal: f[0]
  },
  fy: {
    cardinal: f[4]
  },
  ga: {
    cardinal: f[14],
    ordinal: f[0]
  },
  gd: {
    cardinal: f[15]
  },
  gl: {
    cardinal: f[4]
  },
  gsw: {
    cardinal: f[0]
  },
  gu: {
    cardinal: f[2],
    ordinal: f[40]
  },
  guw: {
    cardinal: f[1]
  },
  gv: {
    cardinal: f[16]
  },
  ha: {
    cardinal: f[0]
  },
  haw: {
    cardinal: f[0]
  },
  he: {
    cardinal: f[17]
  },
  hi: {
    cardinal: f[2],
    ordinal: f[40]
  },
  hr: {
    cardinal: f[7]
  },
  hsb: {
    cardinal: f[11]
  },
  hu: {
    cardinal: f[0],
    ordinal: f[41]
  },
  hy: {
    cardinal: f[12],
    ordinal: f[0]
  },
  io: {
    cardinal: f[4]
  },
  is: {
    cardinal: f[18]
  },
  it: {
    cardinal: f[4],
    ordinal: f[42]
  },
  iu: {
    cardinal: f[19]
  },
  iw: {
    cardinal: f[17]
  },
  jgo: {
    cardinal: f[0]
  },
  ji: {
    cardinal: f[4]
  },
  jmc: {
    cardinal: f[0]
  },
  ka: {
    cardinal: f[0],
    ordinal: f[43]
  },
  kab: {
    cardinal: f[12]
  },
  kaj: {
    cardinal: f[0]
  },
  kcg: {
    cardinal: f[0]
  },
  kk: {
    cardinal: f[0],
    ordinal: f[44]
  },
  kkj: {
    cardinal: f[0]
  },
  kl: {
    cardinal: f[0]
  },
  kn: {
    cardinal: f[2]
  },
  ks: {
    cardinal: f[0]
  },
  ksb: {
    cardinal: f[0]
  },
  ksh: {
    cardinal: f[20]
  },
  ku: {
    cardinal: f[0]
  },
  kw: {
    cardinal: f[19]
  },
  ky: {
    cardinal: f[0]
  },
  lag: {
    cardinal: f[21]
  },
  lb: {
    cardinal: f[0]
  },
  lg: {
    cardinal: f[0]
  },
  ln: {
    cardinal: f[1]
  },
  lt: {
    cardinal: f[22]
  },
  lv: {
    cardinal: f[23]
  },
  mas: {
    cardinal: f[0]
  },
  mg: {
    cardinal: f[1]
  },
  mgo: {
    cardinal: f[0]
  },
  mk: {
    cardinal: f[24],
    ordinal: f[45]
  },
  ml: {
    cardinal: f[0]
  },
  mn: {
    cardinal: f[0]
  },
  mo: {
    cardinal: f[25],
    ordinal: f[0]
  },
  mr: {
    cardinal: f[2],
    ordinal: f[46]
  },
  mt: {
    cardinal: f[26]
  },
  nah: {
    cardinal: f[0]
  },
  naq: {
    cardinal: f[19]
  },
  nb: {
    cardinal: f[0]
  },
  nd: {
    cardinal: f[0]
  },
  ne: {
    cardinal: f[0],
    ordinal: f[47]
  },
  nl: {
    cardinal: f[4]
  },
  nn: {
    cardinal: f[0]
  },
  nnh: {
    cardinal: f[0]
  },
  no: {
    cardinal: f[0]
  },
  nr: {
    cardinal: f[0]
  },
  nso: {
    cardinal: f[1]
  },
  ny: {
    cardinal: f[0]
  },
  nyn: {
    cardinal: f[0]
  },
  om: {
    cardinal: f[0]
  },
  or: {
    cardinal: f[0],
    ordinal: f[48]
  },
  os: {
    cardinal: f[0]
  },
  pa: {
    cardinal: f[1]
  },
  pap: {
    cardinal: f[0]
  },
  pl: {
    cardinal: f[27]
  },
  prg: {
    cardinal: f[23]
  },
  ps: {
    cardinal: f[0]
  },
  pt: {
    cardinal: f[28]
  },
  'pt-PT': {
    cardinal: f[4]
  },
  rm: {
    cardinal: f[0]
  },
  ro: {
    cardinal: f[25],
    ordinal: f[0]
  },
  rof: {
    cardinal: f[0]
  },
  ru: {
    cardinal: f[29]
  },
  rwk: {
    cardinal: f[0]
  },
  saq: {
    cardinal: f[0]
  },
  scn: {
    cardinal: f[4],
    ordinal: f[42]
  },
  sd: {
    cardinal: f[0]
  },
  sdh: {
    cardinal: f[0]
  },
  se: {
    cardinal: f[19]
  },
  seh: {
    cardinal: f[0]
  },
  sh: {
    cardinal: f[7]
  },
  shi: {
    cardinal: f[30]
  },
  si: {
    cardinal: f[31]
  },
  sk: {
    cardinal: f[8]
  },
  sl: {
    cardinal: f[32]
  },
  sma: {
    cardinal: f[19]
  },
  smi: {
    cardinal: f[19]
  },
  smj: {
    cardinal: f[19]
  },
  smn: {
    cardinal: f[19]
  },
  sms: {
    cardinal: f[19]
  },
  sn: {
    cardinal: f[0]
  },
  so: {
    cardinal: f[0]
  },
  sq: {
    cardinal: f[0],
    ordinal: f[49]
  },
  sr: {
    cardinal: f[7]
  },
  ss: {
    cardinal: f[0]
  },
  ssy: {
    cardinal: f[0]
  },
  st: {
    cardinal: f[0]
  },
  sv: {
    cardinal: f[4],
    ordinal: f[50]
  },
  sw: {
    cardinal: f[4]
  },
  syr: {
    cardinal: f[0]
  },
  ta: {
    cardinal: f[0]
  },
  te: {
    cardinal: f[0]
  },
  teo: {
    cardinal: f[0]
  },
  ti: {
    cardinal: f[1]
  },
  tig: {
    cardinal: f[0]
  },
  tk: {
    cardinal: f[0],
    ordinal: f[51]
  },
  tl: {
    cardinal: f[13],
    ordinal: f[0]
  },
  tn: {
    cardinal: f[0]
  },
  tr: {
    cardinal: f[0]
  },
  ts: {
    cardinal: f[0]
  },
  tzm: {
    cardinal: f[33]
  },
  ug: {
    cardinal: f[0]
  },
  uk: {
    cardinal: f[29],
    ordinal: f[52]
  },
  ur: {
    cardinal: f[4]
  },
  uz: {
    cardinal: f[0]
  },
  ve: {
    cardinal: f[0]
  },
  vo: {
    cardinal: f[0]
  },
  vun: {
    cardinal: f[0]
  },
  wa: {
    cardinal: f[1]
  },
  wae: {
    cardinal: f[0]
  },
  xh: {
    cardinal: f[0]
  },
  xog: {
    cardinal: f[0]
  },
  yi: {
    cardinal: f[4]
  },
  zu: {
    cardinal: f[2]
  },
  lo: {
    ordinal: f[0]
  },
  ms: {
    ordinal: f[0]
  },
  vi: {
    ordinal: f[0]
  }
};
},{}],"5Mt1":[function(require,module,exports) {
'use strict';

var formats = require('format-message-formats');

var lookupClosestLocale = require('lookup-closest-locale');

var plurals = require('./plurals');
/*::
import type {
  AST,
  SubMessages
} from '../format-message-parse'
type Locale = string
type Locales = Locale | Locale[]
type Placeholder = any[] // https://github.com/facebook/flow/issues/4050
export type Type = (Placeholder, Locales) => (any, ?Object) => any
export type Types = { [string]: Type }
*/


exports = module.exports = function interpret(ast
/*: AST */
, locale
/*:: ?: Locales */
, types
/*:: ?: Types */
)
/*: (args?: Object) => string */
{
  return interpretAST(ast, null, locale || 'en', types || {}, true);
};

exports.toParts = function toParts(ast
/*: AST */
, locale
/*:: ?: Locales */
, types
/*:: ?: Types */
)
/*: (args?: Object) => any[] */
{
  return interpretAST(ast, null, locale || 'en', types || {}, false);
};

function interpretAST(elements
/*: any[] */
, parent
/*: ?Placeholder */
, locale
/*: Locales */
, types
/*: Types */
, join
/*: boolean */
)
/*: Function */
{
  var parts = elements.map(function (element) {
    return interpretElement(element, parent, locale, types, join);
  });

  if (!join) {
    return function format(args) {
      return parts.reduce(function (parts, part) {
        return parts.concat(part(args));
      }, []);
    };
  }

  if (parts.length === 1) return parts[0];
  return function format(args) {
    var message = '';

    for (var e = 0; e < parts.length; ++e) {
      message += parts[e](args);
    }

    return message;
  };
}

function interpretElement(element
/*: Placeholder */
, parent
/*: ?Placeholder */
, locale
/*: Locales */
, types
/*: Types */
, join
/*: boolean */
)
/*: Function */
{
  if (typeof element === 'string') {
    var value
    /*: string */
    = element;
    return function format() {
      return value;
    };
  }

  var id = element[0];
  var type = element[1];

  if (parent && element[0] === '#') {
    id = parent[0];
    var offset = parent[2];
    var formatter = (types.number || defaults.number)([id, 'number'], locale);
    return function format(args) {
      return formatter(getArg(id, args) - offset, args);
    };
  } // pre-process children


  var children;

  if (type === 'plural' || type === 'selectordinal') {
    children = {};
    Object.keys(element[3]).forEach(function (key) {
      children[key] = interpretAST(element[3][key], element, locale, types, join);
    });
    element = [element[0], element[1], element[2], children];
  } else if (element[2] && typeof element[2] === 'object') {
    children = {};
    Object.keys(element[2]).forEach(function (key) {
      children[key] = interpretAST(element[2][key], element, locale, types, join);
    });
    element = [element[0], element[1], children];
  }

  var getFrmt = type && (types[type] || defaults[type]);

  if (getFrmt) {
    var frmt = getFrmt(element, locale);
    return function format(args) {
      return frmt(getArg(id, args), args);
    };
  }

  return join ? function format(args) {
    return String(getArg(id, args));
  } : function format(args) {
    return getArg(id, args);
  };
}

function getArg(id
/*: string */
, args
/*: ?Object */
)
/*: any */
{
  if (args && id in args) return args[id];
  var parts = id.split('.');
  var a = args;

  for (var i = 0, ii = parts.length; a && i < ii; ++i) {
    a = a[parts[i]];
  }

  return a;
}

function interpretNumber(element
/*: Placeholder */
, locales
/*: Locales */
) {
  var style = element[2];
  var options = formats.number[style] || formats.parseNumberPattern(style) || formats.number.default;
  return new Intl.NumberFormat(locales, options).format;
}

function interpretDuration(element
/*: Placeholder */
, locales
/*: Locales */
) {
  var style = element[2];
  var options = formats.duration[style] || formats.duration.default;
  var fs = new Intl.NumberFormat(locales, options.seconds).format;
  var fm = new Intl.NumberFormat(locales, options.minutes).format;
  var fh = new Intl.NumberFormat(locales, options.hours).format;
  var sep = /^fi$|^fi-|^da/.test(String(locales)) ? '.' : ':';
  return function (s, args) {
    s = +s;
    if (!isFinite(s)) return fs(s);
    var h = ~~(s / 60 / 60); // ~~ acts much like Math.trunc

    var m = ~~(s / 60 % 60);
    var dur = (h ? fh(Math.abs(h)) + sep : '') + fm(Math.abs(m)) + sep + fs(Math.abs(s % 60));
    return s < 0 ? fh(-1).replace(fh(1), dur) : dur;
  };
}

function interpretDateTime(element
/*: Placeholder */
, locales
/*: Locales */
) {
  var type = element[1];
  var style = element[2];
  var options = formats[type][style] || formats.parseDatePattern(style) || formats[type].default;
  return new Intl.DateTimeFormat(locales, options).format;
}

function interpretPlural(element
/*: Placeholder */
, locales
/*: Locales */
) {
  var type = element[1];
  var pluralType = type === 'selectordinal' ? 'ordinal' : 'cardinal';
  var offset = element[2];
  var children = element[3];
  var pluralRules;

  if (Intl.PluralRules && Intl.PluralRules.supportedLocalesOf(locales).length > 0) {
    pluralRules = new Intl.PluralRules(locales, {
      type: pluralType
    });
  } else {
    var locale = lookupClosestLocale(locales, plurals);
    var select = locale && plurals[locale][pluralType] || returnOther;
    pluralRules = {
      select: select
    };
  }

  return function (value, args) {
    var clause = children['=' + +value] || children[pluralRules.select(value - offset)] || children.other;
    return clause(args);
  };
}

function returnOther()
/*:: n:number */
{
  return 'other';
}

function interpretSelect(element
/*: Placeholder */
, locales
/*: Locales */
) {
  var children = element[2];
  return function (value, args) {
    var clause = children[value] || children.other;
    return clause(args);
  };
}

var defaults
/*: Types */
= {
  number: interpretNumber,
  ordinal: interpretNumber,
  // TODO: support rbnf
  spellout: interpretNumber,
  // TODO: support rbnf
  duration: interpretDuration,
  date: interpretDateTime,
  time: interpretDateTime,
  plural: interpretPlural,
  selectordinal: interpretPlural,
  select: interpretSelect
};
exports.types = defaults;
},{"format-message-formats":"84aB","lookup-closest-locale":"+I8B","./plurals":"AlWV"}],"Ecvv":[function(require,module,exports) {
'use strict';

var parse = require('format-message-parse');

var interpret = require('format-message-interpret');

var plurals = require('format-message-interpret/plurals');

var lookupClosestLocale = require('lookup-closest-locale');

var origFormats = require('format-message-formats');
/*::
import type { Types } from 'format-message-interpret'
type Locale = string
type Locales = Locale | Locale[]
type Message = string | {|
  id?: string,
  default: string,
  description?: string
|}
type Translations = { [string]: ?{ [string]: string | Translation } }
type Translation = {
  message: string,
  format?: (args?: Object) => string,
  toParts?: (args?: Object) => any[],
}
type Replacement = ?string | (string, string, locales?: Locales) => ?string
type GenerateId = (string) => string
type MissingTranslation = 'ignore' | 'warning' | 'error'
type FormatObject = { [string]: * }
type Options = {
  locale?: Locales,
  translations?: ?Translations,
  generateId?: GenerateId,
  missingReplacement?: Replacement,
  missingTranslation?: MissingTranslation,
  formats?: {
    number?: FormatObject,
    date?: FormatObject,
    time?: FormatObject
  },
  types?: Types
}
type Setup = {|
  locale: Locales,
  translations: Translations,
  generateId: GenerateId,
  missingReplacement: Replacement,
  missingTranslation: MissingTranslation,
  formats: {
    number: FormatObject,
    date: FormatObject,
    time: FormatObject
  },
  types: Types
|}
type FormatMessage = {
  (msg: Message, args?: Object, locales?: Locales): string,
  rich (msg: Message, args?: Object, locales?: Locales): any[],
  setup (opt?: Options): Setup,
  number (value: number, style?: string, locales?: Locales): string,
  date (value: number | Date, style?: string, locales?: Locales): string,
  time (value: number | Date, style?: string, locales?: Locales): string,
  select (value: any, options: Object): any,
  custom (placeholder: any[], locales: Locales, value: any, args: Object): any,
  plural (value: number, offset: any, options: any, locale: any): any,
  selectordinal (value: number, offset: any, options: any, locale: any): any,
  namespace (): FormatMessage
}
*/


function assign
/*:: <T: Object> */
(target
/*: T */
, source
/*: Object */
) {
  Object.keys(source).forEach(function (key) {
    target[key] = source[key];
  });
  return target;
}

function namespace()
/*: FormatMessage */
{
  var formats = assign({}, origFormats);
  var currentLocales
  /*: Locales */
  = 'en';
  var translations
  /*: Translations */
  = {};

  var generateId
  /*: GenerateId */
  = function (pattern) {
    return pattern;
  };

  var missingReplacement
  /*: Replacement */
  = null;
  var missingTranslation
  /*: MissingTranslation */
  = 'warning';
  var types
  /*: Types */
  = {};

  function formatMessage(msg
  /*: Message */
  , args
  /*:: ?: Object */
  , locales
  /*:: ?: Locales */
  ) {
    var pattern = typeof msg === 'string' ? msg : msg.default;
    var id = typeof msg === 'object' && msg.id || generateId(pattern);
    var translated = translate(pattern, id, locales || currentLocales);
    var format = translated.format || (translated.format = interpret(parse(translated.message), locales || currentLocales, types));
    return format(args);
  }

  formatMessage.rich = function rich(msg
  /*: Message */
  , args
  /*:: ?: Object */
  , locales
  /*:: ?: Locales */
  ) {
    var pattern = typeof msg === 'string' ? msg : msg.default;
    var id = typeof msg === 'object' && msg.id || generateId(pattern);
    var translated = translate(pattern, id, locales || currentLocales);
    var format = translated.toParts || (translated.toParts = interpret.toParts(parse(translated.message, {
      tagsType: tagsType
    }), locales || currentLocales, types));
    return format(args);
  };

  var tagsType = '<>';

  function richType(node
  /*: any[] */
  , locales
  /*: Locales */
  ) {
    var style = node[2];
    return function (fn, args) {
      var props = typeof style === 'object' ? mapObject(style, args) : style;
      return typeof fn === 'function' ? fn(props) : fn;
    };
  }

  types[tagsType] = richType;

  function mapObject(object
  /* { [string]: (args?: Object) => any } */
  , args
  /*: ?Object */
  ) {
    return Object.keys(object).reduce(function (mapped, key) {
      mapped[key] = object[key](args);
      return mapped;
    }, {});
  }

  function translate(pattern
  /*: string */
  , id
  /*: string */
  , locales
  /*: Locales */
  )
  /*: Translation */
  {
    var locale = lookupClosestLocale(locales, translations) || 'en';
    var messages = translations[locale] || (translations[locale] = {});
    var translated = messages[id];

    if (typeof translated === 'string') {
      translated = messages[id] = {
        message: translated
      };
    }

    if (!translated) {
      var message = 'Translation for "' + id + '" in "' + locale + '" is missing';

      if (missingTranslation === 'warning') {
        /* istanbul ignore else */
        if (typeof console !== 'undefined') console.warn(message);
      } else if (missingTranslation !== 'ignore') {
        // 'error'
        throw new Error(message);
      }

      var replacement = typeof missingReplacement === 'function' ? missingReplacement(pattern, id, locale) || pattern : missingReplacement || pattern;
      translated = messages[id] = {
        message: replacement
      };
    }

    return translated;
  }

  formatMessage.setup = function setup(opt
  /*:: ?: Options */
  ) {
    opt = opt || {};
    if (opt.locale) currentLocales = opt.locale;
    if ('translations' in opt) translations = opt.translations || {};
    if (opt.generateId) generateId = opt.generateId;
    if ('missingReplacement' in opt) missingReplacement = opt.missingReplacement;
    if (opt.missingTranslation) missingTranslation = opt.missingTranslation;

    if (opt.formats) {
      if (opt.formats.number) assign(formats.number, opt.formats.number);
      if (opt.formats.date) assign(formats.date, opt.formats.date);
      if (opt.formats.time) assign(formats.time, opt.formats.time);
    }

    if (opt.types) {
      types = opt.types;
      types[tagsType] = richType;
    }

    return {
      locale: currentLocales,
      translations: translations,
      generateId: generateId,
      missingReplacement: missingReplacement,
      missingTranslation: missingTranslation,
      formats: formats,
      types: types
    };
  };

  formatMessage.number = function (value
  /*: number */
  , style
  /*:: ?: string */
  , locales
  /*:: ?: Locales */
  ) {
    var options = style && formats.number[style] || formats.parseNumberPattern(style) || formats.number.default;
    return new Intl.NumberFormat(locales || currentLocales, options).format(value);
  };

  formatMessage.date = function (value
  /*:: ?: number | Date */
  , style
  /*:: ?: string */
  , locales
  /*:: ?: Locales */
  ) {
    var options = style && formats.date[style] || formats.parseDatePattern(style) || formats.date.default;
    return new Intl.DateTimeFormat(locales || currentLocales, options).format(value);
  };

  formatMessage.time = function (value
  /*:: ?: number | Date */
  , style
  /*:: ?: string */
  , locales
  /*:: ?: Locales */
  ) {
    var options = style && formats.time[style] || formats.parseDatePattern(style) || formats.time.default;
    return new Intl.DateTimeFormat(locales || currentLocales, options).format(value);
  };

  formatMessage.select = function (value
  /*: any */
  , options
  /*: Object */
  ) {
    return options[value] || options.other;
  };

  formatMessage.custom = function (placeholder
  /*: any[] */
  , locales
  /*: Locales */
  , value
  /*: any */
  , args
  /*: Object */
  ) {
    if (!(placeholder[1] in types)) return value;
    return types[placeholder[1]](placeholder, locales)(value, args);
  };

  formatMessage.plural = plural.bind(null, 'cardinal');
  formatMessage.selectordinal = plural.bind(null, 'ordinal');

  function plural(pluralType
  /*: 'cardinal' | 'ordinal' */
  , value
  /*: number */
  , offset
  /*: any */
  , options
  /*: any */
  , locale
  /*: any */
  ) {
    if (typeof offset === 'object' && typeof options !== 'object') {
      // offset is optional
      locale = options;
      options = offset;
      offset = 0;
    }

    var closest = lookupClosestLocale(locale || currentLocales, plurals);
    var plural = closest && plurals[closest][pluralType] || returnOther;
    return options['=' + +value] || options[plural(value - offset)] || options.other;
  }

  function returnOther()
  /*:: n:number */
  {
    return 'other';
  }

  formatMessage.namespace = namespace;
  return formatMessage;
}

module.exports = exports = namespace();
},{"format-message-parse":"I2x8","format-message-interpret":"5Mt1","format-message-interpret/plurals":"AlWV","lookup-closest-locale":"+I8B","format-message-formats":"84aB"}],"yh9p":[function(require,module,exports) {
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],"JgNJ":[function(require,module,exports) {
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],"REa7":[function(require,module,exports) {
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],"dskh":[function(require,module,exports) {

  var global = window;
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

},{"base64-js":"yh9p","ieee754":"JgNJ","isarray":"REa7","buffer":"dskh"}],"eN0K":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function (obj) { return typeof obj; }; } else { _typeof = function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (w) {
  "use strict";

  function findBest(atobNative) {
    // normal window
    if ('function' === typeof atobNative) {
      return atobNative;
    } // browserify (web worker)


    if ('function' === typeof Buffer) {
      return function atobBrowserify(a) {
        //!! Deliberately using an API that's deprecated in node.js because
        //!! this file is for browsers and we expect them to cope with it.
        //!! Discussion: github.com/node-browser-compat/atob/pull/9
        return new Buffer(a, 'base64').toString('binary');
      };
    } // ios web worker with base64js


    if ('object' === _typeof(w.base64js)) {
      // bufferToBinaryString
      // https://git.coolaj86.com/coolaj86/unibabel.js/blob/master/index.js#L50
      return function atobWebWorker_iOS(a) {
        var buf = w.base64js.b64ToByteArray(a);
        return Array.prototype.map.call(buf, function (ch) {
          return String.fromCharCode(ch);
        }).join('');
      };
    }

    return function () {
      // ios web worker without base64js
      throw new Error("You're probably in an old browser or an iOS webworker." + " It might help to include beatgammit's base64-js.");
    };
  }

  var atobBest = findBest(w.atob);
  w.atob = atobBest;

  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module && module.exports) {
    module.exports = atobBest;
  }
})(window);
},{"buffer":"dskh"}],"+Q0q":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
(function () {
  "use strict";

  function btoa(str) {
    var buffer;

    if (str instanceof Buffer) {
      buffer = str;
    } else {
      buffer = Buffer.from(str.toString(), 'binary');
    }

    return buffer.toString('base64');
  }

  module.exports = btoa;
})();
},{"buffer":"dskh"}],"XXp4":[function(require,module,exports) {
const atob = require('atob');
const btoa = require('btoa');

class Base64Util {

    /**
     * Convert a base64 encoded string to a Uint8Array.
     * @param {string} base64 - a base64 encoded string.
     * @return {Uint8Array} - a decoded Uint8Array.
     */
    static base64ToUint8Array (base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const array = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            array[i] = binaryString.charCodeAt(i);
        }
        return array;
    }

    /**
     * Convert a Uint8Array to a base64 encoded string.
     * @param {Uint8Array} array - the array to convert.
     * @return {string} - the base64 encoded string.
     */
    static uint8ArrayToBase64 (array) {
        const base64 = btoa(String.fromCharCode.apply(null, array));
        return base64;
    }

    /**
    * Convert an array buffer to a base64 encoded string.
    * @param {array} buffer - an array buffer to convert.
    * @return {string} - the base64 encoded string.
    */
    static arrayBufferToBase64 (buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[ i ]);
        }
        return btoa(binary);
    }

}

module.exports = Base64Util;

},{"atob":"eN0K","btoa":"+Q0q"}],"J0Gg":[function(require,module,exports) {
class JSONRPC {
    constructor () {
        this._requestID = 0;
        this._openRequests = {};
    }

    /**
     * Make an RPC request and retrieve the result.
     * @param {string} method - the remote method to call.
     * @param {object} params - the parameters to pass to the remote method.
     * @returns {Promise} - a promise for the result of the call.
     */
    sendRemoteRequest (method, params) {
        const requestID = this._requestID++;

        const promise = new Promise((resolve, reject) => {
            this._openRequests[requestID] = {resolve, reject};
        });

        this._sendRequest(method, params, requestID);

        return promise;
    }

    /**
     * Make an RPC notification with no expectation of a result or callback.
     * @param {string} method - the remote method to call.
     * @param {object} params - the parameters to pass to the remote method.
     */
    sendRemoteNotification (method, params) {
        this._sendRequest(method, params);
    }

    /**
     * Handle an RPC request from remote, should return a result or Promise for result, if appropriate.
     * @param {string} method - the method requested by the remote caller.
     * @param {object} params - the parameters sent with the remote caller's request.
     */
    didReceiveCall (/* method , params */) {
        throw new Error('Must override didReceiveCall');
    }

    _sendMessage (/* jsonMessageObject */) {
        throw new Error('Must override _sendMessage');
    }

    _sendRequest (method, params, id) {
        const request = {
            jsonrpc: '2.0',
            method,
            params
        };

        if (id !== null) {
            request.id = id;
        }

        this._sendMessage(request);
    }

    _handleMessage (json) {
        if (json.jsonrpc !== '2.0') {
            throw new Error(`Bad or missing JSON-RPC version in message: ${json}`);
        }
        if (json.hasOwnProperty('method')) {
            this._handleRequest(json);
        } else {
            this._handleResponse(json);
        }
    }

    _sendResponse (id, result, error) {
        const response = {
            jsonrpc: '2.0',
            id
        };
        if (error) {
            response.error = error;
        } else {
            response.result = result || null;
        }
        this._sendMessage(response);
    }

    _handleResponse (json) {
        const {result, error, id} = json;
        const openRequest = this._openRequests[id];
        delete this._openRequests[id];
        if (openRequest) {
            if (error) {
                openRequest.reject(error);
            } else {
                openRequest.resolve(result);
            }
        }
    }

    _handleRequest (json) {
        const {method, params, id} = json;
        const rawResult = this.didReceiveCall(method, params);
        if (id) {
            Promise.resolve(rawResult).then(
                result => {
                    this._sendResponse(id, result);
                },
                error => {
                    this._sendResponse(id, null, error);
                }
            );
        }
    }
}

module.exports = JSONRPC;

},{}],"ACGb":[function(require,module,exports) {
const JSONRPC = require('./jsonrpc');
// const log = require('../util/log');

class JSONRPCWebSocket extends JSONRPC {
    constructor (webSocket) {
        super();

        this._ws = webSocket;
        this._ws.onmessage = e => this._onSocketMessage(e);
        this._ws.onopen = e => this._onSocketOpen(e);
        this._ws.onclose = e => this._onSocketClose(e);
        this._ws.onerror = e => this._onSocketError(e);
    }

    dispose () {
        this._ws.close();
        this._ws = null;
    }

    _onSocketOpen () {
    }

    _onSocketClose () {
    }

    _onSocketError () {
    }

    _onSocketMessage (e) {
        const json = JSON.parse(e.data);
        this._handleMessage(json);
    }

    _sendMessage (message) {
        const messageText = JSON.stringify(message);
        this._ws.send(messageText);
    }
}

module.exports = JSONRPCWebSocket;

},{"./jsonrpc":"J0Gg"}],"WwR9":[function(require,module,exports) {
const JSONRPCWebSocket = require('../util/jsonrpc-web-socket');
const ScratchLinkWebSocket = 'wss://device-manager.scratch.mit.edu:20110/scratch/ble';
// const log = require('../util/log');

class BLE extends JSONRPCWebSocket {

    /**
     * A BLE peripheral socket object.  It handles connecting, over web sockets, to
     * BLE peripherals, and reading and writing data to them.
     * @param {Runtime} runtime - the Runtime for sending/receiving GUI update events.
     * @param {string} extensionId - the id of the extension using this socket.
     * @param {object} peripheralOptions - the list of options for peripheral discovery.
     * @param {object} connectCallback - a callback for connection.
     * @param {object} disconnectCallback - a callback for disconnection.
     */
    constructor (runtime, extensionId, peripheralOptions, connectCallback, disconnectCallback = null) {
        const ws = new WebSocket(ScratchLinkWebSocket);
        super(ws);

        this._ws = ws;
        this._ws.onopen = this.requestPeripheral.bind(this); // only call request peripheral after socket opens
        this._ws.onerror = this._handleRequestError.bind(this, 'ws onerror');
        this._ws.onclose = this.handleDisconnectError.bind(this, 'ws onclose');

        this._availablePeripherals = {};
        this._connectCallback = connectCallback;
        this._connected = false;
        this._characteristicDidChangeCallback = null;
        this._disconnectCallback = disconnectCallback;
        this._discoverTimeoutID = null;
        this._extensionId = extensionId;
        this._peripheralOptions = peripheralOptions;
        this._runtime = runtime;
    }

    /**
     * Request connection to the peripheral.
     * If the web socket is not yet open, request when the socket promise resolves.
     */
    requestPeripheral () {
        if (this._ws.readyState === 1) { // is this needed since it's only called on ws.onopen?
            this._availablePeripherals = {};
            if (this._discoverTimeoutID) {
                window.clearTimeout(this._discoverTimeoutID);
            }
            this._discoverTimeoutID = window.setTimeout(this._handleDiscoverTimeout.bind(this), 15000);
            this.sendRemoteRequest('discover', this._peripheralOptions)
                .catch(e => {
                    this._handleRequestError(e);
                });
        }
        // TODO: else?
    }

    /**
     * Try connecting to the input peripheral id, and then call the connect
     * callback if connection is successful.
     * @param {number} id - the id of the peripheral to connect to
     */
    connectPeripheral (id) {
        this.sendRemoteRequest('connect', {peripheralId: id})
            .then(() => {
                this._connected = true;
                this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
                this._connectCallback();
            })
            .catch(e => {
                this._handleRequestError(e);
            });
    }

    /**
     * Close the websocket.
     */
    disconnect () {
        if (this._ws.readyState !== this._ws.OPEN) return;

        this._ws.close();
        this._connected = false;
        if (this._discoverTimeoutID) {
            window.clearTimeout(this._discoverTimeoutID);
        }

        this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
    }

    /**
     * @return {bool} whether the peripheral is connected.
     */
    isConnected () {
        return this._connected;
    }

    /**
     * Start receiving notifications from the specified ble service.
     * @param {number} serviceId - the ble service to read.
     * @param {number} characteristicId - the ble characteristic to get notifications from.
     * @param {object} onCharacteristicChanged - callback for characteristic change notifications.
     * @return {Promise} - a promise from the remote startNotifications request.
     */
    startNotifications (serviceId, characteristicId, onCharacteristicChanged = null) {
        const params = {
            serviceId,
            characteristicId
        };
        this._characteristicDidChangeCallback = onCharacteristicChanged;
        return this.sendRemoteRequest('startNotifications', params)
            .catch(e => {
                this.handleDisconnectError(e);
            });
    }

    /**
     * Read from the specified ble service.
     * @param {number} serviceId - the ble service to read.
     * @param {number} characteristicId - the ble characteristic to read.
     * @param {boolean} optStartNotifications - whether to start receiving characteristic change notifications.
     * @param {object} onCharacteristicChanged - callback for characteristic change notifications.
     * @return {Promise} - a promise from the remote read request.
     */
    read (serviceId, characteristicId, optStartNotifications = false, onCharacteristicChanged = null) {
        const params = {
            serviceId,
            characteristicId
        };
        if (optStartNotifications) {
            params.startNotifications = true;
        }
        if (onCharacteristicChanged) {
            this._characteristicDidChangeCallback = onCharacteristicChanged;
        }
        return this.sendRemoteRequest('read', params)
            .catch(e => {
                this.handleDisconnectError(e);
            });
    }

    /**
     * Write data to the specified ble service.
     * @param {number} serviceId - the ble service to write.
     * @param {number} characteristicId - the ble characteristic to write.
     * @param {string} message - the message to send.
     * @param {string} encoding - the message encoding type.
     * @param {boolean} withResponse - if true, resolve after peripheral's response.
     * @return {Promise} - a promise from the remote send request.
     */
    write (serviceId, characteristicId, message, encoding = null, withResponse = null) {
        const params = {serviceId, characteristicId, message};
        if (encoding) {
            params.encoding = encoding;
        }
        if (withResponse) {
            params.withResponse = withResponse;
        }
        return this.sendRemoteRequest('write', params)
            .catch(e => {
                this.handleDisconnectError(e);
            });
    }

    /**
     * Handle a received call from the socket.
     * @param {string} method - a received method label.
     * @param {object} params - a received list of parameters.
     * @return {object} - optional return value.
     */
    didReceiveCall (method, params) {
        switch (method) {
        case 'didDiscoverPeripheral':
            this._availablePeripherals[params.peripheralId] = params;
            this._runtime.emit(
                this._runtime.constructor.PERIPHERAL_LIST_UPDATE,
                this._availablePeripherals
            );
            if (this._discoverTimeoutID) {
                window.clearTimeout(this._discoverTimeoutID);
            }
            break;
        case 'characteristicDidChange':
            if (this._characteristicDidChangeCallback) {
                this._characteristicDidChangeCallback(params.message);
            }
            break;
        case 'ping':
            return 42;
        }
    }

    /**
     * Handle an error resulting from losing connection to a peripheral.
     *
     * This could be due to:
     * - battery depletion
     * - going out of bluetooth range
     * - being powered down
     *
     * Disconnect the socket, and if the extension using this socket has a
     * disconnect callback, call it. Finally, emit an error to the runtime.
     */
    handleDisconnectError (/* e */) {
        // log.error(`BLE error: ${JSON.stringify(e)}`);

        if (!this._connected) return;

        // TODO: Fix branching by splitting up cleanup/disconnect in extension
        if (this._disconnectCallback) {
            this._disconnectCallback(); // must call disconnect()
        } else {
            this.disconnect();
        }

        this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTION_LOST_ERROR, {
            message: `Scratch lost connection to`,
            extensionId: this._extensionId
        });
    }

    _handleRequestError (/* e */) {
        // log.error(`BLE error: ${JSON.stringify(e)}`);

        this._runtime.emit(this._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
            message: `Scratch lost connection to`,
            extensionId: this._extensionId
        });
    }

    _handleDiscoverTimeout () {
        if (this._discoverTimeoutID) {
            window.clearTimeout(this._discoverTimeoutID);
        }
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
    }
}

module.exports = BLE;

},{"../util/jsonrpc-web-socket":"ACGb"}],"D/or":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

exports.__esModule = true;

var BLE = require("scratch-vm/src/io/ble");

var Base64Util = require("scratch-vm/src/util/base64-util");

var BLEDataStoppedError = 'the extension stopped receiving data from BLE';

var Peripheral =
/** @class */
function () {
  function Peripheral(runtime, extensionId) {
    this.ServiceUuid = 'Service UUID is not defined';
    this.watchdogTimer = null;
    this.watchdogPromise = null;
    this.busy = false;

    this.onConnected = function () {
      return;
    };

    this.runtime = runtime;
    this.extensionId = extensionId;
    this.runtime.registerPeripheralExtension(extensionId, this);
  }

  Peripheral.prototype.isConnected = function () {
    return this.ble && this.ble.isConnected();
  };

  Peripheral.prototype.scan = function () {
    this.ble = new BLE(this.runtime, this.extensionId, {
      filters: [{
        services: [this.ServiceUuid]
      }]
    }, this.onConnected);
  };

  Peripheral.prototype.connect = function (id) {
    this.ble.connectPeripheral(id);
  };

  Peripheral.prototype.disconnect = function () {
    this.stopWatchdogTimer();
    this.ble.disconnect();
  };

  Peripheral.prototype.startWatchdogTimer = function (checkFunction, interval) {
    var _this = this;

    this.stopWatchdogTimer();
    this.watchdogTimer = setInterval(function () {
      if (_this.watchdogPromise) {
        _this.stopWatchdogTimer();

        _this.ble.handleDisconnectError(BLEDataStoppedError);
      }

      if (checkFunction) {
        _this.watchdogPromise = checkFunction().then(function () {
          _this.watchdogPromise = null;
        });
      }
    }, interval);
  };

  Peripheral.prototype.stopWatchdogTimer = function () {
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }

    this.watchdogPromise = null;
  };

  Peripheral.prototype.read = function (characteristic, onRead) {
    return this.ble.read(this.ServiceUuid, characteristic, false, onRead);
  };

  Peripheral.prototype.write = function (characteristic, data, withResponse) {
    var _this = this;

    if (withResponse === void 0) {
      withResponse = false;
    }

    if (!this.isConnected()) {
      return;
    }

    if (this.busy) {
      return;
    }

    this.busy = true;
    var busyTimer = setTimeout(function () {
      _this.busy = false;
    }, Peripheral.WRITE_TIMEOUT);
    var base64 = Base64Util.uint8ArrayToBase64(data);
    return this.ble.write(this.ServiceUuid, characteristic, base64, 'base64', withResponse).then(function () {
      _this.busy = false;
      clearTimeout(busyTimer);
    });
  };

  Peripheral.prototype.startNotifications = function (characteristic, onNotified) {
    this.ble.startNotifications(this.ServiceUuid, characteristic, onNotified);
  };

  Peripheral.WRITE_TIMEOUT = 1000;
  return Peripheral;
}();

exports["default"] = Peripheral;
},{"scratch-vm/src/io/ble":"WwR9","scratch-vm/src/util/base64-util":"XXp4"}],"p22o":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

exports.__esModule = true;

var Mat =
/** @class */
function () {
  function Mat() {}

  Mat.normalizeX = function (x) {
    return x < Mat.Region.X.BOUNDARY ? this.convertCoordinateRange(x, Mat.Region.X.RANGE1_MIN, Mat.Region.X.RANGE1_MAX) : this.convertCoordinateRange(x, Mat.Region.X.RANGE2_MIN, Mat.Region.X.RANGE2_MAX);
  };

  Mat.normalizeY = function (y) {
    return y < Mat.Region.Y.BOUNDARY ? -this.convertCoordinateRange(y, Mat.Region.Y.RANGE1_MIN, Mat.Region.Y.RANGE1_MAX) : -this.convertCoordinateRange(y, Mat.Region.Y.RANGE2_MIN, Mat.Region.Y.RANGE2_MAX);
  };

  Mat.convertCoordinateRange = function (value, min, max) {
    return ((value - min) / (max - min) * 2 - 1) * Mat.COORDINATE_RANGE;
  };

  Mat.normalizeDirection = function (direction) {
    var d = direction - 270;
    return d + (d <= -180 ? 360 : 0);
  };

  Mat.convertXToColumn = function (x) {
    var column = Math.floor((x - Mat.Grid.Border.LEFT) / (Mat.Grid.Border.RIGHT - Mat.Grid.Border.LEFT) * Mat.Grid.COLUMNS);
    return Math.min(Math.max(column, 0), 8) - 4;
  };

  Mat.convertYToRow = function (y) {
    var row = Math.floor((y - Mat.Grid.Border.TOP) / (Mat.Grid.Border.BOTTOM - Mat.Grid.Border.TOP) * Mat.Grid.ROWS);
    return 4 - Math.min(Math.max(row, 0), 8);
  };

  Mat.convertColumnToX = function (column) {
    return column / Mat.Grid.COLUMNS * Mat.COORDINATE_RANGE * 2;
  };

  Mat.convertRowToY = function (row) {
    return row / Mat.Grid.ROWS * Mat.COORDINATE_RANGE * 2;
  };

  Mat.checkIfOnMat = function (state) {
    return state.isTouched && state.standardId === null;
  };

  Mat.checkIfOnColoredMat = function (state) {
    return state.rawX >= Mat.Region.X.BOUNDARY && state.rawY < Mat.Region.Y.BOUNDARY;
  };

  Mat.checkIfMatchColor = function (state, type) {
    if (!state.isTouched || state.standardId !== null) {
      return false;
    }

    var rawX = state.rawX,
        rawY = state.rawY;
    var column = this.convertXToColumn(rawX);
    var row = this.convertYToRow(rawY);
    var colorCode = Mat.COLOR_CODES_ON_MAT_GRID[4 - row][column + 4];
    var color = Mat.COLORS[colorCode];
    return type.indexOf(color) !== -1;
  };

  Mat.Region = {
    X: {
      BOUNDARY: 500,
      RANGE1_MIN: 56,
      RANGE1_MAX: 440,
      RANGE2_MIN: 558,
      RANGE2_MAX: 942
    },
    Y: {
      BOUNDARY: 500,
      RANGE1_MIN: 57,
      RANGE1_MAX: 442,
      RANGE2_MIN: 569,
      RANGE2_MAX: 953
    }
  };
  Mat.COORDINATE_RANGE = 180;
  Mat.Grid = {
    Border: {
      LEFT: 555,
      RIGHT: 947,
      TOP: 53,
      BOTTOM: 446
    },
    COLUMNS: 9,
    ROWS: 9
  };
  Mat.COLOR_CODES_ON_MAT_GRID = ['wbwywrwrw', 'gwrwbwbwy', 'wywywgwgw', 'bwgwrwbwr', 'wrwywgwgw', 'ywbwbwywr', 'wgwrwgwbw', 'bwywbwrwy', 'wrwgwywgw'];
  Mat.COLORS = {
    w: 'white',
    b: 'blue',
    g: 'green',
    y: 'yellow',
    r: 'red'
  };
  return Mat;
}();

exports["default"] = Mat;
},{}],"EuYy":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

exports.__esModule = true;

var Base64Util = require("scratch-vm/src/util/base64-util");

var peripheral_1 = __importDefault(require("../peripheral"));

var mat_1 = __importDefault(require("./mat"));

var CoreCube =
/** @class */
function (_super) {
  __extends(CoreCube, _super);

  function CoreCube(runtime, extensionId) {
    var _this = _super.call(this, runtime, extensionId) || this;

    _this.ServiceUuid = CoreCube.uuid('0100');
    _this.watchdogResolve = null;

    _this.onConnected = function () {
      _this.startNotifications(CoreCube.CharacteristicUuid.ID, _this.onNotified);

      _this.startWatchdogTimer(function () {
        return new Promise(function (resolve) {
          _this.watchdogResolve = resolve;

          _this.read(CoreCube.CharacteristicUuid.ID, _this.onNotified);
        });
      }, CoreCube.BLE_WATCHDOG_INTERVAL);
    };

    _this.onNotified = function (base64) {
      if (_this.watchdogResolve) {
        _this.watchdogResolve();

        _this.watchdogResolve = null;
      }

      var data = Base64Util.base64ToUint8Array(base64);

      switch (data[0]) {
        case 1:
          {
            /* tslint:disable:no-bitwise */
            var x = data[1] | data[2] << 8;
            var y = data[3] | data[4] << 8;
            var direction = data[5] | data[6] << 8;
            /* tslint:enable:no-bitwise */

            _this.state = {
              isTouched: true,
              x: mat_1["default"].normalizeX(x),
              y: mat_1["default"].normalizeY(y),
              direction: mat_1["default"].normalizeDirection(direction),
              rawX: x,
              rawY: y,
              rawDirection: direction,
              standardId: null
            };
            break;
          }

        case 2:
          {
            /* tslint:disable:no-bitwise */
            var standardId = data[1] | data[2] << 8 | data[3] << 16 | data[4] << 24;
            var direction = data[5] | data[6] << 8;
            /* tslint:enable:no-bitwise */

            _this.state = {
              isTouched: true,
              direction: mat_1["default"].normalizeDirection(direction),
              rawDirection: direction,
              standardId: standardId
            };
            break;
          }

        default:
          _this.state.isTouched = false;
          _this.state.standardId = null;
          break;
      }
    };

    _this.state = {
      isTouched: false,
      x: 0,
      y: 0,
      direction: 0,
      rawX: 0,
      rawY: 0,
      rawDirection: 0,
      standardId: null
    };
    return _this;
  }

  CoreCube.prototype.getState = function () {
    return this.state;
  };

  CoreCube.prototype.move = function (speeds, duration) {
    if (duration === void 0) {
      duration = 0;
    }

    var data = [];
    data.push(duration ? 2 : 1);

    for (var i = 0; i < speeds.length; i++) {
      var speed = Math.max(Math.min(speeds[i], 100), -100);
      data.push(i + 1, speed >= 0 ? 1 : 2, Math.abs(speed));
    }

    if (duration) {
      data.push(duration * (1000 / 10));
    }

    this.write(CoreCube.CharacteristicUuid.MOTOR, data);
  };

  CoreCube.prototype.setLightColor = function (color, duration) {
    if (duration === void 0) {
      duration = 0;
    }

    var data = [3, duration * (1000 / 10), 1, 1].concat(color);
    this.write(CoreCube.CharacteristicUuid.LIGHT, data, true);
  };

  CoreCube.prototype.turnOffLight = function () {
    var data = [1];
    this.write(CoreCube.CharacteristicUuid.LIGHT, data, true);
  };

  CoreCube.prototype.playSound = function (note, loudness, duration) {
    if (duration === void 0) {
      duration = 0;
    }

    var data = [3, 0, 1, duration * (1000 / 10), note, loudness];
    this.write(CoreCube.CharacteristicUuid.SOUND, data, true);
  };

  CoreCube.prototype.stopSound = function () {
    var data = [1];
    this.write(CoreCube.CharacteristicUuid.SOUND, data, true);
  };

  CoreCube.uuid = function (id) {
    return "10b2" + id + "-5b3b-4571-9508-cf3efcd7bbae";
  };

  CoreCube.CharacteristicUuid = {
    ID: CoreCube.uuid('0101'),
    MOTOR: CoreCube.uuid('0102'),
    LIGHT: CoreCube.uuid('0103'),
    SOUND: CoreCube.uuid('0104'),
    SENSOR: CoreCube.uuid('0106'),
    BUTTON: CoreCube.uuid('0107')
  };
  CoreCube.BLE_WATCHDOG_INTERVAL = 1000;
  return CoreCube;
}(peripheral_1["default"]);

exports["default"] = CoreCube;
},{"scratch-vm/src/util/base64-util":"XXp4","../peripheral":"D/or","./mat":"p22o"}],"eSML":[function(require,module,exports) {
/**
 * Block argument types
 * @enum {string}
 */
const ArgumentType = {
    /**
     * Numeric value with angle picker
     */
    ANGLE: 'angle',

    /**
     * Boolean value with hexagonal placeholder
     */
    BOOLEAN: 'Boolean',

    /**
     * Numeric value with color picker
     */
    COLOR: 'color',

    /**
     * Numeric value with text field
     */
    NUMBER: 'number',

    /**
     * String value with text field
     */
    STRING: 'string',

    /**
     * String value with matrix field
     */
    MATRIX: 'matrix',

    /**
     * MIDI note number with note picker (piano) field
     */
    NOTE: 'note'
};

module.exports = ArgumentType;

},{}],"I4kj":[function(require,module,exports) {
/**
 * Types of block
 * @enum {string}
 */
const BlockType = {
    /**
     * Boolean reporter with hexagonal shape
     */
    BOOLEAN: 'Boolean',

    /**
     * Command block
     */
    COMMAND: 'command',

    /**
     * Specialized command block which may or may not run a child branch
     * The thread continues with the next block whether or not a child branch ran.
     */
    CONDITIONAL: 'conditional',

    /**
     * Specialized hat block with no implementation function
     * This stack only runs if the corresponding event is emitted by other code.
     */
    EVENT: 'event',

    /**
     * Hat block which conditionally starts a block stack
     */
    HAT: 'hat',

    /**
     * Specialized command block which may or may not run a child branch
     * If a child branch runs, the thread evaluates the loop block again.
     */
    LOOP: 'loop',

    /**
     * General reporter with numeric or string value
     */
    REPORTER: 'reporter'
};

module.exports = BlockType;

},{}],"/mHr":[function(require,module,exports) {
class Color {
    /**
     * @typedef {object} RGBObject - An object representing a color in RGB format.
     * @property {number} r - the red component, in the range [0, 255].
     * @property {number} g - the green component, in the range [0, 255].
     * @property {number} b - the blue component, in the range [0, 255].
     */

    /**
     * @typedef {object} HSVObject - An object representing a color in HSV format.
     * @property {number} h - hue, in the range [0-359).
     * @property {number} s - saturation, in the range [0,1].
     * @property {number} v - value, in the range [0,1].
     */

    /** @type {RGBObject} */
    static get RGB_BLACK () {
        return {r: 0, g: 0, b: 0};
    }

    /** @type {RGBObject} */
    static get RGB_WHITE () {
        return {r: 255, g: 255, b: 255};
    }

    /**
     * Convert a Scratch decimal color to a hex string, #RRGGBB.
     * @param {number} decimal RGB color as a decimal.
     * @return {string} RGB color as #RRGGBB hex string.
     */
    static decimalToHex (decimal) {
        if (decimal < 0) {
            decimal += 0xFFFFFF + 1;
        }
        let hex = Number(decimal).toString(16);
        hex = `#${'000000'.substr(0, 6 - hex.length)}${hex}`;
        return hex;
    }

    /**
     * Convert a Scratch decimal color to an RGB color object.
     * @param {number} decimal RGB color as decimal.
     * @return {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     */
    static decimalToRgb (decimal) {
        const a = (decimal >> 24) & 0xFF;
        const r = (decimal >> 16) & 0xFF;
        const g = (decimal >> 8) & 0xFF;
        const b = decimal & 0xFF;
        return {r: r, g: g, b: b, a: a > 0 ? a : 255};
    }

    /**
     * Convert a hex color (e.g., F00, #03F, #0033FF) to an RGB color object.
     * CC-BY-SA Tim Down:
     * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
     * @param {!string} hex Hex representation of the color.
     * @return {RGBObject} null on failure, or rgb: {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     */
    static hexToRgb (hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert an RGB color object to a hex color.
     * @param {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     * @return {!string} Hex representation of the color.
     */
    static rgbToHex (rgb) {
        return Color.decimalToHex(Color.rgbToDecimal(rgb));
    }

    /**
     * Convert an RGB color object to a Scratch decimal color.
     * @param {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     * @return {!number} Number representing the color.
     */
    static rgbToDecimal (rgb) {
        return (rgb.r << 16) + (rgb.g << 8) + rgb.b;
    }

    /**
    * Convert a hex color (e.g., F00, #03F, #0033FF) to a decimal color number.
    * @param {!string} hex Hex representation of the color.
    * @return {!number} Number representing the color.
    */
    static hexToDecimal (hex) {
        return Color.rgbToDecimal(Color.hexToRgb(hex));
    }

    /**
     * Convert an HSV color to RGB format.
     * @param {HSVObject} hsv - {h: hue [0,360), s: saturation [0,1], v: value [0,1]}
     * @return {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     */
    static hsvToRgb (hsv) {
        let h = hsv.h % 360;
        if (h < 0) h += 360;
        const s = Math.max(0, Math.min(hsv.s, 1));
        const v = Math.max(0, Math.min(hsv.v, 1));

        const i = Math.floor(h / 60);
        const f = (h / 60) - i;
        const p = v * (1 - s);
        const q = v * (1 - (s * f));
        const t = v * (1 - (s * (1 - f)));

        let r;
        let g;
        let b;

        switch (i) {
        default:
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        case 5:
            r = v;
            g = p;
            b = q;
            break;
        }

        return {
            r: Math.floor(r * 255),
            g: Math.floor(g * 255),
            b: Math.floor(b * 255)
        };
    }

    /**
     * Convert an RGB color to HSV format.
     * @param {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     * @return {HSVObject} hsv - {h: hue [0,360), s: saturation [0,1], v: value [0,1]}
     */
    static rgbToHsv (rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const x = Math.min(Math.min(r, g), b);
        const v = Math.max(Math.max(r, g), b);

        // For grays, hue will be arbitrarily reported as zero. Otherwise, calculate
        let h = 0;
        let s = 0;
        if (x !== v) {
            const f = (r === x) ? g - b : ((g === x) ? b - r : r - g);
            const i = (r === x) ? 3 : ((g === x) ? 5 : 1);
            h = ((i - (f / (v - x))) * 60) % 360;
            s = (v - x) / v;
        }

        return {h: h, s: s, v: v};
    }

    /**
     * Linear interpolation between rgb0 and rgb1.
     * @param {RGBObject} rgb0 - the color corresponding to fraction1 <= 0.
     * @param {RGBObject} rgb1 - the color corresponding to fraction1 >= 1.
     * @param {number} fraction1 - the interpolation parameter. If this is 0.5, for example, mix the two colors equally.
     * @return {RGBObject} the interpolated color.
     */
    static mixRgb (rgb0, rgb1, fraction1) {
        if (fraction1 <= 0) return rgb0;
        if (fraction1 >= 1) return rgb1;
        const fraction0 = 1 - fraction1;
        return {
            r: (fraction0 * rgb0.r) + (fraction1 * rgb1.r),
            g: (fraction0 * rgb0.g) + (fraction1 * rgb1.g),
            b: (fraction0 * rgb0.b) + (fraction1 * rgb1.b)
        };
    }
}

module.exports = Color;

},{}],"45jg":[function(require,module,exports) {
const Color = require('../util/color');

/**
 * Store and possibly polyfill Number.isNaN. Number.isNaN can save time over
 * self.isNaN by not coercing its input. We need to polyfill it to support
 * Internet Explorer.
 * @const
 */
const _NumberIsNaN = Number.isNaN || isNaN;

/**
 * @fileoverview
 * Utilities for casting and comparing Scratch data-types.
 * Scratch behaves slightly differently from JavaScript in many respects,
 * and these differences should be encapsulated below.
 * For example, in Scratch, add(1, join("hello", world")) -> 1.
 * This is because "hello world" is cast to 0.
 * In JavaScript, 1 + Number("hello" + "world") would give you NaN.
 * Use when coercing a value before computation.
 */

class Cast {
    /**
     * Scratch cast to number.
     * Treats NaN as 0.
     * In Scratch 2.0, this is captured by `interp.numArg.`
     * @param {*} value Value to cast to number.
     * @return {number} The Scratch-casted number value.
     */
    static toNumber (value) {
        // If value is already a number we don't need to coerce it with
        // Number().
        if (typeof value === 'number') {
            // Scratch treats NaN as 0, when needed as a number.
            // E.g., 0 + NaN -> 0.
            if (_NumberIsNaN(value)) {
                return 0;
            }
            return value;
        }
        const n = Number(value);
        if (_NumberIsNaN(n)) {
            // Scratch treats NaN as 0, when needed as a number.
            // E.g., 0 + NaN -> 0.
            return 0;
        }
        return n;
    }

    /**
     * Scratch cast to boolean.
     * In Scratch 2.0, this is captured by `interp.boolArg.`
     * Treats some string values differently from JavaScript.
     * @param {*} value Value to cast to boolean.
     * @return {boolean} The Scratch-casted boolean value.
     */
    static toBoolean (value) {
        // Already a boolean?
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            // These specific strings are treated as false in Scratch.
            if ((value === '') ||
                (value === '0') ||
                (value.toLowerCase() === 'false')) {
                return false;
            }
            // All other strings treated as true.
            return true;
        }
        // Coerce other values and numbers.
        return Boolean(value);
    }

    /**
     * Scratch cast to string.
     * @param {*} value Value to cast to string.
     * @return {string} The Scratch-casted string value.
     */
    static toString (value) {
        return String(value);
    }

    /**
     * Cast any Scratch argument to an RGB color array to be used for the renderer.
     * @param {*} value Value to convert to RGB color array.
     * @return {Array.<number>} [r,g,b], values between 0-255.
     */
    static toRgbColorList (value) {
        const color = Cast.toRgbColorObject(value);
        return [color.r, color.g, color.b];
    }

    /**
     * Cast any Scratch argument to an RGB color object to be used for the renderer.
     * @param {*} value Value to convert to RGB color object.
     * @return {RGBOject} [r,g,b], values between 0-255.
     */
    static toRgbColorObject (value) {
        let color;
        if (typeof value === 'string' && value.substring(0, 1) === '#') {
            color = Color.hexToRgb(value);
        } else {
            color = Color.decimalToRgb(Cast.toNumber(value));
        }
        return color;
    }

    /**
     * Determine if a Scratch argument is a white space string (or null / empty).
     * @param {*} val value to check.
     * @return {boolean} True if the argument is all white spaces or null / empty.
     */
    static isWhiteSpace (val) {
        return val === null || (typeof val === 'string' && val.trim().length === 0);
    }

    /**
     * Compare two values, using Scratch cast, case-insensitive string compare, etc.
     * In Scratch 2.0, this is captured by `interp.compare.`
     * @param {*} v1 First value to compare.
     * @param {*} v2 Second value to compare.
     * @returns {number} Negative number if v1 < v2; 0 if equal; positive otherwise.
     */
    static compare (v1, v2) {
        let n1 = Number(v1);
        let n2 = Number(v2);
        if (n1 === 0 && Cast.isWhiteSpace(v1)) {
            n1 = NaN;
        } else if (n2 === 0 && Cast.isWhiteSpace(v2)) {
            n2 = NaN;
        }
        if (isNaN(n1) || isNaN(n2)) {
            // At least one argument can't be converted to a number.
            // Scratch compares strings as case insensitive.
            const s1 = String(v1).toLowerCase();
            const s2 = String(v2).toLowerCase();
            if (s1 < s2) {
                return -1;
            } else if (s1 > s2) {
                return 1;
            }
            return 0;
        }
        // Handle the special case of Infinity
        if (
            (n1 === Infinity && n2 === Infinity) ||
            (n1 === -Infinity && n2 === -Infinity)
        ) {
            return 0;
        }
        // Compare as numbers.
        return n1 - n2;
    }

    /**
     * Determine if a Scratch argument number represents a round integer.
     * @param {*} val Value to check.
     * @return {boolean} True if number looks like an integer.
     */
    static isInt (val) {
        // Values that are already numbers.
        if (typeof val === 'number') {
            if (isNaN(val)) { // NaN is considered an integer.
                return true;
            }
            // True if it's "round" (e.g., 2.0 and 2).
            return val === parseInt(val, 10);
        } else if (typeof val === 'boolean') {
            // `True` and `false` always represent integer after Scratch cast.
            return true;
        } else if (typeof val === 'string') {
            // If it contains a decimal point, don't consider it an int.
            return val.indexOf('.') < 0;
        }
        return false;
    }

    static get LIST_INVALID () {
        return 'INVALID';
    }

    static get LIST_ALL () {
        return 'ALL';
    }

    /**
     * Compute a 1-based index into a list, based on a Scratch argument.
     * Two special cases may be returned:
     * LIST_ALL: if the block is referring to all of the items in the list.
     * LIST_INVALID: if the index was invalid in any way.
     * @param {*} index Scratch arg, including 1-based numbers or special cases.
     * @param {number} length Length of the list.
     * @return {(number|string)} 1-based index for list, LIST_ALL, or LIST_INVALID.
     */
    static toListIndex (index, length) {
        if (typeof index !== 'number') {
            if (index === 'all') {
                return Cast.LIST_ALL;
            }
            if (index === 'last') {
                if (length > 0) {
                    return length;
                }
                return Cast.LIST_INVALID;
            } else if (index === 'random' || index === 'any') {
                if (length > 0) {
                    return 1 + Math.floor(Math.random() * length);
                }
                return Cast.LIST_INVALID;
            }
        }
        index = Math.floor(Cast.toNumber(index));
        if (index < 1 || index > length) {
            return Cast.LIST_INVALID;
        }
        return index;
    }
}

module.exports = Cast;

},{"../util/color":"/mHr"}],"I0iv":[function(require,module,exports) {
'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function (obj) { return typeof obj; }; } else { _typeof = function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var CancelError =
/*#__PURE__*/
function (_Error) {
  _inherits(CancelError, _Error);

  function CancelError(reason) {
    var _this;

    _classCallCheck(this, CancelError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(CancelError).call(this, reason || 'Promise was canceled'));
    _this.name = 'CancelError';
    return _this;
  }

  _createClass(CancelError, [{
    key: "isCanceled",
    get: function () {
      return true;
    }
  }]);

  return CancelError;
}(_wrapNativeSuper(Error));

var PCancelable =
/*#__PURE__*/
function () {
  _createClass(PCancelable, null, [{
    key: "fn",
    value: function fn(userFn) {
      return function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return new PCancelable(function (resolve, reject, onCancel) {
          args.push(onCancel);
          userFn.apply(void 0, args).then(resolve, reject);
        });
      };
    }
  }]);

  function PCancelable(executor) {
    var _this2 = this;

    _classCallCheck(this, PCancelable);

    this._cancelHandlers = [];
    this._isPending = true;
    this._isCanceled = false;
    this._rejectOnCancel = true;
    this._promise = new Promise(function (resolve, reject) {
      _this2._reject = reject;

      var onResolve = function (value) {
        _this2._isPending = false;
        resolve(value);
      };

      var onReject = function (error) {
        _this2._isPending = false;
        reject(error);
      };

      var onCancel = function (handler) {
        _this2._cancelHandlers.push(handler);
      };

      Object.defineProperties(onCancel, {
        shouldReject: {
          get: function () {
            return _this2._rejectOnCancel;
          },
          set: function (bool) {
            _this2._rejectOnCancel = bool;
          }
        }
      });
      return executor(onResolve, onReject, onCancel);
    });
  }

  _createClass(PCancelable, [{
    key: "then",
    value: function then(onFulfilled, onRejected) {
      return this._promise.then(onFulfilled, onRejected);
    }
  }, {
    key: "catch",
    value: function _catch(onRejected) {
      return this._promise.catch(onRejected);
    }
  }, {
    key: "finally",
    value: function _finally(onFinally) {
      return this._promise.finally(onFinally);
    }
  }, {
    key: "cancel",
    value: function cancel(reason) {
      if (!this._isPending || this._isCanceled) {
        return;
      }

      if (this._cancelHandlers.length > 0) {
        try {
          for (var handler of this._cancelHandlers) {
            handler();
          }
        } catch (error) {
          this._reject(error);
        }
      }

      this._isCanceled = true;

      if (this._rejectOnCancel) {
        this._reject(new CancelError(reason));
      }
    }
  }, {
    key: "isCanceled",
    get: function () {
      return this._isCanceled;
    }
  }]);

  return PCancelable;
}();

Object.setPrototypeOf(PCancelable.prototype, Promise.prototype);
module.exports = PCancelable;
module.exports.default = PCancelable;
module.exports.CancelError = CancelError;
},{}],"iA35":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

exports.__esModule = true;

var p_cancelable_1 = __importDefault(require("p-cancelable"));

var CancelableBlock =
/** @class */
function () {
  function CancelableBlock() {
    this.promise = null;
    this.resolve = null;
  }

  CancelableBlock.prototype.generateCancelablePromise = function (execFunction, onCompleted, duration) {
    var _this = this;

    if (this.promise) {
      this.promise.cancel();
    }

    this.promise = new p_cancelable_1["default"](function (resolve, reject, onCancel) {
      _this.resolve = resolve;
      var timer = setTimeout(function () {
        resolve();
        _this.resolve = null;
        _this.promise = _this.generateCancelablePromiseDelayed(onCompleted);
      }, duration * 1000);
      onCancel.shouldReject = false;
      onCancel(function () {
        clearTimeout(timer);
        resolve();
      });

      if (execFunction) {
        execFunction();
      }
    });
    return this.promise;
  };

  CancelableBlock.prototype.generateCancelablePromiseInterval = function (execFunction, checkFunction, onCompleted, duration) {
    var _this = this;

    if (this.promise) {
      this.promise.cancel();
    }

    this.promise = new p_cancelable_1["default"](function (resolve, reject, onCancel) {
      _this.resolve = resolve;
      var interval = setInterval(function () {
        if (checkFunction && checkFunction()) {
          resolve();
          _this.resolve = null;
          clearInterval(interval);
          _this.promise = _this.generateCancelablePromiseDelayed(onCompleted, 0);
          return;
        }

        if (execFunction) {
          execFunction();
        }
      }, duration * 1000);
      onCancel.shouldReject = false;
      onCancel(function () {
        clearInterval(interval);
        resolve();
      });
    });
    return this.promise;
  };

  CancelableBlock.prototype.generateCancelablePromiseDelayed = function (onCompleted, delay) {
    var _this = this;

    if (delay === void 0) {
      delay = CancelableBlock.DELAY_FOR_COMPLETION;
    }

    return new p_cancelable_1["default"](function (resolve, reject, onCancel) {
      var timer = setTimeout(function () {
        resolve();

        if (onCompleted) {
          onCompleted();
        }

        _this.promise = null;
      }, delay);
      onCancel.shouldReject = false;
      onCancel(function () {
        clearTimeout(timer);
      });
    });
  };

  CancelableBlock.prototype.stop = function (forceToStop) {
    if (forceToStop === void 0) {
      forceToStop = false;
    }

    var result = false;

    if (this.promise) {
      this.promise.cancel();
      this.promise = null;
      result = true;
    }

    if (this.resolve) {
      this.resolve();
      this.resolve = null;
    }

    return result;
  };

  CancelableBlock.DELAY_FOR_COMPLETION = 50;
  return CancelableBlock;
}();

exports["default"] = CancelableBlock;
},{"p-cancelable":"I0iv"}],"w/NW":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

exports.__esModule = true;

var cancelableBlock_1 = __importDefault(require("./cancelableBlock"));

var CoreCubeBlock =
/** @class */
function (_super) {
  __extends(CoreCubeBlock, _super);

  function CoreCubeBlock(coreCube) {
    var _this = _super.call(this) || this;

    _this.coreCube = coreCube;
    return _this;
  }

  CoreCubeBlock.prototype.setBlocks = function (blocks) {
    this.blocks = blocks;
  };

  CoreCubeBlock.prototype.getInfo = function () {
    return [];
  };

  CoreCubeBlock.prototype.getFunctions = function () {
    var _this = this;

    return this.getInfo().map(function (block) {
      if (!block.opcode) {
        return block;
      }

      var func = _this[block.func || block.opcode];

      if (!func) {
        console.warn("Function \"" + block.opcode + "\" is missing");
        return;
      }

      return {
        opcode: block.opcode,
        func: func.bind(_this)
      };
    });
  };

  return CoreCubeBlock;
}(cancelableBlock_1["default"]);

exports["default"] = CoreCubeBlock;
},{"./cancelableBlock":"iA35"}],"DSFH":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

exports.__esModule = true;

var ArgumentType = require("scratch-vm/src/extension-support/argument-type");

var BlockType = require("scratch-vm/src/extension-support/block-type");

var Cast = require("scratch-vm/src/util/cast");

var formatMessage = require("format-message");

var coreCubeBlock_1 = __importDefault(require("./coreCubeBlock"));

var MotorBlocks =
/** @class */
function (_super) {
  __extends(MotorBlocks, _super);

  function MotorBlocks() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  MotorBlocks.prototype.getInfo = function () {
    return [{
      opcode: 'moveFor',
      blockType: BlockType.COMMAND,
      text: formatMessage({
        id: 'toio.moveFor',
        "default": 'move [DIRECTION] at [SPEED] speed for [DURATION] seconds',
        description: 'move forward or backward for the specified duration'
      }),
      arguments: {
        DIRECTION: this.menus.MoveDirections,
        SPEED: {
          type: ArgumentType.NUMBER,
          defaultValue: 50
        },
        DURATION: {
          type: ArgumentType.NUMBER,
          defaultValue: 1
        }
      }
    }, {
      opcode: 'rotateFor',
      blockType: BlockType.COMMAND,
      text: formatMessage({
        id: 'toio.rotateFor',
        "default": 'rotate [DIRECTION] at [SPEED] speed for [DURATION] seconds',
        description: 'rotate left or right for the specified duration'
      }),
      arguments: {
        DIRECTION: this.menus.RotateDirections,
        SPEED: {
          type: ArgumentType.NUMBER,
          defaultValue: 30
        },
        DURATION: {
          type: ArgumentType.NUMBER,
          defaultValue: 1
        }
      }
    }, {
      opcode: 'moveWheelsFor',
      blockType: BlockType.COMMAND,
      text: formatMessage({
        id: 'toio.moveWheelsFor',
        "default": 'move left wheel forward at [LEFT_SPEED] speed and right wheel forward at [RIGHT_SPEED] speed' + 'for [DURATION] seconds',
        description: 'move left and right wheels for the specified direction'
      }),
      arguments: {
        LEFT_SPEED: {
          type: ArgumentType.NUMBER,
          defaultValue: 50
        },
        RIGHT_SPEED: {
          type: ArgumentType.NUMBER,
          defaultValue: 50
        },
        DURATION: {
          type: ArgumentType.NUMBER,
          defaultValue: 1
        }
      }
    }, {
      opcode: 'moveTo',
      blockType: BlockType.COMMAND,
      text: formatMessage({
        id: 'toio.moveTo',
        "default": 'move to x: [X] y: [Y]',
        description: 'move to the specified position'
      }),
      arguments: {
        X: {
          type: ArgumentType.NUMBER,
          defaultValue: 0
        },
        Y: {
          type: ArgumentType.NUMBER,
          defaultValue: 0
        }
      }
    }, {
      opcode: 'pointInDirection',
      blockType: BlockType.COMMAND,
      text: formatMessage({
        id: 'toio.pointInDirection',
        "default": 'point in direction [DIRECTION]',
        description: 'point in the specified direction'
      }),
      arguments: {
        DIRECTION: {
          type: ArgumentType.NUMBER,
          defaultValue: 0
        }
      }
    }, {
      opcode: 'stopWheels',
      blockType: BlockType.COMMAND,
      text: formatMessage({
        id: 'toio.stopWheels',
        "default": 'stop wheels',
        description: 'stop wheels'
      })
    }, '---'];
  };

  Object.defineProperty(MotorBlocks.prototype, "menus", {
    get: function get() {
      return {
        MoveDirections: {
          type: ArgumentType.STRING,
          menu: 'moveDirections',
          values: [{
            text: formatMessage({
              id: 'toio.moveForMenu.forward',
              "default": 'forward',
              description: 'forward'
            }),
            value: 'forward'
          }, {
            text: formatMessage({
              id: 'toio.moveForMenu.backward',
              "default": 'backward',
              description: 'backward'
            }),
            value: 'backward'
          }],
          defaultValue: 'forward'
        },
        RotateDirections: {
          type: ArgumentType.STRING,
          menu: 'rotateDirections',
          values: [{
            text: formatMessage({
              id: 'toio.rotateForMenu.left',
              "default": 'left',
              description: 'left'
            }),
            value: 'left'
          }, {
            text: formatMessage({
              id: 'toio.rotateForMenu.right',
              "default": 'right',
              description: 'right'
            }),
            value: 'right'
          }],
          defaultValue: 'left'
        }
      };
    },
    enumerable: true,
    configurable: true
  });

  MotorBlocks.prototype.moveFor = function (args) {
    var _this = this;

    var duration = Cast.toNumber(args.DURATION);

    if (duration <= 0) {
      return;
    }

    var direction = args.DIRECTION === 'forward' ? +1 : -1;
    var speed = Cast.toNumber(args.SPEED) * direction;

    if (Math.abs(speed) < MotorBlocks.SPEED_THRESHOLD) {
      this.coreCube.move([speed, speed]);
      return;
    }

    return this.generateCancelablePromise(function () {
      _this.coreCube.move([speed, speed]);
    }, function () {
      _this.stop();
    }, duration);
  };

  MotorBlocks.prototype.rotateFor = function (args) {
    var _this = this;

    var duration = Cast.toNumber(args.DURATION);

    if (duration <= 0) {
      return;
    }

    var direction = args.DIRECTION === 'left' ? +1 : -1;
    var speed = Cast.toNumber(args.SPEED) * direction;

    if (Math.abs(speed) < MotorBlocks.SPEED_THRESHOLD) {
      this.coreCube.move([-speed, +speed]);
      return;
    }

    return this.generateCancelablePromise(function () {
      _this.coreCube.move([-speed, +speed]);
    }, function () {
      _this.stop();
    }, duration);
  };

  MotorBlocks.prototype.moveWheelsFor = function (args) {
    var _this = this;

    var duration = Cast.toNumber(args.DURATION);

    if (duration <= 0) {
      return;
    }

    var leftSpeed = Cast.toNumber(args.LEFT_SPEED);
    var rightSpeed = Cast.toNumber(args.RIGHT_SPEED);

    if (Math.abs(leftSpeed) < MotorBlocks.SPEED_THRESHOLD && Math.abs(rightSpeed) < MotorBlocks.SPEED_THRESHOLD) {
      this.coreCube.move([leftSpeed, rightSpeed]);
      return;
    }

    return this.generateCancelablePromise(function () {
      _this.coreCube.move([leftSpeed, rightSpeed]);
    }, function () {
      _this.stop();
    }, duration);
  };

  MotorBlocks.prototype.moveTo = function (args) {
    var _this = this;

    if (!this.coreCube.getState().isTouched) {
      return;
    }

    var x = Cast.toNumber(args.X);
    var y = Cast.toNumber(args.Y);
    var speed = 70;
    return this.generateCancelablePromiseInterval(function () {
      var deltaX = x - _this.coreCube.getState().x;

      var deltaY = -y + _this.coreCube.getState().y;

      var deltaAngle = Math.atan2(deltaY, deltaX) - _this.coreCube.getState().rawDirection * MotorBlocks.DEGREE_TO_RADIAN;

      while (deltaAngle < -Math.PI) {
        deltaAngle += MotorBlocks.TWICE_PI;
      }

      while (deltaAngle > Math.PI) {
        deltaAngle -= MotorBlocks.TWICE_PI;
      }

      var leftSpeed = speed;
      var rightSpeed = speed;

      if (deltaAngle >= 0) {
        rightSpeed *= (MotorBlocks.HALF_PI - deltaAngle) / MotorBlocks.HALF_PI;
      } else {
        leftSpeed *= (MotorBlocks.HALF_PI + deltaAngle) / MotorBlocks.HALF_PI;
      }

      _this.coreCube.move([leftSpeed, rightSpeed]);
    }, function () {
      var deltaX = x - _this.coreCube.getState().x;

      var deltaY = -y + _this.coreCube.getState().y;

      var distance = Math.abs(deltaX) + Math.abs(deltaY);
      return distance < MotorBlocks.DISTANCE_THRESHOLD;
    }, function () {
      _this.stop();
    }, 0.05);
  };

  MotorBlocks.prototype.pointInDirection = function (args) {
    var _this = this;

    if (!this.coreCube.getState().isTouched) {
      return;
    }

    var direction = Cast.toNumber(args.DIRECTION);
    var baseSpeed = 40;
    var speed;
    return this.generateCancelablePromiseInterval(function () {
      var deltaAngle = (direction - _this.coreCube.getState().rawDirection + 270) % 360 * MotorBlocks.DEGREE_TO_RADIAN;

      if (deltaAngle < -Math.PI) {
        deltaAngle += MotorBlocks.TWICE_PI;
      }

      if (deltaAngle > Math.PI) {
        deltaAngle -= MotorBlocks.TWICE_PI;
      }

      if (Math.abs(deltaAngle) < MotorBlocks.HALF_PI) {
        speed = baseSpeed * Math.sin(deltaAngle);
      } else {
        if (deltaAngle > 0) {
          speed = baseSpeed;
        } else {
          speed = -baseSpeed;
        }
      }

      _this.coreCube.move([speed, -speed]);
    }, function () {
      var deltaAngle = (direction - _this.coreCube.getState().rawDirection + 270) % 360 * MotorBlocks.DEGREE_TO_RADIAN;
      return Math.abs(deltaAngle) < MotorBlocks.DIRECTION_THRESHOLD || Math.abs(deltaAngle) > MotorBlocks.TWICE_PI - MotorBlocks.DIRECTION_THRESHOLD || Math.abs(speed) < 11;
    }, function () {
      _this.stop();
    }, 0.03);
  };

  MotorBlocks.prototype.stopWheels = function () {
    this.stop(true);
  };

  MotorBlocks.prototype.stop = function (forceToStop) {
    if (forceToStop === void 0) {
      forceToStop = false;
    }

    var wasRunning = _super.prototype.stop.call(this);

    if (wasRunning || forceToStop) {
      this.coreCube.move([0, 0]);
    }

    return wasRunning;
  };

  MotorBlocks.HALF_PI = Math.PI / 2;
  MotorBlocks.TWICE_PI = Math.PI * 2;
  MotorBlocks.DEGREE_TO_RADIAN = Math.PI / 180;
  MotorBlocks.SPEED_THRESHOLD = 10;
  MotorBlocks.DISTANCE_THRESHOLD = 16;
  MotorBlocks.DIRECTION_THRESHOLD = 8 * MotorBlocks.DEGREE_TO_RADIAN;
  return MotorBlocks;
}(coreCubeBlock_1["default"]);

exports["default"] = MotorBlocks;
},{"scratch-vm/src/extension-support/argument-type":"eSML","scratch-vm/src/extension-support/block-type":"I4kj","scratch-vm/src/util/cast":"45jg","format-message":"Ecvv","./coreCubeBlock":"w/NW"}],"WXCI":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

exports.__esModule = true;

var BlockType = require("scratch-vm/src/extension-support/block-type");

var formatMessage = require("format-message");

var coreCubeBlock_1 = __importDefault(require("./coreCubeBlock"));

var IdBlocks =
/** @class */
function (_super) {
  __extends(IdBlocks, _super);

  function IdBlocks() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  IdBlocks.prototype.getInfo = function () {
    return [{
      opcode: 'getXPosition',
      blockType: BlockType.REPORTER,
      text: formatMessage({
        id: 'toio.stateTypeMenu.x',
        "default": 'x position',
        description: 'x position'
      })
    }, {
      opcode: 'getYPosition',
      blockType: BlockType.REPORTER,
      text: formatMessage({
        id: 'toio.stateTypeMenu.y',
        "default": 'y position',
        description: 'y position'
      })
    }, {
      opcode: 'getDirection',
      blockType: BlockType.REPORTER,
      text: formatMessage({
        id: 'toio.stateTypeMenu.direction',
        "default": 'direction',
        description: 'direction'
      })
    }, '---'];
  };

  IdBlocks.prototype.getXPosition = function () {
    return this.coreCube.getState().x;
  };

  IdBlocks.prototype.getYPosition = function () {
    return this.coreCube.getState().y;
  };

  IdBlocks.prototype.getDirection = function () {
    return this.coreCube.getState().direction;
  };

  return IdBlocks;
}(coreCubeBlock_1["default"]);

exports["default"] = IdBlocks;
},{"scratch-vm/src/extension-support/block-type":"I4kj","format-message":"Ecvv","./coreCubeBlock":"w/NW"}],"CgGe":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

exports.__esModule = true;

var ArgumentType = require("scratch-vm/src/extension-support/argument-type");

var BlockType = require("scratch-vm/src/extension-support/block-type");

var Cast = require("scratch-vm/src/util/cast");

var formatMessage = require("format-message");

var coreCubeBlock_1 = __importDefault(require("./coreCubeBlock"));

var LightBlocks =
/** @class */
function (_super) {
  __extends(LightBlocks, _super);

  function LightBlocks() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  LightBlocks.prototype.getInfo = function () {
    return [{
      opcode: 'setLightColorFor',
      blockType: BlockType.COMMAND,
      text: formatMessage({
        id: 'toio.setLightColorFor',
        "default": '"set light color to [COLOR] for [DURATION] seconds',
        description: 'set light color'
      }),
      arguments: {
        COLOR: {
          type: ArgumentType.COLOR
        },
        DURATION: {
          type: ArgumentType.NUMBER,
          defaultValue: 1
        }
      }
    }, {
      opcode: 'turnOffLight',
      blockType: BlockType.COMMAND,
      text: formatMessage({
        id: 'toio.turnOffLight',
        "default": 'turn off light',
        description: 'turn off light'
      })
    }, '---'];
  };

  LightBlocks.prototype.setLightColorFor = function (args) {
    var _this = this;

    var duration = Cast.toNumber(args.DURATION);

    if (duration <= 0) {
      return;
    }

    var color = this.convertColorFromStringIntoIntegers(args.COLOR);
    return this.generateCancelablePromise(function () {
      _this.coreCube.setLightColor(color);
    }, function () {
      _this.stop();
    }, duration);
  };

  LightBlocks.prototype.convertColorFromStringIntoIntegers = function (color) {
    var presetColor = LightBlocks.LightColors[color];

    if (presetColor) {
      return presetColor;
    }

    if (color[0] === '#') {
      // Hex
      var r = parseInt(color.slice(1, 3), 16);
      var g = parseInt(color.slice(3, 5), 16);
      var b = parseInt(color.slice(5, 7), 16);
      return [r, g, b];
    } else {
      // Array of decimal
      return color.split(' ').map(function (value) {
        return parseInt(value, 10);
      });
    }
  };

  LightBlocks.prototype.turnOffLight = function () {
    this.stop(true);
  };

  LightBlocks.prototype.stop = function (forceToStop) {
    if (forceToStop === void 0) {
      forceToStop = false;
    }

    var wasRunning = _super.prototype.stop.call(this);

    if (wasRunning || forceToStop) {
      this.coreCube.turnOffLight();
    }

    return wasRunning;
  };

  LightBlocks.LightColors = {
    white: [255, 255, 255],
    red: [255, 0, 0],
    green: [0, 255, 0],
    yellow: [255, 255, 0],
    blue: [0, 0, 255],
    magenta: [255, 0, 255],
    cyan: [0, 255, 255]
  };
  return LightBlocks;
}(coreCubeBlock_1["default"]);

exports["default"] = LightBlocks;
},{"scratch-vm/src/extension-support/argument-type":"eSML","scratch-vm/src/extension-support/block-type":"I4kj","scratch-vm/src/util/cast":"45jg","format-message":"Ecvv","./coreCubeBlock":"w/NW"}],"tfSL":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

exports.__esModule = true;

var ArgumentType = require("scratch-vm/src/extension-support/argument-type");

var BlockType = require("scratch-vm/src/extension-support/block-type");

var Cast = require("scratch-vm/src/util/cast");

var formatMessage = require("format-message");

var coreCubeBlock_1 = __importDefault(require("./coreCubeBlock"));

var SoundBlocks =
/** @class */
function (_super) {
  __extends(SoundBlocks, _super);

  function SoundBlocks() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  SoundBlocks.prototype.getInfo = function () {
    return [{
      opcode: 'playNoteFor',
      blockType: BlockType.COMMAND,
      text: formatMessage({
        id: 'toio.playNoteFor',
        "default": 'play note [NOTE] for [DURATION] seconds',
        description: 'play note for the specified duration'
      }),
      arguments: {
        NOTE: {
          type: ArgumentType.NOTE,
          defaultValue: 60
        },
        DURATION: {
          type: ArgumentType.NUMBER,
          defaultValue: 1
        }
      }
    }, {
      opcode: 'stopNote',
      blockType: BlockType.COMMAND,
      text: formatMessage({
        id: 'toio.stopNote',
        "default": 'stop note',
        description: 'stop note'
      })
    }, '---'];
  };

  SoundBlocks.prototype.playNoteFor = function (args) {
    var _this = this;

    var duration = Cast.toNumber(args.DURATION);

    if (duration <= 0) {
      return;
    }

    var note = Cast.toNumber(args.NOTE);
    return this.generateCancelablePromise(function () {
      _this.coreCube.playSound(note, 127, 2.55);
    }, function () {
      _this.stop();
    }, duration);
  };

  SoundBlocks.prototype.stopNote = function () {
    this.stop(true);
  };

  SoundBlocks.prototype.stop = function (forceToStop) {
    if (forceToStop === void 0) {
      forceToStop = false;
    }

    var wasRunning = _super.prototype.stop.call(this);

    if (wasRunning || forceToStop) {
      this.coreCube.stopSound();
    }

    return wasRunning;
  };

  return SoundBlocks;
}(coreCubeBlock_1["default"]);

exports["default"] = SoundBlocks;
},{"scratch-vm/src/extension-support/argument-type":"eSML","scratch-vm/src/extension-support/block-type":"I4kj","scratch-vm/src/util/cast":"45jg","format-message":"Ecvv","./coreCubeBlock":"w/NW"}],"j977":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

exports.__esModule = true;

var ArgumentType = require("scratch-vm/src/extension-support/argument-type");

var BlockType = require("scratch-vm/src/extension-support/block-type");

var Cast = require("scratch-vm/src/util/cast");

var formatMessage = require("format-message");

var coreCubeBlock_1 = __importDefault(require("./coreCubeBlock"));

var mat_1 = __importDefault(require("../toio/mat"));

var motor_1 = __importDefault(require("./motor"));

var GridBlocks =
/** @class */
function (_super) {
  __extends(GridBlocks, _super);

  function GridBlocks() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  GridBlocks.prototype.getInfo = function () {
    return [{
      opcode: 'moveToOnGrid',
      blockType: BlockType.COMMAND,
      text: formatMessage({
        id: 'toio.moveToOnGrid',
        "default": 'move to column: [COLUMN] row: [ROW]',
        description: 'move to the specified column and row'
      }),
      arguments: {
        COLUMN: this.menus.Values,
        ROW: this.menus.Values
      }
    }, {
      opcode: 'getColumnIndex',
      blockType: BlockType.REPORTER,
      text: formatMessage({
        id: 'toio.getColumnIndex',
        "default": 'column index on grid"',
        description: 'get column index on grid'
      })
    }, {
      opcode: 'getRowIndex',
      blockType: BlockType.REPORTER,
      text: formatMessage({
        id: 'toio.getRowIndex',
        "default": 'row index on grid"',
        description: 'get row index on grid'
      })
    }, '---'];
  };

  Object.defineProperty(GridBlocks.prototype, "menus", {
    get: function get() {
      return {
        Values: {
          type: ArgumentType.STRING,
          menu: 'stateTypes',
          values: ['4', '3', '2', '1', '0', '-1', '-2', '-3', '-4'],
          defaultValue: '0'
        },
        MatAxes: {
          type: ArgumentType.STRING,
          menu: 'matAxes',
          values: [{
            text: formatMessage({
              id: 'toio.getColumnOrRowIndexMenu.column',
              "default": 'column',
              description: 'column'
            }),
            value: 'column'
          }, {
            text: formatMessage({
              id: 'toio.getColumnOrRowIndexMenu.row',
              "default": 'row',
              description: 'row'
            }),
            value: 'row'
          }],
          defaultValue: 'column'
        }
      };
    },
    enumerable: true,
    configurable: true
  });

  GridBlocks.prototype.setBlocks = function (blocks) {
    var _this = this;

    _super.prototype.setBlocks.call(this, blocks);

    this.blocks.forEach(function (block) {
      if (block instanceof motor_1["default"]) {
        _this.motorBlocks = block;
      }
    });
  };

  GridBlocks.prototype.moveToOnGrid = function (args) {
    var column = Cast.toNumber(args.COLUMN);
    var row = Cast.toNumber(args.ROW);
    var x = mat_1["default"].convertColumnToX(column);
    var y = mat_1["default"].convertRowToY(row);
    return this.motorBlocks.moveTo({
      X: x,
      Y: y
    });
  };

  GridBlocks.prototype.getColumnIndex = function () {
    var state = this.coreCube.getState();

    if (!mat_1["default"].checkIfOnColoredMat(state)) {
      return 0;
    }

    return mat_1["default"].convertXToColumn(state.rawX);
  };

  GridBlocks.prototype.getRowIndex = function () {
    var state = this.coreCube.getState();

    if (!mat_1["default"].checkIfOnColoredMat(state)) {
      return 0;
    }

    return mat_1["default"].convertYToRow(state.rawY);
  };

  return GridBlocks;
}(coreCubeBlock_1["default"]);

exports["default"] = GridBlocks;
},{"scratch-vm/src/extension-support/argument-type":"eSML","scratch-vm/src/extension-support/block-type":"I4kj","scratch-vm/src/util/cast":"45jg","format-message":"Ecvv","./coreCubeBlock":"w/NW","../toio/mat":"p22o","./motor":"DSFH"}],"R2z7":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

exports.__esModule = true;

var Card =
/** @class */
function () {
  function Card() {}

  Card.checkIfMatchStandardId = function (state, type) {
    if (!this.cardTypes) {
      this.cardTypes = this.getCardTypes();
    }

    return state.isTouched && this.cardTypes[type].id === state.standardId;
  };

  Card.checkIfMatchAnyType = function (state, type) {
    if (!this.cardTypes) {
      this.cardTypes = this.getCardTypes();
    }

    return state.isTouched && state.standardId && this.cardTypes[state.standardId].label.indexOf(type) !== -1;
  };

  Card.getCardTypes = function () {
    var cardTypes = {};

    for (var _i = 0, _a = Object.keys(Card.Types); _i < _a.length; _i++) {
      var key = _a[_i];
      var cardType = Card.Types[key];
      cardTypes[cardType.label] = cardType;
      cardTypes[cardType.id] = cardType;
    }

    return cardTypes;
  };

  Card.Types = {
    // Rhythm and Go
    LEFT: {
      label: 'left card',
      id: 3670024
    },
    RIGHT: {
      label: 'right card',
      id: 3670062
    },
    FRONT: {
      label: 'front card',
      id: 3670026
    },
    BACK: {
      label: 'back card',
      id: 3670064
    },
    GO: {
      label: 'go card',
      id: 3670028
    },
    // Craft Fighter
    TYPHOON: {
      label: 'typhoon card',
      id: 3670016
    },
    RUSH: {
      label: 'rush card',
      id: 3670054
    },
    AUTO_TACKLE: {
      label: 'auto tackle card',
      id: 3670018
    },
    RANDOM: {
      label: 'random card',
      id: 3670056
    },
    PUSH_POWER_UP: {
      label: 'push power up card',
      id: 3670020
    },
    STRUT_POWER_UP: {
      label: 'strut power up card',
      id: 3670058
    },
    SIDE_ATTACK: {
      label: 'side attack card',
      id: 3670022
    },
    EASY_MODE: {
      label: 'easy mode card',
      id: 3670060
    },
    // Common
    SPEED_UP: {
      label: 'speed up sticker',
      id: 3670066
    },
    SPEED_DOWN: {
      label: 'speed down sticker',
      id: 3670030
    },
    WOBBLE: {
      label: 'wobble sticker',
      id: 3670068
    },
    PANIC: {
      label: 'panic sticker',
      id: 3670032
    },
    SPIN: {
      label: 'spin sticker',
      id: 3670070
    },
    SHOCK: {
      label: 'shock sticker',
      id: 3670034
    }
  };
  Card.cardTypes = null;
  return Card;
}();

exports["default"] = Card;
},{}],"YjP5":[function(require,module,exports) {
module.exports = {
  "toio.moveFor": "move [DIRECTION] at [SPEED] speed for [DURATION] seconds",
  "toio.moveForMenu.forward": "forward",
  "toio.moveForMenu.backward": "backward",
  "toio.rotateFor": "rotate [DIRECTION] at [SPEED] speed for [DURATION] seconds",
  "toio.rotateForMenu.left": "left",
  "toio.rotateForMenu.right": "right",
  "toio.moveWheelsFor": "move left wheel forward at [LEFT_SPEED] speed and right wheel forward at [RIGHT_SPEED] speed for [DURATION] seconds",
  "toio.moveTo": "move to x: [X] y: [Y]",
  "toio.pointInDirection": "point in direction [DIRECTION]",
  "toio.stopWheels": "stop wheels",
  "toio.setLightColorFor": "set light color to [COLOR] for [DURATION] seconds",
  "toio.turnOffLight": "turn off light",
  "toio.playNoteFor": "play note [NOTE] for [DURATION] seconds",
  "toio.stopNote": "stop note",
  "toio.stateTypeMenu.x": "x position",
  "toio.stateTypeMenu.y": "y position",
  "toio.stateTypeMenu.direction": "direction",
  "toio.moveToOnGrid": "move to column: [COLUMN] row: [ROW]",
  "toio.getColumnOrRowIndex": "[MAT_AXES] index on grid",
  "toio.getColumnOrRowIndexMenu.column": "column",
  "toio.getColumnOrRowIndexMenu.row": "row",
  "toio.getColumnIndex": "column index on grid",
  "toio.getRowIndex": "row index on grid",
  "toio.whenTouched": "when [TYPE] is touched",
  "toio.isTouched": "[TYPE] is touched",
  "toio.whenTouchedMenu.mat": "mat",
  "toio.whenTouchedMenu.frontCard": "front card",
  "toio.whenTouchedMenu.backCard": "back card",
  "toio.whenTouchedMenu.leftCard": "left card",
  "toio.whenTouchedMenu.rightCard": "right card",
  "toio.whenTouchedMenu.goCard": "go card",
  "toio.whenTouchedMenu.typhoonCard": "typhoon card",
  "toio.whenTouchedMenu.rushCard": "rush card",
  "toio.whenTouchedMenu.autoTackleCard": "auto tackle card",
  "toio.whenTouchedMenu.randomCard": "random card",
  "toio.whenTouchedMenu.pushPowerUpCard": "push power up card",
  "toio.whenTouchedMenu.strutPowerUpCard": "strut power up card",
  "toio.whenTouchedMenu.sideAttackCard": "side attack card",
  "toio.whenTouchedMenu.easyModeCard": "easy mode card",
  "toio.whenTouchedMenu.anyCard": "any card",
  "toio.whenTouchedMenu.spinSticker": "spin sticker",
  "toio.whenTouchedMenu.shockSticker": "shock sticker",
  "toio.whenTouchedMenu.wobbleSticker": "wobble sticker",
  "toio.whenTouchedMenu.panicSticker": "panic sticker",
  "toio.whenTouchedMenu.speedUpSticker": "speed up sticker",
  "toio.whenTouchedMenu.speedDownSticker": "speed down sticker",
  "toio.whenTouchedMenu.anySticker": "any sticker",
  "toio.whenTouchedMenu.whiteCell": "white cell",
  "toio.whenTouchedMenu.redCell": "red cell",
  "toio.whenTouchedMenu.greenCell": "green cell",
  "toio.whenTouchedMenu.yellowCell": "yellow cell",
  "toio.whenTouchedMenu.blueCell": "blue cell"
};
},{}],"jj3x":[function(require,module,exports) {
module.exports = {
  "toio.moveFor": "[DIRECTION]に速さ[SPEED]%で[DURATION]秒動かす",
  "toio.moveForMenu.forward": "前",
  "toio.moveForMenu.backward": "後ろ",
  "toio.rotateFor": "[DIRECTION]に速さ[SPEED]%で[DURATION]秒回す",
  "toio.rotateForMenu.left": "左",
  "toio.rotateForMenu.right": "右",
  "toio.moveWheelsFor": "左タイヤを速さ[LEFT_SPEED]%、右タイヤを速さ[RIGHT_SPEED]%で[DURATION]秒動かす",
  "toio.moveTo": "x座標[X]、y座標[Y]へ動かす",
  "toio.pointInDirection": "[DIRECTION]度に向ける",
  "toio.stopWheels": "タイヤを止める",
  "toio.setLightColorFor": "ランプの色[COLOR]を[DURATION]秒つける",
  "toio.turnOffLight": "ランプを消す",
  "toio.playNoteFor": "音[NOTE]を[DURATION]秒鳴らす",
  "toio.stopNote": "音を止める",
  "toio.stateTypeMenu.x": "x座標",
  "toio.stateTypeMenu.y": "y座標",
  "toio.stateTypeMenu.direction": "向き",
  "toio.moveToOnGrid": "列[COLUMN]、行[ROW]のマスへ動かす",
  "toio.getColumnOrRowIndex": "マスの[MAT_AXES]番号",
  "toio.getColumnOrRowIndexMenu.column": "列",
  "toio.getColumnOrRowIndexMenu.row": "行",
  "toio.getColumnIndex": "マスの列番号",
  "toio.getRowIndex": "マスの行番号",
  "toio.whenTouched": "[TYPE]に触れたとき",
  "toio.isTouched": "[TYPE]に触れた",
  "toio.whenTouchedMenu.mat": "マット",
  "toio.whenTouchedMenu.frontCard": "前カード",
  "toio.whenTouchedMenu.backCard": "後ろカード",
  "toio.whenTouchedMenu.leftCard": "左カード",
  "toio.whenTouchedMenu.rightCard": "右カード",
  "toio.whenTouchedMenu.goCard": "Goカード",
  "toio.whenTouchedMenu.typhoonCard": "タイフーンカード",
  "toio.whenTouchedMenu.rushCard": "ラッシュカード",
  "toio.whenTouchedMenu.autoTackleCard": "オートタックルカード",
  "toio.whenTouchedMenu.randomCard": "ランダムカード",
  "toio.whenTouchedMenu.pushPowerUpCard": "ツキパワーアップカード",
  "toio.whenTouchedMenu.strutPowerUpCard": "ハリテパワーアップカード",
  "toio.whenTouchedMenu.sideAttackCard": "サイドアタックカード",
  "toio.whenTouchedMenu.easyModeCard": "イージーモードカード",
  "toio.whenTouchedMenu.anyCard": "どれかのカード",
  "toio.whenTouchedMenu.spinSticker": "スピンシール",
  "toio.whenTouchedMenu.shockSticker": "ショックシール",
  "toio.whenTouchedMenu.wobbleSticker": "ふらつきシール",
  "toio.whenTouchedMenu.panicSticker": "パニックシール",
  "toio.whenTouchedMenu.speedUpSticker": "スピードアップシール",
  "toio.whenTouchedMenu.speedDownSticker": "スピードダウンシール",
  "toio.whenTouchedMenu.anySticker": "どれかのシール",
  "toio.whenTouchedMenu.whiteCell": "白のマス",
  "toio.whenTouchedMenu.redCell": "赤のマス",
  "toio.whenTouchedMenu.greenCell": "緑のマス",
  "toio.whenTouchedMenu.yellowCell": "黄のマス",
  "toio.whenTouchedMenu.blueCell": "青のマス"
};
},{}],"iYIC":[function(require,module,exports) {
module.exports = {
  "toio.moveFor": "[DIRECTION]にはやさ[SPEED]%で[DURATION]びょうすすむ",
  "toio.moveForMenu.forward": "まえ",
  "toio.moveForMenu.backward": "うしろ",
  "toio.rotateFor": "[DIRECTION]にはやさ[SPEED]%で[DURATION]びょうまわる",
  "toio.rotateForMenu.left": "ひだり",
  "toio.rotateForMenu.right": "みぎ",
  "toio.moveWheelsFor": "ひだりタイヤをはやさ[LEFT_SPEED]%、みぎタイヤをはやさ[RIGHT_SPEED]%で[DURATION]びょううごかす",
  "toio.moveTo": "xざひょう[X]、yざひょう[Y]へいく",
  "toio.pointInDirection": "[DIRECTION]どにむける",
  "toio.stopWheels": "タイヤをとめる",
  "toio.setLightColorFor": "ランプのいろを[DURATION]びょう[COLOR]にする",
  "toio.turnOffLight": "ランプをけす",
  "toio.playNoteFor": "おと[NOTE]を[DURATION]びょうならす",
  "toio.stopNote": "おとをとめる",
  "toio.stateTypeMenu.x": "xざひょう",
  "toio.stateTypeMenu.y": "yざひょう",
  "toio.stateTypeMenu.direction": "むき",
  "toio.moveToOnGrid": "れつ[COLUMN]、ぎょう[ROW]のマスへうごかす",
  "toio.getColumnOrRowIndex": "マスの[MAT_AXES]ばんごう",
  "toio.getColumnOrRowIndexMenu.column": "れつ",
  "toio.getColumnOrRowIndexMenu.row": "ぎょう",
  "toio.getColumnIndex": "マスのれつばんごう",
  "toio.getRowIndex": "マスのぎょうばんごう",
  "toio.whenTouched": "[TYPE]にふれたとき",
  "toio.isTouched": "[TYPE]にふれた",
  "toio.whenTouchedMenu.mat": "マット",
  "toio.whenTouchedMenu.frontCard": "まえカード",
  "toio.whenTouchedMenu.backCard": "うしろカード",
  "toio.whenTouchedMenu.leftCard": "ひだりカード",
  "toio.whenTouchedMenu.rightCard": "みぎカード",
  "toio.whenTouchedMenu.goCard": "Goカード",
  "toio.whenTouchedMenu.typhoonCard": "タイフーンカード",
  "toio.whenTouchedMenu.rushCard": "ラッシュカード",
  "toio.whenTouchedMenu.autoTackleCard": "オートタックルカード",
  "toio.whenTouchedMenu.randomCard": "ランダムカード",
  "toio.whenTouchedMenu.pushPowerUpCard": "ツキパワーアップカード",
  "toio.whenTouchedMenu.strutPowerUpCard": "ハリテパワーアップカード",
  "toio.whenTouchedMenu.sideAttackCard": "サイドアタックカード",
  "toio.whenTouchedMenu.easyModeCard": "イージーモードカード",
  "toio.whenTouchedMenu.anyCard": "どれかのカード",
  "toio.whenTouchedMenu.spinSticker": "スピンシール",
  "toio.whenTouchedMenu.shockSticker": "ショックシール",
  "toio.whenTouchedMenu.wobbleSticker": "ふらつきシール",
  "toio.whenTouchedMenu.panicSticker": "パニックシール",
  "toio.whenTouchedMenu.speedUpSticker": "スピードアップシール",
  "toio.whenTouchedMenu.speedDownSticker": "スピードダウンシール",
  "toio.whenTouchedMenu.anySticker": "どれかのシール",
  "toio.whenTouchedMenu.whiteCell": "しろのマス",
  "toio.whenTouchedMenu.redCell": "あかのマス",
  "toio.whenTouchedMenu.greenCell": "みどりのマス",
  "toio.whenTouchedMenu.yellowCell": "きいろのマス",
  "toio.whenTouchedMenu.blueCell": "あおのマス"
};
},{}],"0dcf":[function(require,module,exports) {
module.exports = {
  "toio.moveFor": "向[DIRECTION]以[SPEED]%速度移动[DURATION]秒",
  "toio.moveForMenu.forward": "前",
  "toio.moveForMenu.backward": "后",
  "toio.rotateFor": "向[DIRECTION]以[SPEED]%速度转向[DURATION]秒",
  "toio.rotateForMenu.left": "左",
  "toio.rotateForMenu.right": "右",
  "toio.moveWheelsFor": "左轮以[LEFT_SPEED]%速度、右轮以[RIGHT_SPEED]%速度移动[DURATION]秒",
  "toio.moveTo": "向x坐标[X]、y坐标[Y]移动",
  "toio.pointInDirection": "转向[DIRECTION]度",
  "toio.stopWheels": "停下轮子",
  "toio.setLightColorFor": "设置颜色[COLOR]点亮灯[DURATION]秒",
  "toio.turnOffLight": "关闭灯",
  "toio.playNoteFor": "鸣笛[NOTE]持续[DURATION]秒",
  "toio.stopNote": "停止鸣笛",
  "toio.stateTypeMenu.x": "x坐标",
  "toio.stateTypeMenu.y": "y坐标",
  "toio.stateTypeMenu.direction": "转向",
  "toio.moveToOnGrid": "向格子列[COLUMN]、行[ROW]移动",
  "toio.getColumnOrRowIndex": "格子的[MAT_AXES]序号",
  "toio.getColumnOrRowIndexMenu.column": "列",
  "toio.getColumnOrRowIndexMenu.row": "行",
  "toio.getColumnIndex": "格子的列序号",
  "toio.getRowIndex": "格子的行序号",
  "toio.whenTouched": "碰到[TYPE]时",
  "toio.isTouched": "碰到[TYPE]",
  "toio.whenTouchedMenu.mat": "垫子",
  "toio.whenTouchedMenu.frontCard": "向前卡片",
  "toio.whenTouchedMenu.backCard": "向后卡片",
  "toio.whenTouchedMenu.leftCard": "向左卡片",
  "toio.whenTouchedMenu.rightCard": "向右卡片",
  "toio.whenTouchedMenu.goCard": "Go卡片",
  "toio.whenTouchedMenu.typhoonCard": "台风卡片",
  "toio.whenTouchedMenu.rushCard": "冲刺卡片",
  "toio.whenTouchedMenu.autoTackleCard": "自动攻击卡片",
  "toio.whenTouchedMenu.randomCard": "随机卡片",
  "toio.whenTouchedMenu.pushPowerUpCard": "冲撞提升卡片",
  "toio.whenTouchedMenu.strutPowerUpCard": "碰撞提升卡片",
  "toio.whenTouchedMenu.sideAttackCard": "侧翼攻击卡片",
  "toio.whenTouchedMenu.easyModeCard": "简单模式卡片",
  "toio.whenTouchedMenu.anyCard": "任何卡片",
  "toio.whenTouchedMenu.spinSticker": "眩晕标签",
  "toio.whenTouchedMenu.shockSticker": "惊吓标签",
  "toio.whenTouchedMenu.wobbleSticker": "摇晃标签",
  "toio.whenTouchedMenu.panicSticker": "恐惧标签",
  "toio.whenTouchedMenu.speedUpSticker": "加速标签",
  "toio.whenTouchedMenu.speedDownSticker": "减速标签",
  "toio.whenTouchedMenu.anySticker": "任何标签",
  "toio.whenTouchedMenu.whiteCell": "白色格子",
  "toio.whenTouchedMenu.redCell": "红色格子",
  "toio.whenTouchedMenu.greenCell": "绿色格子",
  "toio.whenTouchedMenu.yellowCell": "黄色格子",
  "toio.whenTouchedMenu.blueCell": "蓝色格子"
};
},{}],"yrxK":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

exports.__esModule = true;
var translations = {
  en: require('./en.json'),
  ja: require('./ja.json'),
  'ja-Hira': require('./ja-Hira.json'),
  'zh-cn': require('./zh-CN.json')
};
exports["default"] = translations;
},{"./en.json":"YjP5","./ja.json":"jj3x","./ja-Hira.json":"iYIC","./zh-CN.json":"0dcf"}],"seFL":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

exports.__esModule = true;

var ArgumentType = require("scratch-vm/src/extension-support/argument-type");

var BlockType = require("scratch-vm/src/extension-support/block-type");

var formatMessage = require("format-message");

var coreCubeBlock_1 = __importDefault(require("./coreCubeBlock"));

var card_1 = __importDefault(require("../toio/card"));

var translations_1 = __importDefault(require("../translations"));

var mat_1 = __importDefault(require("../toio/mat"));

var MatBlocks =
/** @class */
function (_super) {
  __extends(MatBlocks, _super);

  function MatBlocks() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  MatBlocks.prototype.getInfo = function () {
    return [{
      opcode: 'whenTouched',
      blockType: BlockType.HAT,
      text: formatMessage({
        id: 'toio.whenTouched',
        "default": 'when [TYPE] is touched',
        description: 'when mat, card or sticker is touched'
      }),
      arguments: {
        TYPE: this.menus.DetectedTypes
      }
    }, {
      opcode: 'isTouched',
      blockType: BlockType.BOOLEAN,
      text: formatMessage({
        id: 'toio.isTouched',
        "default": '[TYPE] is touched',
        description: 'If mat, card or sticker is touched'
      }),
      func: 'whenTouched',
      arguments: {
        TYPE: this.menus.DetectedTypes
      }
    }];
  };

  Object.defineProperty(MatBlocks.prototype, "menus", {
    get: function get() {
      var values = MatBlocks.MENUS.map(function (menuItem) {
        var id = 'toio.whenTouchedMenu.' + menuItem;
        var value = translations_1["default"].en[id];
        return {
          text: formatMessage({
            id: id,
            "default": value,
            description: value
          }),
          value: value
        };
      });
      return {
        DetectedTypes: {
          type: ArgumentType.STRING,
          menu: 'detectedTypes',
          values: values,
          defaultValue: values[0].value
        }
      };
    },
    enumerable: true,
    configurable: true
  });

  MatBlocks.prototype.whenTouched = function (args) {
    var state = this.coreCube.getState();

    switch (args.TYPE) {
      case 'mat':
        return mat_1["default"].checkIfOnMat(state);

      case 'any card':
        return card_1["default"].checkIfMatchAnyType(state, 'card');

      case 'any sticker':
        return card_1["default"].checkIfMatchAnyType(state, 'sticker');

      case 'white cell':
      case 'red cell':
      case 'green cell':
      case 'yellow cell':
      case 'blue cell':
        return mat_1["default"].checkIfMatchColor(state, args.TYPE);

      default:
        return card_1["default"].checkIfMatchStandardId(state, args.TYPE);
    }

    return false;
  };

  MatBlocks.MENUS = ['mat', 'frontCard', 'backCard', 'leftCard', 'rightCard', 'goCard', 'typhoonCard', 'rushCard', 'autoTackleCard', 'randomCard', 'pushPowerUpCard', 'strutPowerUpCard', 'sideAttackCard', 'easyModeCard', 'anyCard', 'spinSticker', 'shockSticker', 'wobbleSticker', 'panicSticker', 'speedUpSticker', 'speedDownSticker', 'anySticker', 'whiteCell', 'redCell', 'greenCell', 'yellowCell', 'blueCell'];
  return MatBlocks;
}(coreCubeBlock_1["default"]);

exports["default"] = MatBlocks;
},{"scratch-vm/src/extension-support/argument-type":"eSML","scratch-vm/src/extension-support/block-type":"I4kj","format-message":"Ecvv","./coreCubeBlock":"w/NW","../toio/card":"R2z7","../translations":"yrxK","../toio/mat":"p22o"}],"VRtA":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

exports.__esModule = true;

var motor_1 = __importDefault(require("./motor"));

var id_1 = __importDefault(require("./id"));

var light_1 = __importDefault(require("./light"));

var sound_1 = __importDefault(require("./sound"));

var matGrid_1 = __importDefault(require("./matGrid"));

var mat_1 = __importDefault(require("./mat"));

var Blocks =
/** @class */
function () {
  function Blocks(coreCube) {
    var _this = this;

    this.blocks = Blocks.BLOCK_CLASSES.map(function (blockClass) {
      return new blockClass(coreCube);
    });
    this.blocks.forEach(function (block) {
      block.setBlocks(_this.blocks);
    });
    this.info = this.merge(this.blocks, function (block) {
      return block.getInfo();
    });
    this.functions = this.merge(this.blocks, function (block) {
      return block.getFunctions();
    });
    var menus = this.merge(this.blocks, function (block) {
      return _this.getMenus(block);
    });
    this.menus = menus.reduce(function (acc, menu) {
      return __assign({}, acc, menu);
    }, {});
  }

  Blocks.prototype.updateTexts = function () {
    var _this = this;

    this.info = this.merge(this.blocks, function (block) {
      return block.getInfo();
    });
    var menus = this.merge(this.blocks, function (block) {
      return _this.getMenus(block);
    });
    this.menus = menus.reduce(function (acc, menu) {
      return __assign({}, acc, menu);
    }, {});
  };

  Blocks.prototype.merge = function (blocks, func) {
    return blocks.reduce(function (acc, block) {
      var result = func(block);
      return result ? acc.concat(result) : acc;
    }, []);
  };

  Blocks.prototype.getMenus = function (blocks) {
    if (!blocks.menus) {
      return;
    }

    var result = {};

    for (var _i = 0, _a = Object.keys(blocks.menus); _i < _a.length; _i++) {
      var key = _a[_i];
      var menu = blocks.menus[key];
      result[menu.menu] = menu.values;
    }

    return result;
  };

  Blocks.prototype.stop = function (forceToStop) {
    this.blocks.forEach(function (block) {
      block.stop(forceToStop);
    });
  };

  Blocks.BLOCK_CLASSES = [motor_1["default"], id_1["default"], light_1["default"], sound_1["default"], matGrid_1["default"], mat_1["default"]];
  return Blocks;
}();

exports["default"] = Blocks;
},{"./motor":"DSFH","./id":"WXCI","./light":"CgGe","./sound":"tfSL","./matGrid":"j977","./mat":"seFL"}],"FObV":[function(require,module,exports) {
module.exports = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjIwcHgiIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAwIDIwIDIwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPg0KICAgIDx0aXRsZT5jdWJlX3M8L3RpdGxlPg0KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPg0KICAgICAgICA8ZyBpZD0iR3JvdXAtQ29weS0zIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxLjUwMDAwMCwgMi41MDAwMDApIj4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNi4zMjY5NTc0LDEuNzQ2ODc3MDQgTDEyLjE3ODk1NzQsMS4xMDM0Mzk1NCBDMTIuMTM2NDU3NCwxLjAzOTA2NDU0IDEyLjA3MDM0NjMsMC45ODkzNzcwMzcgMTEuOTgzNzcyMiwwLjk3MTU2NDUzNyBMMTEuMjgwMTYxMSwwLjg1NDY4OTUzNyBDMTEuMTg4MjM1MiwwLjgzNzE4OTUzNyAxMS4wOTIyMTY3LDAuODYxMjUyMDM3IDEwLjk5MzM2NDgsMC45MDAwMDIwMzcgTDkuMjY0MDg3MDQsMC42MDM0Mzk1MzcgQzkuMjMzMjM1MTksMC41MzA5Mzk1MzcgOS4xODc1ODcwNCwwLjQ3MDYyNzAzNyA5LjA5MTg4MzMzLDAuNDUzMTI3MDM3IEw4LjQxNTAzMTQ4LDAuMzI3ODE0NTM3IEM4LjI4ODc5MDc0LDAuMzAxODc3MDM3IDguMTU3NTEyOTYsMC4zMTk2ODk1MzcgOC4wNzMxNDI1OSwwLjM5OTA2NDUzNyBMNi4yMjgwMTI5NiwwLjAxNjU2NDUzNzMgQzUuODY1OTc1OTMsLTAuMDQ0MzcyOTYyNyA1LjQ2NjE2MTExLDAuMDcxNTY0NTM3MyA1LjMwMDU2ODUyLDAuMzI3NTAyMDM3IEwwLjI1ODQ5NDQ0NCw2LjIzMTg3NzA0IEMwLjEwOTkwMTg1Miw2LjQ0OTM3NzA0IDAuMDU1NzUzNzAzNyw2Ljc2OTM3NzA0IDAuMDUxNjYxMTExMSw3LjA0ODc1MjA0IEwwLjI3ODY0MjU5MywxMi4yNjg3NTIgQzAuMjgyNzM1MTg1LDEyLjUyNjg3NyAwLjQ1NTI1MzcwNCwxMi43NjI4MTQ1IDAuNzQzOTM4ODg5LDEyLjgxNzE4OTUgTDExLjk3OTk5NDQsMTQuODg5Njg5NSBDMTIuMzIzMTQyNiwxNC45NjEyNTIgMTIuNjk5OTc1OSwxNC44MjM0Mzk1IDEyLjg1MjAzMTUsMTQuNTYwNjI3IEwxNi4zMzc5NzU5LDguODM4MTI3MDQgQzE2LjQ2NzY3OTYsOC41OTY4NzcwNCAxNi41MzUwNSw4LjMxNDM3NzA0IDE2LjU0MDA4Nyw4LjAyMDYyNzA0IEwxNi44Nzg4Mjc4LDIuMzkzMTI3MDQgQzE2Ljg3NDEwNTYsMi4xMDU2MjcwNCAxNi42NjY5NTc0LDEuODEwNjI3MDQgMTYuMzI2OTU3NCwxLjc0Njg3NzA0IiBpZD0iRmlsbC02MjkiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMS4xNzM5NzQxLDUuNDA0MTI3MDQgQzExLjEyMDc3MDQsNS40ODAwNjQ1NCAxMS4xMDY2MDM3LDUuNTkyNTY0NTQgMTEuMTA2NjAzNyw1LjY3MTkzOTU0IEwxMS4xMDY2MDM3LDUuOTMzNTAyMDQgQzExLjExMjU4NTIsNi4wMjUwNjQ1NCAxMS4yNzQ3MTQ4LDYuMTA5MTI3MDQgMTEuNDIzNjIyMiw2LjEyNzU2NDU0IEwxMi40MzczMjU5LDYuMzE3MjUyMDQgQzEyLjYyMTgwNzQsNi4zNTk3NTIwNCAxMi44MjM2MDM3LDYuMjg2OTM5NTQgMTIuOTM0MTAzNyw2LjExMDA2NDU0IEwxMy4yNDY3MTQ4LDUuNjE3MjUyMDQgQzEzLjQwNjAxMTEsNS4zNDkxMjcwNCAxMi45MzQxMDM3LDUuMTM2MzE0NTQgMTMuMDg3NDE4NSw0Ljg5ODgxNDU0IEwxMy40ODQ0LDQuNTc1Mzc3MDQgQzEzLjYxMzE1OTMsNC4zODY5Mzk1NCAxNC4xMTU2MDM3LDQuNTM4NTAyMDQgMTQuMjM4Njk2Myw0LjM0MzgxNDU0IEwxNC4zMTIwNDgxLDQuMjIyMjUyMDQgQzE0LjM2MDg0NDQsNC4xMzA2ODk1NCAxNC40NDExMjIyLDMuOTg0NzUyMDQgMTQuNDQxMTIyMiwzLjkwNTM3NzA0IEwxNC40NDExMjIyLDMuNjM3ODc3MDQgQzE0LjQ0MTEyMjIsMy41MzQxMjcwNCAxNC4zNDkxOTYzLDMuNDE4NTAyMDQgMTQuMjIwNDM3LDMuMzg5MTI3MDQgQzE0LjI4MTUxMTEsMy41MTAwNjQ1NCAxNC4yNjkyMzMzLDMuNjMxNjI3MDQgMTQuMTk1ODgxNSwzLjc3MTkzOTU0IEwxNC4xMjIyMTQ4LDMuODkzNTAyMDQgQzEzLjk5OTQzNyw0LjA4ODE4OTU0IDEzLjU1MTc3MDQsMy45MzAwNjQ1NCAxMy40MjMwMTExLDQuMTE4NTAyMDQgTDEyLjg2NjEwMzcsNC42ODAwNjQ1NCBDMTIuNzEzNDE4NSw0LjkxNzI1MjA0IDEzLjEyNDI1MTksNS4xMjM4MTQ1NCAxMi45NjQzMjU5LDUuMzkxOTM5NTQgTDEyLjcxMzQxODUsNS43NjkxMjcwNCBDMTIuNjcwOTE4NSw1Ljg0MjU2NDU0IDEyLjU0MTUyOTYsNS44NjY2MjcwNCAxMi40MzczMjU5LDUuODQyNTY0NTQgTDExLjQyMzYyMjIsNS42NTI4NzcwNCBDMTEuMzE1MDExMSw1LjY0MTMxNDU0IDExLjE1NTcxNDgsNS41NzQ0Mzk1NCAxMS4xNzM5NzQxLDUuNDA0MTI3MDQiIGlkPSJGaWxsLTYzMSIgZmlsbD0iI0JFQjVBQSI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTIuMzk4MDA3NDEsMy43MjQ3NTIwNCBDMi4zMzk3NjY2NywzLjc5ODE4OTU0IDIuMzE5NjE4NTIsMy45MDk0Mzk1NCAyLjMxNTUyNTkzLDMuOTg4MTg5NTQgTDIuMzAxMzU5MjYsNC4yNDgxODk1NCBDMi4zMDI2MTg1Miw0LjMzOTEyNzA0IDIuNDYxNiw0LjQyNzg3NzA0IDIuNjA5ODc3NzgsNC40NTIyNTIwNCBMMy42MTg4NTkyNiw0LjY3Nzg3NzA0IEMzLjgwMTc2NjY3LDQuNzI2OTM5NTQgNC4wMDkyMjk2Myw0LjY2MjI1MjA0IDQuMTI5ODAzNyw0LjQ5MTAwMjA0IEw0LjUwMTI4NTE5LDQuMDQyODc3MDQgQzQuNjc2MDA3NDEsMy43ODI4NzcwNCA0LjMwMTY5MjU5LDMuNTc5NDM5NTQgNC40Njg4NTkyNiwzLjM0OTEyNzA0IEw0Ljc2NjY3NDA3LDMuMDExMzE0NTQgQzQuOTA2NDUxODUsMi44Mjg1MDIwNCA1LjQyMzY5MjU5LDIuOTg5MTI3MDQgNS41NTc4MDM3LDIuODAwMzc3MDQgTDUuNjQ2ODk2MywyLjY4ODgxNDU0IEM1LjcwMTM1OTI2LDIuNTk5NzUyMDQgNS44MDUyNDgxNSwyLjQ4MjI1MjA0IDUuODA5NjU1NTYsMi40MDM1MDIwNCBMNS44MjQxMzcwNCwyLjEzNzg3NzA0IEM1LjgyOTQ4ODg5LDIuMDM1MDY0NTQgNS43MTg2NzQwNywxLjg4NjMxNDU0IDUuNTkwODU5MjYsMS44NTIyNTIwNCBDNS42NDU5NTE4NSwxLjk3NDQzOTU0IDUuNjY3OTg4ODksMi4wODU2ODk1NCA1LjU4NjEzNzA0LDIuMjIxOTM5NTQgTDUuNDY0NjE4NTIsMi4zNDkxMjcwNCBDNS4zMzExMzcwNCwyLjUzODE4OTU0IDQuODY5NjE4NTIsMi4zNzMxODk1NCA0LjczMDE1NTU2LDIuNTU2MDAyMDQgTDQuMjU4NTYyOTYsMy4xMjM1MDIwNCBDNC4wOTE3MTExMSwzLjM1MzgxNDU0IDQuNDA0MzIyMjIsMy41NDg4MTQ1NCA0LjIyOTYsMy44MDg4MTQ1NCBMMy45MjYxMTg1Miw0LjE0NDEyNzA0IEMzLjg3ODg5NjMsNC4yMTUwNjQ1NCAzLjc0ODI0ODE1LDQuMjM0NDM5NTQgMy42NDQ2NzQwNyw0LjIwNjYyNzA0IEwyLjYzNTY5MjU5LDMuOTgxMDAyMDQgQzIuNTI2NzY2NjcsMy45NjUzNzcwNCAyLjM3MDMwMzcsMy44OTM1MDIwNCAyLjM5ODAwNzQxLDMuNzI0NzUyMDQiIGlkPSJGaWxsLTYzMiIgZmlsbD0iI0JFQjVBQSI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTQuMDQwMzMzMzMsNi41MDM3MjA3OSBMNC4wNDAzMzMzMyw2Ljc2NDM0NTc5IEM0LjA0MTkwNzQxLDYuODc2ODQ1NzkgNC4yNDE4MTQ4MSw2Ljk0Njg0NTc5IDQuNDAxMTExMTEsNi45NjU5MDgyOSBMNC44OTY5NDQ0NCw3LjA1Njg0NTc5IEM1LjE3NDkyNTkzLDcuMTE0OTcwNzkgNS40ODg3OTYzLDYuODQ5NjU4MjkgNS42NDE0ODE0OCw2LjgxNjg0NTc5IEM1LjczNDM1MTg1LDYuNzk2NTMzMjkgNS44NjU2Mjk2Myw2LjYwMTIyMDc5IDUuODg0ODMzMzMsNi4zOTU5MDgyOSBMNS45MjI5MjU5Myw2LjAwNzQ3MDc5IEM1LjkyNDE4NTE5LDUuOTM3NzgzMjkgNS44NDQ4NTE4NSw1Ljk3MDkwODI5IDUuODIyMTg1MTksNi4wMDE1MzMyOSBMNS42NDE3OTYzLDYuMzY2MjIwNzkgQzUuMzk1Mjk2Myw2LjQzODQwODI5IDUuMTc0OTI1OTMsNi42NjQ5NzA3OSA0Ljg5Njk0NDQ0LDYuNjA3MTU4MjkgTDQuNDAxMTExMTEsNi41MTUyODMyOSBDNC4yNzMyOTYzLDYuNTA0NjU4MjkgNC4wNDk3Nzc3OCw2LjM2MzQwODI5IDQuMDQwMzMzMzMsNi41MDM3MjA3OSIgaWQ9IkZpbGwtNjMzIiBmaWxsPSIjQkVCNUFBIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNNi45MTgzNzAzNyw2LjYzNTUzMzI5IEM3LjA1Mjc5NjMsNi43OTMwMzMyOSA3LjEyODAzNzA0LDcuMDIzMzQ1NzkgNy4zNzc2ODUxOSw3LjA2ODY1ODI5IEw3Ljk0NDAzNzA0LDcuMTY5MjgzMjkgQzguMDUwNDQ0NDQsNy4xODc3MjA3OSA4LjE3MTMzMzMzLDcuMTUzNjU4MjkgOC4yMDg3OTYzLDcuMDc3NzIwNzkgTDguNjg0MTY2NjcsNi4zMzM5NzA3OSBDOC43MDc0NjI5Niw2LjMwMjcyMDc5IDguNzg4MzcwMzcsNi4yNjg2NTgyOSA4Ljc4Njc5NjMsNi4zNDAyMjA3OSBMOC43ODY3OTYzLDYuNjM2MTU4MjkgQzguNzg1NTM3MDQsNi43MTM5NzA3OSA4LjcxODQ4MTQ4LDYuODg0OTA4MjkgOC42MzUwNTU1Niw3LjAwNTIyMDc5IEw4LjM0ODg4ODg5LDcuNDczMDMzMjkgQzguMjczMDE4NTIsNy42MDM2NTgyOSA4LjEyMDk2Mjk2LDcuNjUzMzQ1NzkgNy45NDQwMzcwNCw3LjYxODk3MDc5IEw3LjM3NzY4NTE5LDcuNTE4NjU4MjkgQzcuMTI3NzIyMjIsNy40NzM2NTgyOSA3LjA1MjQ4MTQ4LDcuMjQyNDA4MjkgNi45MTc3NDA3NCw3LjA4NDkwODI5IEw2LjkxODM3MDM3LDYuNjM1NTMzMjkgWiIgaWQ9IkZpbGwtNjM0IiBmaWxsPSIjQkVCNUFBIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNNy41MDM1NDgxNSwxLjQyNTY1ODI5IEw3LjUwMzU0ODE1LDEuNjgxNTk1NzkgQzcuNTA1MTIyMjIsMS43OTE5MDgyOSA3LjcwMTg4MTQ4LDEuODYwOTcwNzkgNy44NTgwMjk2MywxLjg3OTA5NTc5IEw4LjM0NTM2Mjk2LDEuOTY5MDk1NzkgQzguNjk3NjQwNzQsMi4wNDI4NDU3OSA4Ljk1NTQ3NDA3LDEuNjUyMjIwNzkgOS4yOTM5LDEuNzIwMDMzMjkgTDEwLjA5OTgyNTksMS44NTUzNDU3OSBDMTAuNDMxOTU1NiwxLjkxNDA5NTc5IDEwLjQyODQ5MjYsMi4zNTg3ODMyOSAxMC43ODI2NTkzLDIuNDIzMTU4MjkgTDExLjMzODkzNywyLjUyMTkwODI5IEMxMS41MTMzNDQ0LDIuNTU1MDMzMjkgMTEuNjYyMjUxOSwyLjUwNTk3MDc5IDExLjczNzgwNzQsMi4zNzgxNTgyOSBMMTIuMDE4MzA3NCwxLjkxODE1ODI5IEMxMi4xMDA0NzQxLDEuNzk5NzIwNzkgMTIuMTY2MjcwNCwxLjYzMjIyMDc5IDEyLjE2NzUyOTYsMS41NTUzNDU3OSBMMTIuMTY3NTI5NiwxLjI2NDQwODI5IEMxMi4xNjg3ODg5LDEuMTk0NzIwNzkgMTIuMDg5NDU1NiwxLjIyNzg0NTc5IDEyLjA2Njc4ODksMS4yNTg0NzA3OSBMMTEuNTk5Mjg4OSwxLjk4OTA5NTc5IEMxMS41NjI0NTU2LDIuMDYzNzgzMjkgMTEuNDQ0NCwyLjA5NzUzMzI5IDExLjMzODkzNywyLjA3OTQwODI5IEwxMC43ODI2NTkzLDEuOTgwMzQ1NzkgQzEwLjQyODQ5MjYsMS45MTU5NzA3OSAxMC40MzE5NTU2LDEuNDcxNTk1NzkgMTAuMDk5ODI1OSwxLjQxMzE1ODI5IEw5LjI5MzksMS4yNzc1MzMyOSBDOC45NTU0NzQwNywxLjIwOTQwODI5IDguNjk3NjQwNzQsMS42MDAzNDU3OSA4LjM0NTM2Mjk2LDEuNTI2NTk1NzkgTDcuODU4MDI5NjMsMS40MzY5MDgyOSBDNy43MzI0MTg1MiwxLjQyNTk3MDc5IDcuNTEyMzYyOTYsMS4yODc4NDU3OSA3LjUwMzU0ODE1LDEuNDI1NjU4MjkiIGlkPSJGaWxsLTYzNSIgZmlsbD0iI0JFQjVBQSI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTEyLjY4OTE0NjMsMTQuNTU5ODc3IEwxNi4yODYyMjA0LDguODM3MDY0NTQgQzE2LjQxNTkyNDEsOC41OTY0Mzk1NCAxNi40ODMyOTQ0LDguMzEzOTM5NTQgMTYuNDg4MzMxNSw4LjAyMDE4OTU0IEwxNi44MjczODcsMi4zOTIzNzcwNCBDMTYuODI2NzU3NCwyLjIxNjEyNzA0IDE2Ljc0ODY4MzMsMi4xMDU1MDIwNCAxNi42NTU4MTMsMi4yMjIwNjQ1NCBMMTIuMDkzMjAxOSw4LjU2NjEyNzA0IEMxMS45NzE2ODMzLDguNzY2NDM5NTQgMTEuODk5NTkwNyw4Ljg0OTI1MjA0IDExLjkwMjczODksOS4wODczNzcwNCBMMTEuOTAyNzM4OSwxNC4zODU4MTQ1IEMxMS45MDU1NzIyLDE0Ljc5MzAwMiAxMi40Njk0MDU2LDE0LjkzNTUwMiAxMi42ODkxNDYzLDE0LjU1OTg3NyIgaWQ9IkZpbGwtNjM2IiBmaWxsPSIjQkVCNUFBIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNMTQuNDQxMDkwNywzLjkwNTY4OTU0IEwxNC40NDEwOTA3LDMuNjM3ODc3MDQgQzE0LjQ0MTA5MDcsMy41MzQ0Mzk1NCAxNC4zNDkxNjQ4LDMuNDE4ODE0NTQgMTQuMjIwNDA1NiwzLjM4OTEyNzA0IEwxMy4wMTIxNDYzLDMuMTgxMzE0NTQgQzEyLjg4OTM2ODUsMy4xNjMxODk1NCAxMi43NDgzMzE1LDMuMjExOTM5NTQgMTIuNjk5MjIwNCwzLjI5NzI1MjA0IEwxMi41MDkzODcsMy41OTUwNjQ1NCBDMTIuMzE5MjM4OSwzLjg4MTYyNzA0IDEyLjg2NDE4MzMsNC4wNzY5Mzk1NCAxMi43MzYwNTM3LDQuMjg5MTI3MDQgTDEyLjMwOTE2NDgsNC43NjM1MDIwNCBDMTIuMTgwNDA1Niw0Ljk3NjYyNzA0IDExLjU3Mzc1NzQsNC44MTM1MDIwNCAxMS40NTA5Nzk2LDUuMDE0NzUyMDQgTDExLjE3Mzk0MjYsNS40MDQ0Mzk1NCBDMTEuMTIwNDI0MSw1LjQ4MDA2NDU0IDExLjEwNjI1NzQsNS41OTI4NzcwNCAxMS4xMDYyNTc0LDUuNjcxOTM5NTQgTDExLjEwNjI1NzQsNS45MzM4MTQ1NCIgaWQ9IlN0cm9rZS02MzciIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIwLjE1NzUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTExLjQyMzQ5NjMsNi4xMjc4MTQ1NCBMMTIuNDM3Miw2LjMxNzE4OTU0IiBpZD0iU3Ryb2tlLTYzOCIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjAuMjM2MjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTEyLjkzNDEwMzcsNi4xMTAyODMyOSBMMTMuMjQ2NzE0OCw1LjYxNjg0NTc5IEMxMy40MDYzMjU5LDUuMzQ5MzQ1NzkgMTIuOTM0MTAzNyw1LjEzNjIyMDc5IDEzLjA4NzQxODUsNC44OTkwMzMyOSBMMTMuNDg0NCw0LjU3NTU5NTc5IEMxMy42MTMxNTkzLDQuMzg2NTMzMjkgMTQuMTE1OTE4NSw0LjUzODcyMDc5IDE0LjIzODY5NjMsNC4zNDQwMzMyOSBMMTQuMzEyMzYzLDQuMjIyMTU4MjkiIGlkPSJTdHJva2UtNjM5IiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMC4yMzYyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNNS44MTExMzUxOSwyLjQwNTA5NTc5IEw1LjgyNjI0NjMsMi4xMzk3ODMyOSBDNS44MzIyMjc3OCwyLjAzNzU5NTc5IDUuNzIwNzgzMzMsMS44ODg1MzMyOSA1LjU5Mjk2ODUyLDEuODU0NzgzMjkgTDQuNDAzOTEyOTYsMS41OTEwMzMyOSBDNC4yODE0NSwxLjU2ODUzMzI5IDQuMTM2NjM1MTksMS42MTEwMzMyOSA0LjA4MjE3MjIyLDEuNjkzODQ1NzkgTDMuODMwMDA1NTYsMS45NzA3MjA3OSBDMy42MjIyMjc3OCwyLjI0Njk3MDc5IDQuMTM4MjA5MjYsMi40NjI5MDgyOSAzLjk5NzQ4NzA0LDIuNjY3OTA4MjkgTDMuNTc4NzgzMzMsMy4xMzM1MzMyOSBDMy40Mzc0MzE0OCwzLjMzOTQ3MDc5IDIuNzk0MjY0ODEsMy4xNDgyMjA3OSAyLjY1OTIwOTI2LDMuMzQyMjgzMjkgTDIuMzkwMzU3NDEsMy43MTg4NDU3OSBDMi4zMzE4MDE4NSwzLjc5MjU5NTc5IDIuMzExNjUzNywzLjkwMzIyMDc5IDIuMzA3MjQ2MywzLjk4MTM0NTc5IEwyLjI5Mjc2NDgxLDQuMjQwNzIwNzkiIGlkPSJTdHJva2UtNjQwIiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMC4xNTc1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yLjYwMTIyMDM3LDQuNDQ0ODc3MDQgTDMuNjEyNDA1NTYsNC42NzE3NTIwNCIgaWQ9IlN0cm9rZS02NDEiIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIwLjIzNjI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik00LjEyNDMyNTkzLDQuNDg1NTMzMjkgTDQuNDk3MDY2NjcsNC4wMzkyODMyOSBDNC42NzI3MzMzMywzLjc3OTkwODI5IDQuMjk3Nzg4ODksMy41NzU4NDU3OSA0LjQ2NTksMy4zNDY3ODMyOSBMNC43NjUyODg4OSwzLjAxMDIyMDc5IEM0LjkwNTY5NjMsMi44MjgzNDU3OSA1LjQyMzI1MTg1LDIuOTg5MjgzMjkgNS41NTc2Nzc3OCwyLjgwMDg0NTc5IEw1LjY0NzcxNDgxLDIuNjg5MjgzMjkiIGlkPSJTdHJva2UtNjQyIiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMC4yMzYyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNNC4wNDAzMzMzMyw2Ljc2NDM0NTc5IEw0LjA0MDMzMzMzLDYuNTAzNzIwNzkgQzQuMDQwMzMzMzMsNi4zODE1MzMyOSA0LjA1NjA3NDA3LDYuMjM5MDMzMjkgNC4xMjgxNjY2Nyw2LjEzMjc4MzI5IEw0LjUzODY4NTE5LDUuNTA3MTU4MjkgQzQuNjE2NzU5MjYsNS4zODcxNTgyOSA0Ljc3NDc5NjMsNS4zNTY4NDU3OSA0LjkyNDMzMzMzLDUuMzg4MDk1NzkgTDUuNjA5Njg1MTksNS41MTUyODMyOSBDNS43ODMxNDgxNSw1LjU0NzE1ODI5IDUuODMzMjAzNyw1Ljc2ODA5NTc5IDUuODQ4LDUuODQ5MzQ1NzkgQzUuODYyNzk2Myw1LjkzMDI4MzI5IDUuNjYyNTc0MDcsNi4zMzY4NDU3OSA1LjY2MjU3NDA3LDYuMzM2ODQ1NzkiIGlkPSJTdHJva2UtNjQzIiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMC4xNTc1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik04Ljc4NzE0MjU5LDYuNjM2MTI3MDQgTDguNzg3MTQyNTksNi4zMzk4NzcwNCBDOC43ODMwNSw2LjIwMTc1MjA0IDguNjkxNzUzNyw2LjA3MTQzOTU0IDguNTM2NTUsNi4wMzk4NzcwNCBMNy44MjQ0Mzg4OSw1LjkyMTc1MjA0IEM3LjYxODIzNTE5LDUuODgxNDM5NTQgNy4zODkzNjQ4MSw2LjA1MDUwMjA0IDcuMTU4NjA1NTYsNi4xMjg5Mzk1NCBMNi45MTc3NzIyMiw2LjU1ODMxNDU0IiBpZD0iU3Ryb2tlLTY0NCIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjAuMTU3NSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNOC4zNDk0MjQwNyw3LjQ3MzIyMDc5IEw4LjYzNDk2MTExLDcuMDA1MDk1NzkiIGlkPSJTdHJva2UtNjQ1IiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMC4yMzYyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNMTIuMTc5NDYxMSwxLjY0NDg0NTc5IEwxMi4xNzk0NjExLDEuMzUyMzQ1NzkgQzEyLjE3NTY4MzMsMS4yMTU0NzA3OSAxMi4wODU2NDYzLDEuMDg2NDA4MjkgMTEuOTMxNzAxOSwxLjA1NTE1ODI5IEwxMS4yMjgwOTA3LDAuOTM4NTk1Nzg3IEMxMC45NDUzODcsMC44ODM5MDgyODcgMTAuNjE4OTI0MSwxLjIyNzM0NTc5IDEwLjMwNDczODksMS4xNzY0MDgyOSBMOS40NTU2ODMzMywxLjAyNzk3MDc5IEM5LjE4MDUzNTE5LDAuOTg1MTU4Mjg3IDkuMzE0MzMxNDgsMC41ODczNDU3ODcgOS4wNDAxMjc3OCwwLjUzNzAzMzI4NyBMOC4zNjI5NjExMSwwLjQxMTcyMDc4NyBDOC4yMTUzMTI5NiwwLjM4MDc4MzI4NyA4LjA1OTQ3OTYzLDAuNDEwNDcwNzg3IDcuOTgyMDM1MTksMC41MjkyMjA3ODcgTDcuNTc1OTI0MDcsMS4xNDczNDU3OSBDNy41MDU0MDU1NiwxLjI1MjY1ODI5IDcuNDg5NjY0ODEsMS4zOTI2NTgyOSA3LjQ4OTY2NDgxLDEuNTEzOTA4MjkgTDcuNDg5NjY0ODEsMS43NzE0MDgyOSIgaWQ9IlN0cm9rZS02NDYiIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIwLjIzNjI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik03Ljg0NjIyNDA3LDEuODg1ODc3MDQgTDguMzM2MzkwNzQsMS45NzYxODk1NCBDOC42ODk5Mjc3OCwyLjA1MDI1MjA0IDguOTQ5MDIwMzcsMS42NTcxMjcwNCA5LjI5MDU5NDQ0LDEuNzI1NTY0NTQgTDEwLjA5OTk4MzMsMS44NjE4MTQ1NCBDMTAuNDM0MzE2NywxLjkyMDU2NDU0IDEwLjQzMDg1MzcsMi4zNjc3NTIwNCAxMC43ODcyMjQxLDIuNDMyNDM5NTQgTDExLjM0NjY1LDIuNTMxODE0NTQiIGlkPSJTdHJva2UtNjQ3IiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMC4yMzYyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNMTEuNzQ3MDYzLDIuNDcyMDMzMjkgTDEyLjAyOTQ1MTksMi4wMDk1MzMyOSIgaWQ9IlN0cm9rZS02NDgiIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIwLjIzNjI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNi4yNzUyOTYzLDEuNzQ2MjUyMDQgTDEyLjEyNzI5NjMsMS4xMDI4MTQ1NCBDMTIuMDg0Nzk2MywxLjAzODQzOTU0IDEyLjAxODY4NTIsMC45ODg3NTIwMzcgMTEuOTMyMTExMSwwLjk3MDkzOTUzNyBMMTEuMjI4NSwwLjg1NDA2NDUzNyBDMTEuMTM2NTc0MSwwLjgzNjU2NDUzNyAxMS4wNDA1NTU2LDAuODYwNjI3MDM3IDEwLjk0MTcwMzcsMC44OTkzNzcwMzcgTDkuMjEyNDI1OTMsMC42MDI4MTQ1MzcgQzkuMTgxNTc0MDcsMC41MzAzMTQ1MzcgOS4xMzU5MjU5MywwLjQ3MDAwMjAzNyA5LjA0MDIyMjIyLDAuNDUyNTAyMDM3IEw4LjM2MzM3MDM3LDAuMzI3MTg5NTM3IEM4LjIzNzEyOTYzLDAuMzAxMjUyMDM3IDguMTA1ODUxODUsMC4zMTkwNjQ1MzcgOC4wMjE0ODE0OCwwLjM5ODQzOTUzNyBMNi4xNzYzNTE4NSwwLjAxNTkzOTUzNzMgQzUuODE0MzE0ODEsLTAuMDQ0OTk3OTYyNyA1LjQxNDUsMC4wNzA5Mzk1MzczIDUuMjQ4OTA3NDEsMC4zMjY4NzcwMzcgTDAuMjA2ODMzMzMzLDYuMjMxMjUyMDQgQzAuMDU4MjQwNzQwNyw2LjQ0ODc1MjA0IDAuMDA0MDkyNTkyNTksNi43Njg3NTIwNCAwLDcuMDQ4MTI3MDQgTDAuMjI2OTgxNDgxLDEyLjI2ODEyNyBDMC4yMzEwNzQwNzQsMTIuNTI2MjUyIDAuNDAzNTkyNTkzLDEyLjc2MjE4OTUgMC42OTIyNzc3NzgsMTIuODE2NTY0NSBMMTEuOTI4MzMzMywxNC44ODkwNjQ1IEMxMi4yNzE0ODE1LDE0Ljk2MDYyNyAxMi42NDgzMTQ4LDE0LjgyMjgxNDUgMTIuODAwMzcwNCwxNC41NjAwMDIgTDE2LjI4NjMxNDgsOC44Mzc1MDIwNCBDMTYuNDE2MDE4NSw4LjU5NjI1MjA0IDE2LjQ4MzM4ODksOC4zMTM3NTIwNCAxNi40ODg0MjU5LDguMDIwMDAyMDQgTDE2LjgyNzE2NjcsMi4zOTI1MDIwNCBDMTYuODIyMTI5NiwyLjEwNTAwMjA0IDE2LjYxNTI5NjMsMS44MTAwMDIwNCAxNi4yNzUyOTYzLDEuNzQ2MjUyMDQgWiIgaWQ9IlN0cm9rZS02NDkiIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIwLjU1MTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0wLjA5ODQ0MjU5MjYsNi43MTE0NzA3OSBMMTEuMzU4NDI0MSw4Ljc1ODM0NTc5IEMxMS43MjM5MjQxLDguODI0OTA4MjkgMTIuMDQ3ODY4NSw4LjcwNDkwODI5IDEyLjIwNDY0NjMsOC40NTU4NDU3OSBMMTYuNjAzODY4NSwyLjIwMjcyMDc5IiBpZD0iU3Ryb2tlLTY1MCIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjAuMjM2MjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTUuNTI5MTU1NTYsNi44NTkzNzcwNCBDNS4zMjYxLDYuOTUxNTY0NTQgNS4xMzIxNzQwNyw3LjEwNTkzOTU0IDQuODk3MDA3NDEsNy4wNTY4NzcwNCBMNC40MDExNzQwNyw2Ljk2NTkzOTU0IiBpZD0iU3Ryb2tlLTY1MSIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjAuMjM2MjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTcuOTQzODc5NjMsNy42MTc3NTIwNCBMNy4zNzc4NDI1OSw3LjUxNzQzOTU0IiBpZD0iU3Ryb2tlLTY1MiIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjAuMjM2MjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTcuMTg4MTM1MTksNi4xMzQ3MjA3OSBMNi45NDI4OTQ0NCw2LjUyNDQwODI5IEM2Ljg4OTA2MTExLDYuNjAwMzQ1NzkgNi44NzQ4OTQ0NCw2LjcxMjg0NTc5IDYuODc0ODk0NDQsNi43OTE5MDgyOSBMNi44NzQ4OTQ0NCw3LjA1Mzc4MzI5IiBpZD0iU3Ryb2tlLTY1MyIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjAuMTU3NSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4=";
},{}],"8SPD":[function(require,module,exports) {
module.exports = "data:image/png;base64,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";
},{}],"Vsax":[function(require,module,exports) {
module.exports = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjEyMHB4IiBoZWlnaHQ9IjEyMHB4IiB2aWV3Qm94PSIwIDAgMTIwIDEyMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4NCiAgICA8dGl0bGU+Y3ViZV9sPC90aXRsZT4NCiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4NCiAgICAgICAgPGcgaWQ9Ikdyb3VwLUNvcHktMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOS4wMDAwMDAsIDE1LjAwMDAwMCkiPg0KICAgICAgICAgICAgPHBhdGggZD0iTTk3Ljk2MTc0NDQsMTAuNDgxMjYyMiBMNzMuMDczNzQ0NCw2LjYyMDYzNzIyIEM3Mi44MTg3NDQ0LDYuMjM0Mzg3MjIgNzIuNDIyMDc3OCw1LjkzNjI2MjIyIDcxLjkwMjYzMzMsNS44MjkzODcyMiBMNjcuNjgwOTY2Nyw1LjEyODEzNzIyIEM2Ny4xMjk0MTExLDUuMDIzMTM3MjIgNjYuNTUzMyw1LjE2NzUxMjIyIDY1Ljk2MDE4ODksNS40MDAwMTIyMiBMNTUuNTg0NTIyMiwzLjYyMDYzNzIyIEM1NS4zOTk0MTExLDMuMTg1NjM3MjIgNTUuMTI1NTIyMiwyLjgyMzc2MjIyIDU0LjU1MTMsMi43MTg3NjIyMiBMNTAuNDkwMTg4OSwxLjk2Njg4NzIyIEM0OS43MzI3NDQ0LDEuODExMjYyMjIgNDguOTQ1MDc3OCwxLjkxODEzNzIyIDQ4LjQzODg1NTYsMi4zOTQzODcyMiBMMzcuMzY4MDc3OCwwLjA5OTM4NzIyMzYgQzM1LjE5NTg1NTYsLTAuMjY2MjM3Nzc2IDMyLjc5Njk2NjcsMC40MjkzODcyMjQgMzEuODAzNDExMSwxLjk2NTAxMjIyIEwxLjU1MDk2NjY3LDM3LjM5MTI2MjIgQzAuNjU5NDExMTExLDM4LjY5NjI2MjIgMC4zMzQ1MjIyMjIsNDAuNjE2MjYyMiAwLjMwOTk2NjY2Nyw0Mi4yOTI1MTIyIEwxLjY3MTg1NTU2LDczLjYxMjUxMjIgQzEuNjk2NDExMTEsNzUuMTYxMjYyMiAyLjczMTUyMjIyLDc2LjU3Njg4NzIgNC40NjM2MzMzMyw3Ni45MDMxMzcyIEw3MS44Nzk5NjY3LDg5LjMzODEzNzIgQzczLjkzODg1NTYsODkuNzY3NTEyMiA3Ni4xOTk4NTU2LDg4Ljk0MDYzNzIgNzcuMTEyMTg4OSw4Ny4zNjM3NjIyIEw5OC4wMjc4NTU2LDUzLjAyODc2MjIgQzk4LjgwNjA3NzgsNTEuNTgxMjYyMiA5OS4yMTAzLDQ5Ljg4NjI2MjIgOTkuMjQwNTIyMiw0OC4xMjM3NjIyIEwxMDEuMjcyOTY3LDE0LjM1ODc2MjIgQzEwMS4yNDQ2MzMsMTIuNjMzNzYyMiAxMDAuMDAxNzQ0LDEwLjg2Mzc2MjIgOTcuOTYxNzQ0NCwxMC40ODEyNjIyIiBpZD0iRmlsbC02MjkiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik02Ny4wNDM4NDQ0LDMyLjQyNDc2MjIgQzY2LjcyNDYyMjIsMzIuODgwMzg3MiA2Ni42Mzk2MjIyLDMzLjU1NTM4NzIgNjYuNjM5NjIyMiwzNC4wMzE2MzcyIEw2Ni42Mzk2MjIyLDM1LjYwMTAxMjIgQzY2LjY3NTUxMTEsMzYuMTUwMzg3MiA2Ny42NDgyODg5LDM2LjY1NDc2MjIgNjguNTQxNzMzMywzNi43NjUzODcyIEw3NC42MjM5NTU2LDM3LjkwMzUxMjIgQzc1LjczMDg0NDQsMzguMTU4NTEyMiA3Ni45NDE2MjIyLDM3LjcyMTYzNzIgNzcuNjA0NjIyMiwzNi42NjAzODcyIEw3OS40ODAyODg5LDMzLjcwMzUxMjIgQzgwLjQzNjA2NjcsMzIuMDk0NzYyMiA3Ny42MDQ2MjIyLDMwLjgxNzg4NzIgNzguNTI0NTExMSwyOS4zOTI4ODcyIEw4MC45MDY0LDI3LjQ1MjI2MjIgQzgxLjY3ODk1NTYsMjYuMzIxNjM3MiA4NC42OTM2MjIyLDI3LjIzMTAxMjIgODUuNDMyMTc3OCwyNi4wNjI4ODcyIEw4NS44NzIyODg5LDI1LjMzMzUxMjIgQzg2LjE2NTA2NjcsMjQuNzg0MTM3MiA4Ni42NDY3MzMzLDIzLjkwODUxMjIgODYuNjQ2NzMzMywyMy40MzIyNjIyIEw4Ni42NDY3MzMzLDIxLjgyNzI2MjIgQzg2LjY0NjczMzMsMjEuMjA0NzYyMiA4Ni4wOTUxNzc4LDIwLjUxMTAxMjIgODUuMzIyNjIyMiwyMC4zMzQ3NjIyIEM4NS42ODkwNjY3LDIxLjA2MDM4NzIgODUuNjE1NCwyMS43ODk3NjIyIDg1LjE3NTI4ODksMjIuNjMxNjM3MiBMODQuNzMzMjg4OSwyMy4zNjEwMTIyIEM4My45OTY2MjIyLDI0LjUyOTEzNzIgODEuMzEwNjIyMiwyMy41ODAzODcyIDgwLjUzODA2NjcsMjQuNzExMDEyMiBMNzcuMTk2NjIyMiwyOC4wODAzODcyIEM3Ni4yODA1MTExLDI5LjUwMzUxMjIgNzguNzQ1NTExMSwzMC43NDI4ODcyIDc3Ljc4NTk1NTYsMzIuMzUxNjM3MiBMNzYuMjgwNTExMSwzNC42MTQ3NjIyIEM3Ni4wMjU1MTExLDM1LjA1NTM4NzIgNzUuMjQ5MTc3OCwzNS4xOTk3NjIyIDc0LjYyMzk1NTYsMzUuMDU1Mzg3MiBMNjguNTQxNzMzMywzMy45MTcyNjIyIEM2Ny44OTAwNjY3LDMzLjg0Nzg4NzIgNjYuOTM0Mjg4OSwzMy40NDY2MzcyIDY3LjA0Mzg0NDQsMzIuNDI0NzYyMiIgaWQ9IkZpbGwtNjMxIiBmaWxsPSIjQkVCNUFBIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNMTQuMzg4MDQ0NCwyMi4zNDg1MTIyIEMxNC4wMzg2LDIyLjc4OTEzNzIgMTMuOTE3NzExMSwyMy40NTY2MzcyIDEzLjg5MzE1NTYsMjMuOTI5MTM3MiBMMTMuODA4MTU1NiwyNS40ODkxMzcyIEMxMy44MTU3MTExLDI2LjAzNDc2MjIgMTQuNzY5NiwyNi41NjcyNjIyIDE1LjY1OTI2NjcsMjYuNzEzNTEyMiBMMjEuNzEzMTU1NiwyOC4wNjcyNjIyIEMyMi44MTA2LDI4LjM2MTYzNzIgMjQuMDU1Mzc3OCwyNy45NzM1MTIyIDI0Ljc3ODgyMjIsMjYuOTQ2MDEyMiBMMjcuMDA3NzExMSwyNC4yNTcyNjIyIEMyOC4wNTYwNDQ0LDIyLjY5NzI2MjIgMjUuODEwMTU1NiwyMS40NzY2MzcyIDI2LjgxMzE1NTYsMjAuMDk0NzYyMiBMMjguNjAwMDQ0NCwxOC4wNjc4ODcyIEMyOS40Mzg3MTExLDE2Ljk3MTAxMjIgMzIuNTQyMTU1NiwxNy45MzQ3NjIyIDMzLjM0NjgyMjIsMTYuODAyMjYyMiBMMzMuODgxMzc3OCwxNi4xMzI4ODcyIEMzNC4yMDgxNTU2LDE1LjU5ODUxMjIgMzQuODMxNDg4OSwxNC44OTM1MTIyIDM0Ljg1NzkzMzMsMTQuNDIxMDEyMiBMMzQuOTQ0ODIyMiwxMi44MjcyNjIyIEMzNC45NzY5MzMzLDEyLjIxMDM4NzIgMzQuMzEyMDQ0NCwxMS4zMTc4ODcyIDMzLjU0NTE1NTYsMTEuMTEzNTEyMiBDMzMuODc1NzExMSwxMS44NDY2MzcyIDM0LjAwNzkzMzMsMTIuNTE0MTM3MiAzMy41MTY4MjIyLDEzLjMzMTYzNzIgTDMyLjc4NzcxMTEsMTQuMDk0NzYyMiBDMzEuOTg2ODIyMiwxNS4yMjkxMzcyIDI5LjIxNzcxMTEsMTQuMjM5MTM3MiAyOC4zODA5MzMzLDE1LjMzNjAxMjIgTDI1LjU1MTM3NzgsMTguNzQxMDEyMiBDMjQuNTUwMjY2NywyMC4xMjI4ODcyIDI2LjQyNTkzMzMsMjEuMjkyODg3MiAyNS4zNzc2LDIyLjg1Mjg4NzIgTDIzLjU1NjcxMTEsMjQuODY0NzYyMiBDMjMuMjczMzc3OCwyNS4yOTAzODcyIDIyLjQ4OTQ4ODksMjUuNDA2NjM3MiAyMS44NjgwNDQ0LDI1LjIzOTc2MjIgTDE1LjgxNDE1NTYsMjMuODg2MDEyMiBDMTUuMTYwNiwyMy43OTIyNjIyIDE0LjIyMTgyMjIsMjMuMzYxMDEyMiAxNC4zODgwNDQ0LDIyLjM0ODUxMjIiIGlkPSJGaWxsLTYzMiIgZmlsbD0iI0JFQjVBQSI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTI0LjI0MiwzOS4wMjIzMjQ3IEwyNC4yNDIsNDAuNTg2MDc0NyBDMjQuMjUxNDQ0NCw0MS4yNjEwNzQ3IDI1LjQ1MDg4ODksNDEuNjgxMDc0NyAyNi40MDY2NjY3LDQxLjc5NTQ0OTcgTDI5LjM4MTY2NjcsNDIuMzQxMDc0NyBDMzEuMDQ5NTU1Niw0Mi42ODk4MjQ3IDMyLjkzMjc3NzgsNDEuMDk3OTQ5NyAzMy44NDg4ODg5LDQwLjkwMTA3NDcgQzM0LjQwNjExMTEsNDAuNzc5MTk5NyAzNS4xOTM3Nzc4LDM5LjYwNzMyNDcgMzUuMzA5LDM4LjM3NTQ0OTcgTDM1LjUzNzU1NTYsMzYuMDQ0ODI0NyBDMzUuNTQ1MTExMSwzNS42MjY2OTk3IDM1LjA2OTExMTEsMzUuODI1NDQ5NyAzNC45MzMxMTExLDM2LjAwOTE5OTcgTDMzLjg1MDc3NzgsMzguMTk3MzI0NyBDMzIuMzcxNzc3OCwzOC42MzA0NDk3IDMxLjA0OTU1NTYsMzkuOTg5ODI0NyAyOS4zODE2NjY3LDM5LjY0Mjk0OTcgTDI2LjQwNjY2NjcsMzkuMDkxNjk5NyBDMjUuNjM5Nzc3OCwzOS4wMjc5NDk3IDI0LjI5ODY2NjcsMzguMTgwNDQ5NyAyNC4yNDIsMzkuMDIyMzI0NyIgaWQ9IkZpbGwtNjMzIiBmaWxsPSIjQkVCNUFBIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNNDEuNTEwMjIyMiwzOS44MTMxOTk3IEM0Mi4zMTY3Nzc4LDQwLjc1ODE5OTcgNDIuNzY4MjIyMiw0Mi4xNDAwNzQ3IDQ0LjI2NjExMTEsNDIuNDExOTQ5NyBMNDcuNjY0MjIyMiw0My4wMTU2OTk3IEM0OC4zMDI2NjY3LDQzLjEyNjMyNDcgNDkuMDI4LDQyLjkyMTk0OTcgNDkuMjUyNzc3OCw0Mi40NjYzMjQ3IEw1Mi4xMDUsMzguMDAzODI0NyBDNTIuMjQ0Nzc3OCwzNy44MTYzMjQ3IDUyLjczMDIyMjIsMzcuNjExOTQ5NyA1Mi43MjA3Nzc4LDM4LjA0MTMyNDcgTDUyLjcyMDc3NzgsMzkuODE2OTQ5NyBDNTIuNzEzMjIyMiw0MC4yODM4MjQ3IDUyLjMxMDg4ODksNDEuMzA5NDQ5NyA1MS44MTAzMzMzLDQyLjAzMTMyNDcgTDUwLjA5MzMzMzMsNDQuODM4MTk5NyBDNDkuNjM4MTExMSw0NS42MjE5NDk3IDQ4LjcyNTc3NzgsNDUuOTIwMDc0NyA0Ny42NjQyMjIyLDQ1LjcxMzgyNDcgTDQ0LjI2NjExMTEsNDUuMTExOTQ5NyBDNDIuNzY2MzMzMyw0NC44NDE5NDk3IDQyLjMxNDg4ODksNDMuNDU0NDQ5NyA0MS41MDY0NDQ0LDQyLjUwOTQ0OTcgTDQxLjUxMDIyMjIsMzkuODEzMTk5NyBaIiBpZD0iRmlsbC02MzQiIGZpbGw9IiNCRUI1QUEiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik00NS4wMjEyODg5LDguNTUzOTQ5NzIgTDQ1LjAyMTI4ODksMTAuMDg5NTc0NyBDNDUuMDMwNzMzMywxMC43NTE0NDk3IDQ2LjIxMTI4ODksMTEuMTY1ODI0NyA0Ny4xNDgxNzc4LDExLjI3NDU3NDcgTDUwLjA3MjE3NzgsMTEuODE0NTc0NyBDNTIuMTg1ODQ0NCwxMi4yNTcwNzQ3IDUzLjczMjg0NDQsOS45MTMzMjQ3MiA1NS43NjM0LDEwLjMyMDE5OTcgTDYwLjU5ODk1NTYsMTEuMTMyMDc0NyBDNjIuNTkxNzMzMywxMS40ODQ1NzQ3IDYyLjU3MDk1NTYsMTQuMTUyNjk5NyA2NC42OTU5NTU2LDE0LjUzODk0OTcgTDY4LjAzMzYyMjIsMTUuMTMxNDQ5NyBDNjkuMDgwMDY2NywxNS4zMzAxOTk3IDY5Ljk3MzUxMTEsMTUuMDM1ODI0NyA3MC40MjY4NDQ0LDE0LjI2ODk0OTcgTDcyLjEwOTg0NDQsMTEuNTA4OTQ5NyBDNzIuNjAyODQ0NCwxMC43OTgzMjQ3IDcyLjk5NzYyMjIsOS43OTMzMjQ3MiA3My4wMDUxNzc4LDkuMzMyMDc0NzIgTDczLjAwNTE3NzgsNy41ODY0NDk3MiBDNzMuMDEyNzMzMyw3LjE2ODMyNDcyIDcyLjUzNjczMzMsNy4zNjcwNzQ3MiA3Mi40MDA3MzMzLDcuNTUwODI0NzIgTDY5LjU5NTczMzMsMTEuOTM0NTc0NyBDNjkuMzc0NzMzMywxMi4zODI2OTk3IDY4LjY2NjQsMTIuNTg1MTk5NyA2OC4wMzM2MjIyLDEyLjQ3NjQ0OTcgTDY0LjY5NTk1NTYsMTEuODgyMDc0NyBDNjIuNTcwOTU1NiwxMS40OTU4MjQ3IDYyLjU5MTczMzMsOC44Mjk1NzQ3MiA2MC41OTg5NTU2LDguNDc4OTQ5NzIgTDU1Ljc2MzQsNy42NjUxOTk3MiBDNTMuNzMyODQ0NCw3LjI1NjQ0OTcyIDUyLjE4NTg0NDQsOS42MDIwNzQ3MiA1MC4wNzIxNzc4LDkuMTU5NTc0NzIgTDQ3LjE0ODE3NzgsOC42MjE0NDk3MiBDNDYuMzk0NTExMSw4LjU1NTgyNDcyIDQ1LjA3NDE3NzgsNy43MjcwNzQ3MiA0NS4wMjEyODg5LDguNTUzOTQ5NzIiIGlkPSJGaWxsLTYzNSIgZmlsbD0iI0JFQjVBQSI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTc2LjEzNDg3NzgsODcuMzU5MjYyMiBMOTcuNzE3MzIyMiw1My4wMjIzODcyIEM5OC40OTU1NDQ0LDUxLjU3ODYzNzIgOTguODk5NzY2Nyw0OS44ODM2MzcyIDk4LjkyOTk4ODksNDguMTIxMTM3MiBMMTAwLjk2NDMyMiwxNC4zNTQyNjIyIEMxMDAuOTYwNTQ0LDEzLjI5Njc2MjIgMTAwLjQ5MjEsMTIuNjMzMDEyMiA5OS45MzQ4Nzc4LDEzLjMzMjM4NzIgTDcyLjU1OTIxMTEsNTEuMzk2NzYyMiBDNzEuODMwMSw1Mi41OTg2MzcyIDcxLjM5NzU0NDQsNTMuMDk1NTEyMiA3MS40MTY0MzMzLDU0LjUyNDI2MjIgTDcxLjQxNjQzMzMsODYuMzE0ODg3MiBDNzEuNDMzNDMzMyw4OC43NTgwMTIyIDc0LjgxNjQzMzMsODkuNjEzMDEyMiA3Ni4xMzQ4Nzc4LDg3LjM1OTI2MjIiIGlkPSJGaWxsLTYzNiIgZmlsbD0iI0JFQjVBQSI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTg2LjY0NjU0NDQsMjMuNDM0MTM3MiBMODYuNjQ2NTQ0NCwyMS44MjcyNjIyIEM4Ni42NDY1NDQ0LDIxLjIwNjYzNzIgODYuMDk0OTg4OSwyMC41MTI4ODcyIDg1LjMyMjQzMzMsMjAuMzM0NzYyMiBMNzguMDcyODc3OCwxOS4wODc4ODcyIEM3Ny4zMzYyMTExLDE4Ljk3OTEzNzIgNzYuNDg5OTg4OSwxOS4yNzE2MzcyIDc2LjE5NTMyMjIsMTkuNzgzNTEyMiBMNzUuMDU2MzIyMiwyMS41NzAzODcyIEM3My45MTU0MzMzLDIzLjI4OTc2MjIgNzcuMTg1MSwyNC40NjE2MzcyIDc2LjQxNjMyMjIsMjUuNzM0NzYyMiBMNzMuODU0OTg4OSwyOC41ODEwMTIyIEM3My4wODI0MzMzLDI5Ljg1OTc2MjIgNjkuNDQyNTQ0NCwyOC44ODEwMTIyIDY4LjcwNTg3NzgsMzAuMDg4NTEyMiBMNjcuMDQzNjU1NiwzMi40MjY2MzcyIEM2Ni43MjI1NDQ0LDMyLjg4MDM4NzIgNjYuNjM3NTQ0NCwzMy41NTcyNjIyIDY2LjYzNzU0NDQsMzQuMDMxNjM3MiBMNjYuNjM3NTQ0NCwzNS42MDI4ODcyIiBpZD0iU3Ryb2tlLTYzNyIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjAuOTQ1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik02OC41NDA5Nzc4LDM2Ljc2Njg4NzIgTDc0LjYyMzIsMzcuOTAzMTM3MiIgaWQ9IlN0cm9rZS02MzgiIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIxLjQxNzUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTc3LjYwNDYyMjIsMzYuNjYxNjk5NyBMNzkuNDgwMjg4OSwzMy43MDEwNzQ3IEM4MC40Mzc5NTU2LDMyLjA5NjA3NDcgNzcuNjA0NjIyMiwzMC44MTczMjQ3IDc4LjUyNDUxMTEsMjkuMzk0MTk5NyBMODAuOTA2NCwyNy40NTM1NzQ3IEM4MS42Nzg5NTU2LDI2LjMxOTE5OTcgODQuNjk1NTExMSwyNy4yMzIzMjQ3IDg1LjQzMjE3NzgsMjYuMDY0MTk5NyBMODUuODc0MTc3OCwyNS4zMzI5NDk3IiBpZD0iU3Ryb2tlLTYzOSIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjEuNDE3NSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNMzQuODY2ODExMSwxNC40MzA1NzQ3IEwzNC45NTc0Nzc4LDEyLjgzODY5OTcgQzM0Ljk5MzM2NjcsMTIuMjI1NTc0NyAzNC4zMjQ3LDExLjMzMTE5OTcgMzMuNTU3ODExMSwxMS4xMjg2OTk3IEwyNi40MjM0Nzc4LDkuNTQ2MTk5NzIgQzI1LjY4ODcsOS40MTExOTk3MiAyNC44MTk4MTExLDkuNjY2MTk5NzIgMjQuNDkzMDMzMywxMC4xNjMwNzQ3IEwyMi45ODAwMzMzLDExLjgyNDMyNDcgQzIxLjczMzM2NjcsMTMuNDgxODI0NyAyNC44MjkyNTU2LDE0Ljc3NzQ0OTcgMjMuOTg0OTIyMiwxNi4wMDc0NDk3IEwyMS40NzI3LDE4LjgwMTE5OTcgQzIwLjYyNDU4ODksMjAuMDM2ODI0NyAxNi43NjU1ODg5LDE4Ljg4OTMyNDcgMTUuOTU1MjU1NiwyMC4wNTM2OTk3IEwxNC4zNDIxNDQ0LDIyLjMxMzA3NDcgQzEzLjk5MDgxMTEsMjIuNzU1NTc0NyAxMy44Njk5MjIyLDIzLjQxOTMyNDcgMTMuODQzNDc3OCwyMy44ODgwNzQ3IEwxMy43NTY1ODg5LDI1LjQ0NDMyNDciIGlkPSJTdHJva2UtNjQwIiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMC45NDUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTE1LjYwNzMyMjIsMjYuNjY5MjYyMiBMMjEuNjc0NDMzMywyOC4wMzA1MTIyIiBpZD0iU3Ryb2tlLTY0MSIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjEuNDE3NSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNMjQuNzQ1OTU1NiwyNi45MTMxOTk3IEwyNi45ODI0LDI0LjIzNTY5OTcgQzI4LjAzNjQsMjIuNjc5NDQ5NyAyNS43ODY3MzMzLDIxLjQ1NTA3NDcgMjYuNzk1NCwyMC4wODA2OTk3IEwyOC41OTE3MzMzLDE4LjA2MTMyNDcgQzI5LjQzNDE3NzgsMTYuOTcwMDc0NyAzMi41Mzk1MTExLDE3LjkzNTY5OTcgMzMuMzQ2MDY2NywxNi44MDUwNzQ3IEwzMy44ODYyODg5LDE2LjEzNTY5OTciIGlkPSJTdHJva2UtNjQyIiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMS40MTc1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yNC4yNDIsNDAuNTg2MDc0NyBMMjQuMjQyLDM5LjAyMjMyNDcgQzI0LjI0MiwzOC4yODkxOTk3IDI0LjMzNjQ0NDQsMzcuNDM0MTk5NyAyNC43NjksMzYuNzk2Njk5NyBMMjcuMjMyMTExMSwzMy4wNDI5NDk3IEMyNy43MDA1NTU2LDMyLjMyMjk0OTcgMjguNjQ4Nzc3OCwzMi4xNDEwNzQ3IDI5LjU0NiwzMi4zMjg1NzQ3IEwzMy42NTgxMTExLDMzLjA5MTY5OTcgQzM0LjY5ODg4ODksMzMuMjgyOTQ5NyAzNC45OTkyMjIyLDM0LjYwODU3NDcgMzUuMDg4LDM1LjA5NjA3NDcgQzM1LjE3Njc3NzgsMzUuNTgxNjk5NyAzMy45NzU0NDQ0LDM4LjAyMTA3NDcgMzMuOTc1NDQ0NCwzOC4wMjEwNzQ3IiBpZD0iU3Ryb2tlLTY0MyIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjAuOTQ1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik01Mi43MjI4NTU2LDM5LjgxNjc2MjIgTDUyLjcyMjg1NTYsMzguMDM5MjYyMiBDNTIuNjk4MywzNy4yMTA1MTIyIDUyLjE1MDUyMjIsMzYuNDI4NjM3MiA1MS4yMTkzLDM2LjIzOTI2MjIgTDQ2Ljk0NjYzMzMsMzUuNTMwNTEyMiBDNDUuNzA5NDExMSwzNS4yODg2MzcyIDQ0LjMzNjE4ODksMzYuMzAzMDEyMiA0Mi45NTE2MzMzLDM2Ljc3MzYzNzIgTDQxLjUwNjYzMzMsMzkuMzQ5ODg3MiIgaWQ9IlN0cm9rZS02NDQiIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIwLjk0NSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNNTAuMDk2NTQ0NCw0NC44MzkzMjQ3IEw1MS44MDk3NjY3LDQyLjAzMDU3NDciIGlkPSJTdHJva2UtNjQ1IiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMS40MTc1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik03My4wNzY3NjY3LDkuODY5MDc0NzIgTDczLjA3Njc2NjcsOC4xMTQwNzQ3MiBDNzMuMDU0MSw3LjI5MjgyNDcyIDcyLjUxMzg3NzgsNi41MTg0NDk3MiA3MS41OTAyMTExLDYuMzMwOTQ5NzIgTDY3LjM2ODU0NDQsNS42MzE1NzQ3MiBDNjUuNjcyMzIyMiw1LjMwMzQ0OTcyIDYzLjcxMzU0NDQsNy4zNjQwNzQ3MiA2MS44Mjg0MzMzLDcuMDU4NDQ5NzIgTDU2LjczNDEsNi4xNjc4MjQ3MiBDNTUuMDgzMjExMSw1LjkxMDk0OTcyIDU1Ljg4NTk4ODksMy41MjQwNzQ3MiA1NC4yNDA3NjY3LDMuMjIyMTk5NzIgTDUwLjE3Nzc2NjcsMi40NzAzMjQ3MiBDNDkuMjkxODc3OCwyLjI4NDY5OTcyIDQ4LjM1Njg3NzgsMi40NjI4MjQ3MiA0Ny44OTIyMTExLDMuMTc1MzI0NzIgTDQ1LjQ1NTU0NDQsNi44ODQwNzQ3MiBDNDUuMDMyNDMzMyw3LjUxNTk0OTcyIDQ0LjkzNzk4ODksOC4zNTU5NDk3MiA0NC45Mzc5ODg5LDkuMDgzNDQ5NzIgTDQ0LjkzNzk4ODksMTAuNjI4NDQ5NyIgaWQ9IlN0cm9rZS02NDYiIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIxLjQxIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik00Ny4wNzczNDQ0LDExLjMxNTI2MjIgTDUwLjAxODM0NDQsMTEuODU3MTM3MiBDNTIuMTM5NTY2NywxMi4zMDE1MTIyIDUzLjY5NDEyMjIsOS45NDI3NjIyMiA1NS43NDM1NjY3LDEwLjM1MzM4NzIgTDYwLjU5OTksMTEuMTcwODg3MiBDNjIuNjA1OSwxMS41MjMzODcyIDYyLjU4NTEyMjIsMTQuMjA2NTEyMiA2NC43MjMzNDQ0LDE0LjU5NDYzNzIgTDY4LjA3OTksMTUuMTkwODg3MiIgaWQ9IlN0cm9rZS02NDciIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIxLjQxNzUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTcwLjQ4MjM3NzgsMTQuODMyMTk5NyBMNzIuMTc2NzExMSwxMi4wNTcxOTk3IiBpZD0iU3Ryb2tlLTY0OCIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjEuNDE3NSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNOTcuNjUxNzc3OCwxMC40Nzc1MTIyIEw3Mi43NjM3Nzc4LDYuNjE2ODg3MjIgQzcyLjUwODc3NzgsNi4yMzA2MzcyMiA3Mi4xMTIxMTExLDUuOTMyNTEyMjIgNzEuNTkyNjY2Nyw1LjgyNTYzNzIyIEw2Ny4zNzEsNS4xMjQzODcyMiBDNjYuODE5NDQ0NCw1LjAxOTM4NzIyIDY2LjI0MzMzMzMsNS4xNjM3NjIyMiA2NS42NTAyMjIyLDUuMzk2MjYyMjIgTDU1LjI3NDU1NTYsMy42MTY4ODcyMiBDNTUuMDg5NDQ0NCwzLjE4MTg4NzIyIDU0LjgxNTU1NTYsMi44MjAwMTIyMiA1NC4yNDEzMzMzLDIuNzE1MDEyMjIgTDUwLjE4MDIyMjIsMS45NjMxMzcyMiBDNDkuNDIyNzc3OCwxLjgwNzUxMjIyIDQ4LjYzNTExMTEsMS45MTQzODcyMiA0OC4xMjg4ODg5LDIuMzkwNjM3MjIgTDM3LjA1ODExMTEsMC4wOTU2MzcyMjM2IEMzNC44ODU4ODg5LC0wLjI2OTk4Nzc3NiAzMi40ODcsMC40MjU2MzcyMjQgMzEuNDkzNDQ0NCwxLjk2MTI2MjIyIEwxLjI0MSwzNy4zODc1MTIyIEMwLjM0OTQ0NDQ0NCwzOC42OTI1MTIyIDAuMDI0NTU1NTU1Niw0MC42MTI1MTIyIDAsNDIuMjg4NzYyMiBMMS4zNjE4ODg4OSw3My42MDg3NjIyIEMxLjM4NjQ0NDQ0LDc1LjE1NzUxMjIgMi40MjE1NTU1Niw3Ni41NzMxMzcyIDQuMTUzNjY2NjcsNzYuODk5Mzg3MiBMNzEuNTcsODkuMzM0Mzg3MiBDNzMuNjI4ODg4OSw4OS43NjM3NjIyIDc1Ljg4OTg4ODksODguOTM2ODg3MiA3Ni44MDIyMjIyLDg3LjM2MDAxMjIgTDk3LjcxNzg4ODksNTMuMDI1MDEyMiBDOTguNDk2MTExMSw1MS41Nzc1MTIyIDk4LjkwMDMzMzMsNDkuODgyNTEyMiA5OC45MzA1NTU2LDQ4LjEyMDAxMjIgTDEwMC45NjMsMTQuMzU1MDEyMiBDMTAwLjkzMjc3OCwxMi42MzAwMTIyIDk5LjY5MTc3NzgsMTAuODYwMDEyMiA5Ny42NTE3Nzc4LDEwLjQ3NzUxMjIgWiIgaWQ9IlN0cm9rZS02NDkiIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIzLjMwNzUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTAuNTkwNjU1NTU2LDQwLjI2ODgyNDcgTDY4LjE1MDU0NDQsNTIuNTUwMDc0NyBDNzAuMzQzNTQ0NCw1Mi45NDk0NDk3IDcyLjI4NzIxMTEsNTIuMjI5NDQ5NyA3My4yMjc4Nzc4LDUwLjczNTA3NDcgTDk5LjYyMzIxMTEsMTMuMjE2MzI0NyIgaWQ9IlN0cm9rZS02NTAiIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIxLjQxNzUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTMzLjE3NDkzMzMsNDEuMTU2MjYyMiBDMzEuOTU2Niw0MS43MDkzODcyIDMwLjc5MzA0NDQsNDIuNjM1NjM3MiAyOS4zODIwNDQ0LDQyLjM0MTI2MjIgTDI2LjQwNzA0NDQsNDEuNzk1NjM3MiIgaWQ9IlN0cm9rZS02NTEiIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIxLjQxNzUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTQ3LjY2MzI3NzgsNDUuNzA2NTEyMiBMNDQuMjY3MDU1Niw0NS4xMDQ2MzcyIiBpZD0iU3Ryb2tlLTY1MiIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjEuNDE3NSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNNDMuMTI4ODExMSwzNi44MDgzMjQ3IEw0MS42NTczNjY3LDM5LjE0NjQ0OTcgQzQxLjMzNDM2NjcsMzkuNjAyMDc0NyA0MS4yNDkzNjY3LDQwLjI3NzA3NDcgNDEuMjQ5MzY2Nyw0MC43NTE0NDk3IEw0MS4yNDkzNjY3LDQyLjMyMjY5OTciIGlkPSJTdHJva2UtNjUzIiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMC45NDUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICA8L2c+DQogICAgPC9nPg0KPC9zdmc+";
},{}],"cs5v":[function(require,module,exports) {
module.exports = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjQwcHgiIGhlaWdodD0iNDBweCIgdmlld0JveD0iMCAwIDQwIDQwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPg0KICAgIDx0aXRsZT5jdWJlX208L3RpdGxlPg0KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPg0KICAgICAgICA8ZyBpZD0iR3JvdXAtQ29weS0zIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzLjAwMDAwMCwgNS4wMDAwMDApIj4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0zMi42NTM5MTQ4LDMuNDkzNzU0MDcgTDI0LjM1NzkxNDgsMi4yMDY4NzkwNyBDMjQuMjcyOTE0OCwyLjA3ODEyOTA3IDI0LjE0MDY5MjYsMS45Nzg3NTQwNyAyMy45Njc1NDQ0LDEuOTQzMTI5MDcgTDIyLjU2MDMyMjIsMS43MDkzNzkwNyBDMjIuMzc2NDcwNCwxLjY3NDM3OTA3IDIyLjE4NDQzMzMsMS43MjI1MDQwNyAyMS45ODY3Mjk2LDEuODAwMDA0MDcgTDE4LjUyODE3NDEsMS4yMDY4NzkwNyBDMTguNDY2NDcwNCwxLjA2MTg3OTA3IDE4LjM3NTE3NDEsMC45NDEyNTQwNzUgMTguMTgzNzY2NywwLjkwNjI1NDA3NSBMMTYuODMwMDYzLDAuNjU1NjI5MDc1IEMxNi41Nzc1ODE1LDAuNjAzNzU0MDc1IDE2LjMxNTAyNTksMC42MzkzNzkwNzUgMTYuMTQ2Mjg1MiwwLjc5ODEyOTA3NSBMMTIuNDU2MDI1OSwwLjAzMzEyOTA3NDUgQzExLjczMTk1MTksLTAuMDg4NzQ1OTI1NSAxMC45MzIzMjIyLDAuMTQzMTI5MDc1IDEwLjYwMTEzNywwLjY1NTAwNDA3NSBMMC41MTY5ODg4ODksMTIuNDYzNzU0MSBDMC4yMTk4MDM3MDQsMTIuODk4NzU0MSAwLjExMTUwNzQwNywxMy41Mzg3NTQxIDAuMTAzMzIyMjIyLDE0LjA5NzUwNDEgTDAuNTU3Mjg1MTg1LDI0LjUzNzUwNDEgQzAuNTY1NDcwMzcsMjUuMDUzNzU0MSAwLjkxMDUwNzQwNywyNS41MjU2MjkxIDEuNDg3ODc3NzgsMjUuNjM0Mzc5MSBMMjMuOTU5OTg4OSwyOS43NzkzNzkxIEMyNC42NDYyODUyLDI5LjkyMjUwNDEgMjUuMzk5OTUxOSwyOS42NDY4NzkxIDI1LjcwNDA2MywyOS4xMjEyNTQxIEwzMi42NzU5NTE5LDE3LjY3NjI1NDEgQzMyLjkzNTM1OTMsMTcuMTkzNzU0MSAzMy4wNzAxLDE2LjYyODc1NDEgMzMuMDgwMTc0MSwxNi4wNDEyNTQxIEwzMy43NTc2NTU2LDQuNzg2MjU0MDcgQzMzLjc0ODIxMTEsNC4yMTEyNTQwNyAzMy4zMzM5MTQ4LDMuNjIxMjU0MDcgMzIuNjUzOTE0OCwzLjQ5Mzc1NDA3IiBpZD0iRmlsbC02MjkiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMi4zNDc5NDgxLDEwLjgwODI1NDEgQzIyLjI0MTU0MDcsMTAuOTYwMTI5MSAyMi4yMTMyMDc0LDExLjE4NTEyOTEgMjIuMjEzMjA3NCwxMS4zNDM4NzkxIEwyMi4yMTMyMDc0LDExLjg2NzAwNDEgQzIyLjIyNTE3MDQsMTIuMDUwMTI5MSAyMi41NDk0Mjk2LDEyLjIxODI1NDEgMjIuODQ3MjQ0NCwxMi4yNTUxMjkxIEwyNC44NzQ2NTE5LDEyLjYzNDUwNDEgQzI1LjI0MzYxNDgsMTIuNzE5NTA0MSAyNS42NDcyMDc0LDEyLjU3Mzg3OTEgMjUuODY4MjA3NCwxMi4yMjAxMjkxIEwyNi40OTM0Mjk2LDExLjIzNDUwNDEgQzI2LjgxMjAyMjIsMTAuNjk4MjU0MSAyNS44NjgyMDc0LDEwLjI3MjYyOTEgMjYuMTc0ODM3LDkuNzk3NjI5MDcgTDI2Ljk2ODgsOS4xNTA3NTQwNyBDMjcuMjI2MzE4NSw4Ljc3Mzg3OTA3IDI4LjIzMTIwNzQsOS4wNzcwMDQwNyAyOC40NzczOTI2LDguNjg3NjI5MDcgTDI4LjYyNDA5NjMsOC40NDQ1MDQwNyBDMjguNzIxNjg4OSw4LjI2MTM3OTA3IDI4Ljg4MjI0NDQsNy45Njk1MDQwNyAyOC44ODIyNDQ0LDcuODEwNzU0MDcgTDI4Ljg4MjI0NDQsNy4yNzU3NTQwNyBDMjguODgyMjQ0NCw3LjA2ODI1NDA3IDI4LjY5ODM5MjYsNi44MzcwMDQwNyAyOC40NDA4NzQxLDYuNzc4MjU0MDcgQzI4LjU2MzAyMjIsNy4wMjAxMjkwNyAyOC41Mzg0NjY3LDcuMjYzMjU0MDcgMjguMzkxNzYzLDcuNTQzODc5MDcgTDI4LjI0NDQyOTYsNy43ODcwMDQwNyBDMjcuOTk4ODc0MSw4LjE3NjM3OTA3IDI3LjEwMzU0MDcsNy44NjAxMjkwNyAyNi44NDYwMjIyLDguMjM3MDA0MDcgTDI1LjczMjIwNzQsOS4zNjAxMjkwNyBDMjUuNDI2ODM3LDkuODM0NTA0MDcgMjYuMjQ4NTAzNywxMC4yNDc2MjkxIDI1LjkyODY1MTksMTAuNzgzODc5MSBMMjUuNDI2ODM3LDExLjUzODI1NDEgQzI1LjM0MTgzNywxMS42ODUxMjkxIDI1LjA4MzA1OTMsMTEuNzMzMjU0MSAyNC44NzQ2NTE5LDExLjY4NTEyOTEgTDIyLjg0NzI0NDQsMTEuMzA1NzU0MSBDMjIuNjMwMDIyMiwxMS4yODI2MjkxIDIyLjMxMTQyOTYsMTEuMTQ4ODc5MSAyMi4zNDc5NDgxLDEwLjgwODI1NDEiIGlkPSJGaWxsLTYzMSIgZmlsbD0iI0JFQjVBQSI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTQuNzk2MDE0ODEsNy40NDk1MDQwNyBDNC42Nzk1MzMzMyw3LjU5NjM3OTA3IDQuNjM5MjM3MDQsNy44MTg4NzkwNyA0LjYzMTA1MTg1LDcuOTc2Mzc5MDcgTDQuNjAyNzE4NTIsOC40OTYzNzkwNyBDNC42MDUyMzcwNCw4LjY3ODI1NDA3IDQuOTIzMiw4Ljg1NTc1NDA3IDUuMjE5NzU1NTYsOC45MDQ1MDQwNyBMNy4yMzc3MTg1Miw5LjM1NTc1NDA3IEM3LjYwMzUzMzMzLDkuNDUzODc5MDcgOC4wMTg0NTkyNiw5LjMyNDUwNDA3IDguMjU5NjA3NDEsOC45ODIwMDQwNyBMOS4wMDI1NzAzNyw4LjA4NTc1NDA3IEM5LjM1MjAxNDgxLDcuNTY1NzU0MDcgOC42MDMzODUxOSw3LjE1ODg3OTA3IDguOTM3NzE4NTIsNi42OTgyNTQwNyBMOS41MzMzNDgxNSw2LjAyMjYyOTA3IEM5LjgxMjkwMzcsNS42NTcwMDQwNyAxMC44NDczODUyLDUuOTc4MjU0MDcgMTEuMTE1NjA3NCw1LjYwMDc1NDA3IEwxMS4yOTM3OTI2LDUuMzc3NjI5MDcgQzExLjQwMjcxODUsNS4xOTk1MDQwNyAxMS42MTA0OTYzLDQuOTY0NTA0MDcgMTEuNjE5MzExMSw0LjgwNzAwNDA3IEwxMS42NDgyNzQxLDQuMjc1NzU0MDcgQzExLjY1ODk3NzgsNC4wNzAxMjkwNyAxMS40MzczNDgxLDMuNzcyNjI5MDcgMTEuMTgxNzE4NSwzLjcwNDUwNDA3IEMxMS4yOTE5MDM3LDMuOTQ4ODc5MDcgMTEuMzM1OTc3OCw0LjE3MTM3OTA3IDExLjE3MjI3NDEsNC40NDM4NzkwNyBMMTAuOTI5MjM3LDQuNjk4MjU0MDcgQzEwLjY2MjI3NDEsNS4wNzYzNzkwNyA5LjczOTIzNzA0LDQuNzQ2Mzc5MDcgOS40NjAzMTExMSw1LjExMjAwNDA3IEw4LjUxNzEyNTkzLDYuMjQ3MDA0MDcgQzguMTgzNDIyMjIsNi43MDc2MjkwNyA4LjgwODY0NDQ0LDcuMDk3NjI5MDcgOC40NTkyLDcuNjE3NjI5MDcgTDcuODUyMjM3MDQsOC4yODgyNTQwNyBDNy43NTc3OTI1OSw4LjQzMDEyOTA3IDcuNDk2NDk2Myw4LjQ2ODg3OTA3IDcuMjg5MzQ4MTUsOC40MTMyNTQwNyBMNS4yNzEzODUxOSw3Ljk2MjAwNDA3IEM1LjA1MzUzMzMzLDcuOTMwNzU0MDcgNC43NDA2MDc0MSw3Ljc4NzAwNDA3IDQuNzk2MDE0ODEsNy40NDk1MDQwNyIgaWQ9IkZpbGwtNjMyIiBmaWxsPSIjQkVCNUFBIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNOC4wODA2NjY2NywxMy4wMDc0NDE2IEw4LjA4MDY2NjY3LDEzLjUyODY5MTYgQzguMDgzODE0ODEsMTMuNzUzNjkxNiA4LjQ4MzYyOTYzLDEzLjg5MzY5MTYgOC44MDIyMjIyMiwxMy45MzE4MTY2IEw5Ljc5Mzg4ODg5LDE0LjExMzY5MTYgQzEwLjM0OTg1MTksMTQuMjI5OTQxNiAxMC45Nzc1OTI2LDEzLjY5OTMxNjYgMTEuMjgyOTYzLDEzLjYzMzY5MTYgQzExLjQ2ODcwMzcsMTMuNTkzMDY2NiAxMS43MzEyNTkzLDEzLjIwMjQ0MTYgMTEuNzY5NjY2NywxMi43OTE4MTY2IEwxMS44NDU4NTE5LDEyLjAxNDk0MTYgQzExLjg0ODM3MDQsMTEuODc1NTY2NiAxMS42ODk3MDM3LDExLjk0MTgxNjYgMTEuNjQ0MzcwNCwxMi4wMDMwNjY2IEwxMS4yODM1OTI2LDEyLjczMjQ0MTYgQzEwLjc5MDU5MjYsMTIuODc2ODE2NiAxMC4zNDk4NTE5LDEzLjMyOTk0MTYgOS43OTM4ODg4OSwxMy4yMTQzMTY2IEw4LjgwMjIyMjIyLDEzLjAzMDU2NjYgQzguNTQ2NTkyNTksMTMuMDA5MzE2NiA4LjA5OTU1NTU2LDEyLjcyNjgxNjYgOC4wODA2NjY2NywxMy4wMDc0NDE2IiBpZD0iRmlsbC02MzMiIGZpbGw9IiNCRUI1QUEiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMy44MzY3NDA3LDEzLjI3MTA2NjYgQzE0LjEwNTU5MjYsMTMuNTg2MDY2NiAxNC4yNTYwNzQxLDE0LjA0NjY5MTYgMTQuNzU1MzcwNCwxNC4xMzczMTY2IEwxNS44ODgwNzQxLDE0LjMzODU2NjYgQzE2LjEwMDg4ODksMTQuMzc1NDQxNiAxNi4zNDI2NjY3LDE0LjMwNzMxNjYgMTYuNDE3NTkyNiwxNC4xNTU0NDE2IEwxNy4zNjgzMzMzLDEyLjY2Nzk0MTYgQzE3LjQxNDkyNTksMTIuNjA1NDQxNiAxNy41NzY3NDA3LDEyLjUzNzMxNjYgMTcuNTczNTkyNiwxMi42ODA0NDE2IEwxNy41NzM1OTI2LDEzLjI3MjMxNjYgQzE3LjU3MTA3NDEsMTMuNDI3OTQxNiAxNy40MzY5NjMsMTMuNzY5ODE2NiAxNy4yNzAxMTExLDE0LjAxMDQ0MTYgTDE2LjY5Nzc3NzgsMTQuOTQ2MDY2NiBDMTYuNTQ2MDM3LDE1LjIwNzMxNjYgMTYuMjQxOTI1OSwxNS4zMDY2OTE2IDE1Ljg4ODA3NDEsMTUuMjM3OTQxNiBMMTQuNzU1MzcwNCwxNS4wMzczMTY2IEMxNC4yNTU0NDQ0LDE0Ljk0NzMxNjYgMTQuMTA0OTYzLDE0LjQ4NDgxNjYgMTMuODM1NDgxNSwxNC4xNjk4MTY2IEwxMy44MzY3NDA3LDEzLjI3MTA2NjYgWiIgaWQ9IkZpbGwtNjM0IiBmaWxsPSIjQkVCNUFBIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNMTUuMDA3MDk2MywyLjg1MTMxNjU3IEwxNS4wMDcwOTYzLDMuMzYzMTkxNTcgQzE1LjAxMDI0NDQsMy41ODM4MTY1NyAxNS40MDM3NjMsMy43MjE5NDE1NyAxNS43MTYwNTkzLDMuNzU4MTkxNTcgTDE2LjY5MDcyNTksMy45MzgxOTE1NyBDMTcuMzk1MjgxNSw0LjA4NTY5MTU3IDE3LjkxMDk0ODEsMy4zMDQ0NDE1NyAxOC41ODc4LDMuNDQwMDY2NTcgTDIwLjE5OTY1MTksMy43MTA2OTE1NyBDMjAuODYzOTExMSwzLjgyODE5MTU3IDIwLjg1Njk4NTIsNC43MTc1NjY1NyAyMS41NjUzMTg1LDQuODQ2MzE2NTcgTDIyLjY3Nzg3NDEsNS4wNDM4MTY1NyBDMjMuMDI2Njg4OSw1LjExMDA2NjU3IDIzLjMyNDUwMzcsNS4wMTE5NDE1NyAyMy40NzU2MTQ4LDQuNzU2MzE2NTcgTDI0LjAzNjYxNDgsMy44MzYzMTY1NyBDMjQuMjAwOTQ4MSwzLjU5OTQ0MTU3IDI0LjMzMjU0MDcsMy4yNjQ0NDE1NyAyNC4zMzUwNTkzLDMuMTEwNjkxNTcgTDI0LjMzNTA1OTMsMi41Mjg4MTY1NyBDMjQuMzM3NTc3OCwyLjM4OTQ0MTU3IDI0LjE3ODkxMTEsMi40NTU2OTE1NyAyNC4xMzM1Nzc4LDIuNTE2OTQxNTcgTDIzLjE5ODU3NzgsMy45NzgxOTE1NyBDMjMuMTI0OTExMSw0LjEyNzU2NjU3IDIyLjg4ODgsNC4xOTUwNjY1NyAyMi42Nzc4NzQxLDQuMTU4ODE2NTcgTDIxLjU2NTMxODUsMy45NjA2OTE1NyBDMjAuODU2OTg1MiwzLjgzMTk0MTU3IDIwLjg2MzkxMTEsMi45NDMxOTE1NyAyMC4xOTk2NTE5LDIuODI2MzE2NTcgTDE4LjU4NzgsMi41NTUwNjY1NyBDMTcuOTEwOTQ4MSwyLjQxODgxNjU3IDE3LjM5NTI4MTUsMy4yMDA2OTE1NyAxNi42OTA3MjU5LDMuMDUzMTkxNTcgTDE1LjcxNjA1OTMsMi44NzM4MTY1NyBDMTUuNDY0ODM3LDIuODUxOTQxNTcgMTUuMDI0NzI1OSwyLjU3NTY5MTU3IDE1LjAwNzA5NjMsMi44NTEzMTY1NyIgaWQ9IkZpbGwtNjM1IiBmaWxsPSIjQkVCNUFBIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNMjUuMzc4MjkyNiwyOS4xMTk3NTQxIEwzMi41NzI0NDA3LDE3LjY3NDEyOTEgQzMyLjgzMTg0ODEsMTcuMTkyODc5MSAzMi45NjY1ODg5LDE2LjYyNzg3OTEgMzIuOTc2NjYzLDE2LjA0MDM3OTEgTDMzLjY1NDc3NDEsNC43ODQ3NTQwNyBDMzMuNjUzNTE0OCw0LjQzMjI1NDA3IDMzLjQ5NzM2NjcsNC4yMTEwMDQwNyAzMy4zMTE2MjU5LDQuNDQ0MTI5MDcgTDI0LjE4NjQwMzcsMTcuMTMyMjU0MSBDMjMuOTQzMzY2NywxNy41MzI4NzkxIDIzLjc5OTE4MTUsMTcuNjk4NTA0MSAyMy44MDU0Nzc4LDE4LjE3NDc1NDEgTDIzLjgwNTQ3NzgsMjguNzcxNjI5MSBDMjMuODExMTQ0NCwyOS41ODYwMDQxIDI0LjkzODgxMTEsMjkuODcxMDA0MSAyNS4zNzgyOTI2LDI5LjExOTc1NDEiIGlkPSJGaWxsLTYzNiIgZmlsbD0iI0JFQjVBQSI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTI4Ljg4MjE4MTUsNy44MTEzNzkwNyBMMjguODgyMTgxNSw3LjI3NTc1NDA3IEMyOC44ODIxODE1LDcuMDY4ODc5MDcgMjguNjk4MzI5Niw2LjgzNzYyOTA3IDI4LjQ0MDgxMTEsNi43NzgyNTQwNyBMMjYuMDI0MjkyNiw2LjM2MjYyOTA3IEMyNS43Nzg3MzcsNi4zMjYzNzkwNyAyNS40OTY2NjMsNi40MjM4NzkwNyAyNS4zOTg0NDA3LDYuNTk0NTA0MDcgTDI1LjAxODc3NDEsNy4xOTAxMjkwNyBDMjQuNjM4NDc3OCw3Ljc2MzI1NDA3IDI1LjcyODM2NjcsOC4xNTM4NzkwNyAyNS40NzIxMDc0LDguNTc4MjU0MDcgTDI0LjYxODMyOTYsOS41MjcwMDQwNyBDMjQuMzYwODExMSw5Ljk1MzI1NDA3IDIzLjE0NzUxNDgsOS42MjcwMDQwNyAyMi45MDE5NTkzLDEwLjAyOTUwNDEgTDIyLjM0Nzg4NTIsMTAuODA4ODc5MSBDMjIuMjQwODQ4MSwxMC45NjAxMjkxIDIyLjIxMjUxNDgsMTEuMTg1NzU0MSAyMi4yMTI1MTQ4LDExLjM0Mzg3OTEgTDIyLjIxMjUxNDgsMTEuODY3NjI5MSIgaWQ9IlN0cm9rZS02MzciIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIwLjMxNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNMjIuODQ2OTkyNiwxMi4yNTU2MjkxIEwyNC44NzQ0LDEyLjYzNDM3OTEiIGlkPSJTdHJva2UtNjM4IiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMC40NzI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yNS44NjgyMDc0LDEyLjIyMDU2NjYgTDI2LjQ5MzQyOTYsMTEuMjMzNjkxNiBDMjYuODEyNjUxOSwxMC42OTg2OTE2IDI1Ljg2ODIwNzQsMTAuMjcyNDQxNiAyNi4xNzQ4MzcsOS43OTgwNjY1NyBMMjYuOTY4OCw5LjE1MTE5MTU3IEMyNy4yMjYzMTg1LDguNzczMDY2NTcgMjguMjMxODM3LDkuMDc3NDQxNTcgMjguNDc3MzkyNiw4LjY4ODA2NjU3IEwyOC42MjQ3MjU5LDguNDQ0MzE2NTciIGlkPSJTdHJva2UtNjM5IiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMC40NzI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMS42MjIyNzA0LDQuODEwMTkxNTcgTDExLjY1MjQ5MjYsNC4yNzk1NjY1NyBDMTEuNjY0NDU1Niw0LjA3NTE5MTU3IDExLjQ0MTU2NjcsMy43NzcwNjY1NyAxMS4xODU5MzcsMy43MDk1NjY1NyBMOC44MDc4MjU5MywzLjE4MjA2NjU3IEM4LjU2MjksMy4xMzcwNjY1NyA4LjI3MzI3MDM3LDMuMjIyMDY2NTcgOC4xNjQzNDQ0NCwzLjM4NzY5MTU3IEw3LjY2MDAxMTExLDMuOTQxNDQxNTcgQzcuMjQ0NDU1NTYsNC40OTM5NDE1NyA4LjI3NjQxODUyLDQuOTI1ODE2NTcgNy45OTQ5NzQwNyw1LjMzNTgxNjU3IEw3LjE1NzU2NjY3LDYuMjY3MDY2NTcgQzYuODc0ODYyOTYsNi42Nzg5NDE1NyA1LjU4ODUyOTYzLDYuMjk2NDQxNTcgNS4zMTg0MTg1Miw2LjY4NDU2NjU3IEw0Ljc4MDcxNDgxLDcuNDM3NjkxNTcgQzQuNjYzNjAzNyw3LjU4NTE5MTU3IDQuNjIzMzA3NDEsNy44MDY0NDE1NyA0LjYxNDQ5MjU5LDcuOTYyNjkxNTcgTDQuNTg1NTI5NjMsOC40ODE0NDE1NyIgaWQ9IlN0cm9rZS02NDAiIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIwLjMxNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNNS4yMDI0NDA3NCw4Ljg4OTc1NDA3IEw3LjIyNDgxMTExLDkuMzQzNTA0MDciIGlkPSJTdHJva2UtNjQxIiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMC40NzI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik04LjI0ODY1MTg1LDguOTcxMDY2NTcgTDguOTk0MTMzMzMsOC4wNzg1NjY1NyBDOS4zNDU0NjY2Nyw3LjU1OTgxNjU3IDguNTk1NTc3NzgsNy4xNTE2OTE1NyA4LjkzMTgsNi42OTM1NjY1NyBMOS41MzA1Nzc3OCw2LjAyMDQ0MTU3IEM5LjgxMTM5MjU5LDUuNjU2NjkxNTcgMTAuODQ2NTAzNyw1Ljk3ODU2NjU3IDExLjExNTM1NTYsNS42MDE2OTE1NyBMMTEuMjk1NDI5Niw1LjM3ODU2NjU3IiBpZD0iU3Ryb2tlLTY0MiIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjAuNDcyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNOC4wODA2NjY2NywxMy41Mjg2OTE2IEw4LjA4MDY2NjY3LDEzLjAwNzQ0MTYgQzguMDgwNjY2NjcsMTIuNzYzMDY2NiA4LjExMjE0ODE1LDEyLjQ3ODA2NjYgOC4yNTYzMzMzMywxMi4yNjU1NjY2IEw5LjA3NzM3MDM3LDExLjAxNDMxNjYgQzkuMjMzNTE4NTIsMTAuNzc0MzE2NiA5LjU0OTU5MjU5LDEwLjcxMzY5MTYgOS44NDg2NjY2NywxMC43NzYxOTE2IEwxMS4yMTkzNzA0LDExLjAzMDU2NjYgQzExLjU2NjI5NjMsMTEuMDk0MzE2NiAxMS42NjY0MDc0LDExLjUzNjE5MTYgMTEuNjk2LDExLjY5ODY5MTYgQzExLjcyNTU5MjYsMTEuODYwNTY2NiAxMS4zMjUxNDgxLDEyLjY3MzY5MTYgMTEuMzI1MTQ4MSwxMi42NzM2OTE2IiBpZD0iU3Ryb2tlLTY0MyIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjAuMzE1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNy41NzQyODUyLDEzLjI3MjI1NDEgTDE3LjU3NDI4NTIsMTIuNjc5NzU0MSBDMTcuNTY2MSwxMi40MDM1MDQxIDE3LjM4MzUwNzQsMTIuMTQyODc5MSAxNy4wNzMxLDEyLjA3OTc1NDEgTDE1LjY0ODg3NzgsMTEuODQzNTA0MSBDMTUuMjM2NDcwNCwxMS43NjI4NzkxIDE0Ljc3ODcyOTYsMTIuMTAxMDA0MSAxNC4zMTcyMTExLDEyLjI1Nzg3OTEgTDEzLjgzNTU0NDQsMTMuMTE2NjI5MSIgaWQ9IlN0cm9rZS02NDQiIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIwLjMxNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNMTYuNjk4ODQ4MSwxNC45NDY0NDE2IEwxNy4yNjk5MjIyLDE0LjAxMDE5MTYiIGlkPSJTdHJva2UtNjQ1IiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMC40NzI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yNC4zNTg5MjIyLDMuMjg5NjkxNTcgTDI0LjM1ODkyMjIsMi43MDQ2OTE1NyBDMjQuMzUxMzY2NywyLjQzMDk0MTU3IDI0LjE3MTI5MjYsMi4xNzI4MTY1NyAyMy44NjM0MDM3LDIuMTEwMzE2NTcgTDIyLjQ1NjE4MTUsMS44NzcxOTE1NyBDMjEuODkwNzc0MSwxLjc2NzgxNjU3IDIxLjIzNzg0ODEsMi40NTQ2OTE1NyAyMC42MDk0Nzc4LDIuMzUyODE2NTcgTDE4LjkxMTM2NjcsMi4wNTU5NDE1NyBDMTguMzYxMDcwNCwxLjk3MDMxNjU3IDE4LjYyODY2MywxLjE3NDY5MTU3IDE4LjA4MDI1NTYsMS4wNzQwNjY1NyBMMTYuNzI1OTIyMiwwLjgyMzQ0MTU3NSBDMTYuNDMwNjI1OSwwLjc2MTU2NjU3NSAxNi4xMTg5NTkzLDAuODIwOTQxNTc1IDE1Ljk2NDA3MDQsMS4wNTg0NDE1NyBMMTUuMTUxODQ4MSwyLjI5NDY5MTU3IEMxNS4wMTA4MTExLDIuNTA1MzE2NTcgMTQuOTc5MzI5NiwyLjc4NTMxNjU3IDE0Ljk3OTMyOTYsMy4wMjc4MTY1NyBMMTQuOTc5MzI5NiwzLjU0MjgxNjU3IiBpZD0iU3Ryb2tlLTY0NiIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjAuNDciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTE1LjY5MjQ0ODEsMy43NzE3NTQwNyBMMTYuNjcyNzgxNSwzLjk1MjM3OTA3IEMxNy4zNzk4NTU2LDQuMTAwNTA0MDcgMTcuODk4MDQwNywzLjMxNDI1NDA3IDE4LjU4MTE4ODksMy40NTExMjkwNyBMMjAuMTk5OTY2NywzLjcyMzYyOTA3IEMyMC44Njg2MzMzLDMuODQxMTI5MDcgMjAuODYxNzA3NCw0LjczNTUwNDA3IDIxLjU3NDQ0ODEsNC44NjQ4NzkwNyBMMjIuNjkzMyw1LjA2MzYyOTA3IiBpZD0iU3Ryb2tlLTY0NyIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjAuNDcyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNMjMuNDk0MTI1OSw0Ljk0NDA2NjU3IEwyNC4wNTg5MDM3LDQuMDE5MDY2NTciIGlkPSJTdHJva2UtNjQ4IiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMC40NzI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0zMi41NTA1OTI2LDMuNDkyNTA0MDcgTDI0LjI1NDU5MjYsMi4yMDU2MjkwNyBDMjQuMTY5NTkyNiwyLjA3Njg3OTA3IDI0LjAzNzM3MDQsMS45Nzc1MDQwNyAyMy44NjQyMjIyLDEuOTQxODc5MDcgTDIyLjQ1NywxLjcwODEyOTA3IEMyMi4yNzMxNDgxLDEuNjczMTI5MDcgMjIuMDgxMTExMSwxLjcyMTI1NDA3IDIxLjg4MzQwNzQsMS43OTg3NTQwNyBMMTguNDI0ODUxOSwxLjIwNTYyOTA3IEMxOC4zNjMxNDgxLDEuMDYwNjI5MDcgMTguMjcxODUxOSwwLjk0MDAwNDA3NSAxOC4wODA0NDQ0LDAuOTA1MDA0MDc1IEwxNi43MjY3NDA3LDAuNjU0Mzc5MDc1IEMxNi40NzQyNTkzLDAuNjAyNTA0MDc1IDE2LjIxMTcwMzcsMC42MzgxMjkwNzUgMTYuMDQyOTYzLDAuNzk2ODc5MDc1IEwxMi4zNTI3MDM3LDAuMDMxODc5MDc0NSBDMTEuNjI4NjI5NiwtMC4wODk5OTU5MjU1IDEwLjgyOSwwLjE0MTg3OTA3NSAxMC40OTc4MTQ4LDAuNjUzNzU0MDc1IEwwLjQxMzY2NjY2NywxMi40NjI1MDQxIEMwLjExNjQ4MTQ4MSwxMi44OTc1MDQxIDAuMDA4MTg1MTg1MTksMTMuNTM3NTA0MSAwLDE0LjA5NjI1NDEgTDAuNDUzOTYyOTYzLDI0LjUzNjI1NDEgQzAuNDYyMTQ4MTQ4LDI1LjA1MjUwNDEgMC44MDcxODUxODUsMjUuNTI0Mzc5MSAxLjM4NDU1NTU2LDI1LjYzMzEyOTEgTDIzLjg1NjY2NjcsMjkuNzc4MTI5MSBDMjQuNTQyOTYzLDI5LjkyMTI1NDEgMjUuMjk2NjI5NiwyOS42NDU2MjkxIDI1LjYwMDc0MDcsMjkuMTIwMDA0MSBMMzIuNTcyNjI5NiwxNy42NzUwMDQxIEMzMi44MzIwMzcsMTcuMTkyNTA0MSAzMi45NjY3Nzc4LDE2LjYyNzUwNDEgMzIuOTc2ODUxOSwxNi4wNDAwMDQxIEwzMy42NTQzMzMzLDQuNzg1MDA0MDcgQzMzLjY0NDI1OTMsNC4yMTAwMDQwNyAzMy4yMzA1OTI2LDMuNjIwMDA0MDcgMzIuNTUwNTkyNiwzLjQ5MjUwNDA3IFoiIGlkPSJTdHJva2UtNjQ5IiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMS4xMDI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0wLjE5Njg4NTE4NSwxMy40MjI5NDE2IEwyMi43MTY4NDgxLDE3LjUxNjY5MTYgQzIzLjQ0Nzg0ODEsMTcuNjQ5ODE2NiAyNC4wOTU3MzcsMTcuNDA5ODE2NiAyNC40MDkyOTI2LDE2LjkxMTY5MTYgTDMzLjIwNzczNyw0LjQwNTQ0MTU3IiBpZD0iU3Ryb2tlLTY1MCIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjAuNDcyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNMTEuMDU4MzExMSwxMy43MTg3NTQxIEMxMC42NTIyLDEzLjkwMzEyOTEgMTAuMjY0MzQ4MSwxNC4yMTE4NzkxIDkuNzk0MDE0ODEsMTQuMTEzNzU0MSBMOC44MDIzNDgxNSwxMy45MzE4NzkxIiBpZD0iU3Ryb2tlLTY1MSIgc3Ryb2tlPSIjNUM1MTQyIiBzdHJva2Utd2lkdGg9IjAuNDcyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICA8cGF0aCBkPSJNMTUuODg3NzU5MywxNS4yMzU1MDQxIEwxNC43NTU2ODUyLDE1LjAzNDg3OTEiIGlkPSJTdHJva2UtNjUyIiBzdHJva2U9IiM1QzUxNDIiIHN0cm9rZS13aWR0aD0iMC40NzI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNC4zNzYyNzA0LDEyLjI2OTQ0MTYgTDEzLjg4NTc4ODksMTMuMDQ4ODE2NiBDMTMuNzc4MTIyMiwxMy4yMDA2OTE2IDEzLjc0OTc4ODksMTMuNDI1NjkxNiAxMy43NDk3ODg5LDEzLjU4MzgxNjYgTDEzLjc0OTc4ODksMTQuMTA3NTY2NiIgaWQ9IlN0cm9rZS02NTMiIHN0cm9rZT0iIzVDNTE0MiIgc3Ryb2tlLXdpZHRoPSIwLjMxNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4=";
},{}],"70rD":[function(require,module,exports) {

},{}],"Sy7q":[function(require,module,exports) {
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
exports.extend = extend;
var hop = Object.prototype.hasOwnProperty;

function extend(obj) {
    var sources = Array.prototype.slice.call(arguments, 1),
        i, len, source, key;

    for (i = 0, len = sources.length; i < len; i += 1) {
        source = sources[i];
        if (!source) { continue; }

        for (key in source) {
            if (hop.call(source, key)) {
                obj[key] = source[key];
            }
        }
    }

    return obj;
}
exports.hop = hop;


},{}],"rAkH":[function(require,module,exports) {
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
var src$utils$$ = require("./utils");

// Purposely using the same implementation as the Intl.js `Intl` polyfill.
// Copyright 2013 Andy Earnshaw, MIT License

var realDefineProp = (function () {
    try { return !!Object.defineProperty({}, 'a', {}); }
    catch (e) { return false; }
})();

var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

var defineProperty = realDefineProp ? Object.defineProperty :
        function (obj, name, desc) {

    if ('get' in desc && obj.__defineGetter__) {
        obj.__defineGetter__(name, desc.get);
    } else if (!src$utils$$.hop.call(obj, name) || 'value' in desc) {
        obj[name] = desc.value;
    }
};

var objCreate = Object.create || function (proto, props) {
    var obj, k;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (k in props) {
        if (src$utils$$.hop.call(props, k)) {
            defineProperty(obj, k, props[k]);
        }
    }

    return obj;
};

exports.defineProperty = defineProperty, exports.objCreate = objCreate;


},{"./utils":"Sy7q"}],"i1A+":[function(require,module,exports) {
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
exports["default"] = Compiler;

function Compiler(locales, formats, pluralFn) {
    this.locales  = locales;
    this.formats  = formats;
    this.pluralFn = pluralFn;
}

Compiler.prototype.compile = function (ast) {
    this.pluralStack        = [];
    this.currentPlural      = null;
    this.pluralNumberFormat = null;

    return this.compileMessage(ast);
};

Compiler.prototype.compileMessage = function (ast) {
    if (!(ast && ast.type === 'messageFormatPattern')) {
        throw new Error('Message AST is not of type: "messageFormatPattern"');
    }

    var elements = ast.elements,
        pattern  = [];

    var i, len, element;

    for (i = 0, len = elements.length; i < len; i += 1) {
        element = elements[i];

        switch (element.type) {
            case 'messageTextElement':
                pattern.push(this.compileMessageText(element));
                break;

            case 'argumentElement':
                pattern.push(this.compileArgument(element));
                break;

            default:
                throw new Error('Message element does not have a valid type');
        }
    }

    return pattern;
};

Compiler.prototype.compileMessageText = function (element) {
    // When this `element` is part of plural sub-pattern and its value contains
    // an unescaped '#', use a `PluralOffsetString` helper to properly output
    // the number with the correct offset in the string.
    if (this.currentPlural && /(^|[^\\])#/g.test(element.value)) {
        // Create a cache a NumberFormat instance that can be reused for any
        // PluralOffsetString instance in this message.
        if (!this.pluralNumberFormat) {
            this.pluralNumberFormat = new Intl.NumberFormat(this.locales);
        }

        return new PluralOffsetString(
                this.currentPlural.id,
                this.currentPlural.format.offset,
                this.pluralNumberFormat,
                element.value);
    }

    // Unescape the escaped '#'s in the message text.
    return element.value.replace(/\\#/g, '#');
};

Compiler.prototype.compileArgument = function (element) {
    var format = element.format;

    if (!format) {
        return new StringFormat(element.id);
    }

    var formats  = this.formats,
        locales  = this.locales,
        pluralFn = this.pluralFn,
        options;

    switch (format.type) {
        case 'numberFormat':
            options = formats.number[format.style];
            return {
                id    : element.id,
                format: new Intl.NumberFormat(locales, options).format
            };

        case 'dateFormat':
            options = formats.date[format.style];
            return {
                id    : element.id,
                format: new Intl.DateTimeFormat(locales, options).format
            };

        case 'timeFormat':
            options = formats.time[format.style];
            return {
                id    : element.id,
                format: new Intl.DateTimeFormat(locales, options).format
            };

        case 'pluralFormat':
            options = this.compileOptions(element);
            return new PluralFormat(
                element.id, format.ordinal, format.offset, options, pluralFn
            );

        case 'selectFormat':
            options = this.compileOptions(element);
            return new SelectFormat(element.id, options);

        default:
            throw new Error('Message element does not have a valid format type');
    }
};

Compiler.prototype.compileOptions = function (element) {
    var format      = element.format,
        options     = format.options,
        optionsHash = {};

    // Save the current plural element, if any, then set it to a new value when
    // compiling the options sub-patterns. This conforms the spec's algorithm
    // for handling `"#"` syntax in message text.
    this.pluralStack.push(this.currentPlural);
    this.currentPlural = format.type === 'pluralFormat' ? element : null;

    var i, len, option;

    for (i = 0, len = options.length; i < len; i += 1) {
        option = options[i];

        // Compile the sub-pattern and save it under the options's selector.
        optionsHash[option.selector] = this.compileMessage(option.value);
    }

    // Pop the plural stack to put back the original current plural value.
    this.currentPlural = this.pluralStack.pop();

    return optionsHash;
};

// -- Compiler Helper Classes --------------------------------------------------

function StringFormat(id) {
    this.id = id;
}

StringFormat.prototype.format = function (value) {
    if (!value && typeof value !== 'number') {
        return '';
    }

    return typeof value === 'string' ? value : String(value);
};

function PluralFormat(id, useOrdinal, offset, options, pluralFn) {
    this.id         = id;
    this.useOrdinal = useOrdinal;
    this.offset     = offset;
    this.options    = options;
    this.pluralFn   = pluralFn;
}

PluralFormat.prototype.getOption = function (value) {
    var options = this.options;

    var option = options['=' + value] ||
            options[this.pluralFn(value - this.offset, this.useOrdinal)];

    return option || options.other;
};

function PluralOffsetString(id, offset, numberFormat, string) {
    this.id           = id;
    this.offset       = offset;
    this.numberFormat = numberFormat;
    this.string       = string;
}

PluralOffsetString.prototype.format = function (value) {
    var number = this.numberFormat.format(value - this.offset);

    return this.string
            .replace(/(^|[^\\])#/g, '$1' + number)
            .replace(/\\#/g, '#');
};

function SelectFormat(id, options) {
    this.id      = id;
    this.options = options;
}

SelectFormat.prototype.getOption = function (value) {
    var options = this.options;
    return options[value] || options.other;
};


},{}],"nf75":[function(require,module,exports) {
"use strict";

exports["default"] = (function() {
  "use strict";

  /*
   * Generated by PEG.js 0.9.0.
   *
   * http://pegjs.org/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function peg$SyntaxError(message, expected, found, location) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.location = location;
    this.name     = "SyntaxError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }

  peg$subclass(peg$SyntaxError, Error);

  function peg$parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},
        parser  = this,

        peg$FAILED = {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = function(elements) {
                return {
                    type    : 'messageFormatPattern',
                    elements: elements,
                    location: location()
                };
            },
        peg$c1 = function(text) {
                var string = '',
                    i, j, outerLen, inner, innerLen;

                for (i = 0, outerLen = text.length; i < outerLen; i += 1) {
                    inner = text[i];

                    for (j = 0, innerLen = inner.length; j < innerLen; j += 1) {
                        string += inner[j];
                    }
                }

                return string;
            },
        peg$c2 = function(messageText) {
                return {
                    type : 'messageTextElement',
                    value: messageText,
                    location: location()
                };
            },
        peg$c3 = /^[^ \t\n\r,.+={}#]/,
        peg$c4 = { type: "class", value: "[^ \\t\\n\\r,.+={}#]", description: "[^ \\t\\n\\r,.+={}#]" },
        peg$c5 = "{",
        peg$c6 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c7 = ",",
        peg$c8 = { type: "literal", value: ",", description: "\",\"" },
        peg$c9 = "}",
        peg$c10 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c11 = function(id, format) {
                return {
                    type  : 'argumentElement',
                    id    : id,
                    format: format && format[2],
                    location: location()
                };
            },
        peg$c12 = "number",
        peg$c13 = { type: "literal", value: "number", description: "\"number\"" },
        peg$c14 = "date",
        peg$c15 = { type: "literal", value: "date", description: "\"date\"" },
        peg$c16 = "time",
        peg$c17 = { type: "literal", value: "time", description: "\"time\"" },
        peg$c18 = function(type, style) {
                return {
                    type : type + 'Format',
                    style: style && style[2],
                    location: location()
                };
            },
        peg$c19 = "plural",
        peg$c20 = { type: "literal", value: "plural", description: "\"plural\"" },
        peg$c21 = function(pluralStyle) {
                return {
                    type   : pluralStyle.type,
                    ordinal: false,
                    offset : pluralStyle.offset || 0,
                    options: pluralStyle.options,
                    location: location()
                };
            },
        peg$c22 = "selectordinal",
        peg$c23 = { type: "literal", value: "selectordinal", description: "\"selectordinal\"" },
        peg$c24 = function(pluralStyle) {
                return {
                    type   : pluralStyle.type,
                    ordinal: true,
                    offset : pluralStyle.offset || 0,
                    options: pluralStyle.options,
                    location: location()
                }
            },
        peg$c25 = "select",
        peg$c26 = { type: "literal", value: "select", description: "\"select\"" },
        peg$c27 = function(options) {
                return {
                    type   : 'selectFormat',
                    options: options,
                    location: location()
                };
            },
        peg$c28 = "=",
        peg$c29 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c30 = function(selector, pattern) {
                return {
                    type    : 'optionalFormatPattern',
                    selector: selector,
                    value   : pattern,
                    location: location()
                };
            },
        peg$c31 = "offset:",
        peg$c32 = { type: "literal", value: "offset:", description: "\"offset:\"" },
        peg$c33 = function(number) {
                return number;
            },
        peg$c34 = function(offset, options) {
                return {
                    type   : 'pluralFormat',
                    offset : offset,
                    options: options,
                    location: location()
                };
            },
        peg$c35 = { type: "other", description: "whitespace" },
        peg$c36 = /^[ \t\n\r]/,
        peg$c37 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },
        peg$c38 = { type: "other", description: "optionalWhitespace" },
        peg$c39 = /^[0-9]/,
        peg$c40 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c41 = /^[0-9a-f]/i,
        peg$c42 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" },
        peg$c43 = "0",
        peg$c44 = { type: "literal", value: "0", description: "\"0\"" },
        peg$c45 = /^[1-9]/,
        peg$c46 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c47 = function(digits) {
            return parseInt(digits, 10);
        },
        peg$c48 = /^[^{}\\\0-\x1F \t\n\r]/,
        peg$c49 = { type: "class", value: "[^{}\\\\\\0-\\x1F\\x7f \\t\\n\\r]", description: "[^{}\\\\\\0-\\x1F\\x7f \\t\\n\\r]" },
        peg$c50 = "\\\\",
        peg$c51 = { type: "literal", value: "\\\\", description: "\"\\\\\\\\\"" },
        peg$c52 = function() { return '\\'; },
        peg$c53 = "\\#",
        peg$c54 = { type: "literal", value: "\\#", description: "\"\\\\#\"" },
        peg$c55 = function() { return '\\#'; },
        peg$c56 = "\\{",
        peg$c57 = { type: "literal", value: "\\{", description: "\"\\\\{\"" },
        peg$c58 = function() { return '\u007B'; },
        peg$c59 = "\\}",
        peg$c60 = { type: "literal", value: "\\}", description: "\"\\\\}\"" },
        peg$c61 = function() { return '\u007D'; },
        peg$c62 = "\\u",
        peg$c63 = { type: "literal", value: "\\u", description: "\"\\\\u\"" },
        peg$c64 = function(digits) {
                return String.fromCharCode(parseInt(digits, 16));
            },
        peg$c65 = function(chars) { return chars.join(''); },

        peg$currPos          = 0,
        peg$savedPos         = 0,
        peg$posDetailsCache  = [{ line: 1, column: 1, seenCR: false }],
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }

    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        input.substring(peg$savedPos, peg$currPos),
        peg$computeLocation(peg$savedPos, peg$currPos)
      );
    }

    function error(message) {
      throw peg$buildException(
        message,
        null,
        input.substring(peg$savedPos, peg$currPos),
        peg$computeLocation(peg$savedPos, peg$currPos)
      );
    }

    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos],
          p, ch;

      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }

        details = peg$posDetailsCache[p];
        details = {
          line:   details.line,
          column: details.column,
          seenCR: details.seenCR
        };

        while (p < pos) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }

          p++;
        }

        peg$posDetailsCache[pos] = details;
        return details;
      }
    }

    function peg$computeLocation(startPos, endPos) {
      var startPosDetails = peg$computePosDetails(startPos),
          endPosDetails   = peg$computePosDetails(endPos);

      return {
        start: {
          offset: startPos,
          line:   startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line:   endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, found, location) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0100-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1000-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new peg$SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        location
      );
    }

    function peg$parsestart() {
      var s0;

      s0 = peg$parsemessageFormatPattern();

      return s0;
    }

    function peg$parsemessageFormatPattern() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsemessageFormatElement();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsemessageFormatElement();
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c0(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsemessageFormatElement() {
      var s0;

      s0 = peg$parsemessageTextElement();
      if (s0 === peg$FAILED) {
        s0 = peg$parseargumentElement();
      }

      return s0;
    }

    function peg$parsemessageText() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$currPos;
      s3 = peg$parse_();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsechars();
        if (s4 !== peg$FAILED) {
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            s3 = [s3, s4, s5];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$currPos;
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsechars();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s3 = [s3, s4, s5];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsews();
        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parsemessageTextElement() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsemessageText();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c2(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseargument() {
      var s0, s1, s2;

      s0 = peg$parsenumber();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        if (peg$c3.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c4); }
        }
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            if (peg$c3.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parseargumentElement() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c5;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c6); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseargument();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s6 = peg$c7;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c8); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseelementFormat();
                  if (s8 !== peg$FAILED) {
                    s6 = [s6, s7, s8];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 125) {
                    s7 = peg$c9;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c10); }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c11(s3, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseelementFormat() {
      var s0;

      s0 = peg$parsesimpleFormat();
      if (s0 === peg$FAILED) {
        s0 = peg$parsepluralFormat();
        if (s0 === peg$FAILED) {
          s0 = peg$parseselectOrdinalFormat();
          if (s0 === peg$FAILED) {
            s0 = peg$parseselectFormat();
          }
        }
      }

      return s0;
    }

    function peg$parsesimpleFormat() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c12) {
        s1 = peg$c12;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c13); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c14) {
          s1 = peg$c14;
          peg$currPos += 4;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c15); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 4) === peg$c16) {
            s1 = peg$c16;
            peg$currPos += 4;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c17); }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c7;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              s6 = peg$parsechars();
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c18(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsepluralFormat() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c19) {
        s1 = peg$c19;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c20); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c7;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsepluralStyle();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c21(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseselectOrdinalFormat() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 13) === peg$c22) {
        s1 = peg$c22;
        peg$currPos += 13;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c23); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c7;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsepluralStyle();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c24(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseselectFormat() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c25) {
        s1 = peg$c25;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c26); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c7;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseoptionalFormatPattern();
              if (s6 !== peg$FAILED) {
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseoptionalFormatPattern();
                }
              } else {
                s5 = peg$FAILED;
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c27(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseselector() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 61) {
        s2 = peg$c28;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c29); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenumber();
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s0 = input.substring(s0, peg$currPos);
      } else {
        s0 = s1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parsechars();
      }

      return s0;
    }

    function peg$parseoptionalFormatPattern() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseselector();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 123) {
              s4 = peg$c5;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c6); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsemessageFormatPattern();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s8 = peg$c9;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c10); }
                    }
                    if (s8 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c30(s2, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseoffset() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c31) {
        s1 = peg$c31;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenumber();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c33(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsepluralStyle() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseoffset();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseoptionalFormatPattern();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseoptionalFormatPattern();
            }
          } else {
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c34(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsews() {
      var s0, s1;

      peg$silentFails++;
      s0 = [];
      if (peg$c36.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c37); }
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (peg$c36.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c37); }
          }
        }
      } else {
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c35); }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsews();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsews();
      }
      if (s1 !== peg$FAILED) {
        s0 = input.substring(s0, peg$currPos);
      } else {
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c38); }
      }

      return s0;
    }

    function peg$parsedigit() {
      var s0;

      if (peg$c39.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c40); }
      }

      return s0;
    }

    function peg$parsehexDigit() {
      var s0;

      if (peg$c41.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c42); }
      }

      return s0;
    }

    function peg$parsenumber() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 48) {
        s1 = peg$c43;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c44); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$currPos;
        s2 = peg$currPos;
        if (peg$c45.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c46); }
        }
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parsedigit();
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$parsedigit();
          }
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s1 = input.substring(s1, peg$currPos);
        } else {
          s1 = s2;
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c47(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsechar() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      if (peg$c48.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c49); }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c50) {
          s1 = peg$c50;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c51); }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c52();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c53) {
            s1 = peg$c53;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c54); }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c55();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c56) {
              s1 = peg$c56;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c57); }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c58();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c59) {
                s1 = peg$c59;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c60); }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c61();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c62) {
                  s1 = peg$c62;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c63); }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$currPos;
                  s3 = peg$currPos;
                  s4 = peg$parsehexDigit();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsehexDigit();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsehexDigit();
                      if (s6 !== peg$FAILED) {
                        s7 = peg$parsehexDigit();
                        if (s7 !== peg$FAILED) {
                          s4 = [s4, s5, s6, s7];
                          s3 = s4;
                        } else {
                          peg$currPos = s3;
                          s3 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                  if (s3 !== peg$FAILED) {
                    s2 = input.substring(s2, peg$currPos);
                  } else {
                    s2 = s3;
                  }
                  if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c64(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsechars() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsechar();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsechar();
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c65(s1);
      }
      s0 = s1;

      return s0;
    }

    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(
        null,
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length
          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }

  return {
    SyntaxError: peg$SyntaxError,
    parse:       peg$parse
  };
})();


},{}],"vCGK":[function(require,module,exports) {
'use strict';

exports = module.exports = require('./lib/parser')['default'];
exports['default'] = exports;

},{"./lib/parser":"nf75"}],"3Iku":[function(require,module,exports) {
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
var src$utils$$ = require("./utils"), src$es5$$ = require("./es5"), src$compiler$$ = require("./compiler"), intl$messageformat$parser$$ = require("intl-messageformat-parser");
exports["default"] = MessageFormat;

// -- MessageFormat --------------------------------------------------------

function MessageFormat(message, locales, formats) {
    // Parse string messages into an AST.
    var ast = typeof message === 'string' ?
            MessageFormat.__parse(message) : message;

    if (!(ast && ast.type === 'messageFormatPattern')) {
        throw new TypeError('A message must be provided as a String or AST.');
    }

    // Creates a new object with the specified `formats` merged with the default
    // formats.
    formats = this._mergeFormats(MessageFormat.formats, formats);

    // Defined first because it's used to build the format pattern.
    src$es5$$.defineProperty(this, '_locale',  {value: this._resolveLocale(locales)});

    // Compile the `ast` to a pattern that is highly optimized for repeated
    // `format()` invocations. **Note:** This passes the `locales` set provided
    // to the constructor instead of just the resolved locale.
    var pluralFn = this._findPluralRuleFunction(this._locale);
    var pattern  = this._compilePattern(ast, locales, formats, pluralFn);

    // "Bind" `format()` method to `this` so it can be passed by reference like
    // the other `Intl` APIs.
    var messageFormat = this;
    this.format = function (values) {
      try {
        return messageFormat._format(pattern, values);
      } catch (e) {
        if (e.variableId) {
          throw new Error(
            'The intl string context variable \'' + e.variableId + '\'' +
            ' was not provided to the string \'' + message + '\''
          );
        } else {
          throw e;
        }
      }
    };
}

// Default format options used as the prototype of the `formats` provided to the
// constructor. These are used when constructing the internal Intl.NumberFormat
// and Intl.DateTimeFormat instances.
src$es5$$.defineProperty(MessageFormat, 'formats', {
    enumerable: true,

    value: {
        number: {
            'currency': {
                style: 'currency'
            },

            'percent': {
                style: 'percent'
            }
        },

        date: {
            'short': {
                month: 'numeric',
                day  : 'numeric',
                year : '2-digit'
            },

            'medium': {
                month: 'short',
                day  : 'numeric',
                year : 'numeric'
            },

            'long': {
                month: 'long',
                day  : 'numeric',
                year : 'numeric'
            },

            'full': {
                weekday: 'long',
                month  : 'long',
                day    : 'numeric',
                year   : 'numeric'
            }
        },

        time: {
            'short': {
                hour  : 'numeric',
                minute: 'numeric'
            },

            'medium':  {
                hour  : 'numeric',
                minute: 'numeric',
                second: 'numeric'
            },

            'long': {
                hour        : 'numeric',
                minute      : 'numeric',
                second      : 'numeric',
                timeZoneName: 'short'
            },

            'full': {
                hour        : 'numeric',
                minute      : 'numeric',
                second      : 'numeric',
                timeZoneName: 'short'
            }
        }
    }
});

// Define internal private properties for dealing with locale data.
src$es5$$.defineProperty(MessageFormat, '__localeData__', {value: src$es5$$.objCreate(null)});
src$es5$$.defineProperty(MessageFormat, '__addLocaleData', {value: function (data) {
    if (!(data && data.locale)) {
        throw new Error(
            'Locale data provided to IntlMessageFormat is missing a ' +
            '`locale` property'
        );
    }

    MessageFormat.__localeData__[data.locale.toLowerCase()] = data;
}});

// Defines `__parse()` static method as an exposed private.
src$es5$$.defineProperty(MessageFormat, '__parse', {value: intl$messageformat$parser$$["default"].parse});

// Define public `defaultLocale` property which defaults to English, but can be
// set by the developer.
src$es5$$.defineProperty(MessageFormat, 'defaultLocale', {
    enumerable: true,
    writable  : true,
    value     : undefined
});

MessageFormat.prototype.resolvedOptions = function () {
    // TODO: Provide anything else?
    return {
        locale: this._locale
    };
};

MessageFormat.prototype._compilePattern = function (ast, locales, formats, pluralFn) {
    var compiler = new src$compiler$$["default"](locales, formats, pluralFn);
    return compiler.compile(ast);
};

MessageFormat.prototype._findPluralRuleFunction = function (locale) {
    var localeData = MessageFormat.__localeData__;
    var data       = localeData[locale.toLowerCase()];

    // The locale data is de-duplicated, so we have to traverse the locale's
    // hierarchy until we find a `pluralRuleFunction` to return.
    while (data) {
        if (data.pluralRuleFunction) {
            return data.pluralRuleFunction;
        }

        data = data.parentLocale && localeData[data.parentLocale.toLowerCase()];
    }

    throw new Error(
        'Locale data added to IntlMessageFormat is missing a ' +
        '`pluralRuleFunction` for :' + locale
    );
};

MessageFormat.prototype._format = function (pattern, values) {
    var result = '',
        i, len, part, id, value, err;

    for (i = 0, len = pattern.length; i < len; i += 1) {
        part = pattern[i];

        // Exist early for string parts.
        if (typeof part === 'string') {
            result += part;
            continue;
        }

        id = part.id;

        // Enforce that all required values are provided by the caller.
        if (!(values && src$utils$$.hop.call(values, id))) {
          err = new Error('A value must be provided for: ' + id);
          err.variableId = id;
          throw err;
        }

        value = values[id];

        // Recursively format plural and select parts' option — which can be a
        // nested pattern structure. The choosing of the option to use is
        // abstracted-by and delegated-to the part helper object.
        if (part.options) {
            result += this._format(part.getOption(value), values);
        } else {
            result += part.format(value);
        }
    }

    return result;
};

MessageFormat.prototype._mergeFormats = function (defaults, formats) {
    var mergedFormats = {},
        type, mergedType;

    for (type in defaults) {
        if (!src$utils$$.hop.call(defaults, type)) { continue; }

        mergedFormats[type] = mergedType = src$es5$$.objCreate(defaults[type]);

        if (formats && src$utils$$.hop.call(formats, type)) {
            src$utils$$.extend(mergedType, formats[type]);
        }
    }

    return mergedFormats;
};

MessageFormat.prototype._resolveLocale = function (locales) {
    if (typeof locales === 'string') {
        locales = [locales];
    }

    // Create a copy of the array so we can push on the default locale.
    locales = (locales || []).concat(MessageFormat.defaultLocale);

    var localeData = MessageFormat.__localeData__;
    var i, len, localeParts, data;

    // Using the set of locales + the default locale, we look for the first one
    // which that has been registered. When data does not exist for a locale, we
    // traverse its ancestors to find something that's been registered within
    // its hierarchy of locales. Since we lack the proper `parentLocale` data
    // here, we must take a naive approach to traversal.
    for (i = 0, len = locales.length; i < len; i += 1) {
        localeParts = locales[i].toLowerCase().split('-');

        while (localeParts.length) {
            data = localeData[localeParts.join('-')];
            if (data) {
                // Return the normalized locale string; e.g., we return "en-US",
                // instead of "en-us".
                return data.locale;
            }

            localeParts.pop();
        }
    }

    var defaultLocale = locales.pop();
    throw new Error(
        'No locale data has been added to IntlMessageFormat for: ' +
        locales.join(', ') + ', or the default locale: ' + defaultLocale
    );
};


},{"./utils":"Sy7q","./es5":"rAkH","./compiler":"i1A+","intl-messageformat-parser":"vCGK"}],"Bm8w":[function(require,module,exports) {
// GENERATED FILE
"use strict";
exports["default"] = {"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"}};


},{}],"DZGG":[function(require,module,exports) {
/* jslint esnext: true */

"use strict";
var src$core$$ = require("./core"), src$en$$ = require("./en");

src$core$$["default"].__addLocaleData(src$en$$["default"]);
src$core$$["default"].defaultLocale = 'en';

exports["default"] = src$core$$["default"];


},{"./core":"3Iku","./en":"Bm8w"}],"+Eog":[function(require,module,exports) {
/* jshint node:true */

'use strict';

var IntlMessageFormat = require('./lib/main')['default'];

// Add all locale data to `IntlMessageFormat`. This module will be ignored when
// bundling for the browser with Browserify/Webpack.
require('./lib/locales');

// Re-export `IntlMessageFormat` as the CommonJS default exports with all the
// locale data registered, and with English set as the default locale. Define
// the `default` prop for use with other compiled ES6 Modules.
exports = module.exports = IntlMessageFormat;
exports['default'] = exports;

},{"./lib/main":"DZGG","./lib/locales":"70rD"}],"hqRB":[function(require,module,exports) {
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";

var round = Math.round;

function daysToYears(days) {
    // 400 years have 146097 days (taking into account leap year rules)
    return days * 400 / 146097;
}

exports["default"] = function (from, to) {
    // Convert to ms timestamps.
    from = +from;
    to   = +to;

    var millisecond = round(to - from),
        second      = round(millisecond / 1000),
        minute      = round(second / 60),
        hour        = round(minute / 60),
        day         = round(hour / 24),
        week        = round(day / 7);

    var rawYears = daysToYears(day),
        month    = round(rawYears * 12),
        year     = round(rawYears);

    return {
        millisecond    : millisecond,
        second         : second,
        'second-short' : second,
        minute         : minute,
        'minute-short' : minute,
        hour           : hour,
        'hour-short'   : hour,
        day            : day,
        'day-short'    : day,
        week           : week,
        'week-short'   : week,
        month          : month,
        'month-short'  : month,
        year           : year,
        'year-short'   : year
    };
};


},{}],"XzCr":[function(require,module,exports) {
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

// Purposely using the same implementation as the Intl.js `Intl` polyfill.
// Copyright 2013 Andy Earnshaw, MIT License

"use strict";

var hop = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

var realDefineProp = (function () {
    try { return !!Object.defineProperty({}, 'a', {}); }
    catch (e) { return false; }
})();

var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

var defineProperty = realDefineProp ? Object.defineProperty :
        function (obj, name, desc) {

    if ('get' in desc && obj.__defineGetter__) {
        obj.__defineGetter__(name, desc.get);
    } else if (!hop.call(obj, name) || 'value' in desc) {
        obj[name] = desc.value;
    }
};

var objCreate = Object.create || function (proto, props) {
    var obj, k;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (k in props) {
        if (hop.call(props, k)) {
            defineProperty(obj, k, props[k]);
        }
    }

    return obj;
};

var arrIndexOf = Array.prototype.indexOf || function (search, fromIndex) {
    /*jshint validthis:true */
    var arr = this;
    if (!arr.length) {
        return -1;
    }

    for (var i = fromIndex || 0, max = arr.length; i < max; i++) {
        if (arr[i] === search) {
            return i;
        }
    }

    return -1;
};

var isArray = Array.isArray || function (obj) {
    return toString.call(obj) === '[object Array]';
};

var dateNow = Date.now || function () {
    return new Date().getTime();
};

exports.defineProperty = defineProperty, exports.objCreate = objCreate, exports.arrIndexOf = arrIndexOf, exports.isArray = isArray, exports.dateNow = dateNow;


},{}],"4NrO":[function(require,module,exports) {
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
var intl$messageformat$$ = require("intl-messageformat"), src$diff$$ = require("./diff"), src$es5$$ = require("./es5");
exports["default"] = RelativeFormat;

// -----------------------------------------------------------------------------

var FIELDS = [
    'second', 'second-short',
    'minute', 'minute-short',
    'hour', 'hour-short',
    'day', 'day-short',
    'month', 'month-short',
    'year', 'year-short'
];
var STYLES = ['best fit', 'numeric'];

// -- RelativeFormat -----------------------------------------------------------

function RelativeFormat(locales, options) {
    options = options || {};

    // Make a copy of `locales` if it's an array, so that it doesn't change
    // since it's used lazily.
    if (src$es5$$.isArray(locales)) {
        locales = locales.concat();
    }

    src$es5$$.defineProperty(this, '_locale', {value: this._resolveLocale(locales)});
    src$es5$$.defineProperty(this, '_options', {value: {
        style: this._resolveStyle(options.style),
        units: this._isValidUnits(options.units) && options.units
    }});

    src$es5$$.defineProperty(this, '_locales', {value: locales});
    src$es5$$.defineProperty(this, '_fields', {value: this._findFields(this._locale)});
    src$es5$$.defineProperty(this, '_messages', {value: src$es5$$.objCreate(null)});

    // "Bind" `format()` method to `this` so it can be passed by reference like
    // the other `Intl` APIs.
    var relativeFormat = this;
    this.format = function format(date, options) {
        return relativeFormat._format(date, options);
    };
}

// Define internal private properties for dealing with locale data.
src$es5$$.defineProperty(RelativeFormat, '__localeData__', {value: src$es5$$.objCreate(null)});
src$es5$$.defineProperty(RelativeFormat, '__addLocaleData', {value: function (data) {
    if (!(data && data.locale)) {
        throw new Error(
            'Locale data provided to IntlRelativeFormat is missing a ' +
            '`locale` property value'
        );
    }

    RelativeFormat.__localeData__[data.locale.toLowerCase()] = data;

    // Add data to IntlMessageFormat.
    intl$messageformat$$["default"].__addLocaleData(data);
}});

// Define public `defaultLocale` property which can be set by the developer, or
// it will be set when the first RelativeFormat instance is created by
// leveraging the resolved locale from `Intl`.
src$es5$$.defineProperty(RelativeFormat, 'defaultLocale', {
    enumerable: true,
    writable  : true,
    value     : undefined
});

// Define public `thresholds` property which can be set by the developer, and
// defaults to relative time thresholds from moment.js.
src$es5$$.defineProperty(RelativeFormat, 'thresholds', {
    enumerable: true,

    value: {
        second: 45, 'second-short': 45,  // seconds to minute
        minute: 45, 'minute-short': 45, // minutes to hour
        hour  : 22, 'hour-short': 22, // hours to day
        day   : 26, 'day-short': 26, // days to month
        month : 11, 'month-short': 11 // months to year
    }
});

RelativeFormat.prototype.resolvedOptions = function () {
    return {
        locale: this._locale,
        style : this._options.style,
        units : this._options.units
    };
};

RelativeFormat.prototype._compileMessage = function (units) {
    // `this._locales` is the original set of locales the user specified to the
    // constructor, while `this._locale` is the resolved root locale.
    var locales        = this._locales;
    var resolvedLocale = this._locale;

    var field        = this._fields[units];
    var relativeTime = field.relativeTime;
    var future       = '';
    var past         = '';
    var i;

    for (i in relativeTime.future) {
        if (relativeTime.future.hasOwnProperty(i)) {
            future += ' ' + i + ' {' +
                relativeTime.future[i].replace('{0}', '#') + '}';
        }
    }

    for (i in relativeTime.past) {
        if (relativeTime.past.hasOwnProperty(i)) {
            past += ' ' + i + ' {' +
                relativeTime.past[i].replace('{0}', '#') + '}';
        }
    }

    var message = '{when, select, future {{0, plural, ' + future + '}}' +
                                 'past {{0, plural, ' + past + '}}}';

    // Create the synthetic IntlMessageFormat instance using the original
    // locales value specified by the user when constructing the the parent
    // IntlRelativeFormat instance.
    return new intl$messageformat$$["default"](message, locales);
};

RelativeFormat.prototype._getMessage = function (units) {
    var messages = this._messages;

    // Create a new synthetic message based on the locale data from CLDR.
    if (!messages[units]) {
        messages[units] = this._compileMessage(units);
    }

    return messages[units];
};

RelativeFormat.prototype._getRelativeUnits = function (diff, units) {
    var field = this._fields[units];

    if (field.relative) {
        return field.relative[diff];
    }
};

RelativeFormat.prototype._findFields = function (locale) {
    var localeData = RelativeFormat.__localeData__;
    var data       = localeData[locale.toLowerCase()];

    // The locale data is de-duplicated, so we have to traverse the locale's
    // hierarchy until we find `fields` to return.
    while (data) {
        if (data.fields) {
            return data.fields;
        }

        data = data.parentLocale && localeData[data.parentLocale.toLowerCase()];
    }

    throw new Error(
        'Locale data added to IntlRelativeFormat is missing `fields` for :' +
        locale
    );
};

RelativeFormat.prototype._format = function (date, options) {
    var now = options && options.now !== undefined ? options.now : src$es5$$.dateNow();

    if (date === undefined) {
        date = now;
    }

    // Determine if the `date` and optional `now` values are valid, and throw a
    // similar error to what `Intl.DateTimeFormat#format()` would throw.
    if (!isFinite(now)) {
        throw new RangeError(
            'The `now` option provided to IntlRelativeFormat#format() is not ' +
            'in valid range.'
        );
    }

    if (!isFinite(date)) {
        throw new RangeError(
            'The date value provided to IntlRelativeFormat#format() is not ' +
            'in valid range.'
        );
    }

    var diffReport  = src$diff$$["default"](now, date);
    var units       = this._options.units || this._selectUnits(diffReport);
    var diffInUnits = diffReport[units];

    if (this._options.style !== 'numeric') {
        var relativeUnits = this._getRelativeUnits(diffInUnits, units);
        if (relativeUnits) {
            return relativeUnits;
        }
    }

    return this._getMessage(units).format({
        '0' : Math.abs(diffInUnits),
        when: diffInUnits < 0 ? 'past' : 'future'
    });
};

RelativeFormat.prototype._isValidUnits = function (units) {
    if (!units || src$es5$$.arrIndexOf.call(FIELDS, units) >= 0) {
        return true;
    }

    if (typeof units === 'string') {
        var suggestion = /s$/.test(units) && units.substr(0, units.length - 1);
        if (suggestion && src$es5$$.arrIndexOf.call(FIELDS, suggestion) >= 0) {
            throw new Error(
                '"' + units + '" is not a valid IntlRelativeFormat `units` ' +
                'value, did you mean: ' + suggestion
            );
        }
    }

    throw new Error(
        '"' + units + '" is not a valid IntlRelativeFormat `units` value, it ' +
        'must be one of: "' + FIELDS.join('", "') + '"'
    );
};

RelativeFormat.prototype._resolveLocale = function (locales) {
    if (typeof locales === 'string') {
        locales = [locales];
    }

    // Create a copy of the array so we can push on the default locale.
    locales = (locales || []).concat(RelativeFormat.defaultLocale);

    var localeData = RelativeFormat.__localeData__;
    var i, len, localeParts, data;

    // Using the set of locales + the default locale, we look for the first one
    // which that has been registered. When data does not exist for a locale, we
    // traverse its ancestors to find something that's been registered within
    // its hierarchy of locales. Since we lack the proper `parentLocale` data
    // here, we must take a naive approach to traversal.
    for (i = 0, len = locales.length; i < len; i += 1) {
        localeParts = locales[i].toLowerCase().split('-');

        while (localeParts.length) {
            data = localeData[localeParts.join('-')];
            if (data) {
                // Return the normalized locale string; e.g., we return "en-US",
                // instead of "en-us".
                return data.locale;
            }

            localeParts.pop();
        }
    }

    var defaultLocale = locales.pop();
    throw new Error(
        'No locale data has been added to IntlRelativeFormat for: ' +
        locales.join(', ') + ', or the default locale: ' + defaultLocale
    );
};

RelativeFormat.prototype._resolveStyle = function (style) {
    // Default to "best fit" style.
    if (!style) {
        return STYLES[0];
    }

    if (src$es5$$.arrIndexOf.call(STYLES, style) >= 0) {
        return style;
    }

    throw new Error(
        '"' + style + '" is not a valid IntlRelativeFormat `style` value, it ' +
        'must be one of: "' + STYLES.join('", "') + '"'
    );
};

RelativeFormat.prototype._selectUnits = function (diffReport) {
    var i, l, units;
    var fields = FIELDS.filter(function(field) {
        return field.indexOf('-short') < 1;
    });

    for (i = 0, l = fields.length; i < l; i += 1) {
        units = fields[i];

        if (Math.abs(diffReport[units]) < RelativeFormat.thresholds[units]) {
            break;
        }
    }

    return units;
};


},{"intl-messageformat":"+Eog","./diff":"hqRB","./es5":"XzCr"}],"bH6W":[function(require,module,exports) {
// GENERATED FILE
"use strict";
exports["default"] = {"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"},"fields":{"year":{"displayName":"year","relative":{"0":"this year","1":"next year","-1":"last year"},"relativeTime":{"future":{"one":"in {0} year","other":"in {0} years"},"past":{"one":"{0} year ago","other":"{0} years ago"}}},"year-short":{"displayName":"yr.","relative":{"0":"this yr.","1":"next yr.","-1":"last yr."},"relativeTime":{"future":{"one":"in {0} yr.","other":"in {0} yr."},"past":{"one":"{0} yr. ago","other":"{0} yr. ago"}}},"month":{"displayName":"month","relative":{"0":"this month","1":"next month","-1":"last month"},"relativeTime":{"future":{"one":"in {0} month","other":"in {0} months"},"past":{"one":"{0} month ago","other":"{0} months ago"}}},"month-short":{"displayName":"mo.","relative":{"0":"this mo.","1":"next mo.","-1":"last mo."},"relativeTime":{"future":{"one":"in {0} mo.","other":"in {0} mo."},"past":{"one":"{0} mo. ago","other":"{0} mo. ago"}}},"day":{"displayName":"day","relative":{"0":"today","1":"tomorrow","-1":"yesterday"},"relativeTime":{"future":{"one":"in {0} day","other":"in {0} days"},"past":{"one":"{0} day ago","other":"{0} days ago"}}},"day-short":{"displayName":"day","relative":{"0":"today","1":"tomorrow","-1":"yesterday"},"relativeTime":{"future":{"one":"in {0} day","other":"in {0} days"},"past":{"one":"{0} day ago","other":"{0} days ago"}}},"hour":{"displayName":"hour","relative":{"0":"this hour"},"relativeTime":{"future":{"one":"in {0} hour","other":"in {0} hours"},"past":{"one":"{0} hour ago","other":"{0} hours ago"}}},"hour-short":{"displayName":"hr.","relative":{"0":"this hour"},"relativeTime":{"future":{"one":"in {0} hr.","other":"in {0} hr."},"past":{"one":"{0} hr. ago","other":"{0} hr. ago"}}},"minute":{"displayName":"minute","relative":{"0":"this minute"},"relativeTime":{"future":{"one":"in {0} minute","other":"in {0} minutes"},"past":{"one":"{0} minute ago","other":"{0} minutes ago"}}},"minute-short":{"displayName":"min.","relative":{"0":"this minute"},"relativeTime":{"future":{"one":"in {0} min.","other":"in {0} min."},"past":{"one":"{0} min. ago","other":"{0} min. ago"}}},"second":{"displayName":"second","relative":{"0":"now"},"relativeTime":{"future":{"one":"in {0} second","other":"in {0} seconds"},"past":{"one":"{0} second ago","other":"{0} seconds ago"}}},"second-short":{"displayName":"sec.","relative":{"0":"now"},"relativeTime":{"future":{"one":"in {0} sec.","other":"in {0} sec."},"past":{"one":"{0} sec. ago","other":"{0} sec. ago"}}}}};


},{}],"dl7x":[function(require,module,exports) {
/* jslint esnext: true */

"use strict";
var src$core$$ = require("./core"), src$en$$ = require("./en");

src$core$$["default"].__addLocaleData(src$en$$["default"]);
src$core$$["default"].defaultLocale = 'en';

exports["default"] = src$core$$["default"];


},{"./core":"4NrO","./en":"bH6W"}],"ztuU":[function(require,module,exports) {
/* jshint node:true */

'use strict';

var IntlRelativeFormat = require('./lib/main')['default'];

// Add all locale data to `IntlRelativeFormat`. This module will be ignored when
// bundling for the browser with Browserify/Webpack.
require('./lib/locales');

// Re-export `IntlRelativeFormat` as the CommonJS default exports with all the
// locale data registered, and with English set as the default locale. Define
// the `default` prop for use with other compiled ES6 Modules.
exports = module.exports = IntlRelativeFormat;
exports['default'] = exports;

},{"./lib/main":"dl7x","./lib/locales":"70rD"}],"Asjh":[function(require,module,exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;

},{}],"wVGV":[function(require,module,exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');

function emptyFunction() {}
function emptyFunctionWithReset() {}
emptyFunctionWithReset.resetWarningCache = emptyFunction;

module.exports = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      // It is still safe when called from React.
      return;
    }
    var err = new Error(
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
    err.name = 'Invariant Violation';
    throw err;
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    elementType: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim,
    exact: getShim,

    checkPropTypes: emptyFunctionWithReset,
    resetWarningCache: emptyFunction
  };

  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

},{"./lib/ReactPropTypesSecret":"Asjh"}],"5D9O":[function(require,module,exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
if ("production" !== 'production') {
  var ReactIs = require('react-is'); // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod


  var throwOnDirectAccess = true;
  module.exports = require('./factoryWithTypeCheckers')(ReactIs.isElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = require('./factoryWithThrowingShims')();
}
},{"./factoryWithThrowingShims":"wVGV"}],"J4Nk":[function(require,module,exports) {
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
'use strict';
/* eslint-disable no-unused-vars */

var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
  if (val === null || val === undefined) {
    throw new TypeError('Object.assign cannot be called with null or undefined');
  }

  return Object(val);
}

function shouldUseNative() {
  try {
    if (!Object.assign) {
      return false;
    } // Detect buggy property enumeration order in older V8 versions.
    // https://bugs.chromium.org/p/v8/issues/detail?id=4118


    var test1 = new String('abc'); // eslint-disable-line no-new-wrappers

    test1[5] = 'de';

    if (Object.getOwnPropertyNames(test1)[0] === '5') {
      return false;
    } // https://bugs.chromium.org/p/v8/issues/detail?id=3056


    var test2 = {};

    for (var i = 0; i < 10; i++) {
      test2['_' + String.fromCharCode(i)] = i;
    }

    var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
      return test2[n];
    });

    if (order2.join('') !== '0123456789') {
      return false;
    } // https://bugs.chromium.org/p/v8/issues/detail?id=3056


    var test3 = {};
    'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
      test3[letter] = letter;
    });

    if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
      return false;
    }

    return true;
  } catch (err) {
    // We don't expect any of the above to throw, but better to be safe.
    return false;
  }
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
  var from;
  var to = toObject(target);
  var symbols;

  for (var s = 1; s < arguments.length; s++) {
    from = Object(arguments[s]);

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }

    if (getOwnPropertySymbols) {
      symbols = getOwnPropertySymbols(from);

      for (var i = 0; i < symbols.length; i++) {
        if (propIsEnumerable.call(from, symbols[i])) {
          to[symbols[i]] = from[symbols[i]];
        }
      }
    }
  }

  return to;
};
},{}],"awqi":[function(require,module,exports) {
/** @license React v16.8.4
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

var k = require("object-assign"),
    n = "function" === typeof Symbol && Symbol.for,
    p = n ? Symbol.for("react.element") : 60103,
    q = n ? Symbol.for("react.portal") : 60106,
    r = n ? Symbol.for("react.fragment") : 60107,
    t = n ? Symbol.for("react.strict_mode") : 60108,
    u = n ? Symbol.for("react.profiler") : 60114,
    v = n ? Symbol.for("react.provider") : 60109,
    w = n ? Symbol.for("react.context") : 60110,
    x = n ? Symbol.for("react.concurrent_mode") : 60111,
    y = n ? Symbol.for("react.forward_ref") : 60112,
    z = n ? Symbol.for("react.suspense") : 60113,
    aa = n ? Symbol.for("react.memo") : 60115,
    ba = n ? Symbol.for("react.lazy") : 60116,
    A = "function" === typeof Symbol && Symbol.iterator;

function ca(a, b, d, c, e, g, h, f) {
  if (!a) {
    a = void 0;
    if (void 0 === b) a = Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else {
      var l = [d, c, e, g, h, f],
          m = 0;
      a = Error(b.replace(/%s/g, function () {
        return l[m++];
      }));
      a.name = "Invariant Violation";
    }
    a.framesToPop = 1;
    throw a;
  }
}

function B(a) {
  for (var b = arguments.length - 1, d = "https://reactjs.org/docs/error-decoder.html?invariant=" + a, c = 0; c < b; c++) d += "&args[]=" + encodeURIComponent(arguments[c + 1]);

  ca(!1, "Minified React error #" + a + "; visit %s for the full message or use the non-minified dev environment for full errors and additional helpful warnings. ", d);
}

var C = {
  isMounted: function () {
    return !1;
  },
  enqueueForceUpdate: function () {},
  enqueueReplaceState: function () {},
  enqueueSetState: function () {}
},
    D = {};

function E(a, b, d) {
  this.props = a;
  this.context = b;
  this.refs = D;
  this.updater = d || C;
}

E.prototype.isReactComponent = {};

E.prototype.setState = function (a, b) {
  "object" !== typeof a && "function" !== typeof a && null != a ? B("85") : void 0;
  this.updater.enqueueSetState(this, a, b, "setState");
};

E.prototype.forceUpdate = function (a) {
  this.updater.enqueueForceUpdate(this, a, "forceUpdate");
};

function F() {}

F.prototype = E.prototype;

function G(a, b, d) {
  this.props = a;
  this.context = b;
  this.refs = D;
  this.updater = d || C;
}

var H = G.prototype = new F();
H.constructor = G;
k(H, E.prototype);
H.isPureReactComponent = !0;
var I = {
  current: null
},
    J = {
  current: null
},
    K = Object.prototype.hasOwnProperty,
    L = {
  key: !0,
  ref: !0,
  __self: !0,
  __source: !0
};

function M(a, b, d) {
  var c = void 0,
      e = {},
      g = null,
      h = null;
  if (null != b) for (c in void 0 !== b.ref && (h = b.ref), void 0 !== b.key && (g = "" + b.key), b) K.call(b, c) && !L.hasOwnProperty(c) && (e[c] = b[c]);
  var f = arguments.length - 2;
  if (1 === f) e.children = d;else if (1 < f) {
    for (var l = Array(f), m = 0; m < f; m++) l[m] = arguments[m + 2];

    e.children = l;
  }
  if (a && a.defaultProps) for (c in f = a.defaultProps, f) void 0 === e[c] && (e[c] = f[c]);
  return {
    $$typeof: p,
    type: a,
    key: g,
    ref: h,
    props: e,
    _owner: J.current
  };
}

function da(a, b) {
  return {
    $$typeof: p,
    type: a.type,
    key: b,
    ref: a.ref,
    props: a.props,
    _owner: a._owner
  };
}

function N(a) {
  return "object" === typeof a && null !== a && a.$$typeof === p;
}

function escape(a) {
  var b = {
    "=": "=0",
    ":": "=2"
  };
  return "$" + ("" + a).replace(/[=:]/g, function (a) {
    return b[a];
  });
}

var O = /\/+/g,
    P = [];

function Q(a, b, d, c) {
  if (P.length) {
    var e = P.pop();
    e.result = a;
    e.keyPrefix = b;
    e.func = d;
    e.context = c;
    e.count = 0;
    return e;
  }

  return {
    result: a,
    keyPrefix: b,
    func: d,
    context: c,
    count: 0
  };
}

function R(a) {
  a.result = null;
  a.keyPrefix = null;
  a.func = null;
  a.context = null;
  a.count = 0;
  10 > P.length && P.push(a);
}

function S(a, b, d, c) {
  var e = typeof a;
  if ("undefined" === e || "boolean" === e) a = null;
  var g = !1;
  if (null === a) g = !0;else switch (e) {
    case "string":
    case "number":
      g = !0;
      break;

    case "object":
      switch (a.$$typeof) {
        case p:
        case q:
          g = !0;
      }

  }
  if (g) return d(c, a, "" === b ? "." + T(a, 0) : b), 1;
  g = 0;
  b = "" === b ? "." : b + ":";
  if (Array.isArray(a)) for (var h = 0; h < a.length; h++) {
    e = a[h];
    var f = b + T(e, h);
    g += S(e, f, d, c);
  } else if (null === a || "object" !== typeof a ? f = null : (f = A && a[A] || a["@@iterator"], f = "function" === typeof f ? f : null), "function" === typeof f) for (a = f.call(a), h = 0; !(e = a.next()).done;) e = e.value, f = b + T(e, h++), g += S(e, f, d, c);else "object" === e && (d = "" + a, B("31", "[object Object]" === d ? "object with keys {" + Object.keys(a).join(", ") + "}" : d, ""));
  return g;
}

function U(a, b, d) {
  return null == a ? 0 : S(a, "", b, d);
}

function T(a, b) {
  return "object" === typeof a && null !== a && null != a.key ? escape(a.key) : b.toString(36);
}

function ea(a, b) {
  a.func.call(a.context, b, a.count++);
}

function fa(a, b, d) {
  var c = a.result,
      e = a.keyPrefix;
  a = a.func.call(a.context, b, a.count++);
  Array.isArray(a) ? V(a, c, d, function (a) {
    return a;
  }) : null != a && (N(a) && (a = da(a, e + (!a.key || b && b.key === a.key ? "" : ("" + a.key).replace(O, "$&/") + "/") + d)), c.push(a));
}

function V(a, b, d, c, e) {
  var g = "";
  null != d && (g = ("" + d).replace(O, "$&/") + "/");
  b = Q(b, g, c, e);
  U(a, fa, b);
  R(b);
}

function W() {
  var a = I.current;
  null === a ? B("307") : void 0;
  return a;
}

var X = {
  Children: {
    map: function (a, b, d) {
      if (null == a) return a;
      var c = [];
      V(a, c, null, b, d);
      return c;
    },
    forEach: function (a, b, d) {
      if (null == a) return a;
      b = Q(null, null, b, d);
      U(a, ea, b);
      R(b);
    },
    count: function (a) {
      return U(a, function () {
        return null;
      }, null);
    },
    toArray: function (a) {
      var b = [];
      V(a, b, null, function (a) {
        return a;
      });
      return b;
    },
    only: function (a) {
      N(a) ? void 0 : B("143");
      return a;
    }
  },
  createRef: function () {
    return {
      current: null
    };
  },
  Component: E,
  PureComponent: G,
  createContext: function (a, b) {
    void 0 === b && (b = null);
    a = {
      $$typeof: w,
      _calculateChangedBits: b,
      _currentValue: a,
      _currentValue2: a,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    };
    a.Provider = {
      $$typeof: v,
      _context: a
    };
    return a.Consumer = a;
  },
  forwardRef: function (a) {
    return {
      $$typeof: y,
      render: a
    };
  },
  lazy: function (a) {
    return {
      $$typeof: ba,
      _ctor: a,
      _status: -1,
      _result: null
    };
  },
  memo: function (a, b) {
    return {
      $$typeof: aa,
      type: a,
      compare: void 0 === b ? null : b
    };
  },
  useCallback: function (a, b) {
    return W().useCallback(a, b);
  },
  useContext: function (a, b) {
    return W().useContext(a, b);
  },
  useEffect: function (a, b) {
    return W().useEffect(a, b);
  },
  useImperativeHandle: function (a, b, d) {
    return W().useImperativeHandle(a, b, d);
  },
  useDebugValue: function () {},
  useLayoutEffect: function (a, b) {
    return W().useLayoutEffect(a, b);
  },
  useMemo: function (a, b) {
    return W().useMemo(a, b);
  },
  useReducer: function (a, b, d) {
    return W().useReducer(a, b, d);
  },
  useRef: function (a) {
    return W().useRef(a);
  },
  useState: function (a) {
    return W().useState(a);
  },
  Fragment: r,
  StrictMode: t,
  Suspense: z,
  createElement: M,
  cloneElement: function (a, b, d) {
    null === a || void 0 === a ? B("267", a) : void 0;
    var c = void 0,
        e = k({}, a.props),
        g = a.key,
        h = a.ref,
        f = a._owner;

    if (null != b) {
      void 0 !== b.ref && (h = b.ref, f = J.current);
      void 0 !== b.key && (g = "" + b.key);
      var l = void 0;
      a.type && a.type.defaultProps && (l = a.type.defaultProps);

      for (c in b) K.call(b, c) && !L.hasOwnProperty(c) && (e[c] = void 0 === b[c] && void 0 !== l ? l[c] : b[c]);
    }

    c = arguments.length - 2;
    if (1 === c) e.children = d;else if (1 < c) {
      l = Array(c);

      for (var m = 0; m < c; m++) l[m] = arguments[m + 2];

      e.children = l;
    }
    return {
      $$typeof: p,
      type: a.type,
      key: g,
      ref: h,
      props: e,
      _owner: f
    };
  },
  createFactory: function (a) {
    var b = M.bind(null, a);
    b.type = a;
    return b;
  },
  isValidElement: N,
  version: "16.8.4",
  unstable_ConcurrentMode: x,
  unstable_Profiler: u,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    ReactCurrentDispatcher: I,
    ReactCurrentOwner: J,
    assign: k
  }
},
    Y = {
  default: X
},
    Z = Y && X || Y;
module.exports = Z.default || Z;
},{"object-assign":"J4Nk"}],"1n8/":[function(require,module,exports) {
'use strict';

if ("production" === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}
},{"./cjs/react.production.min.js":"awqi"}],"89El":[function(require,module,exports) {
'use strict';

/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
var REACT_STATICS = {
    childContextTypes: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    getDerivedStateFromProps: true,
    mixins: true,
    propTypes: true,
    type: true
};

var KNOWN_STATICS = {
    name: true,
    length: true,
    prototype: true,
    caller: true,
    callee: true,
    arguments: true,
    arity: true
};

var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = getPrototypeOf && getPrototypeOf(Object);

function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
    if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components

        if (objectPrototype) {
            var inheritedComponent = getPrototypeOf(sourceComponent);
            if (inheritedComponent && inheritedComponent !== objectPrototype) {
                hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
            }
        }

        var keys = getOwnPropertyNames(sourceComponent);

        if (getOwnPropertySymbols) {
            keys = keys.concat(getOwnPropertySymbols(sourceComponent));
        }

        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            if (!REACT_STATICS[key] && !KNOWN_STATICS[key] && (!blacklist || !blacklist[key])) {
                var descriptor = getOwnPropertyDescriptor(sourceComponent, key);
                try { // Avoid failures from read-only properties
                    defineProperty(targetComponent, key, descriptor);
                } catch (e) {}
            }
        }

        return targetComponent;
    }

    return targetComponent;
}

module.exports = hoistNonReactStatics;

},{}],"2gTp":[function(require,module,exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';
/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function (condition, format, a, b, c, d, e, f) {
  if ("production" !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;

    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame

    throw error;
  }
};

module.exports = invariant;
},{}],"ln8d":[function(require,module,exports) {
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

// Function.prototype.bind implementation from Mozilla Developer Network:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Polyfill

"use strict";

var bind = Function.prototype.bind || function (oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // native functions don't have a prototype
      fNOP.prototype = this.prototype;
    }
    fBound.prototype = new fNOP();

    return fBound;
};

// Purposely using the same implementation as the Intl.js `Intl` polyfill.
// Copyright 2013 Andy Earnshaw, MIT License

var hop = Object.prototype.hasOwnProperty;

var realDefineProp = (function () {
    try { return !!Object.defineProperty({}, 'a', {}); }
    catch (e) { return false; }
})();

var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

var defineProperty = realDefineProp ? Object.defineProperty :
        function (obj, name, desc) {

    if ('get' in desc && obj.__defineGetter__) {
        obj.__defineGetter__(name, desc.get);
    } else if (!hop.call(obj, name) || 'value' in desc) {
        obj[name] = desc.value;
    }
};

var objCreate = Object.create || function (proto, props) {
    var obj, k;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (k in props) {
        if (hop.call(props, k)) {
            defineProperty(obj, k, props[k]);
        }
    }

    return obj;
};

exports.bind = bind, exports.defineProperty = defineProperty, exports.objCreate = objCreate;


},{}],"utwJ":[function(require,module,exports) {
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jshint esnext: true */

"use strict";
var src$es5$$ = require("./es5");
exports["default"] = createFormatCache;

// -----------------------------------------------------------------------------

function createFormatCache(FormatConstructor) {
    var cache = src$es5$$.objCreate(null);

    return function () {
        var args    = Array.prototype.slice.call(arguments);
        var cacheId = getCacheId(args);
        var format  = cacheId && cache[cacheId];

        if (!format) {
            format = new (src$es5$$.bind.apply(FormatConstructor, [null].concat(args)))();

            if (cacheId) {
                cache[cacheId] = format;
            }
        }

        return format;
    };
}

// -- Utilities ----------------------------------------------------------------

function getCacheId(inputs) {
    // When JSON is not available in the runtime, we will not create a cache id.
    if (typeof JSON === 'undefined') { return; }

    var cacheId = [];

    var i, len, input;

    for (i = 0, len = inputs.length; i < len; i += 1) {
        input = inputs[i];

        if (input && typeof input === 'object') {
            cacheId.push(orderedProps(input));
        } else {
            cacheId.push(input);
        }
    }

    return JSON.stringify(cacheId);
}

function orderedProps(obj) {
    var props = [],
        keys  = [];

    var key, i, len, prop;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }

    var orderedKeys = keys.sort();

    for (i = 0, len = orderedKeys.length; i < len; i += 1) {
        key  = orderedKeys[i];
        prop = {};

        prop[key] = obj[key];
        props[i]  = prop;
    }

    return props;
}


},{"./es5":"ln8d"}],"fEWX":[function(require,module,exports) {
'use strict';

exports = module.exports = require('./lib/memoizer')['default'];
exports['default'] = exports;

},{"./lib/memoizer":"utwJ"}],"R31r":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addLocaleData = addLocaleData;
exports.injectIntl = injectIntl;
exports.defineMessages = defineMessages;
exports.FormattedHTMLMessage = exports.FormattedMessage = exports.FormattedPlural = exports.FormattedNumber = exports.FormattedRelative = exports.FormattedTime = exports.FormattedDate = exports.IntlProvider = exports.intlShape = void 0;

var _index = _interopRequireDefault(require("../locale-data/index.js"));

var _intlMessageformat = _interopRequireDefault(require("intl-messageformat"));

var _intlRelativeformat = _interopRequireDefault(require("intl-relativeformat"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _hoistNonReactStatics = _interopRequireDefault(require("hoist-non-react-statics"));

var _invariant = _interopRequireDefault(require("invariant"));

var _intlFormatCache = _interopRequireDefault(require("intl-format-cache"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Copyright 2019, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
// GENERATED FILE
var defaultLocaleData = {
  "locale": "en",
  "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    var s = String(n).split("."),
        v0 = !s[1],
        t0 = Number(s[0]) == n,
        n10 = t0 && s[0].slice(-1),
        n100 = t0 && s[0].slice(-2);
    if (ord) return n10 == 1 && n100 != 11 ? "one" : n10 == 2 && n100 != 12 ? "two" : n10 == 3 && n100 != 13 ? "few" : "other";
    return n == 1 && v0 ? "one" : "other";
  },
  "fields": {
    "year": {
      "displayName": "year",
      "relative": {
        "0": "this year",
        "1": "next year",
        "-1": "last year"
      },
      "relativeTime": {
        "future": {
          "one": "in {0} year",
          "other": "in {0} years"
        },
        "past": {
          "one": "{0} year ago",
          "other": "{0} years ago"
        }
      }
    },
    "year-short": {
      "displayName": "yr.",
      "relative": {
        "0": "this yr.",
        "1": "next yr.",
        "-1": "last yr."
      },
      "relativeTime": {
        "future": {
          "one": "in {0} yr.",
          "other": "in {0} yr."
        },
        "past": {
          "one": "{0} yr. ago",
          "other": "{0} yr. ago"
        }
      }
    },
    "month": {
      "displayName": "month",
      "relative": {
        "0": "this month",
        "1": "next month",
        "-1": "last month"
      },
      "relativeTime": {
        "future": {
          "one": "in {0} month",
          "other": "in {0} months"
        },
        "past": {
          "one": "{0} month ago",
          "other": "{0} months ago"
        }
      }
    },
    "month-short": {
      "displayName": "mo.",
      "relative": {
        "0": "this mo.",
        "1": "next mo.",
        "-1": "last mo."
      },
      "relativeTime": {
        "future": {
          "one": "in {0} mo.",
          "other": "in {0} mo."
        },
        "past": {
          "one": "{0} mo. ago",
          "other": "{0} mo. ago"
        }
      }
    },
    "day": {
      "displayName": "day",
      "relative": {
        "0": "today",
        "1": "tomorrow",
        "-1": "yesterday"
      },
      "relativeTime": {
        "future": {
          "one": "in {0} day",
          "other": "in {0} days"
        },
        "past": {
          "one": "{0} day ago",
          "other": "{0} days ago"
        }
      }
    },
    "day-short": {
      "displayName": "day",
      "relative": {
        "0": "today",
        "1": "tomorrow",
        "-1": "yesterday"
      },
      "relativeTime": {
        "future": {
          "one": "in {0} day",
          "other": "in {0} days"
        },
        "past": {
          "one": "{0} day ago",
          "other": "{0} days ago"
        }
      }
    },
    "hour": {
      "displayName": "hour",
      "relative": {
        "0": "this hour"
      },
      "relativeTime": {
        "future": {
          "one": "in {0} hour",
          "other": "in {0} hours"
        },
        "past": {
          "one": "{0} hour ago",
          "other": "{0} hours ago"
        }
      }
    },
    "hour-short": {
      "displayName": "hr.",
      "relative": {
        "0": "this hour"
      },
      "relativeTime": {
        "future": {
          "one": "in {0} hr.",
          "other": "in {0} hr."
        },
        "past": {
          "one": "{0} hr. ago",
          "other": "{0} hr. ago"
        }
      }
    },
    "minute": {
      "displayName": "minute",
      "relative": {
        "0": "this minute"
      },
      "relativeTime": {
        "future": {
          "one": "in {0} minute",
          "other": "in {0} minutes"
        },
        "past": {
          "one": "{0} minute ago",
          "other": "{0} minutes ago"
        }
      }
    },
    "minute-short": {
      "displayName": "min.",
      "relative": {
        "0": "this minute"
      },
      "relativeTime": {
        "future": {
          "one": "in {0} min.",
          "other": "in {0} min."
        },
        "past": {
          "one": "{0} min. ago",
          "other": "{0} min. ago"
        }
      }
    },
    "second": {
      "displayName": "second",
      "relative": {
        "0": "now"
      },
      "relativeTime": {
        "future": {
          "one": "in {0} second",
          "other": "in {0} seconds"
        },
        "past": {
          "one": "{0} second ago",
          "other": "{0} seconds ago"
        }
      }
    },
    "second-short": {
      "displayName": "sec.",
      "relative": {
        "0": "now"
      },
      "relativeTime": {
        "future": {
          "one": "in {0} sec.",
          "other": "in {0} sec."
        },
        "past": {
          "one": "{0} sec. ago",
          "other": "{0} sec. ago"
        }
      }
    }
  }
};
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

function addLocaleData() {
  var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var locales = Array.isArray(data) ? data : [data];
  locales.forEach(function (localeData) {
    if (localeData && localeData.locale) {
      _intlMessageformat.default.__addLocaleData(localeData);

      _intlRelativeformat.default.__addLocaleData(localeData);
    }
  });
}

function hasLocaleData(locale) {
  var localeParts = (locale || '').split('-');

  while (localeParts.length > 0) {
    if (hasIMFAndIRFLocaleData(localeParts.join('-'))) {
      return true;
    }

    localeParts.pop();
  }

  return false;
}

function hasIMFAndIRFLocaleData(locale) {
  var normalizedLocale = locale && locale.toLowerCase();
  return !!(_intlMessageformat.default.__localeData__[normalizedLocale] && _intlRelativeformat.default.__localeData__[normalizedLocale]);
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */


var bool = _propTypes.default.bool;
var number = _propTypes.default.number;
var string = _propTypes.default.string;
var func = _propTypes.default.func;
var object = _propTypes.default.object;
var oneOf = _propTypes.default.oneOf;
var shape = _propTypes.default.shape;
var any = _propTypes.default.any;
var oneOfType = _propTypes.default.oneOfType;
var localeMatcher = oneOf(['best fit', 'lookup']);
var narrowShortLong = oneOf(['narrow', 'short', 'long']);
var numeric2digit = oneOf(['numeric', '2-digit']);
var funcReq = func.isRequired;
var intlConfigPropTypes = {
  locale: string,
  timeZone: string,
  formats: object,
  messages: object,
  textComponent: any,
  defaultLocale: string,
  defaultFormats: object,
  onError: func
};
var intlFormatPropTypes = {
  formatDate: funcReq,
  formatTime: funcReq,
  formatRelative: funcReq,
  formatNumber: funcReq,
  formatPlural: funcReq,
  formatMessage: funcReq,
  formatHTMLMessage: funcReq
};
var intlShape = shape(_extends({}, intlConfigPropTypes, intlFormatPropTypes, {
  formatters: object,
  now: funcReq
}));
exports.intlShape = intlShape;
var messageDescriptorPropTypes = {
  id: string.isRequired,
  description: oneOfType([string, object]),
  defaultMessage: string
};
var dateTimeFormatPropTypes = {
  localeMatcher: localeMatcher,
  formatMatcher: oneOf(['basic', 'best fit']),
  timeZone: string,
  hour12: bool,
  weekday: narrowShortLong,
  era: narrowShortLong,
  year: numeric2digit,
  month: oneOf(['numeric', '2-digit', 'narrow', 'short', 'long']),
  day: numeric2digit,
  hour: numeric2digit,
  minute: numeric2digit,
  second: numeric2digit,
  timeZoneName: oneOf(['short', 'long'])
};
var numberFormatPropTypes = {
  localeMatcher: localeMatcher,
  style: oneOf(['decimal', 'currency', 'percent']),
  currency: string,
  currencyDisplay: oneOf(['symbol', 'code', 'name']),
  useGrouping: bool,
  minimumIntegerDigits: number,
  minimumFractionDigits: number,
  maximumFractionDigits: number,
  minimumSignificantDigits: number,
  maximumSignificantDigits: number
};
var relativeFormatPropTypes = {
  style: oneOf(['best fit', 'numeric']),
  units: oneOf(['second', 'minute', 'hour', 'day', 'month', 'year', 'second-short', 'minute-short', 'hour-short', 'day-short', 'month-short', 'year-short'])
};
var pluralFormatPropTypes = {
  style: oneOf(['cardinal', 'ordinal'])
};
/*
HTML escaping and shallow-equals implementations are the same as React's
(on purpose.) Therefore, it has the following Copyright and Licensing:

Copyright 2013-2014, Facebook, Inc.
All rights reserved.

This source code is licensed under the BSD-style license found in the LICENSE
file in the root directory of React's source tree.
*/

var intlConfigPropNames = Object.keys(intlConfigPropTypes);
var ESCAPED_CHARS = {
  '&': '&amp;',
  '>': '&gt;',
  '<': '&lt;',
  '"': '&quot;',
  "'": '&#x27;'
};
var UNSAFE_CHARS_REGEX = /[&><"']/g;

function escape(str) {
  return ('' + str).replace(UNSAFE_CHARS_REGEX, function (match) {
    return ESCAPED_CHARS[match];
  });
}

function filterProps(props, whitelist) {
  var defaults$$1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return whitelist.reduce(function (filtered, name) {
    if (props.hasOwnProperty(name)) {
      filtered[name] = props[name];
    } else if (defaults$$1.hasOwnProperty(name)) {
      filtered[name] = defaults$$1[name];
    }

    return filtered;
  }, {});
}

function invariantIntlContext() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      intl = _ref.intl;

  (0, _invariant.default)(intl, '[React Intl] Could not find required `intl` object. ' + '<IntlProvider> needs to exist in the component ancestry.');
}

function shallowEquals(objA, objB) {
  if (objA === objB) {
    return true;
  }

  if ((typeof objA === 'undefined' ? 'undefined' : _typeof(objA)) !== 'object' || objA === null || (typeof objB === 'undefined' ? 'undefined' : _typeof(objB)) !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  } // Test for A's keys different from B.


  var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);

  for (var i = 0; i < keysA.length; i++) {
    if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}

function shouldIntlComponentUpdate(_ref2, nextProps, nextState) {
  var props = _ref2.props,
      state = _ref2.state,
      _ref2$context = _ref2.context,
      context = _ref2$context === undefined ? {} : _ref2$context;
  var nextContext = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _context$intl = context.intl,
      intl = _context$intl === undefined ? {} : _context$intl;
  var _nextContext$intl = nextContext.intl,
      nextIntl = _nextContext$intl === undefined ? {} : _nextContext$intl;
  return !shallowEquals(nextProps, props) || !shallowEquals(nextState, state) || !(nextIntl === intl || shallowEquals(filterProps(nextIntl, intlConfigPropNames), filterProps(intl, intlConfigPropNames)));
}

function createError(message, exception) {
  var eMsg = exception ? '\n' + exception : '';
  return '[React Intl] ' + message + eMsg;
}

function defaultErrorHandler(error) {
  if ("production" !== 'production') {
    console.error(error);
  }
}
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
// Inspired by react-redux's `connect()` HOC factory function implementation:
// https://github.com/rackt/react-redux


function getDisplayName(Component$$1) {
  return Component$$1.displayName || Component$$1.name || 'Component';
}

function injectIntl(WrappedComponent) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$intlPropName = options.intlPropName,
      intlPropName = _options$intlPropName === undefined ? 'intl' : _options$intlPropName,
      _options$withRef = options.withRef,
      withRef = _options$withRef === undefined ? false : _options$withRef;

  var InjectIntl = function (_Component) {
    inherits(InjectIntl, _Component);

    function InjectIntl(props, context) {
      classCallCheck(this, InjectIntl);

      var _this = possibleConstructorReturn(this, (InjectIntl.__proto__ || Object.getPrototypeOf(InjectIntl)).call(this, props, context));

      invariantIntlContext(context);
      return _this;
    }

    createClass(InjectIntl, [{
      key: 'getWrappedInstance',
      value: function getWrappedInstance() {
        (0, _invariant.default)(withRef, '[React Intl] To access the wrapped instance, ' + 'the `{withRef: true}` option must be set when calling: ' + '`injectIntl()`');
        return this._wrappedInstance;
      }
    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;

        return _react.default.createElement(WrappedComponent, _extends({}, this.props, defineProperty({}, intlPropName, this.context.intl), {
          ref: withRef ?
          /* istanbul ignore next */
          function (ref) {
            return _this2._wrappedInstance = ref;
          } : null
        }));
      }
    }]);
    return InjectIntl;
  }(_react.Component);

  InjectIntl.displayName = 'InjectIntl(' + getDisplayName(WrappedComponent) + ')';
  InjectIntl.contextTypes = {
    intl: intlShape
  };
  InjectIntl.WrappedComponent = WrappedComponent;
  return (0, _hoistNonReactStatics.default)(InjectIntl, WrappedComponent);
}
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */


function defineMessages(messageDescriptors) {
  // This simply returns what's passed-in because it's meant to be a hook for
  // babel-plugin-react-intl.
  return messageDescriptors;
}
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
// This is a "hack" until a proper `intl-pluralformat` package is created.


function resolveLocale(locales) {
  // IntlMessageFormat#_resolveLocale() does not depend on `this`.
  return _intlMessageformat.default.prototype._resolveLocale(locales);
}

function findPluralFunction(locale) {
  // IntlMessageFormat#_findPluralFunction() does not depend on `this`.
  return _intlMessageformat.default.prototype._findPluralRuleFunction(locale);
}

var IntlPluralFormat = function IntlPluralFormat(locales) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  classCallCheck(this, IntlPluralFormat);
  var useOrdinal = options.style === 'ordinal';
  var pluralFn = findPluralFunction(resolveLocale(locales));

  this.format = function (value) {
    return pluralFn(value, useOrdinal);
  };
};
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */


var DATE_TIME_FORMAT_OPTIONS = Object.keys(dateTimeFormatPropTypes);
var NUMBER_FORMAT_OPTIONS = Object.keys(numberFormatPropTypes);
var RELATIVE_FORMAT_OPTIONS = Object.keys(relativeFormatPropTypes);
var PLURAL_FORMAT_OPTIONS = Object.keys(pluralFormatPropTypes);
var RELATIVE_FORMAT_THRESHOLDS = {
  second: 60,
  // seconds to minute
  minute: 60,
  // minutes to hour
  hour: 24,
  // hours to day
  day: 30,
  // days to month
  month: 12
};

function updateRelativeFormatThresholds(newThresholds) {
  var thresholds = _intlRelativeformat.default.thresholds;
  thresholds.second = newThresholds.second;
  thresholds.minute = newThresholds.minute;
  thresholds.hour = newThresholds.hour;
  thresholds.day = newThresholds.day;
  thresholds.month = newThresholds.month;
  thresholds['second-short'] = newThresholds['second-short'];
  thresholds['minute-short'] = newThresholds['minute-short'];
  thresholds['hour-short'] = newThresholds['hour-short'];
  thresholds['day-short'] = newThresholds['day-short'];
  thresholds['month-short'] = newThresholds['month-short'];
}

function getNamedFormat(formats, type, name, onError) {
  var format = formats && formats[type] && formats[type][name];

  if (format) {
    return format;
  }

  onError(createError('No ' + type + ' format named: ' + name));
}

function formatDate(config, state, value) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var locale = config.locale,
      formats = config.formats,
      timeZone = config.timeZone;
  var format = options.format;
  var onError = config.onError || defaultErrorHandler;
  var date = new Date(value);

  var defaults$$1 = _extends({}, timeZone && {
    timeZone: timeZone
  }, format && getNamedFormat(formats, 'date', format, onError));

  var filteredOptions = filterProps(options, DATE_TIME_FORMAT_OPTIONS, defaults$$1);

  try {
    return state.getDateTimeFormat(locale, filteredOptions).format(date);
  } catch (e) {
    onError(createError('Error formatting date.', e));
  }

  return String(date);
}

function formatTime(config, state, value) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var locale = config.locale,
      formats = config.formats,
      timeZone = config.timeZone;
  var format = options.format;
  var onError = config.onError || defaultErrorHandler;
  var date = new Date(value);

  var defaults$$1 = _extends({}, timeZone && {
    timeZone: timeZone
  }, format && getNamedFormat(formats, 'time', format, onError));

  var filteredOptions = filterProps(options, DATE_TIME_FORMAT_OPTIONS, defaults$$1);

  if (!filteredOptions.hour && !filteredOptions.minute && !filteredOptions.second) {
    // Add default formatting options if hour, minute, or second isn't defined.
    filteredOptions = _extends({}, filteredOptions, {
      hour: 'numeric',
      minute: 'numeric'
    });
  }

  try {
    return state.getDateTimeFormat(locale, filteredOptions).format(date);
  } catch (e) {
    onError(createError('Error formatting time.', e));
  }

  return String(date);
}

function formatRelative(config, state, value) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var locale = config.locale,
      formats = config.formats;
  var format = options.format;
  var onError = config.onError || defaultErrorHandler;
  var date = new Date(value);
  var now = new Date(options.now);
  var defaults$$1 = format && getNamedFormat(formats, 'relative', format, onError);
  var filteredOptions = filterProps(options, RELATIVE_FORMAT_OPTIONS, defaults$$1); // Capture the current threshold values, then temporarily override them with
  // specific values just for this render.

  var oldThresholds = _extends({}, _intlRelativeformat.default.thresholds);

  updateRelativeFormatThresholds(RELATIVE_FORMAT_THRESHOLDS);

  try {
    return state.getRelativeFormat(locale, filteredOptions).format(date, {
      now: isFinite(now) ? now : state.now()
    });
  } catch (e) {
    onError(createError('Error formatting relative time.', e));
  } finally {
    updateRelativeFormatThresholds(oldThresholds);
  }

  return String(date);
}

function formatNumber(config, state, value) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var locale = config.locale,
      formats = config.formats;
  var format = options.format;
  var onError = config.onError || defaultErrorHandler;
  var defaults$$1 = format && getNamedFormat(formats, 'number', format, onError);
  var filteredOptions = filterProps(options, NUMBER_FORMAT_OPTIONS, defaults$$1);

  try {
    return state.getNumberFormat(locale, filteredOptions).format(value);
  } catch (e) {
    onError(createError('Error formatting number.', e));
  }

  return String(value);
}

function formatPlural(config, state, value) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var locale = config.locale;
  var filteredOptions = filterProps(options, PLURAL_FORMAT_OPTIONS);
  var onError = config.onError || defaultErrorHandler;

  try {
    return state.getPluralFormat(locale, filteredOptions).format(value);
  } catch (e) {
    onError(createError('Error formatting plural.', e));
  }

  return 'other';
}

function formatMessage(config, state) {
  var messageDescriptor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var values = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var locale = config.locale,
      formats = config.formats,
      messages = config.messages,
      defaultLocale = config.defaultLocale,
      defaultFormats = config.defaultFormats;
  var id = messageDescriptor.id,
      defaultMessage = messageDescriptor.defaultMessage; // Produce a better error if the user calls `intl.formatMessage(element)`

  if ("production" !== 'production') {
    (0, _invariant.default)(!(0, _react.isValidElement)(config), '[React Intl] Don\'t pass React elements to ' + 'formatMessage(), pass `.props`.');
  } // `id` is a required field of a Message Descriptor.


  (0, _invariant.default)(id, '[React Intl] An `id` must be provided to format a message.');
  var message = messages && messages[id];
  var hasValues = Object.keys(values).length > 0; // Avoid expensive message formatting for simple messages without values. In
  // development messages will always be formatted in case of missing values.

  if (!hasValues && "production" === 'production') {
    return message || defaultMessage || id;
  }

  var formattedMessage = void 0;
  var onError = config.onError || defaultErrorHandler;

  if (message) {
    try {
      var formatter = state.getMessageFormat(message, locale, formats);
      formattedMessage = formatter.format(values);
    } catch (e) {
      onError(createError('Error formatting message: "' + id + '" for locale: "' + locale + '"' + (defaultMessage ? ', using default message as fallback.' : ''), e));
    }
  } else {
    // This prevents warnings from littering the console in development
    // when no `messages` are passed into the <IntlProvider> for the
    // default locale, and a default message is in the source.
    if (!defaultMessage || locale && locale.toLowerCase() !== defaultLocale.toLowerCase()) {
      onError(createError('Missing message: "' + id + '" for locale: "' + locale + '"' + (defaultMessage ? ', using default message as fallback.' : '')));
    }
  }

  if (!formattedMessage && defaultMessage) {
    try {
      var _formatter = state.getMessageFormat(defaultMessage, defaultLocale, defaultFormats);

      formattedMessage = _formatter.format(values);
    } catch (e) {
      onError(createError('Error formatting the default message for: "' + id + '"', e));
    }
  }

  if (!formattedMessage) {
    onError(createError('Cannot format message: "' + id + '", ' + ('using message ' + (message || defaultMessage ? 'source' : 'id') + ' as fallback.')));
  }

  return formattedMessage || message || defaultMessage || id;
}

function formatHTMLMessage(config, state, messageDescriptor) {
  var rawValues = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {}; // Process all the values before they are used when formatting the ICU
  // Message string. Since the formatted message might be injected via
  // `innerHTML`, all String-based values need to be HTML-escaped.

  var escapedValues = Object.keys(rawValues).reduce(function (escaped, name) {
    var value = rawValues[name];
    escaped[name] = typeof value === 'string' ? escape(value) : value;
    return escaped;
  }, {});
  return formatMessage(config, state, messageDescriptor, escapedValues);
}

var format = Object.freeze({
  formatDate: formatDate,
  formatTime: formatTime,
  formatRelative: formatRelative,
  formatNumber: formatNumber,
  formatPlural: formatPlural,
  formatMessage: formatMessage,
  formatHTMLMessage: formatHTMLMessage
});
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var intlConfigPropNames$1 = Object.keys(intlConfigPropTypes);
var intlFormatPropNames = Object.keys(intlFormatPropTypes); // These are not a static property on the `IntlProvider` class so the intl
// config values can be inherited from an <IntlProvider> ancestor.

var defaultProps = {
  formats: {},
  messages: {},
  timeZone: null,
  textComponent: 'span',
  defaultLocale: 'en',
  defaultFormats: {},
  onError: defaultErrorHandler
};

var IntlProvider = function (_Component) {
  inherits(IntlProvider, _Component);

  function IntlProvider(props) {
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, IntlProvider);

    var _this = possibleConstructorReturn(this, (IntlProvider.__proto__ || Object.getPrototypeOf(IntlProvider)).call(this, props, context));

    (0, _invariant.default)(typeof Intl !== 'undefined', '[React Intl] The `Intl` APIs must be available in the runtime, ' + 'and do not appear to be built-in. An `Intl` polyfill should be loaded.\n' + 'See: http://formatjs.io/guides/runtime-environments/');
    var intlContext = context.intl; // Used to stabilize time when performing an initial rendering so that
    // all relative times use the same reference "now" time.

    var initialNow = void 0;

    if (isFinite(props.initialNow)) {
      initialNow = Number(props.initialNow);
    } else {
      // When an `initialNow` isn't provided via `props`, look to see an
      // <IntlProvider> exists in the ancestry and call its `now()`
      // function to propagate its value for "now".
      initialNow = intlContext ? intlContext.now() : Date.now();
    } // Creating `Intl*` formatters is expensive. If there's a parent
    // `<IntlProvider>`, then its formatters will be used. Otherwise, this
    // memoize the `Intl*` constructors and cache them for the lifecycle of
    // this IntlProvider instance.


    var _ref = intlContext || {},
        _ref$formatters = _ref.formatters,
        formatters = _ref$formatters === undefined ? {
      getDateTimeFormat: (0, _intlFormatCache.default)(Intl.DateTimeFormat),
      getNumberFormat: (0, _intlFormatCache.default)(Intl.NumberFormat),
      getMessageFormat: (0, _intlFormatCache.default)(_intlMessageformat.default),
      getRelativeFormat: (0, _intlFormatCache.default)(_intlRelativeformat.default),
      getPluralFormat: (0, _intlFormatCache.default)(IntlPluralFormat)
    } : _ref$formatters;

    _this.state = _extends({}, formatters, {
      // Wrapper to provide stable "now" time for initial render.
      now: function now() {
        return _this._didDisplay ? Date.now() : initialNow;
      }
    });
    return _this;
  }

  createClass(IntlProvider, [{
    key: 'getConfig',
    value: function getConfig() {
      var intlContext = this.context.intl; // Build a whitelisted config object from `props`, defaults, and
      // `context.intl`, if an <IntlProvider> exists in the ancestry.

      var config = filterProps(this.props, intlConfigPropNames$1, intlContext); // Apply default props. This must be applied last after the props have
      // been resolved and inherited from any <IntlProvider> in the ancestry.
      // This matches how React resolves `defaultProps`.

      for (var propName in defaultProps) {
        if (config[propName] === undefined) {
          config[propName] = defaultProps[propName];
        }
      }

      if (!hasLocaleData(config.locale)) {
        var _config = config,
            locale = _config.locale,
            defaultLocale = _config.defaultLocale,
            defaultFormats = _config.defaultFormats,
            onError = _config.onError;
        onError(createError('Missing locale data for locale: "' + locale + '". ' + ('Using default locale: "' + defaultLocale + '" as fallback.'))); // Since there's no registered locale data for `locale`, this will
        // fallback to the `defaultLocale` to make sure things can render.
        // The `messages` are overridden to the `defaultProps` empty object
        // to maintain referential equality across re-renders. It's assumed
        // each <FormattedMessage> contains a `defaultMessage` prop.

        config = _extends({}, config, {
          locale: defaultLocale,
          formats: defaultFormats,
          messages: defaultProps.messages
        });
      }

      return config;
    }
  }, {
    key: 'getBoundFormatFns',
    value: function getBoundFormatFns(config, state) {
      return intlFormatPropNames.reduce(function (boundFormatFns, name) {
        boundFormatFns[name] = format[name].bind(null, config, state);
        return boundFormatFns;
      }, {});
    }
  }, {
    key: 'getChildContext',
    value: function getChildContext() {
      var config = this.getConfig(); // Bind intl factories and current config to the format functions.

      var boundFormatFns = this.getBoundFormatFns(config, this.state);
      var _state = this.state,
          now = _state.now,
          formatters = objectWithoutProperties(_state, ['now']);
      return {
        intl: _extends({}, config, boundFormatFns, {
          formatters: formatters,
          now: now
        })
      };
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      for (var _len = arguments.length, next = Array(_len), _key = 0; _key < _len; _key++) {
        next[_key] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this].concat(next));
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._didDisplay = true;
    }
  }, {
    key: 'render',
    value: function render() {
      return _react.Children.only(this.props.children);
    }
  }]);
  return IntlProvider;
}(_react.Component);

exports.IntlProvider = IntlProvider;
IntlProvider.displayName = 'IntlProvider';
IntlProvider.contextTypes = {
  intl: intlShape
};
IntlProvider.childContextTypes = {
  intl: intlShape.isRequired
};
"production" !== "production" ? IntlProvider.propTypes = _extends({}, intlConfigPropTypes, {
  children: _propTypes.default.element.isRequired,
  initialNow: _propTypes.default.any
}) : void 0;
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var FormattedDate = function (_Component) {
  inherits(FormattedDate, _Component);

  function FormattedDate(props, context) {
    classCallCheck(this, FormattedDate);

    var _this = possibleConstructorReturn(this, (FormattedDate.__proto__ || Object.getPrototypeOf(FormattedDate)).call(this, props, context));

    invariantIntlContext(context);
    return _this;
  }

  createClass(FormattedDate, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      for (var _len = arguments.length, next = Array(_len), _key = 0; _key < _len; _key++) {
        next[_key] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this].concat(next));
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$intl = this.context.intl,
          formatDate = _context$intl.formatDate,
          Text = _context$intl.textComponent;
      var _props = this.props,
          value = _props.value,
          children = _props.children;
      var formattedDate = formatDate(value, this.props);

      if (typeof children === 'function') {
        return children(formattedDate);
      }

      return _react.default.createElement(Text, null, formattedDate);
    }
  }]);
  return FormattedDate;
}(_react.Component);

exports.FormattedDate = FormattedDate;
FormattedDate.displayName = 'FormattedDate';
FormattedDate.contextTypes = {
  intl: intlShape
};
"production" !== "production" ? FormattedDate.propTypes = _extends({}, dateTimeFormatPropTypes, {
  value: _propTypes.default.any.isRequired,
  format: _propTypes.default.string,
  children: _propTypes.default.func
}) : void 0;
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var FormattedTime = function (_Component) {
  inherits(FormattedTime, _Component);

  function FormattedTime(props, context) {
    classCallCheck(this, FormattedTime);

    var _this = possibleConstructorReturn(this, (FormattedTime.__proto__ || Object.getPrototypeOf(FormattedTime)).call(this, props, context));

    invariantIntlContext(context);
    return _this;
  }

  createClass(FormattedTime, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      for (var _len = arguments.length, next = Array(_len), _key = 0; _key < _len; _key++) {
        next[_key] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this].concat(next));
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$intl = this.context.intl,
          formatTime = _context$intl.formatTime,
          Text = _context$intl.textComponent;
      var _props = this.props,
          value = _props.value,
          children = _props.children;
      var formattedTime = formatTime(value, this.props);

      if (typeof children === 'function') {
        return children(formattedTime);
      }

      return _react.default.createElement(Text, null, formattedTime);
    }
  }]);
  return FormattedTime;
}(_react.Component);

exports.FormattedTime = FormattedTime;
FormattedTime.displayName = 'FormattedTime';
FormattedTime.contextTypes = {
  intl: intlShape
};
"production" !== "production" ? FormattedTime.propTypes = _extends({}, dateTimeFormatPropTypes, {
  value: _propTypes.default.any.isRequired,
  format: _propTypes.default.string,
  children: _propTypes.default.func
}) : void 0;
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var SECOND = 1000;
var MINUTE = 1000 * 60;
var HOUR = 1000 * 60 * 60;
var DAY = 1000 * 60 * 60 * 24; // The maximum timer delay value is a 32-bit signed integer.
// See: https://mdn.io/setTimeout

var MAX_TIMER_DELAY = 2147483647;

function selectUnits(delta) {
  var absDelta = Math.abs(delta);

  if (absDelta < MINUTE) {
    return 'second';
  }

  if (absDelta < HOUR) {
    return 'minute';
  }

  if (absDelta < DAY) {
    return 'hour';
  } // The maximum scheduled delay will be measured in days since the maximum
  // timer delay is less than the number of milliseconds in 25 days.


  return 'day';
}

function getUnitDelay(units) {
  switch (units) {
    case 'second':
      return SECOND;

    case 'minute':
      return MINUTE;

    case 'hour':
      return HOUR;

    case 'day':
      return DAY;

    default:
      return MAX_TIMER_DELAY;
  }
}

function isSameDate(a, b) {
  if (a === b) {
    return true;
  }

  var aTime = new Date(a).getTime();
  var bTime = new Date(b).getTime();
  return isFinite(aTime) && isFinite(bTime) && aTime === bTime;
}

var FormattedRelative = function (_Component) {
  inherits(FormattedRelative, _Component);

  function FormattedRelative(props, context) {
    classCallCheck(this, FormattedRelative);

    var _this = possibleConstructorReturn(this, (FormattedRelative.__proto__ || Object.getPrototypeOf(FormattedRelative)).call(this, props, context));

    invariantIntlContext(context);
    var now = isFinite(props.initialNow) ? Number(props.initialNow) : context.intl.now(); // `now` is stored as state so that `render()` remains a function of
    // props + state, instead of accessing `Date.now()` inside `render()`.

    _this.state = {
      now: now
    };
    return _this;
  }

  createClass(FormattedRelative, [{
    key: 'scheduleNextUpdate',
    value: function scheduleNextUpdate(props, state) {
      var _this2 = this; // Cancel and pending update because we're scheduling a new update.


      clearTimeout(this._timer);
      var value = props.value,
          units = props.units,
          updateInterval = props.updateInterval;
      var time = new Date(value).getTime(); // If the `updateInterval` is falsy, including `0` or we don't have a
      // valid date, then auto updates have been turned off, so we bail and
      // skip scheduling an update.

      if (!updateInterval || !isFinite(time)) {
        return;
      }

      var delta = time - state.now;
      var unitDelay = getUnitDelay(units || selectUnits(delta));
      var unitRemainder = Math.abs(delta % unitDelay); // We want the largest possible timer delay which will still display
      // accurate information while reducing unnecessary re-renders. The delay
      // should be until the next "interesting" moment, like a tick from
      // "1 minute ago" to "2 minutes ago" when the delta is 120,000ms.

      var delay = delta < 0 ? Math.max(updateInterval, unitDelay - unitRemainder) : Math.max(updateInterval, unitRemainder);
      this._timer = setTimeout(function () {
        _this2.setState({
          now: _this2.context.intl.now()
        });
      }, delay);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.scheduleNextUpdate(this.props, this.state);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(_ref) {
      var nextValue = _ref.value; // When the `props.value` date changes, `state.now` needs to be updated,
      // and the next update can be rescheduled.

      if (!isSameDate(nextValue, this.props.value)) {
        this.setState({
          now: this.context.intl.now()
        });
      }
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      for (var _len = arguments.length, next = Array(_len), _key = 0; _key < _len; _key++) {
        next[_key] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this].concat(next));
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps, nextState) {
      this.scheduleNextUpdate(nextProps, nextState);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      clearTimeout(this._timer);
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$intl = this.context.intl,
          formatRelative = _context$intl.formatRelative,
          Text = _context$intl.textComponent;
      var _props = this.props,
          value = _props.value,
          children = _props.children;
      var formattedRelative = formatRelative(value, _extends({}, this.props, this.state));

      if (typeof children === 'function') {
        return children(formattedRelative);
      }

      return _react.default.createElement(Text, null, formattedRelative);
    }
  }]);
  return FormattedRelative;
}(_react.Component);

exports.FormattedRelative = FormattedRelative;
FormattedRelative.displayName = 'FormattedRelative';
FormattedRelative.contextTypes = {
  intl: intlShape
};
FormattedRelative.defaultProps = {
  updateInterval: 1000 * 10
};
"production" !== "production" ? FormattedRelative.propTypes = _extends({}, relativeFormatPropTypes, {
  value: _propTypes.default.any.isRequired,
  format: _propTypes.default.string,
  updateInterval: _propTypes.default.number,
  initialNow: _propTypes.default.any,
  children: _propTypes.default.func
}) : void 0;
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var FormattedNumber = function (_Component) {
  inherits(FormattedNumber, _Component);

  function FormattedNumber(props, context) {
    classCallCheck(this, FormattedNumber);

    var _this = possibleConstructorReturn(this, (FormattedNumber.__proto__ || Object.getPrototypeOf(FormattedNumber)).call(this, props, context));

    invariantIntlContext(context);
    return _this;
  }

  createClass(FormattedNumber, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      for (var _len = arguments.length, next = Array(_len), _key = 0; _key < _len; _key++) {
        next[_key] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this].concat(next));
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$intl = this.context.intl,
          formatNumber = _context$intl.formatNumber,
          Text = _context$intl.textComponent;
      var _props = this.props,
          value = _props.value,
          children = _props.children;
      var formattedNumber = formatNumber(value, this.props);

      if (typeof children === 'function') {
        return children(formattedNumber);
      }

      return _react.default.createElement(Text, null, formattedNumber);
    }
  }]);
  return FormattedNumber;
}(_react.Component);

exports.FormattedNumber = FormattedNumber;
FormattedNumber.displayName = 'FormattedNumber';
FormattedNumber.contextTypes = {
  intl: intlShape
};
"production" !== "production" ? FormattedNumber.propTypes = _extends({}, numberFormatPropTypes, {
  value: _propTypes.default.any.isRequired,
  format: _propTypes.default.string,
  children: _propTypes.default.func
}) : void 0;
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var FormattedPlural = function (_Component) {
  inherits(FormattedPlural, _Component);

  function FormattedPlural(props, context) {
    classCallCheck(this, FormattedPlural);

    var _this = possibleConstructorReturn(this, (FormattedPlural.__proto__ || Object.getPrototypeOf(FormattedPlural)).call(this, props, context));

    invariantIntlContext(context);
    return _this;
  }

  createClass(FormattedPlural, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      for (var _len = arguments.length, next = Array(_len), _key = 0; _key < _len; _key++) {
        next[_key] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this].concat(next));
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$intl = this.context.intl,
          formatPlural = _context$intl.formatPlural,
          Text = _context$intl.textComponent;
      var _props = this.props,
          value = _props.value,
          other = _props.other,
          children = _props.children;
      var pluralCategory = formatPlural(value, this.props);
      var formattedPlural = this.props[pluralCategory] || other;

      if (typeof children === 'function') {
        return children(formattedPlural);
      }

      return _react.default.createElement(Text, null, formattedPlural);
    }
  }]);
  return FormattedPlural;
}(_react.Component);

exports.FormattedPlural = FormattedPlural;
FormattedPlural.displayName = 'FormattedPlural';
FormattedPlural.contextTypes = {
  intl: intlShape
};
FormattedPlural.defaultProps = {
  style: 'cardinal'
};
"production" !== "production" ? FormattedPlural.propTypes = _extends({}, pluralFormatPropTypes, {
  value: _propTypes.default.any.isRequired,
  other: _propTypes.default.node.isRequired,
  zero: _propTypes.default.node,
  one: _propTypes.default.node,
  two: _propTypes.default.node,
  few: _propTypes.default.node,
  many: _propTypes.default.node,
  children: _propTypes.default.func
}) : void 0;
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var defaultFormatMessage = function defaultFormatMessage(descriptor, values) {
  if ("production" !== 'production') {
    console.error('[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry. Using default message as fallback.');
  }

  return formatMessage({}, {
    getMessageFormat: (0, _intlFormatCache.default)(_intlMessageformat.default)
  }, descriptor, values);
};

var FormattedMessage = function (_Component) {
  inherits(FormattedMessage, _Component);

  function FormattedMessage(props, context) {
    classCallCheck(this, FormattedMessage);

    var _this = possibleConstructorReturn(this, (FormattedMessage.__proto__ || Object.getPrototypeOf(FormattedMessage)).call(this, props, context));

    if (!props.defaultMessage) {
      invariantIntlContext(context);
    }

    return _this;
  }

  createClass(FormattedMessage, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      var values = this.props.values;
      var nextValues = nextProps.values;

      if (!shallowEquals(nextValues, values)) {
        return true;
      } // Since `values` has already been checked, we know they're not
      // different, so the current `values` are carried over so the shallow
      // equals comparison on the other props isn't affected by the `values`.


      var nextPropsToCheck = _extends({}, nextProps, {
        values: values
      });

      for (var _len = arguments.length, next = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        next[_key - 1] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this, nextPropsToCheck].concat(next));
    }
  }, {
    key: 'render',
    value: function render() {
      var _ref = this.context.intl || {},
          _ref$formatMessage = _ref.formatMessage,
          formatMessage$$1 = _ref$formatMessage === undefined ? defaultFormatMessage : _ref$formatMessage,
          _ref$textComponent = _ref.textComponent,
          Text = _ref$textComponent === undefined ? 'span' : _ref$textComponent;

      var _props = this.props,
          id = _props.id,
          description = _props.description,
          defaultMessage = _props.defaultMessage,
          values = _props.values,
          _props$tagName = _props.tagName,
          Component$$1 = _props$tagName === undefined ? Text : _props$tagName,
          children = _props.children;
      var tokenDelimiter = void 0;
      var tokenizedValues = void 0;
      var elements = void 0;
      var hasValues = values && Object.keys(values).length > 0;

      if (hasValues) {
        // Creates a token with a random UID that should not be guessable or
        // conflict with other parts of the `message` string.
        var uid = Math.floor(Math.random() * 0x10000000000).toString(16);

        var generateToken = function () {
          var counter = 0;
          return function () {
            return 'ELEMENT-' + uid + '-' + (counter += 1);
          };
        }(); // Splitting with a delimiter to support IE8. When using a regex
        // with a capture group IE8 does not include the capture group in
        // the resulting array.


        tokenDelimiter = '@__' + uid + '__@';
        tokenizedValues = {};
        elements = {}; // Iterates over the `props` to keep track of any React Element
        // values so they can be represented by the `token` as a placeholder
        // when the `message` is formatted. This allows the formatted
        // message to then be broken-up into parts with references to the
        // React Elements inserted back in.

        Object.keys(values).forEach(function (name) {
          var value = values[name];

          if ((0, _react.isValidElement)(value)) {
            var token = generateToken();
            tokenizedValues[name] = tokenDelimiter + token + tokenDelimiter;
            elements[token] = value;
          } else {
            tokenizedValues[name] = value;
          }
        });
      }

      var descriptor = {
        id: id,
        description: description,
        defaultMessage: defaultMessage
      };
      var formattedMessage = formatMessage$$1(descriptor, tokenizedValues || values);
      var nodes = void 0;
      var hasElements = elements && Object.keys(elements).length > 0;

      if (hasElements) {
        // Split the message into parts so the React Element values captured
        // above can be inserted back into the rendered message. This
        // approach allows messages to render with React Elements while
        // keeping React's virtual diffing working properly.
        nodes = formattedMessage.split(tokenDelimiter).filter(function (part) {
          return !!part;
        }).map(function (part) {
          return elements[part] || part;
        });
      } else {
        nodes = [formattedMessage];
      }

      if (typeof children === 'function') {
        return children.apply(undefined, toConsumableArray(nodes));
      } // Needs to use `createElement()` instead of JSX, otherwise React will
      // warn about a missing `key` prop with rich-text message formatting.


      return _react.createElement.apply(undefined, [Component$$1, null].concat(toConsumableArray(nodes)));
    }
  }]);
  return FormattedMessage;
}(_react.Component);

exports.FormattedMessage = FormattedMessage;
FormattedMessage.displayName = 'FormattedMessage';
FormattedMessage.contextTypes = {
  intl: intlShape
};
FormattedMessage.defaultProps = {
  values: {}
};
"production" !== "production" ? FormattedMessage.propTypes = _extends({}, messageDescriptorPropTypes, {
  values: _propTypes.default.object,
  tagName: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.element]),
  children: _propTypes.default.func
}) : void 0;
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var FormattedHTMLMessage = function (_Component) {
  inherits(FormattedHTMLMessage, _Component);

  function FormattedHTMLMessage(props, context) {
    classCallCheck(this, FormattedHTMLMessage);

    var _this = possibleConstructorReturn(this, (FormattedHTMLMessage.__proto__ || Object.getPrototypeOf(FormattedHTMLMessage)).call(this, props, context));

    invariantIntlContext(context);
    return _this;
  }

  createClass(FormattedHTMLMessage, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      var values = this.props.values;
      var nextValues = nextProps.values;

      if (!shallowEquals(nextValues, values)) {
        return true;
      } // Since `values` has already been checked, we know they're not
      // different, so the current `values` are carried over so the shallow
      // equals comparison on the other props isn't affected by the `values`.


      var nextPropsToCheck = _extends({}, nextProps, {
        values: values
      });

      for (var _len = arguments.length, next = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        next[_key - 1] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this, nextPropsToCheck].concat(next));
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$intl = this.context.intl,
          formatHTMLMessage = _context$intl.formatHTMLMessage,
          Text = _context$intl.textComponent;
      var _props = this.props,
          id = _props.id,
          description = _props.description,
          defaultMessage = _props.defaultMessage,
          rawValues = _props.values,
          _props$tagName = _props.tagName,
          Component$$1 = _props$tagName === undefined ? Text : _props$tagName,
          children = _props.children;
      var descriptor = {
        id: id,
        description: description,
        defaultMessage: defaultMessage
      };
      var formattedHTMLMessage = formatHTMLMessage(descriptor, rawValues);

      if (typeof children === 'function') {
        return children(formattedHTMLMessage);
      } // Since the message presumably has HTML in it, we need to set
      // `innerHTML` in order for it to be rendered and not escaped by React.
      // To be safe, all string prop values were escaped when formatting the
      // message. It is assumed that the message is not UGC, and came from the
      // developer making it more like a template.
      //
      // Note: There's a perf impact of using this component since there's no
      // way for React to do its virtual DOM diffing.


      var html = {
        __html: formattedHTMLMessage
      };
      return _react.default.createElement(Component$$1, {
        dangerouslySetInnerHTML: html
      });
    }
  }]);
  return FormattedHTMLMessage;
}(_react.Component);

exports.FormattedHTMLMessage = FormattedHTMLMessage;
FormattedHTMLMessage.displayName = 'FormattedHTMLMessage';
FormattedHTMLMessage.contextTypes = {
  intl: intlShape
};
FormattedHTMLMessage.defaultProps = {
  values: {}
};
"production" !== "production" ? FormattedHTMLMessage.propTypes = _extends({}, messageDescriptorPropTypes, {
  values: _propTypes.default.object,
  tagName: _propTypes.default.string,
  children: _propTypes.default.func
}) : void 0;
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

addLocaleData(defaultLocaleData);
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

addLocaleData(_index.default);
},{"../locale-data/index.js":"70rD","intl-messageformat":"+Eog","intl-relativeformat":"ztuU","prop-types":"5D9O","react":"1n8/","hoist-non-react-statics":"89El","invariant":"2gTp","intl-format-cache":"fEWX"}],"nK9d":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reactIntl = require("react-intl");

var _default = (0, _reactIntl.defineMessages)({
  backdrop: {
    defaultMessage: 'backdrop{index}',
    description: 'Default name for a new backdrop, scratch will automatically adjust the number if necessary',
    id: 'gui.sharedMessages.backdrop'
  },
  costume: {
    defaultMessage: 'costume{index}',
    description: 'Default name for a new costume, scratch will automatically adjust the number if necessary',
    id: 'gui.sharedMessages.costume'
  },
  sprite: {
    defaultMessage: 'Sprite{index}',
    description: 'Default name for a new sprite, scratch will automatically adjust the number if necessary',
    id: 'gui.sharedMessages.sprite'
  },
  pop: {
    defaultMessage: 'pop',
    description: 'Name of the pop sound, the default sound added to a sprite',
    id: 'gui.sharedMessages.pop'
  },
  replaceProjectWarning: {
    id: 'gui.sharedMessages.replaceProjectWarning',
    defaultMessage: 'Replace contents of the current project?',
    description: 'Confirmation that user wants to overwrite the current project contents'
  }
});

exports.default = _default;
},{"react-intl":"R31r"}],"1cLc":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reactIntl = require("react-intl");

var _sharedMessages = _interopRequireDefault(require("./shared-messages"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var messages = (0, _reactIntl.defineMessages)({
  variable: {
    defaultMessage: 'my variable',
    description: 'Name for the default variable',
    id: 'gui.defaultProject.variable'
  }
});
messages = _objectSpread({}, messages, _sharedMessages.default); // use the default message if a translation function is not passed

var defaultTranslator = function defaultTranslator(msgObj) {
  return msgObj.defaultMessage;
};
/**
 * Generate a localized version of the default project
 * @param {function} translateFunction a function to use for translating the default names
 * @return {object} the project data json for the default project
 */


var projectData = function projectData(translateFunction) {
  var translator = translateFunction || defaultTranslator;
  return {
    targets: [{
      isStage: true,
      name: 'Stage',
      variables: {
        '`jEk@4|i[#Fk?(8x)AV.-my variable': [translator(messages.variable), 0]
      },
      lists: {},
      broadcasts: {},
      blocks: {},
      currentCostume: 0,
      costumes: [{
        assetId: 'cd21514d0531fdffb22204e0ec5ed84a',
        name: translator(messages.backdrop, {
          index: 1
        }),
        md5ext: 'cd21514d0531fdffb22204e0ec5ed84a.svg',
        dataFormat: 'svg',
        rotationCenterX: 240,
        rotationCenterY: 180
      }],
      sounds: [],
      volume: 100
    }, {
      isStage: false,
      name: translator(messages.sprite, {
        index: 1
      }),
      variables: {},
      lists: {},
      broadcasts: {},
      blocks: {},
      currentCostume: 0,
      costumes: [{
        assetId: '7ec7c2ce88c6b447fe3c099ed4799708',
        name: 'car',
        bitmapResolution: 1,
        md5ext: '7ec7c2ce88c6b447fe3c099ed4799708.svg',
        dataFormat: 'svg',
        rotationCenterX: 46,
        rotationCenterY: 36
      }],
      sounds: [],
      volume: 100,
      visible: true,
      x: 0,
      y: 0,
      size: 100,
      direction: 90,
      draggable: false,
      rotationStyle: 'all around'
    }],
    meta: {
      semver: '3.0.0',
      vm: '0.1.0',
      agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36' // eslint-disable-line max-len

    }
  };
};

var _default = projectData;
exports.default = _default;
},{"react-intl":"R31r","./shared-messages":"nK9d"}],"Cp1k":[function(require,module,exports) {
module.exports = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIHZpZXdCb3g9Ii0xIC0xIDIgMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogIDwhLS0gRXhwb3J0ZWQgYnkgU2NyYXRjaCAtIGh0dHA6Ly9zY3JhdGNoLm1pdC5lZHUvIC0tPg0KPC9zdmc+";
},{}],"4Ptg":[function(require,module,exports) {
module.exports = "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iOTFweCIgaGVpZ2h0PSI3MnB4IiB2aWV3Qm94PSItMC41IC0wLjUgOTEgNzIiPjxkZWZzLz48Zz48cmVjdCB4PSIxOCIgeT0iMTQuNCIgd2lkdGg9IjY4LjQiIGhlaWdodD0iNDIiIHJ4PSI2LjMiIHJ5PSI2LjMiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0ibm9uZSIgcG9pbnRlci1ldmVudHM9Im5vbmUiLz48aW1hZ2UgeD0iOS4xIiB5PSItMTAuMSIgd2lkdGg9IjcwLjgiIGhlaWdodD0iOTAiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaUlIWnBaWGRDYjNnOUlqQWdNQ0F6TkRJdU1ERWdORE16TGpnNUlqNDhaR1ZtY3o0OGMzUjViR1UrTG1Oc2N5MHhlMlpwYkd3Nkl6WTFOVGMwT0R0OVBDOXpkSGxzWlQ0OEwyUmxabk0rUEhScGRHeGxQbU5oY2p3dmRHbDBiR1UrUEhCaGRHZ2dZMnhoYzNNOUltTnNjeTB4SWlCa1BTSk5NVFU1TGpJNUxEUTVNUzR5TlVneE5EQXVPVEZoTVRRdU1qZ3NNVFF1TWpnc01Dd3dMREF0TVRRdU1qZ3NNVFF1TWpoMk5URXVOelZoTVRRdU1qZ3NNVFF1TWpnc01Dd3dMREFzTVRRdU1qZ3NNVFF1TWpob01UZ3VNMkV6TGpJNUxETXVNamtzTUN3d0xEQXNNeTR6TXkwekxqTmpMUzR3TnkwMkxqQTNMUzR4TmkweE1pNDROUzB1TWpFdE1Ua3VOemN0TGpFeUxUSXdMakkwTFM0eU9TMDBNUzR4T1MwdU1qa3RORGN1TXpoaE16WXVORGtzTXpZdU5Ea3NNQ3d3TERFc0xqVXlMVFl1TURoQk15NHlOeXd6TGpJM0xEQXNNQ3d3TERFMU9TNHlPU3cwT1RFdU1qVmFJaUIwY21GdWMyWnZjbTA5SW5SeVlXNXpiR0YwWlNndE1USTJMall6SUMweU1EUXBJaTgrUEhCaGRHZ2dZMnhoYzNNOUltTnNjeTB4SWlCa1BTSk5NVFU0TGpZM0xETXlOUzR3T1dNd0xUSXVNalV1TURZdE5DNDBPUzR3TmkwMkxqVTFMREF0TkM0eE1TNHlOeTB4TUM0Mk1Td3hMVEU0TGpRMFlUTXVNek1zTXk0ek15d3dMREFzTUMwekxqTXhMVE11TmpOSU1UUXdMamt4WVRFMExqTXlMREUwTGpNeUxEQXNNQ3d3TFRFMExqSTRMREUwTGpJNFZqTTJNaTQxWVRFMExqSXlMREUwTGpJeUxEQXNNQ3d3TERFMExqSXlMREUwTGpJeWFESXdMamc0WXpNdU1URXRMakEzTERJdU9EVXRNaTQyT1N3eUxqSTFMVFF1TXpGRE1UVTRMak00TERNMU9TNHlOU3d4TlRndU5UVXNNelF4TGpBNExERTFPQzQyTnl3ek1qVXVNRGxhSWlCMGNtRnVjMlp2Y20wOUluUnlZVzV6YkdGMFpTZ3RNVEkyTGpZeklDMHlNRFFwSWk4K1BIQmhkR2dnWTJ4aGMzTTlJbU5zY3kweElpQmtQU0pOTkRNeExqSTVMRE0zTWk0ME1XTXRMallzTVM0Mk1pMHVPRFlzTkM0eU5Dd3lMakkxTERRdU16Rm9NakF1T0RoaE1UUXVNaklzTVRRdU1qSXNNQ3d3TERBc01UUXVNakl0TVRRdU1qSldNekV3TGpjMVlURTBMak14TERFMExqTXhMREFzTUN3d0xURTBMakk0TFRFMExqSTRTRFF6T0M0NE9XRXpMak16TERNdU16TXNNQ3d3TERBdE15NHpMRE11TmpOakxqWTVMRGN1T0RNc01Td3hOQzR6TXl3eExERTRMalEwTERBc01pNHdOaTR3Tml3MExqTXVNRFlzTmk0MU5VTTBNell1TnpJc016UXhMakE0TERRek5pNDVMRE0xT1M0eU5TdzBNekV1TWprc016Y3lMalF4V2lJZ2RISmhibk5tYjNKdFBTSjBjbUZ1YzJ4aGRHVW9MVEV5Tmk0Mk15QXRNakEwS1NJdlBqeHdZWFJvSUdOc1lYTnpQU0pqYkhNdE1TSWdaRDBpVFRReE1DNDVNeXcwTnpFdU1EZFdOREkyTGpJNVl6QXRNak11TWpVc01pNHhPUzB6T0M0eE9DdzFMalkzTFRRNUxqVTNZVGM0TGpJMkxEYzRMakkyTERBc01Dd3hMRE11TWpVdE9TNHdPV00xTGpJMUxURXlMalUzTERRdU15MHpNeXcwTGpNdE5Ea3VNRGtzTUMwMUxqQTRMUzR6TlMweE15NHdOUzB4TGpNdE1qSXVNRGN0TWkweE9TNDNNUzAyTGpZdE5EUXVPRFV0TVRVdU5URXROVGd1TXpZdE1UVXRNakl1T0RRdE5ETXVOVFV0TXpRdU1URXRNVEE1TGpjdE16UXVNVEZUTWpBekxESXhOUzR5Tnl3eE9EY3VPVFFzTWpNNExqRXhZeTA0TGpreExERXpMalV4TFRFekxqVXhMRE00TGpZMUxURTFMalV5TERVNExqTTJMUzQ1TkN3NUxURXVNeXd4TnkweExqTXNNakl1TURjc01Dd3hOaTR4TFM0NU5Dd3pOaTQxTWl3MExqTXhMRFE1TGpBNVlUZ3lMakUwTERneUxqRTBMREFzTUN3eExETXVNalVzT1M0d09XTXpMalE0TERFeExqTTVMRFV1TmpZc01qWXVNeklzTlM0Mk5pdzBPUzQxTjNZME5DNDNPR013TERVdU1pMDFMakEzTERFeUxqSXlMVGdzTWpBdU1UaGhNamt1TmpFc01qa3VOakVzTUN3d0xEQXRNUzQ1TkN3NUxqZzJZekFzT0M0Mk55NHpOU3cwTmk0MU5pNDFNeXczTUM0ME5TNHdOaXc0TGpnMkxqRXlMREUxTGpjMkxqRXlMREU0TGpVekxEQXNPQzQxTERVdU1EY3NNVFF1TWpnc01UVXVOelVzTVRZdU9UUmhNVFlzTVRZc01Dd3dMREVzT1M0MU5pdzJMamcwWXpjdU5qRXNNVEV1TWpJc01qRXVOemdzTWpRc09UY3VNalVzTWpSek9Ea3VOak10TVRJdU9DdzVOeTR5TkMweU5HRXhOaTR3Tml3eE5pNHdOaXd3TERBc01TdzVMalUyTFRZdU9EUmpNVEF1TmpndE1pNDJOaXd4TlM0M05pMDRMalEwTERFMUxqYzJMVEUyTGprMExEQXRNaTQzTnk0d05pMDVMalkzTGpFeUxURTRMalV6TGpFM0xUSXpMamc1TGpVekxUWXhMamM0TGpVekxUY3dMalExWVRJNUxqWXlMREk1TGpZeUxEQXNNQ3d3TFRJdE9TNDROa00wTVRZc05EZ3pMakk1TERReE1DNDVNeXcwTnpZdU1qY3NOREV3TGprekxEUTNNUzR3TjFwTk1qQTFMalUyTERJMk1pNDJOV010TXk0NU1pMDJMamM1TERJdU9ERXRNVGdzTVRVdU1EVXRNalV1TURoek1qVXVNekl0Tnk0eU9Td3lPUzR5TkMwdU5TMHlMamd5TERFNExURTFMREkxTGpBNVV6SXdPUzQwT0N3eU5qa3VORFFzTWpBMUxqVTJMREkyTWk0Mk5WcE5NelkxTGpneExEVXpOUzQzT0dFMk15NHhNU3cyTXk0eE1Td3dMREFzTVMweU55NDFNU3cyU0RJMU4yRTJNeTR3T0N3Mk15NHdPQ3d3TERBc01TMHlOeTQxTVMwMkxEWXVOREVzTmk0ME1Td3dMREFzTVMwekxUZ3VOVGhqTWk0ME55MDFMakV6TERZdU55MHhNaTQzTlN3eE1pNHhMVEUzTGpnMExEZ3VPREV0T0M0eU9Dd3hOaTQ0TkMwNExqZ3NNakF1TkRZdE9DNDRhRGMzTGpFM1l6TXVOak1zTUN3eE1TNDJOaTQxTWl3eU1DNDBOaXc0TGpnc05TNDBNU3cxTGpBNUxEa3VOalFzTVRJdU56RXNNVEl1TVN3eE55NDRORUUyTGpRc05pNDBMREFzTUN3eExETTJOUzQ0TVN3MU16VXVOemhhYlRFMkxqY3pMVEV5T0dFekxqTXpMRE11TXpNc01Dd3dMREV0TlM0Mk5pd3lMak01TERVeUxqSXNOVEl1TWl3d0xEQXNNQzB4T0MweE1TNHpPR010TVRRdU5UVXROUzR6TmkwMU5TNDJOaTAyTGpJMUxUWXhMakk0TFRZdU1qVnpMVFEyTGpjMExqZzVMVFl4TGpJNExEWXVNalZoTlRJdU1qVXNOVEl1TWpVc01Dd3dMREF0TVRnc01URXVNemdzTXk0ek15d3pMak16TERBc01Dd3hMVFV1TmpVdE1pNHpPVll6T0RBdU56SmpNQzB5TVM0MUxESXhMVE13TGpVekxESTVMVE15TGpjMWN6RTVMalE1TFRjdU1qY3NOVFV1T1RRdE55NHlOeXcwT0N3MUxqQTFMRFUxTGprMExEY3VNamNzTWprc01URXVNalVzTWprc016SXVOelZhYlRjdU1UZ3RNVFExTGpFMVl5MHpMamt5TERZdU56a3RNVGNzTmk0MU55MHlPUzR5TlMwdU5EbHpMVEU1TFRFNExqTXRNVFV1TURVdE1qVXVNRGtzTVRjdE5pNDFOeXd5T1M0eU5TNDFVek01TXk0Mk5Dd3lOVFV1T0RZc016ZzVMamN5TERJMk1pNDJOVm9pSUhSeVlXNXpabTl5YlQwaWRISmhibk5zWVhSbEtDMHhNall1TmpNZ0xUSXdOQ2tpTHo0OGNHRjBhQ0JqYkdGemN6MGlZMnh6TFRFaUlHUTlJazAwTlRRdU16WXNORGt4TGpJMVNEUXpObUV6TGpJNExETXVNamdzTUN3d0xEQXRNeTR5Tnl3ekxqYzRMRE0xTGpRMExETTFMalEwTERBc01Dd3hMQzQxTXl3MkxqQTRZekFzTmk0eE9TMHVNVGdzTWpjdU1UUXRMak1zTkRjdU16Z3NNQ3cyTGpreUxTNHhOQ3d4TXk0M0xTNHlMREU1TGpjM1lUTXVNamdzTXk0eU9Dd3dMREFzTUN3ekxqTXlMRE11TTJneE9DNHpZVEUwTGpJNExERTBMakk0TERBc01Dd3dMREUwTGpJNExURTBMakk0VmpVd05TNDFNMEV4TkM0eU9Dd3hOQzR5T0N3d0xEQXNNQ3cwTlRRdU16WXNORGt4TGpJMVdpSWdkSEpoYm5ObWIzSnRQU0owY21GdWMyeGhkR1VvTFRFeU5pNDJNeUF0TWpBMEtTSXZQand2YzNablBnbz0iIHRyYW5zZm9ybT0icm90YXRlKDkwLDQ1LDM1LjQpIiBwb2ludGVyLWV2ZW50cz0ibm9uZSIvPjwvZz48L3N2Zz4=";
},{}],"xY5H":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _base64Js = _interopRequireDefault(require("base64-js"));

var _projectData = _interopRequireDefault(require("./project-data"));

var _cd21514d0531fdffb22204e0ec5ed84a = _interopRequireDefault(require("./cd21514d0531fdffb22204e0ec5ed84a.svg"));

var _ec7c2ce88c6b447fe3c099ed = _interopRequireDefault(require("./7ec7c2ce88c6b447fe3c099ed4799708.svg"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var convertBase64ImageToByteArray = function convertBase64ImageToByteArray(image) {
  return _base64Js.default.toByteArray(image.replace(/data:image\/[\w\+]+;base64,/, ''));
};

var defaultProject = function defaultProject(translator) {
  var projectJson = (0, _projectData.default)(translator);
  return [{
    id: 0,
    assetType: 'Project',
    dataFormat: 'JSON',
    data: JSON.stringify(projectJson)
  }, {
    id: 'cd21514d0531fdffb22204e0ec5ed84a',
    assetType: 'ImageVector',
    dataFormat: 'SVG',
    data: convertBase64ImageToByteArray(_cd21514d0531fdffb22204e0ec5ed84a.default)
  }, {
    id: '7ec7c2ce88c6b447fe3c099ed4799708',
    assetType: 'ImageVector',
    dataFormat: 'SVG',
    data: convertBase64ImageToByteArray(_ec7c2ce88c6b447fe3c099ed.default)
  }];
};

var _default = defaultProject;
exports.default = _default;
},{"base64-js":"yh9p","./project-data":"1cLc","./cd21514d0531fdffb22204e0ec5ed84a.svg":"Cp1k","./7ec7c2ce88c6b447fe3c099ed4799708.svg":"4Ptg"}],"huWP":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

exports.__esModule = true;

var logo_png_1 = __importDefault(require("../images/logo.png"));

var cube_l_svg_1 = __importDefault(require("../images/cube_l.svg"));

var cube_m_svg_1 = __importDefault(require("../images/cube_m.svg")); // import './about'


var SCRATCH_TRADEMARKS = ['Cat', 'Cat Flying', 'Gobo', 'Pico', 'Pico Walking', 'Nano', 'Tera', 'Giga', 'Giga Walking'];

var Gui =
/** @class */
function () {
  function Gui() {}

  Object.defineProperty(Gui.prototype, "INFO", {
    get: function get() {
      return {
        name: 'toio-duplicated',
        extensionId: 'toio2',
        collaborator: 'Sony Interactive Entertainment Inc.',
        iconURL: logo_png_1["default"],
        insetIconURL: cube_m_svg_1["default"],
        description: 'つくって、あそんで、ひらめいて。',
        featured: true,
        disabled: false,
        bluetoothRequired: true,
        launchPeripheralConnectionFlow: true,
        useAutoScan: false,
        peripheralImage: cube_l_svg_1["default"],
        smallPeripheralImage: cube_m_svg_1["default"],
        connectingMessage: '接続中',
        helpLink: 'https://toio.io/programming/visual-programming.html'
      };
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(Gui.prototype, "ANALYTICS", {
    get: function get() {
      return {
        debug: false,
        testMode: true
      };
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(Gui.prototype, "DEFAULT_PROJECT", {
    get: function get() {
      return require('./default-project')["default"];
    },
    enumerable: true,
    configurable: true
  });

  Gui.prototype.filter = function (sprites) {
    return sprites.filter(function (sprite) {
      return !SCRATCH_TRADEMARKS.includes(sprite.name);
    });
  };

  return Gui;
}();

module.exports = new Gui();
},{"../images/logo.png":"8SPD","../images/cube_l.svg":"Vsax","../images/cube_m.svg":"cs5v","./default-project":"xY5H"}],"7QCb":[function(require,module,exports) {
"use strict";
/**
 * Copyright (c) Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

exports.__esModule = true;

var formatMessage = require("format-message");

var coreCube_1 = __importDefault(require("./toio/coreCube"));

var blocks_1 = __importDefault(require("./blocks"));

var cube_s_svg_1 = __importDefault(require("./images/cube_s.svg"));

var translations_1 = __importDefault(require("./translations"));

var ToioBlocks =
/** @class */
function () {
  function ToioBlocks(runtime) {
    this.runtime = runtime;
    formatMessage.setup({
      translations: translations_1["default"],
      locale: 'ja'
    });
    this.coreCube = new coreCube_1["default"](this.runtime, ToioBlocks.EXTENSION_NAME);
    this.blocks = new blocks_1["default"](this.coreCube);

    for (var _i = 0, _a = this.blocks.functions; _i < _a.length; _i++) {
      var blockFunction = _a[_i];
      ToioBlocks.prototype[blockFunction.opcode] = blockFunction.func;
    }

    this.runtime.on('PROJECT_RUN_STOP', this.stop.bind(this));
    this.runtime.on('PROJECT_STOP_ALL', this.stopAll.bind(this));
  }

  Object.defineProperty(ToioBlocks, "gui", {
    get: function get() {
      return require('./gui');
    },
    enumerable: true,
    configurable: true
  });

  ToioBlocks.prototype.getInfo = function (locale) {
    formatMessage.setup({
      translations: translations_1["default"],
      locale: locale || 'ja'
    });
    this.blocks.updateTexts();
    return {
      id: ToioBlocks.EXTENSION_NAME,
      blockIconURI: cube_s_svg_1["default"],
      colour: '#f9630e',
      colourSecondary: '#f95064',
      colourTertiary: '#c8630e',
      showStatusButton: true,
      blocks: this.blocks.info,
      menus: this.blocks.menus
    };
  };

  ToioBlocks.prototype.stop = function () {
    this.blocks.stop(false);
  };

  ToioBlocks.prototype.stopAll = function () {
    this.blocks.stop(true);
  };

  ToioBlocks.EXTENSION_NAME = 'toio2';
  return ToioBlocks;
}();

module.exports = ToioBlocks;
},{"format-message":"Ecvv","./toio/coreCube":"EuYy","./blocks":"VRtA","./images/cube_s.svg":"FObV","./translations":"yrxK","./gui":"huWP"}]},{},["7QCb"], null)
//# sourceMappingURL=/index.js.map