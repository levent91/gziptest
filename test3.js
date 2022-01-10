const request = require('request');
const zlib = require('zlib');
const cheerio = require('cheerio');

async function makeRequest() {
    const url = 'https://d15790c7fypqrz.cloudfront.net/sitemaps/product_template.xml.gz';
    const headers = { 'Accept-Encoding': 'gzip' };
    const urls = [];

    const response = request(url, headers);

    gunzipJSON(response, urls);
}

function parseSitemap($) {
    /** @type {Set<string>} */
    const urls = new Set();
    // console.log($)

    $('urlset url loc').each((_, el) => {
        const url = $(el).text();

        if (!url || !(/\/(sneakers|apparel)\//.test(url))) {
            return;
        }

        urls.add(url);
    });

    return urls;
}

async function gunzipJSON(response, urls) {
    const gunzip = zlib.createGunzip();
    let json = '';
    // const urls = [];

    gunzip.on('data', (data) => {
        json += data.toString();
    });

    gunzip.on('end', () => {
        const $ = cheerio.load(json);

        for (const url of parseSitemap($)) {
            urls.push(url);
        }
        console.log(urls.length);
    });

    gunzip.on('finish', () => {
        const $ = cheerio.load(json);

        for (const url of parseSitemap($)) {
            urls.push(url);
        }
        console.log(urls.length);
    });

    response.pipe(gunzip);
}

makeRequest();
