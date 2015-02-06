var zookeeper = include('zookeeper')

module.exports.createDefaultTemplate = function(state) {
  // Initialize zookeeper state for templates
  var node = zookeeper.getTemplatePath('default')
  var zk = zookeeper.createClient()

  zk.client.once('connected', function () {
    zk.exists(node, 
      function(err) {
        zk.mkdir(node,
          function(err) {
            state.log.error("Could not create path %s (%s)", node, err)
            zk.client.close()
          }, 
          function() {
            zookeeper.getDefaultConfig(function(data) {
              zk.set(node, data,
                function(err) {
                  state.log.error("Data could not be updated for path %s (%s)", node, err)
                  zk.client.close()
                },
                function(data, stat) {
                  state.log.info("Updated data for path %s", node)
                  zk.client.close()
                }
              )
            })
          }
        )
      },
      function() {
        state.log.info("Path exists %s", node)
        zk.client.close()
      }
    )
  });

  zk.client.connect()
}