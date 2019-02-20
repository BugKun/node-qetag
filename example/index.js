const qetag = require('../src/'),
    fileList = require('./filesList');
    path = require('path');


fileList(path.join(__dirname, './inputs'))
    .then(list => {
        qetag(list)
            .then(results => {
                if(results.length < 1) return;
                for(let i = 0; i < list.length; i++) {
                    console.log(`${path.relative(__dirname, list[i])} => ${results[i]}`);
                }
            })
            .catch(err => {
                console.log(err);
            })
    })
    .catch(err => {
        console.log(err);
    })

