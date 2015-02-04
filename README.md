# Spider Web
Service Discovery for Marathon. This project is based on the haproxy-marathon-bridge script deployed with Marathon. The goal of this project is to provide a GUI to customize the configuration of haproxy. Spiderweb is designed to run inside a docker container but can also be run as just a normal node application.

# SpiderWeb Installation
Assuming that you already have marathon install all you need to do is add a new application using the configuration file shown below and then install the haproxy script.

```json
{
	"id": "/spiderweb",
	"env": {
		"MARATHON_HOST": "192.168.2.96",
		"MARATHON_PORT": 8080,
		"ZOOKEEPER_CONNECT": "192.168.2.96:2181",
		"BINDING_PORT": 8081
	},
	"instances": 1,
	"cpus": 0.1,
	"mem": 64,
	"uris": [],
	"container": {
		"type": "DOCKER",
		"docker": {
			"image": "sbrnetmarketing/spiderweb",
			"network": "BRIDGE",
			"portMappings": [{
				"containerPort": 8081,
				"hostPort": 0,
				"servicePort": 8081
			}]
		}
	}
}
```
