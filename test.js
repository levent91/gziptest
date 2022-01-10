const http = require('http');
const zlib = require('zlib');

function getGzipped(url, callback) {
    let buffer;
    console.log(callback)

    http.get(url, (res) => {
        const gunzip = zlib.createGunzip();
        res.pipe(gunzip);
        gunzip.on('data', (data) => {
           buffer += data.toString();
           console.log(buffer.length)
        }).on('end', () => {
            callback(null, buffer.join(''));
        }).on('error', (e) => {
            callback(e);
        });
    }).on('error', (e) => {
        callback(e);
    });
}

getGzipped('http://d15790c7fypqrz.cloudfront.net/sitemaps/product_template.xml.gz', (err, data) => {
    console.log(data)
});
