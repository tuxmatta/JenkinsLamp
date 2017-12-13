# JenkinsLamp

A lamp for display the states of the jenkins jobs in the console and also with a real traffic light connected on raspberry pi.

## Getting Started

These instructions will get you a copy of the project up and running on your local unix based machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You need node.js in version 8 or higher and a JavaScript package manager like [yarn](https://github.com/yarnpkg/yarn) or [npm](https://www.npmjs.com/).

```
node -v
```

For the real traffic light, you use a raspberry pi with three lamps.

### Installing for console only

Checkout this repository and call the package manager for get the needed JavaScript libraries.

```
yarn install
or
npm install
```


### Installing with real traffic light

You will also prepare the raspberry pi for use the GPIO connectors from node.js. Install the following python packages from rasbian repository:

```
apt-get python-dev python-rpi.gpio
```

For manual testing the GPIO connectors from raspberry pi you can use the  [WiringPi Tool](http://wiringpi.com/).

## Configuration

Rename the config.json.sample file to config.json. Change the  host, port, user, password in the first section. If you use the JenkinsLamp on a raspberry pi then change the useLibrary to `raspberryPiLamp.js`.

```
"jenkins": {
  "host": "host from jenkins",
  "port": host from jenkins,
  "path": "/api/json?tree=jobs[name,color]",
  "pathNova": "/job/s16-backend-nova/api/json?tree=activeConfigurations[name,color,url]",
  "user": "the user",
  "password": "the password",
  "useLibrary": "pcLamp.js",
  "delay": 60000
}
```

Any lamp sections are a traffic light in the console.

```
{
  "id": "dev. job",
  "name": "develop  multibranch job",
  "enabled" : true,
  "job" : {
    "type" : "color",
    "path": "/job/s16/job/s16-multibranch-pipeline/job/develop/api/json?tree=name,color",
    "ignore": [],
    "colorJsonPath": "color"
  }
```

## Running the tests

Currently there are no tests available

## Start

Start the JenkinsLamp with:

```
node jenkinsLamp
```

## Authors

* **Jonas schmid** - *Initial work* - [tuxmatta](https://github.com/tuxmatta)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
