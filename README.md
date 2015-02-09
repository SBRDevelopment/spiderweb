# Spider Web
Service Discovery for Marathon. This project is based on the haproxy-marathon-bridge script deployed with Marathon. The goal of this project is to provide a GUI to customize the configuration of haproxy. Spiderweb is designed to run inside a docker container but can also be run as just a normal node application.

# SpiderWeb Installation
Assuming that you already have marathon install all you need to do is add a new application using the configuration file shown below and then install the haproxy script.

All you need to do is replace the `MARATHON_HOST` and `ZOOKEEPER_CONNECT` environmental variables to the correct host name and configuration for your installation of marathon and then add the application. If there any any conflicts you may also need to replace the `hostPort` configured in the portMappings. You can leave the `hostPort` set to 0 if you choose to do so but then you will need to find the correct port that spiderweb is running on in order to install the script.

```json
{
	"id": "/spiderweb",
	"env": {
		"MARATHON_HOST": "127.0.0.1",
		"MARATHON_PORT": "8080",
		"ZOOKEEPER_CONNECT": "127.0.0.1:2181",
		"BINDING_PORT": "8081"
	},
	"instances": 1,
	"cpus": 0.2,
	"mem": 256,
	"uris": [],
	"container": {
		"type": "DOCKER",
		"docker": {
			"image": "sbrnetmarketing/spiderweb",
			"network": "BRIDGE",
			"portMappings": [{
				"containerPort": 8081,
				"hostPort": 32000,
				"servicePort": 8081
			}]
		}
	},
	"constraints": [["hostname", "UNIQUE"]],
	"healthChecks": [{
      		"protocol": "HTTP",
      		"portIndex": 0,
      		"path": "/",
      		"gracePeriodSeconds": 5,
      		"intervalSeconds": 20,
      		"maxConsecutiveFailures": 3
	}]
}
```

If you don't want to run it in marathon you can also optionally run it manually in docker by running the command below. Again be sure to change the env variables `MARATHON_HOST` and `ZOOKEEPER_CONNECT`.

```
docker run -d -e MARATHON_HOST=127.0.0.1 -e ZOOKEEPER_CONNECT=127.0.0.1:2181 -p 32000:8081 sbrnetmarketing/spiderweb
```

Once you add the application then install the cronjob to update haproxy. Assuming that `32000` is the port that was selected for the `hostPort` in the previous step.

```bash
curl -s http://localhost:32000/install-crontab.sh | bash /dev/stdin install_cronjob http://localhost:32000
```

Now you can either restart haproxy or wait 1 minute and it will restart with the new configuration.

```bash
service haproxy restart
```

To test that spiderweb is properly installed please visit the following URL `http://localhost:8081`.
