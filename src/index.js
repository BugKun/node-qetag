const path = require('path'),
    ThreadPool = require('./ThreadPool'),
    qetagPath = path.join(__dirname, './qetag.js');

module.exports = (buffers, threads) => {
    return new Promise((resolve, reject) => {
        const threadPool = new ThreadPool(qetagPath, threads);
        threadPool
            .start(buffers)
            .then(results => {
                threadPool.close();
                resolve(results);
            })
            .catch(reject)
    })
}