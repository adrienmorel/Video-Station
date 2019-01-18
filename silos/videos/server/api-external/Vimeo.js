const VimeoAPI =  require("vimeo").Vimeo;
const vimeoAPI = new VimeoAPI("b0eeb1d44872154f78413a1f37fef36352f420b3", "uGlHQnd6C8pu0NMgAcjm8ybsVphMJSgIMaQdZfObCQhHTxwvKWfeRrT5pI7n7B4V04pRgmXTk0EVDZDPs/6CI02sTvC+74ANj7mkCtCVHQ/bH3VKOUp8xxTvns9vMbu/", "bed141a559e19f691ed6e67f720a4f3a");



class Vimeo {
    constructor() {
    }

    search(keyWords, maxResults, page = 1) {
        return new Promise(function (resolve, reject) {
            vimeoAPI.request({
                // This returns the first page of videos containing the term "vimeo staff".
                // These videos will be sorted by most relevant to least relevant.

                path: '/videos',
                query: {
                    page: page,
                    per_page: maxResults,
                    query: keyWords,
                    sort: 'relevant',
                    direction: 'asc'
                }
            }, function (error, body, statusCode, headers) {
                if (error) {
                    reject(error);
                } else {
                    body.data.map(function (video) {
                        video.brand = "Vimeo";
                        if((typeof video.description === 'string') && (video.description.length > 100)){
                            video.description = video.description.substring(0, 175).concat('', '...');
                        }
                    });
                    resolve(body);
                }
            });
        });
    }

    getVideoById(id){
        return new Promise(function (resolve, reject) {
            //path = '/videos/numberOfId'
            vimeoAPI.request({
                method: 'GET',
                path: '/videos/' + id
            }, function (error, body, statusCode, headers) {
                if (error) {
                    reject(error);
                } else {
                    resolve(body);
                }
            });
        });
    };

    normalize(video){
        var result = {};

        result.id = video.uri.replace("/videos/", "");
        result.title = video.name;
        result.description = video.description;

        result.thumbnails = {};
        result.thumbnails.default = {};
        result.thumbnails.medium = {};
        result.thumbnails.high = {};

        if(typeof video.pictures.sizes[0] !== 'undefined'){
            result.thumbnails.default.url = video.pictures.sizes[0].link;
            result.thumbnails.default.width = video.pictures.sizes[0].width;
            result.thumbnails.default.height = video.pictures.sizes[0].height;
        }

        if(typeof video.pictures.sizes[2] !== 'undefined'){
            result.thumbnails.medium.url = video.pictures.sizes[2].link;
            result.thumbnails.medium.width = video.pictures.sizes[2].width;
            result.thumbnails.medium.height = video.pictures.sizes[2].height;
        }

        if(typeof video.pictures.sizes[3] !== 'undefined'){
            result.thumbnails.high.url = video.pictures.sizes[3].link;
            result.thumbnails.high.width = video.pictures.sizes[3].width;
            result.thumbnails.high.height = video.pictures.sizes[3].height;
        }

        result.channel = {};
        result.channel.id = video.user.uri;
        result.channel.title = video.user.name;

        result.link = video.link;

        result.publishedAt = video.release_time;

        result.brand = "Vimeo";

        return result;
    }
}

module.exports = new Vimeo();