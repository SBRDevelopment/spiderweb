var JSX = require('node-jsx').install();
var React = require('react');
var SpiderWebApp = include('components/SpiderWebApp.react');

var Tasks = include('models/marathon/Tasks.js');
var Template = include('models/Template.js');
var async = require('async')

module.exports = function(app, state) {
  var exports = {}

  var getModels = function(failure, success) {
    async.parallel({
      tasks: function(cb) {
        setTimeout(function() {
          Tasks.getTasks(cb)
        }, 500)
      },
      template: function(cb) {
        setTimeout(function() {
          Template.getTemplate('default', cb)  
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

  exports.viewIndex = function(req, res) {
    // Get marathon applications
    getModels(function(err) {
        state.log.error(err)
        res.status(500)
        res.json({
          message: 'Unexpected Error',
          error: err
        })
      },
      function(models) {
        var markup = React.renderComponentToString(
          SpiderWebApp(models)
        );
        res.render('apps', {
          markup: markup,
          state: JSON.stringify(models)
        });
    })
  }

  return exports

}