# node-qetag
A multi-thread utility of NodeJS, calculate the hash value of the file on the qiniu cloud storage (also the etag value when the file is downloaded).

## Base
Base on the <a href="https://github.com/qiniu/qetag" target="__blank">qetag</a>, which is the official version.

## Install
```bash
$ npm i node-qetag --save
```

## API
```JavaScript
const qetag = require('node-qetag');

let fileList = []; // Your file list
let threads = 8 - 1; // Default is the number of your device's logical processors and minus 1

qetag(fileList, threads)
    .then(results => {
        console.log(results);
    })
    .catch(err => {
        console.log(err);
    })
```