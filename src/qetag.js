const fs = require('fs'),
	crypto = require('crypto');


// sha1算法
function sha1(content){
    const sha1 = crypto.createHash('sha1');
    sha1.update(content);
    return sha1.digest();
}


function calcEtag({sha1String, blockCount, prefix}){
    if(!sha1String.length){
        return 'Fto5o-5ea0sNMlW_75VgGJCv2AcJ';
    }
    let sha1Buffer = Buffer.concat(sha1String,blockCount * 20);

    // 如果大于4M，则对各个块的sha1结果再次sha1
    if(blockCount > 1){
        prefix = 0x96;
        sha1Buffer = sha1(sha1Buffer);
    }

    sha1Buffer = Buffer.concat(
        [new Buffer([prefix]),sha1Buffer],
        sha1Buffer.length + 1
    );

    return sha1Buffer.toString('base64')
        .replace(/\//g,'_').replace(/\+/g,'-');

}

function getEtag(buffer, callback){

	// 判断传入的参数是buffer还是stream还是filepath
	let mode = 'buffer';

	if(typeof buffer === 'string'){
		buffer = fs.createReadStream(buffer);
		mode='stream';
	}else if(buffer instanceof require('stream')){
		mode='stream';
	}

	
	// 以4M为单位分割
    const blockSize = 4*1024*1024;
    
	let sha1String = [],
	prefix = 0x16,
	blockCount = 0;

	switch(mode){
		case 'buffer':
			const bufferSize = buffer.length;
			blockCount = Math.ceil(bufferSize / blockSize);

			for(var i=0;i<blockCount;i++){
				sha1String.push(sha1(buffer.slice(i*blockSize,(i+1)*blockSize)));
			}
			process.nextTick(() => {
				callback(calcEtag({sha1String, blockCount, prefix}));
			});
			break;
		case 'stream':
			const stream = buffer;
			stream.on('readable', function() {
				let chunk;
				while (chunk = stream.read(blockSize)) {
					sha1String.push(sha1(chunk));
					blockCount++;
				}
			});
			stream.on('end',function(){
				callback(calcEtag({sha1String, blockCount, prefix}));
			});
			break;
	}
}

process.on('message', (buffer) =>
	getEtag(buffer, (hash) => 
		process.send(hash)
	)
)
