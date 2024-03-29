# nicer

%NPM: nicer%

`nicer` is An Http _Multipart/Form-Data_ Request Body Parser. It can receive form data fields and files headers and stream their data.

```sh
yarn add nicer
```

<table>
<tr><th colspan="2"><a href="benchmark/default">Benchmark</a></th></tr>
<!-- block-start -->
<tr><td>

%!_FORKERR-table node_modules/.bin/zoroaster benchmark/default -a -t 100000 -s benchmark/snapshot -r benchmark/default%
</td><td>
<details>
<summary>[Stable Benchmark](t) (18 Jul)</summary>

|  Library   |     Max Speed     |
| ---------- | --------- |
| (1) dicer      | 92.93mb/s |
| (2) nicerc     | 79.95mb/s |
|     nicer      | 72.23mb/s |
| (3) multiparty | 28.79mb/s |
</details>
</td>
</tr>
<tr><td colspan="2"><md2html>

<a href="https://github.com/idiocc/nicer">_Nicer_</a> is comparable to the faster streaming parser, <a href="https://github.com/idiocc/dicer">_Dicer_</a> since the real-world data (uploading 2 fields, 2 text files and 50 photos) is processed at speeds that are close to max 90mb/s. In the benchmark, `nicer` is the source code of this package, whereas `nicerc` is the <a href="https://compiler.page">compiled JavaScript</a> optimised Closure Compiler, which probably increases the speed by 5-10%.
</md2html></td></tr>
<!-- /block-end -->
<!-- block-start -->
<!-- <tr><td colspan="2">

%EXAMPLE: benchmark, ../src => nicer%
</td>
</tr>
<tr><td colspan="2"><md2html>


</md2html></td></tr> -->
<!-- /block-end -->
</table>

%~%

<!-- > THIS IS A PRE-v1 RELEASE SO IT's HUGELY EXPERIMENTAL AND WORKS FOR -->
<!-- > DATA RECEIVED ALL IN ONE CHUNK -->
<!-- >    - [] The incoming data is processed by keeping parts of the buffer untouched such as that with the safe buffer when  -->

## Table Of Contents

%TOC%

%~%