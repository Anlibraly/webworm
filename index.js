const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const config = require('./config/index');
let louInfo = [];
const MAXPAGE = 1;

let getOneFang = async (findex) => {
    if(findex >= louInfo.length) {
        return;
    }
    let f = louInfo[findex];
    return new Promise((resolve, reject) => {
        request(`${config.infoUrl}/listing/detail-i${f.id}.html`, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body);
                $('.fitem').each(function(i, elem) {
                    let fangxing = {};
                    fangxing.img = $(this).find('.f-photo img').data('daily-image');
                    fangxing.area = $(this).find('.f-area').text().trim();
                    fangxing.price = $(this).find('.f-price .unit-show').text().trim();
                    fangxing.floor  = $(this).find('.f-floor').text().trim();
                    fangxing.decoraion = $(this).find('.f-decoraion').text().trim();
                    fangxing.update = $(this).find('.f-update').text();
                    f.fangxing.push(fangxing);
                });
                $('.desc-box .feature li').each(function(i, elem) {
                    let feature = {};
                    feature.key = $(this).find('.f-title').text().trim();
                    feature.value = $(this).find('.f-con').text().trim();
                    f.feature.push(feature);
                });
                $('.house-bar .feature li').each(function(i, elem) {
                    let feature = {};
                    feature.key = $(this).find('.f-title').text().trim();
                    feature.value = $(this).find('.f-con').text().trim();
                    f.feature.push(feature);
                });
            }
            resolve(getOneFang(findex + 1));
        });
    });
};

let getOnePage = async pnum => {
    if (pnum > MAXPAGE) {
        return louInfo;
    }
    return new Promise((resolve, reject) => {
        request(`${config.infoUrl}/listing/p${pnum}`, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body);
                $('.list-item-link').each(function(i, elem) {
                    let info = {};
                    info.id = $(this).data('id');
                    info.title = $(this).find('h2 a').text();
                    info.price = $(this).find('.price-num').text() + $(this).find('.price-unit').text() + $(this).find('.price-txt').text();
                    info.location = $(this).find('.region a').text();
                    info.metro = $(this).find('.metro').text();
                    info.fangxing = [];
                    info.feature = [];
                    louInfo.push(info);
                });
                //console.log(louInfo);
                resolve(getOnePage(pnum+1));
            } else {
                write();
                console.log(pnum)
                reject(error);
            }
        });
    });
};

function write(){
    fs.writeFile(config.infoDist, JSON.stringify(louInfo), { 'flag': 'w' }, function(err) {
        if (err) {
            throw err;
        }
    });
}

getOnePage(1)
.then(() => getOneFang(0))
.then(() => {
    console.log(louInfo.length);
    write();
});
