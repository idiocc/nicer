## Debug

The software can write debug information, when the `DEBUG=nicer` env variable is set.

<table>
<tr><th>Debug <a href="example/debug.js">(<em>Source</em>)</a></th></tr>
<!-- block-start -->
<tr><td>

%EXAMPLE: example/debug.js%
</td></tr>
<tr><td><md2html>

The transform method appends data to the left-over buffer (which can usually be small enough to accommodate [--boundary.length-1] symbols) and consumes data. The data is consumed by first trying to find the boundary in the new buffer. If this is possible, then depending on the state of the parser, the data found before the separator is either flushed in an existing data stream, or appended to the existing header, which can then lead to body-flushing.
</md2html></td></tr>
<!-- /block-end -->
<!-- block-start -->
<tr><td>

%FORKERR-sh example/debug.js%
</td></tr>
<tr><td><md2html>

After knowing what's left after the last found boundary, the _Nicer_ parser takes only the safe amount of data to consume more which equals to the length of the boundary (including prior --), otherwise there might be a partial boundary leaking into the data stream. The remainder is saved as the new buffer, to which the following chunk in the transform method will be appended, and so on.
</md2html></td></tr>
<!-- /block-end -->
</table>

%~%