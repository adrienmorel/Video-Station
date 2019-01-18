const express = require("express");
var bodyParser = require("body-parser");
const apiTask = require("./api-video");
const apiList = require("./api-playlist");

class Server {
    constructor() {
        this.server = express();

        this.server.use(bodyParser.json());
        this.server.use(
            bodyParser.urlencoded({
                extended: true
            })
        );

        this.server.use("/video", apiTask.router);
        this.server.use("/playlist", apiList.router);
    }

    start(host, port) {
        this.server.listen(port, host, () => {
            console.log(`Listening on '${host}' on the port ${port}...`);
        });
    }
}

module.exports = new Server();
