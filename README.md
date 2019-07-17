# nicer

[![npm version](https://badge.fury.io/js/nicer.svg)](https://npmjs.org/package/nicer)

`nicer` is An Http _Multipart/Form-Data_ Request Body Parser. It can receive form data fields and files headers and stream their data.

```sh
yarn add nicer
```

<table>
<tr><th colspan="2"><a href="benchmark/default.js">Benchmark</a></th></tr>
<tr><td>

```java
benchmark/default.js
  ✓  sends 100mb of data with nicer (1)
  ✓  sends 100mb of data with nicer (2)
  ✓  sends 100mb of data with nicer-compiled
  ✓  sends 100mb of data with nicer-compiled 2
  ✓  sends 100mb of data with dicer (1)
  ✓  sends 100mb of data with dicer (2)

🦅  Executed 6 tests.
```
</td>
<td>

```java
​
Processed 105.38MB at 73.74mb/s
Processed 105.38MB at 85.12mb/s
Processed 105.38MB at 92.76mb/s
Processed 105.38MB at 95.62mb/s
Processed 105.38MB at 104.23mb/s
Processed 105.38MB at 115.17mb/s
​
​
```
</td>
</tr>
<tr><td colspan="2"><a href="https://github.com/idiocc/nicer"><em>Nicer</em></a> is comparable to the faster streaming parser, <a href="https://github.com/idiocc/dicer"><em>Dicer</em></a> since the real-world data (uploading 2 fields, 2 text files and 50 photos) is processed at speeds of 46 and 60 Mb/s.</td></tr>
</table>


<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/0.svg?sanitize=true"></a></p>

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [API](#api)
- [`constructor(boundary: string): Nicer`](#constructorboundary-string-nicer)
  * [`_nicer.Nicer`](#type-_nicernicer)
  * [`_nicer.NicerPart`](#type-_nicernicerpart)
- [Errors](#errors)
  * [Extra Buffer](#extra-buffer)
- [Debug](#debug)
- [Copyright](#copyright)

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/1.svg?sanitize=true"></a></p>

## API

The package is available by importing its default constructor function:

```js
import Nicer from 'nicer'
```

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/2.svg?sanitize=true"></a></p>

## `constructor(`<br/>&nbsp;&nbsp;`boundary: string,`<br/>`): Nicer`

Creates a transform that emits objects with a header buffer and the body stream. The body stream is a pass-through so all data must be written as it comes, the request doesn't pause for data to be consumed. The header is a buffer which can be parsed more and/or decrypted, but it does not stream. The assumption is the headers are short therefore a header buffer is accumulated until `\r\n` is found. Just make sure to run behind NginX then it should be alright.

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

|    Name     |             Type             |          Description           |
| ----------- | ---------------------------- | ------------------------------ |
| __stream*__ | <em>!stream.PassThrough</em> | The mandatory field separator. |
| __header*__ | <em>!Buffer</em>             | The header found before data.  |

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

## Errors

The errors are spawned when the buffer remaining the stream after the `final` event, and processed to extract the rest of the fields, still contains symbols different from <kbd>-</kbd><kbd>-</kbd> (`[45,45]`).

<table>
<tr><th><a name="extra-buffer">Extra Buffer</a> <a href="example/extra-buffer.js">(<em>Source</em>)</a></th></tr>
<tr><td>

```http
-------example
Content-Disposition: form-data; name="key"

data
-------exampleWAT
```
</td></tr>
<tr><td>The data remaining after the last boundary detected after the <em>final</em> method is called does not have any meaning and is discarded. This is not the case with parts that arrived before the stream was closed, i.e., the file limit is not implemented.</td></tr>
<tr><td>

```fs
Boundary detected: -----example
[!] Error Unexpected end of request body, wanted to see "--" but saw WA.
    Detected Data:

Content-Disposition: form-data; name="key"
====
 [ 'data' ]
```
</td></tr>
<tr><td>The parser will always check for the closing <code>--</code> and emit an error in the end, however the headers and data streams emitted by it, would have been all closed, i.e., the data can still be used.</td></tr>
</table>

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/4.svg?sanitize=true"></a></p>

## Debug

The software can write debug information, when the `DEBUG=nicer` env variable is set.

<table>
<tr><th>Debug <a href="example/debug.js">(<em>Source</em>)</a></th></tr>
<tr><td>

```js
import { Writable } from 'stream'
import Nicer from '../src'

const detected = []

await http.startPlain((req, res) => {
  const boundary = getBoundary(req, res)
  console.log('Boundary detected: %s', boundary)
  const nicer = new Nicer({ boundary })
  const bt = new BufferTransform(50)

  req.pipe(bt).pipe(nicer).pipe(new Writable({
    objectMode: true,
    write(obj, enc, next) {
      const { header: HEADER, stream: STREAM } = obj
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
<tr><td>The transform method appends data to the left-over buffer (which can usually be small enough to accommodate [--boundary.length-1] symbols) and consumes data. The data is consumed by first trying to find the boundary in the new buffer. If this is possible, then depending on the state of the parser, the data found before the separator is either flushed in an existing data stream, or appended to the existing header, which can then lead to body-flushing.</td></tr>
<tr><td>

```sh
nicer 🔍  Staring boundary --u2KxIV5yF1y+x... scan +0ms
  nicer 🔎  Finished boundary scan, buffer of length 50B left, separators found: 0 +2ms
  nicer one consume safe consumed 0B and left 50B +10ms
  nicer <concat-transform> +1ms
  nicer <concat-transform> 100B +0ms
  nicer 🔍  Staring boundary --u2KxIV5yF1y+x... scan +0ms
  nicer   ⭐  Found starting boundary at index 2 +1ms
  nicer 🔎  Finished boundary scan, buffer of length 48B left, separators found: 1 +0ms
  nicer one consume safe consumed 52B and left 48B +0ms
  nicer <concat-transform> +0ms
  nicer <concat-transform> 98B +0ms
  nicer 🔍  Staring boundary --u2KxIV5yF1y+x... scan +0ms
  nicer 🔎  Finished boundary scan, buffer of length 98B left, separators found: 0 +0ms
  nicer one consume safe consumed 46B and left 52B +1ms
  nicer <concat-transform> +0ms
  nicer <concat-transform> 102B +0ms
  nicer 🔍  Staring boundary --u2KxIV5yF1y+x... scan +0ms
  nicer   🔛  Found boundary, data size 7B +0ms
  nicer   🗒  Found header and data of size <53B> +0ms
  nicer      Content-Disposition: form-data; name="key" +1ms
  nicer      value +0ms
  nicer 🔎  Finished boundary scan, buffer of length 43B left, separators found: 1 +1ms
  nicer one consume safe consumed 59B and left 43B +0ms
  nicer <concat-transform> +0ms
  nicer <concat-transform> 93B +0ms
  nicer 🔍  Staring boundary --u2KxIV5yF1y+x... scan +0ms
  nicer 🔎  Finished boundary scan, buffer of length 93B left, separators found: 0 +1ms
  nicer one consume safe consumed 41B and left 52B +0ms
  nicer <concat-transform> +0ms
  nicer <concat-transform> 102B +0ms
  nicer 🔍  Staring boundary --u2KxIV5yF1y+x... scan +0ms
  nicer   🔛  Found boundary, data size 13B +0ms
  nicer   🗒  Found header and data of size <54B> +0ms
  nicer      Content-Disposition: form-data; name="alan" +0ms
  nicer      watts +0ms
  nicer 🔎  Finished boundary scan, buffer of length 37B left, separators found: 1 +1ms
  nicer one consume safe consumed 65B and left 37B +0ms
  nicer <concat-transform> +0ms
  nicer <concat-transform> 87B +0ms
  nicer 🔍  Staring boundary --u2KxIV5yF1y+x... scan +0ms
  nicer 🔎  Finished boundary scan, buffer of length 87B left, separators found: 0 +0ms
  nicer one consume safe consumed 35B and left 52B +0ms
  nicer <concat-transform> +0ms
  nicer <concat-transform> 102B +0ms
  nicer 🔍  Staring boundary --u2KxIV5yF1y+x... scan +0ms
  nicer 🔎  Finished boundary scan, buffer of length 102B left, separators found: 0 +1ms
  nicer       <concat-header> +0ms
  nicer       <concat-header> 85B +0ms
  nicer one consume safe consumed 50B and left 52B +0ms
  nicer <concat-transform> +0ms
  nicer <concat-transform> 102B +1ms
  nicer 🔍  Staring boundary --u2KxIV5yF1y+x... scan +0ms
  nicer   🔛  Found boundary, data size 50B +0ms
  nicer   🗒  Found header and data of size <135B> +0ms
  nicer      Content-Disposition: form-data; name="file"; filename="test/fixture/test.txt" +0ms
  nicer      Content-Type: ap... +0ms
  nicer 🔎  Finished boundary scan, buffer of length 0B left, separators found: 1 +0ms
  nicer one consume safe consumed 102B and left 0B +0ms
  nicer 🔍  Staring boundary --u2KxIV5yF1y+x... scan +0ms
  nicer 🔎  Finished boundary scan, buffer of length 4B left, separators found: 0 +1ms
  nicer one consume safe consumed 0B and left 4B +0ms
  nicer 🔍  Staring boundary --u2KxIV5yF1y+x... scan +8ms
  nicer 🔎  Finished boundary scan, buffer of length 4B left, separators found: 0 +0ms
  nicer one consume safe consumed 0B and left 4B +1ms
```
</td></tr>
<tr><td>After knowing what's left after the last found boundary, the <em>Nicer</em> parser takes only the safe amount of data to consume more which equals to the length of the boundary (including prior --), otherwise there might be a partial boundary leaking into the data stream. The remainder is saved as the new buffer, to which the following chunk in the transform method will be appended, and so on.</td></tr>
</table>

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/5.svg?sanitize=true"></a></p>

## Copyright

(c) [Idio][1] 2019

[1]: https://idio.cc

<p align="center"><a href="#table-of-contents"><img src="/.documentary/section-breaks/-1.svg?sanitize=true"></a></p>