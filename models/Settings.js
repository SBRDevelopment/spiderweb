var Config = require('../config')
var RestClient = require('node-rest-client').Client
var Backbone = require('backbone')
Backbone.$ = require('jquery')

var SettingsUri = 'api/v1.0/setting'
var Setting = Backbone.Model.extend({})
var Settings = Backbone.Collection.extend({
	model: Setting,
	url: SettingsUri
})

Settings.getSettings = function(appId, callback) {
	new RestClient().get(Config.api.host + '/' + SettingsUri + '/' + encodeURIComponent(appId), function(data, response) {
		callback(JSON.parse(data));	
	})
}
Settings.getAllSettings = function(callback) {
	new RestClient().get(Config.api.host + '/' + SettingsUri, function(data, response) {
		callback(JSON.parse(data));	
	})
}

module.exports = Settings;