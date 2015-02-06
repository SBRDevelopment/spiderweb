var zookeeper = include('zookeeper')
var async = require('async')

module.exports = function(app, state) {

	var getSettings = function(zk, appId, failure, success) {
		zk.get_children(zookeeper.getSettingPath(appId), failure, success, 
			function(id, data, stat) {
				return {
					id: id, 
					data: JSON.parse(data), 
					version: stat.version, 
					mtime: stat.mtime
				}
			}
		)
	}

	var setSetting = function(zk, appId, id, data, failure, success) {
		zk.set(zookeeper.getSettingPath(appId, id), JSON.stringify(data), failure, success)
	}

	var getAllSettings = function(zk, failure, success) {
		zk.get_children_paths(zookeeper.getAppsPath(), failure,
			function(apps) {
				var settings = {}
				async.each(apps, 
					function(app, callback) {
						getSettings(zk, app, callback, function(data) {
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
	}

	var exports = {}
	exports.viewSettings = function(req, res) {
		zk = zookeeper.createClient()
		zk.client.once('connected', function() {
			getSettings(zk, req.params.appId, function(err) {
					zk.client.close()
					state.log.error(err.stack)
					res.status(500)
					res.json({
						message: 'Zookeeper Error',
						error: err
					})
				},
				function(data) {
					zk.client.close()
					res.json(data)
				}
			)
		})
		zk.client.connect()
	}
	exports.viewAllSettings = function(req, res) {
		zk = zookeeper.createClient()
		zk.client.once('connected', function() {
			getAllSettings(zk, function(err) {
					zk.client.close()
					state.log.error(err.stack)
					res.status(500)
					res.json({
						message: 'Zookeeper Error',
						error: err
					})
				},
				function(data) {
					zk.client.close()
					res.json(data)
				}
			)
		})
		zk.client.connect()
	}
	exports.updateSetting = function(req, res) {
		zk = zookeeper.createClient()
		zk.client.once('connected', function() {
			setSetting(zk, req.params.appId, req.params.id, req.body.data, function(err) {
					zk.client.close()
					state.log.error(err.stack)
					res.status(500)
					res.json({
						message: 'Zookeeper Error',
						error: err
					})
				},
				function(stat) {
					zk.client.close()
					res.json({
						id: req.params.id,
						version: stat.version,
						mtime: stat.mtime,
						data: req.body.data,
					})
				}
			)
		})
		zk.client.connect()
	}

	return exports
}