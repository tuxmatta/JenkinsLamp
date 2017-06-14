var config = require('./config.json');
var async = require("async");
const util = require('util');
const https = require('https');

var delay = 30000;
var Lamp = require("./pcLamp.js");
//var Lamp = require("./raspberryPiLamp.js");

var LampState = {
    ON: 1,
    OFF: 2,
    BLINK: 3
};

function LampData() {
    var red, orange, green;
    this.red = LampState.OFF;
    this.orange = LampState.OFF;
    this.green = LampState.OFF;
}

function JenkinsLamp() {
    var jenkinsData, lampState;

    // initialize data
    this.jenkinsData = {};
    this.lampData = new LampData();

    // initialize Lamp
    this.Lamp = new Lamp();
    this.Lamp.startup();

    this.initShutdown();
};

JenkinsLamp.prototype.info = function() {
    console.log('This is the JenkinsLamp!');
};

JenkinsLamp.prototype.initShutdown = function() {
    // initialize the shutdown process
    let Lamp = this.Lamp;
    process.on('SIGINT', function() {
        console.log('');
        Lamp.shutdown();
        console.log('Bye, bye!');
        process.exit();
    });
};

JenkinsLamp.prototype.callJenkins = function() {
    let options = {
        host: config.jenkins.host,
        port: config.jenkins.port,
        path: config.jenkins.path,
        headers: {
            'Authorization': 'Basic ' + new Buffer(config.jenkins.user + ':' + config.jenkins.password).toString('base64')
        }
    };
    https.get(options, (res) => {
        res.on('data', (d) => {
            let jsonData = JSON.parse(d);
            //console.log(JSON.stringify(jsonData));
            if (jsonData && jsonData.jobs) {
                for (let jobIndex in jsonData.jobs) {
                    let job = jsonData.jobs[jobIndex];
                    let state = this.colorify(job.color);
                    console.log(job.name + ' : ' + state);
                }
            }
            this.saveJenkinsData(jsonData);
        });

    }).on('error', (e) => {
        console.error(e);
    });
}

JenkinsLamp.prototype.colorify = function(color, text=color) {
    if(color.startsWith('red'))
        return '\x1b[31m' + text + '\x1b[0m';
    if(color.startsWith('yellow'))
        return '\x1b[33m' + text + '\x1b[0m';
    if(color.startsWith('blue'))
        return '\x1b[34m' + text + '\x1b[0m';
    return text;
}

JenkinsLamp.prototype.saveJenkinsData = function(jenkinsData) {
    // TODO: validate jenkinsData before saveJenkinsData
    this.jenkinsData = jenkinsData;
    //console.log(jenkinsData);
    this.processJenkinsData();
}

JenkinsLamp.prototype.processJenkinsData = function() {
    if (this.jenkinsData && this.jenkinsData.jobs) {
        let jobs = this.jenkinsData.jobs.filter(function(job) {
            return config.jenkins.ignore.indexOf(job.name) == -1;
        });

        // disable all lamps
        this.lampData.red = LampState.OFF;
        this.lampData.orange = LampState.OFF;
        this.lampData.green = LampState.OFF;

        // red lamp is on, if one of the jobs has a red or red_anime state
        if (this.hasJobWithColor(jobs, 'red')) {
            this.lampData.red = LampState.ON;
        }

        // orange lamp is on, if one of the jobs has a _anime state,
        // or one jobs has yellow state and nobody has red state
        if (this.hasAnimeJob(jobs) ||
            this.hasJobWithColor(jobs, 'yellow') && (!this.hasJobWithColor(jobs, 'red'))) {
            this.lampData.orange = LampState.ON;
        }

        // green lamp is on, if all jobs has a green or green_anime state
        if (!this.hasJobWithColor(jobs, 'red') && !this.hasJobWithColor(jobs, 'yellow')) {
            this.lampData.green = LampState.ON;
        }

        this.updateLamp();
    }
}

JenkinsLamp.prototype.hasJobWithColor = function(jobs, color) {
    for (let job of jobs) {
        if (job.color.startsWith(color)) {
            return true;
        }
    }
}

JenkinsLamp.prototype.hasAnimeJob = function(jobs) {
    for (let job of jobs) {
        if (job.color.endsWith('_anime')) {
            return true;
        }
    }
}

JenkinsLamp.prototype.updateLamp = function() {
    // red lamp
    if (this.lampData.red === LampState.ON) {
        this.Lamp.enableRed();
    } else {
        this.Lamp.disableRed();
    }

    // orange lamp
    if (this.lampData.orange === LampState.ON) {
        this.Lamp.enableOrange();
    } else {
        this.Lamp.disableOrange();
    }

    // green lamp
    if (this.lampData.green === LampState.ON) {
        this.Lamp.enableGreen();
    } else {
        this.Lamp.disableGreen();
    }
}

JenkinsLamp.prototype.work = function() {
    let self = this;
    async.forever(

        function(next) {
            self.callJenkins();

            setTimeout(function() {
                next();
            }, delay)
        },
        function(err) {
            console.error(err);
        }
    );
};

// start jenkins Lamp
var jenkinsLamp = new JenkinsLamp();
jenkinsLamp.work();
