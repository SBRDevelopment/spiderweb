var zookeeper = include('zookeeper')
var async = require('async')

module.exports = function(app, state) {

	var getSettings = function(appId, failure, success) {
		state.zk.connect(function(err) {
			if(err) {
				failure(error)
			}
			state.zk._get_children(zookeeper.getSettingPath(appId), failure, success, 
				function(id, data, stat) {
					return {
						id: id, 
						data: JSON.parse(data), 
						version: stat.version, 
						mtime: stat.mtime
					}
				}
			)
		})
	}

	var setSetting = function(appId, id, data, failure, success) {
		state.zk.connect(function(err) {
			if(err) {
				failure(err)
			}
			state.zk._set(zookeeper.getSettingPath(appId, id), JSON.stringify(data), failure, success)
		})
	}

	var getAllSettings = function(failure, success) {
		var _this = this
		state.zk.connect(function(err) {
			if(err) {
				failure(error)
			}
			state.zk._get_children_paths(zookeeper.getAppsPath(), failure,
				function(apps) {
					var settings = {}
					async.each(apps, 
						function(app, callback) {
							getSettings(app, callback, function(data) {
								settings[app] = data
								callback()
							})
						},
						function(err) {
							if(err) {
								failure(err)
							} else {
								success(settings)
							}
						}
					)
				}
			)
		})
	}

	var exports = {}
	exports.viewSettings = function(req, res) {
		getSettings(req.params.appId,
			function(err) {
				state.log.error("Could not read settings %s", err)
				res.status(500)
				res.json({
					message: 'Zookeeper Error',
					error: err
				})
			},
			function(data) {
				res.json(data)
			}
		)
	}
	exports.viewAllSettings = function(req, res) {
		getAllSettings(
			function(err) {
				state.log.error("Could not read settings %s", err)
				res.status(500)
				res.json({
					message: 'Zookeeper Error',
					error: err
				})
			},
			function(data) {
				res.json(data)
			}
		)
	}
	exports.updateSetting = function(req, res) {
		setSetting(req.params.appId, req.params.id, req.body.data,
			function(err) {
				state.log.error("Could not save settings %s", err)
				res.status(500)
				res.json({
					message: 'Zookeeper Error',
					error: err
				})
			},
			function(stat) {
				res.json({
					id: req.params.id,
					version: stat.version,
					mtime: stat.mtime,
					data: req.body.data,
				})
			}
		)
	}

	return exports
}