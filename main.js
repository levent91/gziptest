const Apify = require('apify');
const zlib = require('zlib');
const cheerio = require('cheerio');

const { utils: { log } } = Apify;

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();

    await requestQueue.addRequest({
        url: 'https://d15790c7fypqrz.cloudfront.net/sitemaps/product_template.xml.gz',
        headers: {
            'Accept-Encoding': 'gzip',
        },
    });
    const crawler = new Apify.BasicCrawler({
        requestQueue,
        maxConcurrency: 50,
        handleRequestFunction: async (context) => {
            return myFunction(context);
        },
    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');
});

async function myFunction({ request }) {
    const res = await Apify.utils.requestAsBrowser({
        url: request.url,
        isStream: true,
        responseType: 'buffer',
    });
    console.log(res.body)
}

async function gunzipJSON(response) {
    const gunzip = zlib.createGunzip();
    let json = '';
    const urls = [];

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

    response.pipe(gunzip);
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
