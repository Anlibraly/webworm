const request = require('request');
const cheerio = require('cheerio');
const config = require('./config/index');

request(`${config.infoUrl}`, function(error, response, body) {
    if (!error && response.statusCode == 200) {
        $ = cheerio.load(body);
        console.log(body.length);
    }
});