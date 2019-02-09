const qetag = require('../src/'),
    fileList = require('./filesList');
    path = require('path');


fileList(path.join(__dirname, "./inputs"))
    .then(list => {
        qetag(list)
            .then(results => {
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

