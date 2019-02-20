const childProcess = require('child_process'),
    promiseMap = require('promise.map'),
    os = require('os'),
    defaultThreads = Math.max(os.cpus().length - 1, 1);

class ThreadPool {
    constructor(factoryPath, threads) {
        this.factoryPath = factoryPath;
        this.threads = threads || defaultThreads;
        this.threadPool = [];
        this.idlePool = [];
    }

    warmup() {
        if(this.threadPool.length !== 0) return;

        this.idlePool = [];
        for(let i = 0; i < this.threads; i++){
            const $_process = childProcess.fork(this.factoryPath);
            this.idlePool.push(i);
            this.threadPool[i] = {
                run: (buffer) => {
                    return new Promise((resolve, reject) => {
                        const onMessage = (data) => {
                            this.idlePool.push(i);
                            $_process.removeListener('message', onMessage);
                            $_process.removeListener('error', onError);
                            resolve(data);
                        };
                        const onError = (error) => {
                            this.idlePool.push(i);
                            $_process.removeListener('message', onMessage);
                            $_process.removeListener('error', onError);
                            reject(error);
                        }
                        $_process.on('message', onMessage);
                        $_process.on('error', onError);
                        $_process.send(buffer);
                    })
                },
                exit: () => $_process.disconnect()
            };
        }

        return this;
    }

    start(buffers) {
        if(this.threadPool.length === 0) {
            if(buffers.length < this.threads) this.threads = buffers.length;
            this.warmup();
        }

        return promiseMap(buffers, (buffer) => {
            const idleProcess = this.threadPool[this.idlePool.pop()];
            return idleProcess.run(buffer)
        }, this.threads);
    }

    close() {
        for(let i in this.threadPool) {
            this.threadPool[i].exit();
        }
    }
}

module.exports = ThreadPool