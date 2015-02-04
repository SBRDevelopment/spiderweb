var fs = require('fs')
var zookeeper = require('zookeeper')
var async = require('async')

var getTemplatePath = function(appId) {
	return '/spiderweb/template/' + appId
}

var getAppsPath = function() {
	return '/spiderweb/apps'
}

var getSettingPath = function(appId, id) {
	return getAppsPath() + '/' + appId + '/.setting' + (id ? '/' + id : '')	
}

var getDefaultConfig = function(callback) {
	var path = require('path')
	fs.readFile(path.join(process.cwd(), 'views', 'haproxy.cfg'), 'utf8', function(err, data) {
		if(err) {
			callback('')
		} else {
			callback(data)
		}
	})
}

module.exports.init = function(app, state) {

	state.zk._exists = function(node, failure, success) {
		this.a_exists(node,
			function(type, _state, path) {
				state.log.info("_exists watch event %s", type)
			},
			function(rc, err, stat) {
				if(err == 'no node') {
					failure(null) // Node does not exist and must be created
				} else if(err != 'ok') {
					failure(err) // Checking for node state failed
				} else {
					success()
				}
			}
		)
	}

	state.zk._mkdir = function(node, failure, success) {
		this.mkdirp(node, function(err) {
			if(err) {
				failure(err)
			} else {
				success()
			}
		})
	}

	state.zk._set = function(node, content, failure, success) {
		_this = this
		this.a_get(node, 
			function(type, stat, path) {
				state.log.info("_get watch event %s", type)
			},
			function(rc, err, stat, data) {
				if(rc != 0) {
					if(rc == -101) {
						_this._mkdir(node, failure, function() {
							_this._set(node, content, failure, success)
						})
					} else {
						failure(err)
					}
				} else {
					_this.a_set(node, content, stat.version, function (rc, err, stat)  {
						if(rc != 0) {
							failure(err)
						} else {
							success(stat)
						}
					})
				}

			}
		)
	}

	state.zk._get = function(node, failure, success) {
		this.a_get(node, 
			function(type, stat, path) {
				state.log.info("_get watch event %s", type)
			},
			function(rc, err, stat, data) {
				if(rc != 0) {
					failure(err)
				} else {
					success(data.toString('utf8'), stat)
				}					
			}
		)
	}

	state.zk._get_children_paths = function(node, failure, success) {
		_this = this
		this.a_get_children(node, 
			function(type, stat, path) {
				state.log.info("_get_children_paths watch event %s", type)
			},
			function (rc, err, children) {
				if(rc != 0) {
					if(rc == -101) {
						_this._mkdir(node, failure, function() {
							_this._get_children_paths(node, failure, success)
						})
					} else {
						failure(err)
					}
				} else {
					success(children)
				}
			}
		)
	}

	state.zk._get_children = function(node, failure, success, eachitem) {
		_this = this
		this._get_children_paths(node, failure,
			function (children) {
				items = []
				async.each(children, 
					function(child, callback) {
						childPath = node + '/' + child
						_this._get(childPath, callback, function(data, stat) {
							items.push(eachitem(child, data, stat))
							callback()
						})
					},
					function(err) {
						if(err) {
							failure(err)
						} else {
							success(items)
						}
					}
				)
			}
		)
	}

	// Initialize zookeeper state for templates
	node = getTemplatePath('default')
	state.zk.connect(function(err) {
		if(err) {
			state.log.error("ZK Error: %s", err)
		} else {
			state.zk._exists(node, 
				function(err) {
					state.log.warn("Path does not exist %s", node)
					state.zk._mkdir(node,
						function(err) {
							state.log.error("Could not create path %s (%s)", node, err)
						}, 
						function() {
							state.log.info("Path was created %s", node)
							getDefaultConfig(function(data) {
								state.zk._set(node, data,
									function(err) {
										state.log.error("Data could not be updated for path %s (%s)", node, err)
									},
									function(data, stat) {
										state.log.info("Updated data for path %s", node)
									}
								)
							})
						}
					)
				},
				function() {
					state.log.info("Path exists %s", node)
				}
			)
		}
	})
}

module.exports.getTemplatePath = getTemplatePath
module.exports.getSettingPath = getSettingPath
module.exports.getAppsPath = getAppsPath
module.exports.getDefaultConfig = getDefaultConfig