# nicer

[![npm version](https://badge.fury.io/js/nicer.svg)](https://npmjs.org/package/nicer)

`nicer` is An Http _Multipart/Form-Data_ Request Body Parser. It can receive form data fields and files headers and stream their data.

```sh
yarn add nicer
```

<table>
<tr><th><a href="benchmark/default.js">Benchmark</a></th></tr>
<tr><td>

```
benchmark/default.js
Processed 105.38MB at 46.92mb/s
  ✓  sends 100mb of data with nicer
Processed 105.38MB at 60.15mb/s
  ✓  sends 100mb of data with dicer

🦅  Executed 2 tests.
```
</td></tr>
<tr><td><a href="https://github.com/idiocc/nicer"><em>Nicer</em></a> is comparable to the faster streaming parser, <a href="https://github.com/idiocc/dicer"><em>Dicer</em></a> since the real-world data (uploading 2 fields, 2 text files and 50 photos) is processed at speeds of 46 and 60 Mb/s.</td></tr>
</table>


<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/0.svg?sanitize=true"></a></p>

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [API](#api)
- [`constructor(boundary: string): Nicer`](#constructorboundary-string-nicer)
  * [`_nicer.Nicer`](#type-_nicernicer)
- [Copyright](#copyright)

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/1.svg?sanitize=true"></a></p>

## API

The package is available by importing its default constructor function:

```js
import Nicer from 'nicer'
```

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/2.svg?sanitize=true"></a></p>

## `constructor(`<br/>&nbsp;&nbsp;`boundary: string,`<br/>`): Nicer`

Creates a transform that emits objects with header and body streams.

__<a name="type-_nicernicer">`_nicer.Nicer`</a>__: A stream that emits objects with a header buffer and the body PassThrough stream.

|     Name      |      Type       |          Description           |
| ------------- | --------------- | ------------------------------ |
| __boundary*__ | <em>string</em> | The mandatory field separator. |

```js
import { Transform } from 'stream'
import Nicer from 'nicer'

const detected = []

await http.startPlain((req, res) => {
  const boundary = getBoundary(req, res)
  console.log('Boundary detected: %s', boundary)
  req.pipe(new Nicer({ boundary })).pipe(new Transform({
    objectMode: true,
    transform(obj, enc, next) {
      let d = []
      detected.push(['%s\n====\n', obj.header, d, '\n'])
      obj.stream.on('data', (data) => {
        d.push(data)
      })
      next()
    },
    final() {
      res.statusCode = 200
      res.end(JSON.stringify(detected))
    },
  }))
})
```
```
Boundary detected: u2KxIV5yF1y+xUspOQCCZopaVgeV6Jxihv35XQJmuTx8X3sh

Content-Disposition: form-data; name="key"
====
 [ 'value' ] 


Content-Disposition: form-data; name="alan"
====
 [ 'watts' ] 


Content-Disposition: form-data; name="file"; filename="test/fixture/test.txt"
Content-Type: application/octet-stream
====
 [ 'a test file\n' ]
```

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/3.svg?sanitize=true"></a></p>

## Copyright

(c) [Idio][1] 2019

[1]: https://idio.cc

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/-1.svg?sanitize=true"></a></p>