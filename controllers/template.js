var zookeeper = include('zookeeper')
var tasks = require('../models/marathon/Tasks')
var settings = require('../models/Settings')
var _ = require('underscore')
var ejs = require('ejs')
var async = require('async')

module.exports = function(app, state) {

	var mergeSettings = function(tasks, settings) {
		return _.map(tasks, function(task) {
			if(settings.hasOwnProperty(task.id)) {
				_.each(settings[task.id], function(setting) {
					task.settings[setting.id] = setting.data.split(/\n/)
				})
			}
			return task
		})
	}
	
	var getModels = function(failure, success) {
		async.parallel({
			settings: function(cb) {
				setTimeout(function() {
					settings.getAllSettings(cb)
				}, 500)
		  	},
			tasks: function(cb) {
				setTimeout(function() {
					tasks.getTasks(cb)  
				}, 500)
			}
		}, function(err, results) {
			if(err) {
				failure(err)
				return;
			}
			success(results)
		})
	}

	var render = function(zk, appId, models, failure, success) {
		zk.get(zookeeper.getTemplatePath(appId), failure,
			function(data, stat) {
				var tasks = mergeSettings(models.tasks, models.settings)
				var template = ejs.compile(data)
				var config = template({tasks: tasks, settings: models.settings})
				zk.set(zookeeper.getTemplatePath('haproxy'), config, failure, success)
			}
		)
	}

	var exports = {}
	exports.viewTemplate = function(req, res) {
		zk = zookeeper.createClient()
		zk.client.once('connected', function() {
			zk.get(zookeeper.getTemplatePath(req.params.appId),
				function(err) {
					zk.client.close()
					state.log.error(err.stack)
					res.status(500)
					res.json({
						message: 'Zookeeper Error',
						error: err
					})
				},
				function(data, stat) {
					zk.client.close()
					res.json({
						id: req.params.appId,
						version: stat.version,
						mtime: stat.mtime,
						data: data,
					})
				}
			)
		})
		zk.client.connect()
	}
	exports.renderTemplate = function(req, res) {
		getModels(function(err) {
				state.log.error(err)
				res.status(500)
				res.json({
					message: 'Unexpected Error',
					error: err
				})
			},
			function(models) {
				zk = zookeeper.createClient()
				zk.client.once('connected', function() {
					render(zk, req.params.appId, models,
						function(err) {
							zk.client.close()
							state.log.error(err.stack)
							res.status(500)
							res.json({
								message: 'Zookeeper Error',
								error: err
							})
						},
						function(stat) {
							zk.get(zookeeper.getTemplatePath('haproxy'),
								function(err) {
									zk.client.close()
									state.log.error(err.stack)
									res.status(500)
									res.json({
										message: 'Zookeeper Error',
										error: err
									})
								},
								function(data, stat2) {
									zk.client.close()
									if(req.params.ext == ".txt") {
										res.send(data)
									} else {
										res.json({
											id: req.params.appId,
											version: stat2.version,
											mtime: stat2.mtime,
											data: data,
										})
									}
								}
							)
						}
					)
				})
				zk.client.connect()
			}
		)
		
	}
	exports.updateTemplate = function(req, res) {
		zk = zookeeper.createClient()
		zk.client.once('connected', function() {
			zk.set(zookeeper.getTemplatePath(req.body.id), req.body.data,
				function(err) {
					zk.client.close()
					state.log.error("Could not update config %s", err)
					res.status(500)
					res.json({
						message: 'Zookeeper Error',
						error: err
					})
				},
				function(stat) {
					zk.client.close()
					res.json({
						id: req.body.id,
						version: stat.version,
						mtime: stat.mtime
					})	
				}
			)
		})
		zk.client.connect()
	}

	return exports
}