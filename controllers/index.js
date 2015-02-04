var JSX = require('node-jsx').install();
var React = require('react');
var SpiderWebApp = include('components/SpiderWebApp.react');

var Tasks = include('models/marathon/Tasks.js');
var Template = include('models/Template.js');

module.exports = function(app, state) {
  var exports = {}

  exports.viewIndex = function(req, res) {
    // Get marathon applications
    Tasks.getTasks(function(tasks) {
      Template.getTemplate('default', function(template) {
        var markup = React.renderComponentToString(
          SpiderWebApp({
            tasks: tasks,
            template: template
          })
        );
        res.render('apps', {
          markup: markup,
          state: JSON.stringify({
            tasks: tasks,
            template: template
          })
        });
      })
    });
  }

  return exports

}