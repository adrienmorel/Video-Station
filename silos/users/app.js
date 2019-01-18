const config = require("./config/config");
const Server = require("./server/server");

Server.start(config.serverConfig.server.host, config.serverConfig.server.port);