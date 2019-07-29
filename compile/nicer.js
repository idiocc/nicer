#!/usr/bin/env node
'use strict';
const stream = require('stream');
const tty = require('tty');
const util = require('util');             
const {PassThrough:h, Transform:k} = stream;
var l = tty;
const {format:m, inspect:r} = util;
/*

 Copyright (c) 2016 Zeit, Inc.
 https://npmjs.org/ms
*/
function t(a) {
  var b = {}, c = typeof a;
  if ("string" == c && 0 < a.length) {
    return u(a);
  }
  if ("number" == c && isFinite(a)) {
    return b.s ? (b = Math.abs(a), a = 864E5 <= b ? w(a, b, 864E5, "day") : 36E5 <= b ? w(a, b, 36E5, "hour") : 6E4 <= b ? w(a, b, 6E4, "minute") : 1000 <= b ? w(a, b, 1000, "second") : a + " ms") : (b = Math.abs(a), a = 864E5 <= b ? Math.round(a / 864E5) + "d" : 36E5 <= b ? Math.round(a / 36E5) + "h" : 6E4 <= b ? Math.round(a / 6E4) + "m" : 1000 <= b ? Math.round(a / 1000) + "s" : a + "ms"), a;
  }
  throw Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(a));
}
function u(a) {
  a = String(a);
  if (!(100 < a.length) && (a = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(a))) {
    var b = parseFloat(a[1]);
    switch((a[2] || "ms").toLowerCase()) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return 315576E5 * b;
      case "weeks":
      case "week":
      case "w":
        return 6048E5 * b;
      case "days":
      case "day":
      case "d":
        return 864E5 * b;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return 36E5 * b;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return 6E4 * b;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return 1000 * b;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return b;
    }
  }
}
function w(a, b, c, d) {
  return Math.round(a / c) + " " + d + (b >= 1.5 * c ? "s" : "");
}
;/*
 bytes
 Copyright(c) 2012-2014 TJ Holowaychuk
 Copyright(c) 2015 Jed Watson
 MIT Licensed
*/
const x = /\B(?=(\d{3})+(?!\d))/g, y = /(?:\.0*|(\.[^0]+)0+)$/, z = {b:1, kb:1024, mb:1048576, gb:1073741824, tb:Math.pow(1024, 4), pb:Math.pow(1024, 5)};
function A(a, b) {
  if (!Number.isFinite(a)) {
    return null;
  }
  const c = Math.abs(a), d = b && b.u || "", f = b && b.w || "", g = b && void 0 !== b.j ? b.j : 2, e = !(!b || !b.m);
  (b = b && b.v || "") && z[b.toLowerCase()] || (b = c >= z.pb ? "PB" : c >= z.tb ? "TB" : c >= z.gb ? "GB" : c >= z.mb ? "MB" : c >= z.kb ? "KB" : "B");
  a = (a / z[b.toLowerCase()]).toFixed(g);
  e || (a = a.replace(y, "$1"));
  d && (a = a.replace(x, d));
  return a + f + b;
}
;/*
 diff package https://github.com/kpdecker/jsdiff
 BSD License
 Copyright (c) 2009-2015, Kevin Decker <kpdecker@gmail.com>
*/
const B = {black:30, red:31, green:32, yellow:33, blue:34, magenta:35, cyan:36, white:37, grey:90}, C = {black:40, red:41, green:42, yellow:43, blue:44, magenta:45, cyan:46, white:47};
function D(a, b) {
  return (b = B[b]) ? `\x1b[${b}m${a}\x1b[0m` : a;
}
;var E = {f:A, ["fy"](a) {
  return D(A(a) || "", "yellow");
}, ["fr"](a) {
  return D(A(a) || "", "red");
}, ["fb"](a) {
  return D(A(a) || "", "blue");
}, ["fg"](a) {
  return D(A(a) || "", "green");
}, ["fc"](a) {
  return D(A(a) || "", "cyan");
}, ["fm"](a) {
  return D(A(a) || "", "magenta");
}};
const F = Object.keys(process.env).filter(a => /^debug_/i.test(a)).reduce((a, b) => {
  const c = b.substring(6).toLowerCase().replace(/_([a-z])/g, (d, f) => f.toUpperCase());
  b = process.env[b];
  /^(yes|on|true|enabled)$/i.test(b) ? b = !0 : /^(no|off|false|disabled)$/i.test(b) ? b = !1 : "null" === b ? b = null : b = Number(b);
  a[c] = b;
  return a;
}, {}), G = Object.assign({}, {o:function(a) {
  const b = Object.assign({}, this.inspectOpts, {colors:this.useColors});
  return r(a, b).replace(/\s*\n\s*/g, " ");
}, O:function(a) {
  const b = Object.assign({}, this.inspectOpts, {colors:this.useColors});
  return r(a, b);
}}, E), H = {init:function(a) {
  a.inspectOpts = Object.assign({}, F);
}, log:function(...a) {
  return process.stderr.write(m(...a) + "\n");
}, formatArgs:function(a) {
  const {namespace:b, useColors:c, color:d, diff:f} = this;
  if (c) {
    const g = "\u001b[3" + (8 > d ? d : "8;5;" + d), e = `  ${g};1m${b} \u001B[0m`;
    a[0] = e + a[0].split("\n").join("\n" + e);
    a.push(g + "m+" + t(f) + "\u001b[0m");
  } else {
    a[0] = (F.hideDate ? "" : (new Date).toISOString() + " ") + b + " " + a[0];
  }
}, save:function(a) {
  a ? process.env.DEBUG = a : delete process.env.DEBUG;
}, load:function() {
  return process.env.DEBUG;
}, useColors:function() {
  return "colors" in F ? !!F.colors : l.isatty(process.stderr.fd);
}, colors:[6, 2, 3, 4, 5, 1], inspectOpts:F, formatters:G};
function I(a) {
  function b(...e) {
    if (b.enabled) {
      var n = Number(new Date);
      b.diff = n - (g || n);
      b.prev = g;
      g = b.curr = n;
      e[0] = J(e[0]);
      "string" != typeof e[0] && e.unshift("%O");
      var p = 0;
      e[0] = e[0].replace(/%([a-zA-Z%]+)/g, (q, v) => {
        if ("%%" == q) {
          return q;
        }
        p++;
        if (v = c[v]) {
          q = v.call(b, e[p]), e.splice(p, 1), p--;
        }
        return q;
      });
      d.call(b, e);
      (b.log || f).apply(b, e);
    }
  }
  const c = a.formatters, d = a.formatArgs, f = a.log;
  let g;
  return b;
}
function K(a) {
  const b = I(a);
  "function" == typeof a.init && a.init(b);
  a.a.push(b);
  return b;
}
function L(a, b) {
  let c = 0;
  for (let d = 0; d < b.length; d++) {
    c = (c << 5) - c + b.charCodeAt(d), c |= 0;
  }
  return a.colors[Math.abs(c) % a.colors.length];
}
function M(a) {
  var b = H.load();
  a.save(b);
  a.c = [];
  a.g = [];
  let c;
  const d = ("string" == typeof b ? b : "").split(/[\s,]+/), f = d.length;
  for (c = 0; c < f; c++) {
    d[c] && (b = d[c].replace(/\*/g, ".*?"), "-" == b[0] ? a.g.push(new RegExp("^" + b.substr(1) + "$")) : a.c.push(new RegExp("^" + b + "$")));
  }
  for (c = 0; c < a.a.length; c++) {
    b = a.a[c], b.enabled = a.enabled(b.namespace);
  }
}
class N {
  constructor(a) {
    this.colors = a.colors;
    this.formatArgs = a.formatArgs;
    this.inspectOpts = a.inspectOpts;
    this.log = a.log;
    this.save = a.save;
    this.init = a.init;
    this.formatters = a.formatters || {};
    this.a = [];
    this.c = [];
    this.g = [];
  }
  destroy(a) {
    a = this.a.indexOf(a);
    return -1 !== a ? (this.a.splice(a, 1), !0) : !1;
  }
  enabled(a) {
    if ("*" == a[a.length - 1]) {
      return !0;
    }
    let b, c;
    b = 0;
    for (c = this.g.length; b < c; b++) {
      if (this.g[b].test(a)) {
        return !1;
      }
    }
    b = 0;
    for (c = this.c.length; b < c; b++) {
      if (this.c[b].test(a)) {
        return !0;
      }
    }
    return !1;
  }
}
function J(a) {
  return a instanceof Error ? a.stack || a.message : a;
}
;var O;
O = function() {
  const a = new N(H);
  return function(b) {
    const c = K(a);
    c.namespace = b;
    c.useColors = H.useColors();
    c.enabled = a.enabled(b);
    c.color = L(a, b);
    c.destroy = function() {
      a.destroy(this);
    };
    c.extend = function(d, f) {
      d = this.namespace + (void 0 === f ? ":" : f) + d;
      d.log = this.log;
      return d;
    };
    M(a);
    return c;
  };
}()("nicer");
const P = (a, b = 97) => {
  let c = a.slice(0, b);
  a.length >= b + 3 ? c += "..." : a.length == b + 2 ? c += ".." : a.length == b + 1 && (c += ".");
  return c;
}, Q = (a, b) => {
  const c = a.slice(0, b);
  a = a.slice(b + 4);
  return {header:c, data:a};
}, R = (a, b, c = "", d = 0) => {
  if (!a.length) {
    return b;
  }
  if (!b.length) {
    return a;
  }
  d = " ".repeat(d);
  c && (c = `-${c}`);
  O("%s<concat%s>", d, c);
  a = Buffer.concat([a, b]);
  O("%s<concat%s> %f", d, c, a.length);
  return a;
};
function S(a, b) {
  a.h += b.length;
  a.g.write(b);
  O("    \ud83d\udcdd  Wrote %f to body", b.length);
}
function T(a, b) {
  if (b.length && (a.header = R(a.header, b, "header", 6), b = a.header.indexOf("\r\n\r\n"), -1 != b)) {
    const {header:c, data:d} = Q(a.header, b);
    a.a = "reading_body";
    O("    \ud83d\uddd2  Found header at %s, data available <%f>", D(`${b}`, "yellow"), d.length);
    U(c);
    a.g = new h;
    a.header = Buffer.from("");
    a.push({header:c, stream:a.g});
    S(a, d);
  }
}
function V(a) {
  var {c:b} = a;
  const c = W(a, b);
  a = (b = b.length - c.length) ? a.c.slice(b) : a.c;
  O("one consume safe consumed %f and left %f", b, a.length);
  return a;
}
function W(a, b) {
  var c, d, f = 0;
  O("\ud83d\udd0d  Staring boundary %s scan", D(P(a.boundary.trim(), 15), "red"));
  for (var g = []; -1 != (c = b.indexOf(d = a.boundary));) {
    f++;
    d = c + d.length;
    const e = b.slice(0, c);
    b = b.slice(d);
    "start" == a.a ? (O("  \u2b50  Found starting boundary at index %s", D(`${c}`, "yellow")), a.a = "reading_header") : (O("  \ud83d\udd1b  Found boundary, data size %fm", e.length), "reading_body" == a.a ? (X(a, e), a.a = "finished_body") : "reading_header" == a.a && a.header.length ? (c = Buffer.concat([a.header, e]), O("  \ud83d\uddd2  Found header and data of size <%fy>", c.length), U(c, 3), g.push(c), a.header = Buffer.from(""), a.a = "finished_body") : g.push(e));
  }
  g.forEach(e => {
    const n = e.indexOf("\r\n\r\n");
    if (-1 == n) {
      throw Error("Did not find the end of header before boundary.");
    }
    const {header:p, data:q} = Q(e, n);
    e = new h;
    e.end(q);
    a.push({header:p, stream:e});
    a.a = "finished_body";
  });
  O("\ud83d\udd0e  Finished boundary scan, buffer of length %f left, separators found: %s", b.length, f);
  if ("finished_body" == a.a && 45 == b[0] && 45 == b[1]) {
    return O("\u3030\ufe0f  Special case, found %s after the boundary", D("--", "red")), a.a = "data-ended", b;
  }
  "finished_body" == a.a && (a.a = "reading_header");
  f = b.slice(0, Math.max(0, b.length - a.boundary.length));
  g = b.slice(f.length);
  return "reading_body" == a.a ? (S(a, f), g) : "reading_header" == a.a ? (T(a, f), g) : "start" == a.a ? g : b;
}
function X(a, b) {
  a.g && (b && b.length && S(a, b), O("    \ud83d\udd12  Closing current data stream, total written: %f", a.h), a.g.push(null), a.g = null, a.h = 0);
}
class Y extends k {
  constructor(a) {
    const {writableHighWaterMark:b, boundary:c} = a || {};
    if (!c) {
      throw Error("please pass the boundary");
    }
    super({writableHighWaterMark:b, readableObjectMode:!0});
    this.c = Buffer.from("");
    this.l = c;
    this.i = `--${this.l}`;
    this.a = "start";
    this.header = Buffer.from("");
    this.h = 0;
    this.g = null;
  }
  _transform(a, b, c) {
    try {
      this.c = R(this.c, a, "transform"), this.c = V(this);
    } catch (d) {
      c(d);
      return;
    }
    c(null);
  }
  get boundary() {
    return "start" == this.a ? this.i : `\r\n${this.i}`;
  }
  _final(a) {
    if ("data-ended" == this.a) {
      return X(this), a();
    }
    this.c = V(this);
    X(this);
    var b = this.c;
    45 == b[0] && 45 == b[1] ? (a(), this.push(null)) : (b = this.c.slice(0, 2).toString(), b = Error(`Unexpected end of request body, wanted to see "--" but saw ${b}.`), a(b), this.push(b));
  }
}
const U = (a, b = 5) => {
  /nicer/.test(`${process.env.DEBUG}`) && P(a).toString().split(/\r?\n/).filter(Boolean).forEach(c => {
    var d = " ".repeat(b + 2);
    {
      c = `${c}`;
      const f = C.blue;
      c = f ? `\x1b[${f}m${c}\x1b[0m` : c;
    }
    O("%s%s", d, D(c, "cyan"));
  });
};
module.exports = Y;


//# sourceMappingURL=nicer.js.map