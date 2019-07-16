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
  * [`_nicer.NicerPart`](#type-_nicernicerpart)
- [Copyright](#copyright)

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/1.svg?sanitize=true"></a></p>

## API

The package is available by importing its default constructor function:

```js
import Nicer from 'nicer'
```

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/2.svg?sanitize=true"></a></p>

## `constructor(`<br/>&nbsp;&nbsp;`boundary: string,`<br/>`): Nicer`

Creates a transform that emits objects with a header buffer and the body stream. The body stream is a pass-through so all data must be written as it comes, the request doesn't pause for data to be consumed. The header is a buffer which can be parsed more and/or decrypted, but it does not stream. The assumption is the headers are short therefore a header buffer is accumulated until /r/n is found. Just make sure to run behind nginx then it should be alright.

- [ ] [**TODO**] throw on header-buffer-overflow.
- [ ] [**TODO**] emit ended streams as data so that they don't have to be assigned listeners _etc_.

<table>
<tr><th>

__<a name="type-_nicernicer">`_nicer.Nicer`</a>__: A stream that emits objects with a header buffer and the body PassThrough stream.

|     Name      |      Type       |          Description           |
| ------------- | --------------- | ------------------------------ |
| __boundary*__ | <em>string</em> | The mandatory field separator. |
</th></tr>
<tr><td>

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
      const { header: HEADER, stream: STREAM } = obj

      // to print in sync have to wait for all data
      // since STREAM is a pass-through
      let d = []
      detected.push(['%s\n====\n', HEADER, d])

      STREAM.on('data', (data) => {
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
</td></tr>
<tr><td>A new instance of <em>Nicer</em> can be piped into by an <em>http.IncomingMessage</em> stream in the Node.JS server. Then a transform stream must be created to listen for the data emitted by <em>Nicer</em> in object mode.

__<a name="type-_nicernicerpart">`_nicer.NicerPart`</a>__: A part that gets emitted by _Nicer_.

|    Name     |            Type             |          Description           |
| ----------- | --------------------------- | ------------------------------ |
| __stream*__ | <em>stream.PassThrough</em> | The mandatory field separator. |
| __header*__ | <em>Buffer</em>             | The header found before data.  |

</td></tr>
<tr><td>

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
</td></tr>
<tr><td>The data received by the 'transform' method, contains the { header, stream } properties. The data from the stream must be accumulated.
</td></tr>
</table>



<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/3.svg?sanitize=true"></a></p>

## Copyright

(c) [Idio][1] 2019

[1]: https://idio.cc

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/-1.svg?sanitize=true"></a></p>