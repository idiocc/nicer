## API

The package is available by importing its default constructor function:

```js
import Nicer from 'nicer'
```

%~%

```## constructor => Nicer
[
  ["boundary", "string"]
]
```

Creates a transform that emits objects with a header buffer and the body stream. The body stream is a pass-through so all data must be written as it comes, the request doesn't pause for data to be consumed. The header is a buffer which can be parsed more and/or decrypted, but it does not stream. The assumption is the headers are short therefore a header buffer is accumulated until `\r\n` is found. Just make sure to run behind _NginX_ then it should be alright.

<!-- [**TODO**]:  -->

<table>
<tr><th>

%TYPEDEF types/index.xml Nicer%
</th></tr>
<!-- block-start -->
<tr><td>

%EXAMPLE: example, .. => nicer%
</td></tr>
<tr><td><md2html>
A new instance of _Nicer_ can be piped into by an _http.IncomingMessage_ stream in the Node.JS server. Then a transform stream must be created to listen for the data emitted by _Nicer_ in object mode.

</md2html>

%TYPEDEF types/index.xml Part%

</td></tr>
<!-- /block-end -->
<!-- block-start -->
<tr><td>

%FORK example%
</td></tr>
<tr><td><md2html>

The data received by the 'transform' method, contains the { header, stream } properties. The data from the stream must be accumulated.
</md2html>
</td></tr>
<!-- /block-end -->
</table>

<!-- - [ ] [**TODO**] throw on header-buffer-overflow. -->
<!-- - [ ] [**TODO**] emit ended streams as data so that they don't have to be assigned listeners _etc_. -->

%~%