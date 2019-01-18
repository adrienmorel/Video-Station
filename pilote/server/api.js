const express = require("express");
const axios = require("axios");


const router = express.Router();
const config = require(`${process.cwd()}/config/config`);
const Token = require('./token');

class API {
	constructor(globalBruteforce) {
		this.router = router;
		var silosConfig = config.silosConfig.silo;
		this.globalBruteforce = globalBruteforce;
		
		// global brute force, on all routes
		this.router.use(this.globalBruteforce.prevent);
		
		// route middleware to verify a token
		this.router.use(function(req, res, next) {
			var that = this;
			
			// check header or url parameters or post parameters for token
			var token =
			req.body.token || req.query.token || req.headers["x-access-token"];
			
			// decode token
			if (token) {
				// verifies secret and checks exp
				
				Token.verify(token)
				.then(function(tokenDecoded) {
					// if everything is good, save to request for use in other routes
					req.body.token = req.query.token = req.headers["x-access-token"] = tokenDecoded;
					next();
				})
				.catch(function(error) {
					console.log(`Token error: ${error.message}`);
					return res.json({
						success: false,
						error: "BAD_TOKEN"
					});
				});
				
			} else {
				// if there is no token
				// return an error
				return res.status(403).send({
					success: false,
					error: "TOKEN_NEEDED"
				});
			}
		});
		
		// task
		this.router.post(`/${silosConfig.task.endpoints.task}/add`, (req, res) => {
			var that = this;
			
			axios
			.post(
				that.makeFullEndpoint(
					silosConfig.task,
					silosConfig.task.endpoints.task,
					"add"
				),
				{
					task: req.body.task,
					token: req.body.token
				}
			)
			.then(function(response) {
				res.json(response.data);
			})
			.catch(function(error) {
				res.send(that.makeError(error.message));
			});
		});
		
		this.router.get(`/${silosConfig.task.endpoints.task}/all`, (req, res) => {
			var that = this;
			
			axios
			.get(
				that.makeFullEndpoint(
					silosConfig.task,
					silosConfig.task.endpoints.task,
					"all"
				),
				{
					params: {
						idList: req.query.idList,
						isDone: req.query.isDone,
						token: req.body.token
					}
				}
			)
			.then(function(response) {
				res.json(response.data);
			})
			.catch(function(error) {
				res.send(that.makeError(error.message));
			});
		});
		
		this.router.put(`/${silosConfig.task.endpoints.task}/update`, (req, res) => {
				var that = this;
				
				axios
				.post(
					that.makeFullEndpoint(
						silosConfig.task,
						silosConfig.task.endpoints.task,
						"update"
					),
					{
						token: req.body.token,
						task: req.body.task
					}
				)
				.then(function(response) {
					res.json(response.data);
				})
				.catch(function(error) {
					res.send(that.makeError(error.message));
				});
			});
		
		this.router.delete(`/${silosConfig.task.endpoints.task}/delete`, (req, res) => {
				var that = this;
				
				axios
				.post(
					that.makeFullEndpoint(
						silosConfig.task,
						silosConfig.task.endpoints.task,
						"delete"
					),
					{
						token: req.body.token,
						task: req.body.task
					}
				)
				.then(function(response) {
					res.json(response.data);
				})
				.catch(function(error) {
					res.send(that.makeError(error.message));
				});
			});
		
		// list
		this.router.post(`/${silosConfig.task.endpoints.list}/add`, (req, res) => {
			var that = this;
			
			axios
			.post(
				that.makeFullEndpoint(
					silosConfig.task,
					silosConfig.task.endpoints.list,
					"add"
				),
				{
					list: req.body.list,
					token: req.body.token
				}
			)
			.then(function(response) {
				res.json(response.data);
			})
			.catch(function(error) {
				res.send(that.makeError(error.message));
			});
		});
		
		this.router.get(`/${silosConfig.task.endpoints.list}/all`, (req, res) => {
			var that = this;
			
			axios
			.get(
				that.makeFullEndpoint(
					silosConfig.task,
					silosConfig.task.endpoints.list,
					"all"
				),
				{
					params: {
						token: req.body.token
					}
				}
			)
			.then(function(response) {
				res.json(response.data);
			})
			.catch(function(error) {
				res.send(that.makeError(error.message));
			});
		});

		this.router.get(`/${silosConfig.task.endpoints.list}/get`, (req, res) => {
			var that = this;
			
			axios
			.get(
				that.makeFullEndpoint(
					silosConfig.task,
					silosConfig.task.endpoints.list,
					"get"
				),
				{
					params: {
						idList: req.query.idList,
						token: req.body.token
					}
				}
			)
			.then(function(response) {
				res.json(response.data);
			})
			.catch(function(error) {
				res.send(that.makeError(error.message));
			});
		});
		
		this.router.put(`/${silosConfig.task.endpoints.list}/update`, (req, res) => {
				var that = this;
				
				axios
				.post(
					that.makeFullEndpoint(
						silosConfig.task,
						silosConfig.task.endpoints.list,
						"update"
					),
					{
						token: req.body.token,
						list: req.body.list
					}
				)
				.then(function(response) {
					res.json(response.data);
				})
				.catch(function(error) {
					res.send(that.makeError(error.message));
				});
			});
		
		this.router.delete(`/${silosConfig.task.endpoints.list}/delete`, (req, res) => {
				var that = this;
				
				axios
				.post(
					that.makeFullEndpoint(
						silosConfig.task,
						silosConfig.task.endpoints.list,
						"delete"
					),
					{
						token: req.body.token,
						list: req.body.list
					}
				)
				.then(function(response) {
					res.json(response.data);
				})
				.catch(function(error) {
					res.send(that.makeError(error.message));
				});
			});

        // Video
        this.router.get(`/${silosConfig.video.endpoints.video}/search`, (req, res) => {
            var that = this;

            axios
                .get(
                    that.makeFullEndpoint(
                        silosConfig.video,
                        silosConfig.video.endpoints.video,
                        "search"
                    ),
                    {
                        params: {
                            token: req.body.token,
							slug: req.query.slug
                        }
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.get(`/${silosConfig.video.endpoints.video}/get`, (req, res) => {
            var that = this;

            axios
                .get(
                    that.makeFullEndpoint(
                        silosConfig.video,
                        silosConfig.video.endpoints.video,
                        "get"
                    ),
                    {
                        params: {
                            token: req.body.token,
                            id: req.query.id,
							brand: req.query.brand
                        }
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.get(`/${silosConfig.video.endpoints.video}/all`, (req, res) => {
            var that = this;

            axios
                .get(
                    that.makeFullEndpoint(
                        silosConfig.video,
                        silosConfig.video.endpoints.video,
                        "all"
                    ),
                    {
                        params: {
                            token: req.body.token,
                            idPlaylist: req.query.idPlaylist
                        }
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.post(`/${silosConfig.video.endpoints.video}/add`, (req, res) => {
            var that = this;

            axios
                .post(
                    that.makeFullEndpoint(
                        silosConfig.video,
                        silosConfig.video.endpoints.video,
                        "add"
                    ),
                    {
                        video: req.body.video,
                        token: req.body.token,
                        idPlaylist : req.body.idPlaylist
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.post(`/${silosConfig.video.endpoints.video}/delete`, (req, res) => {
            var that = this;

            axios
                .post(
                    that.makeFullEndpoint(
                        silosConfig.video,
                        silosConfig.video.endpoints.video,
                        "delete"
                    ),
                    {
                        video: req.body.video,
                        token: req.body.token
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        // Playlist
        this.router.post(`/${silosConfig.video.endpoints.playlist}/add`, (req, res) => {
            var that = this;

            axios
                .post(
                    that.makeFullEndpoint(
                        silosConfig.video,
                        silosConfig.video.endpoints.playlist,
                        "add"
                    ),
                    {
                        playlist: req.body.playlist,
                        token: req.body.token
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.get(`/${silosConfig.video.endpoints.playlist}/all`, (req, res) => {
            var that = this;

            axios
                .get(
                    that.makeFullEndpoint(
                        silosConfig.video,
                        silosConfig.video.endpoints.playlist,
                        "all"
                    ),
                    {
                        params: {
                            token: req.body.token
                        }
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.get(`/${silosConfig.video.endpoints.playlist}/get`, (req, res) => {
            var that = this;

            axios
                .get(
                    that.makeFullEndpoint(
                        silosConfig.video,
                        silosConfig.video.endpoints.playlist,
                        "get"
                    ),
                    {
                        params: {
                            idPlaylist: req.query.idPlaylist,
                            token: req.body.token
                        }
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.put(`/${silosConfig.video.endpoints.playlist}/update`, (req, res) => {
            var that = this;

            axios
                .post(
                    that.makeFullEndpoint(
                        silosConfig.video,
                        silosConfig.video.endpoints.playlist,
                        "update"
                    ),
                    {
                        token: req.body.token,
                        playlist: req.body.playlist
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.delete(`/${silosConfig.video.endpoints.playlist}/delete`, (req, res) => {
            var that = this;

            axios
                .post(
                    that.makeFullEndpoint(
                        silosConfig.video,
                        silosConfig.video.endpoints.playlist,
                        "delete"
                    ),
                    {
                        token: req.body.token,
                        playlist: req.body.playlist
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        // Historique
        this.router.post(`/${silosConfig.historique.endpoints.historique}/add`, (req, res) => {
            var that = this;

            axios
                .post(
                    that.makeFullEndpoint(
                        silosConfig.historique,
                        silosConfig.historique.endpoints.historique,
                        "add"
                    ),
                    {
                        historique: req.body.historique,
                        token: req.body.token
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.get(`/${silosConfig.historique.endpoints.historique}/all`, (req, res) => {
            var that = this;

            axios
                .get(
                    that.makeFullEndpoint(
                        silosConfig.historique,
                        silosConfig.historique.endpoints.historique,
                        "all"
                    ),
                    {
                        params: {
                            token: req.body.token,
                            during: req.body.during || null
                        }
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.get(`/${silosConfig.historique.endpoints.historique}/allOfUser`, (req, res) => {
            var that = this;

            axios
                .get(
                    that.makeFullEndpoint(
                        silosConfig.historique,
                        silosConfig.historique.endpoints.historique,
                        "allOfUser"
                    ),
                    {
                        params: {
                            token: req.body.token,
                            id: req.query.id,
							during: req.query.during || null
                        }
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.get(`/${silosConfig.historique.endpoints.historique}/get`, (req, res) => {
            var that = this;

            axios
                .get(
                    that.makeFullEndpoint(
                        silosConfig.historique,
                        silosConfig.historique.endpoints.historique,
                        "get"
                    ),
                    {
                        params: {
                            idHistorique: req.query.idHistorique,
                            token: req.body.token
                        }
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.put(`/${silosConfig.historique.endpoints.historique}/update`, (req, res) => {
            var that = this;

            axios
                .post(
                    that.makeFullEndpoint(
                        silosConfig.historique,
                        silosConfig.historique.endpoints.historique,
                        "update"
                    ),
                    {
                        token: req.body.token,
                        historique: req.body.historique
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.delete(`/${silosConfig.historique.endpoints.historique}/delete`, (req, res) => {
            var that = this;

            axios
                .post(
                    that.makeFullEndpoint(
                        silosConfig.historique,
                        silosConfig.historique.endpoints.historique,
                        "delete"
                    ),
                    {
                        token: req.body.token,
                        historique: req.body.historique
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        //USER
        this.router.get(`/${silosConfig.user.endpoints.admin}/all`, (req, res) => {
            var that = this;

            axios
                .get(
                    that.makeFullEndpoint(
                        silosConfig.user,
                        silosConfig.user.endpoints.admin,
                        "all"
                    ),
                    {
                        params: {
                            token: req.body.token,
                        }
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.get(`/${silosConfig.user.endpoints.admin}/get`, (req, res) => {
            var that = this;

            axios
                .get(
                    that.makeFullEndpoint(
                        silosConfig.user,
                        silosConfig.user.endpoints.admin,
                        "get"
                    ),
                    {
                        params: {
                            token: req.body.token,
							id : req.query.id
                        }
                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.post(`/${silosConfig.user.endpoints.admin}/register`, (req, res) => {
            var that = this;


            axios
                .post(
                    that.makeFullEndpoint(
                        silosConfig.user,
                        silosConfig.user.endpoints.admin,
                        "register"
                    ),
                    {
						token: req.body.token,
						email : req.body.email,
						password: req.body.password,
						type: req.body.type,
						state: req.body.state

                    }
                )
				.then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });

        this.router.post(`/${silosConfig.user.endpoints.admin}/update`, (req, res) => {
            var that = this;

            axios
                .post(
                    that.makeFullEndpoint(
                        silosConfig.user,
                        silosConfig.user.endpoints.admin,
                        "update"
                    ),
                    {
                    	token: req.body.token,
						id : req.body.id,
						valuesToUpdate : req.body.valuesToUpdate

                    }
                )
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.send(that.makeError(error.message));
                });
        });




	}
	
	makeFullEndpoint(silo, name, endpoint) {
		const fullEndpoint = `http://${silo.host}:${silo.port}/${name}/${endpoint}`;
		console.log(`Making endpoint: ${fullEndpoint}`);
		return fullEndpoint;
	}
	
	makeError(errors) {
		return {
			success: false,
			error: errors
		};
	}
	
	makeSuccess(data) {
		return {
			success: true,
			data: data
		};
	}
}

module.exports = API;