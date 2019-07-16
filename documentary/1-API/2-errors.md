## Errors

The errors are spawned when the buffer remaining the stream after the `final` event, and processed to extract the rest of the fields, still contains symbols different from <kbd>-</kbd><kbd>-</kbd> (`[45,45]`).

<table>
<tr><th>[Extra Buffer](t) <a href="example/extra-buffer.js">(<em>Source</em>)</a></th></tr>
<!-- block-start -->
<tr><td>

%FORK-http example/extra-buffer.js%
</td></tr>
<tr><td><md2html>

The data remaining after the last boundary detected after the _final_ method is called does not have any meaning and is discarded. This is not the case with parts that arrived before the stream was closed, i.e., the file limit is not implemented.
</md2html></td></tr>
<!-- /block-end -->
<!-- block-start -->
<tr><td>

%FORKERR-fs example/extra-buffer.js%
</td></tr>
<tr><td><md2html>

The parser will always check for the closing `--` and emit an error in the end, however the headers and data streams emitted by it, would have been all closed, i.e., the data can still be used.
</md2html></td></tr>
<!-- /block-end -->
</table>

%~%