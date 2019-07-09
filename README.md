# nicer

[![npm version](https://badge.fury.io/js/nicer.svg)](https://npmjs.org/package/nicer)

`nicer` is An Http Multipart/Form-Data Request Body Parser.

```sh
yarn add nicer
```

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [API](#api)
- [`newNicer(boundary: string): Nicer`](#newnicerboundary-string-nicer)
  * [`_nicer.Nicer`](#type-_nicernicer)
- [Copyright](#copyright)

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/0.svg?sanitize=true"></a></p>

## API

The package is available by importing its default constructor function:

```js
import Nicer from 'nicer'
```

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/1.svg?sanitize=true"></a></p>

## `newNicer(`<br/>&nbsp;&nbsp;`boundary: string,`<br/>`): Nicer`

Creates a transform that emits objects with header and body streams.

__<a name="type-_nicernicer">`_nicer.Nicer`</a>__: A stream that emits objects with a header buffer and the body PassThrough stream.

|     Name      |      Type       |          Description           |
| ------------- | --------------- | ------------------------------ |
| __boundary*__ | <em>string</em> | The mandatory field separater. |

```js
import { Transform } from 'stream'
import Nicer from 'nicer'

await http.startPlain((req, res) => {
  const boundary = getBoundary(req, res)
  console.log('Boundary detected: %s', boundary)
  req.pipe(new Nicer({ boundary })).pipe(new Transform({
    objectMode: true,
    transform(obj, enc, next) {
      console.log('%s\n====', obj.header) // Data from Nicer:
      obj.stream.pipe(process.stdout)
      next()
    },
    final() {
      res.statusCode = 200
      res.end('hello world')
    },
  }))
})
```
```
Boundary detected: u2KxIV5yF1y+xUspOQCCZopaVgeV6Jxihv35XQJmuTx8X3sh

Content-Disposition: form-data; name="key"
====
value
Content-Disposition: form-data; name="alan"
====
watts
```

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/2.svg?sanitize=true"></a></p>

## Copyright

(c) [Idio][1] 2019

[1]: https://idio.cc

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/-1.svg?sanitize=true"></a></p>