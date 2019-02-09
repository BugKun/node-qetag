const path = require('path'),
    qetagPath = path.join(__dirname, './qetag.js'),
    childProcess = require('child_process'),
    promiseMap = require('promise.map'),
    os = require('os'),
    threads = os.cpus().length;



function factory(buffer) {
    const qetag = childProcess.fork(qetagPath);

    return new Promise((resolve, reject) => {
        qetag.on('message', resolve);
        qetag.on('error', reject);
        qetag.send(buffer);
    })
}

module.exports = (buffers, concurrency = (threads > 1)? threads - 1 : 1) => promiseMap(buffers, factory, concurrency)