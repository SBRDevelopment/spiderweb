var zookeeper = include('zookeeper')
var tasks = require('../models/marathon/Tasks')
var settings = require('../models/Settings')
var _ = require('underscore')
var ejs = require('ejs')

module.exports = function(app, state) {

	var getConfig = function(appId, failure, success) {
		state.zk.connect(function(err) {
			if(err) {
				failure(error)
			}
			state.zk._get(zookeeper.getTemplatePath(appId), failure, success)
		})
	}

	var setConfig = function(appId, data, failure, success) {
		state.zk.connect(function(err) {
			if(err) {
				failure(error)
			}
			state.zk._set(zookeeper.getTemplatePath(appId), data, failure, success)
		})
	}

	var mergeSettings = function(tasks, settings) {
		return _.map(tasks, function(task) {
			if(settings.hasOwnProperty(task.id)) {
				_.each(settings[task.id], function(setting) {
					task.settings[setting.id] = setting.data
				})
			}
			return task
		})
	}

	var render = function(appId, failure, success) {
		getConfig(appId,
			function(err) {
				failure(err)
			},
			function(data, stat) {
				settings.getAllSettings(function(settings) {
					tasks.getTasks(function(tasks) {
						tasks = mergeSettings(tasks, settings)
						template = ejs.compile(data)
						config = template({tasks: tasks, settings: settings})
						setConfig('haproxy', config, failure, success)
					})
				})
			}
		)
	}

	var exports = {}
	exports.viewTemplate = function(req, res) {
		getConfig(req.params.appId,
			function(err) {
				state.log.error("Could not read config %s", err)
				res.status(500)
				res.json({
					message: 'Zookeeper Error',
					error: err
				})
			},
			function(data, stat) {
				res.json({
					id: req.params.appId,
					version: stat.version,
					mtime: stat.mtime,
					data: data,
				})
			}
		)
	}
	exports.renderTemplate = function(req, res) {
		render(req.params.appId, 
			function(err) {
				state.log.error("Could not render config %s", err)
				res.status(500)
				res.json({
					message: 'Zookeeper Error',
					error: err
				})
			},
			function(stat) {
				getConfig('haproxy',
					function(err) {
						state.log.error("Could not read config %s", err)
						res.status(500)
						res.json({
							message: 'Zookeeper Error',
							error: err
						})
					},
					function(data, stat2) {
						res.json({
							id: req.params.appId,
							version: stat2.version,
							mtime: stat2.mtime,
							data: data,
						})
					}
				)
			}
		)
	}
	exports.renderTemplateText = function(req, res) {
		render(req.params.appId, 
			function(err) {
				state.log.error("Could not render config %s", err)
				res.status(500)
				res.send('Zookeeper Error ' + err)
			},
			function(stat) {
				getConfig('haproxy',
					function(err) {
						state.log.error("Could not read config %s", err)
						res.status(500)
						res.send('Zookeeper Error ' + err)
					},
					function(data, stat2) {
						res.send(data)
					}
				)
			}
		)
	}
	exports.updateTemplate = function(req, res) {
		setConfig(req.body.id, req.body.data,
			function(err) {
				state.log.error("Could not update config %s", err)
				res.status(500)
				res.json({
					message: 'Zookeeper Error',
					error: err
				})
			},
			function(stat) {
				res.json({
					id: req.body.id,
					version: stat.version,
					mtime: stat.mtime
				})	
			}
		)
	}

	return exports
}