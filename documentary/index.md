# nicer

%NPM: nicer%

`nicer` is An Http _Multipart/Form-Data_ Request Body Parser. It can receive form data fields and files headers and stream their data.

```sh
yarn add nicer
```

<table>
<tr><th colspan="2"><a href="benchmark/default.js">Benchmark</a></th></tr>
<!-- block-start -->
<tr><td>

%_FORK-java node_modules/.bin/zoroaster benchmark/default.js -a -t 100000 -s benchmark/snapshot -r benchmark/default%
</td>
<td>

%_FORKERR-java node_modules/.bin/zoroaster benchmark/default.js -a -t 100000 -s benchmark/snapshot -r benchmark/default%
</td>
</tr>
<tr><td colspan="2"><md2html>

<a href="https://github.com/idiocc/nicer">_Nicer_</a> is comparable to the faster streaming parser, <a href="https://github.com/idiocc/dicer">_Dicer_</a> since the real-world data (uploading 2 fields, 2 text files and 50 photos) is processed at speeds of 46 and 60 Mb/s.
</md2html></td></tr>
<!-- /block-end -->
</table>


%~%

<!-- > THIS IS A PRE-v1 RELEASE SO IT's HUGELY EXPERIMENTAL AND WORKS FOR -->
<!-- > DATA RECEIVED ALL IN ONE CHUNK -->
<!-- >    - [] The incoming data is processed by keeping parts of the buffer untouched such as that with the safe buffer when  -->

## Table Of Contents

%TOC%

%~%