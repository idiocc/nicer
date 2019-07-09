'use strict';
// let DEPACK_EXPORT;
const stream = require('stream');'use strict';
const {PassThrough:e, Transform:f} = stream;
function h(a, b) {
  a.f += b;
  let c = a.f.indexOf("\r\n\r\n");
  if (-1 != c) {
    const d = a.f.substr(0, c);
    b = b.substr(c + 4);
    a.a = "reading_body";
    a.b = new e;
    a.f = "";
    a.push({f:d, stream:a.b});
    a.b.write(b);
  }
}
function k(a) {
  a.b && (a.b.push(null), a.b = null);
}
class l extends f {
  constructor(a) {
    const {writableHighWaterMark:b, boundary:c} = a || {};
    if (!c) {
      throw Error("please pass the boundary");
    }
    super({writableHighWaterMark:b, readableObjectMode:!0});
    this.c = "";
    this.h = c;
    this.g = `--${this.h}`;
    this.a = "start";
    this.f = "";
    this.b = null;
  }
  get i() {
    "reading_body" == this.a && (k(this), this.a = "reading_header");
    return null;
  }
  _transform(a, b, c) {
    this.c += `${a}`;
    {
      a = this.c;
      let g;
      for (; -1 != (b = a.indexOf(g = this.boundary));) {
        var d = 1;
        const m = a.substr(0, b);
        a = a.substr(b + g.length);
        "start" == this.a ? this.a = "reading_header" : (this.i, b = m, "reading_header" == this.a ? h(this, b) : this.b.write(b));
      }
      "reading_body" == this.a && d && "-" == a[0] && "-" == a[1] ? (k(this), d = a) : "reading_body" == this.a ? (this.b.write(a), d = "") : "reading_header" == this.a ? (h(this, a), d = "") : d = void 0;
    }
    this.c = d;
    c(null);
  }
  get boundary() {
    return "start" == this.a ? this.g : `\r\n${this.g}`;
  }
  _final(a) {
    this.b && this.b.push(null);
    const b = /^--/.test(this.c);
    try {
      if (b) {
        a();
      } else {
        const [c, d] = this.c;
        a(Error(`Unexpected end of request body, wanted to see "--" but saw ${c}${d}.`));
      }
    } finally {
      this.push(null);
    }
  }
}
;var DEPACK_EXPORT = {_Nicer:l};


module.exports = DEPACK_EXPORT
//# sourceMappingURL=index.js.map