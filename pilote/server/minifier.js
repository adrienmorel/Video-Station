const minifier = require("minifier");
const minify = require('minify');
const UglifyJS = require("uglify-js");
const concat = require("concat-files");
const fs = require("fs");
const yml = require("js-yaml");
const watch = require("node-watch");
const path = require("path");
const JavaScriptObfuscator = require("javascript-obfuscator");

const config = require(`${process.cwd()}/config/config`);

class JSMinifier {
	constructor() {
		
		this.root = path.join(process.cwd(), `${config.serverConfig.server.public.js}/`);
		
		this.configPath = `${this.root}${config.serverConfig.server.minifier.js.package}`;
		
		minifier.on("error", error => {
			console.log(`Error whilst minifying js file : ${error}`);
		});
		
		this.rawDestination = `${this.root}${config.serverConfig.server.minifier.js.raw}`;
		this.minDestination = `${this.root}${config.serverConfig.server.minifier.js.min}`;
		
		this.watcher;
		
	}
	
	watching(files) {
		
		var that = this;
		
		if (this.watcher !== undefined) {
			this.watcher.close();
		}
		this.watcher = watch(files, { encoding: "utf8" });
		this.watcher.on("change", function(evt, name) {
			console.log(`${name} was ${evt}`);
			that.update();
		});
		
	}
	update() {
		
		try {
			this.files = yml.safeLoad(fs.readFileSync(this.configPath, "utf8"));
			this.files = this.files
			? this.files.files ? this.files.files : []
			: [];
		} catch (e) {
			console.log("Could not load the js package config file");
		}
		
		// adding root
		for (let i = 0; i < this.files.length; ++i) {
			this.files[i] = this.root + this.files[i];
		}
		
		// launch watch
		this.watching(this.files.concat([this.configPath]));
		
		console.log("Regenerating minified js files");
		this.concat(this.files, this.rawDestination);
		
	}
	
	concat(files, destination) {
		let that = this;
		concat(files, destination, error => {
			if (error) {
				console.log(`Error whilst concatening js files : ${error}`);
			} else {
				that.minifying(that.rawDestination);
			}
		});
	}
	
	minifying(file) {
		//minifier.minify(file);


		/*fs.writeFileSync(
			this.minDestination, 
			JavaScriptObfuscator.obfuscate(fs.readFileSync(this.minDestination, "utf8"),
			"utf8")
		);*/
	}
}

module.exports = new JSMinifier();
