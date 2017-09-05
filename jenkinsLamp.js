var config = require('./config.json');
var async = require("async");
var clear = require('clear');
const util = require('util');
const https = require('https');
const jp = require('jsonpath');
const tfunk = require("tfunk");
const pad = require("pad");

const JenkinsState = require('./model.js').JenkinsState;
const LampState = require('./model.js').LampState;
const JobState = require('./model.js').JobState;

// config data and lamp status
const LampData = require('./model.js').LampData;
const Job = require('./model.js').Job;

clear();

// config
var delay = getConfigValue(config.jenkins.delay, 60000)
var useLibrary = getConfigValue(config.jenkins.useLibrary, "pcLamp.js")
console.log('=> delay is ' + delay + 'ms');
console.log('=> use the output library: ' + useLibrary);

// select library
var Lamp = require("./" + useLibrary);


function getConfigValue(value, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  };
  return value;
}

function JenkinsLamp() {
  var jenkinsData,
    lampState,
    firstLoop,
    lampList; // list of lamps, one lamp is a group of green, orange and red

  // initialize data
  this.jenkinsData = {};
  this.lampData = new LampData();
  this.firstLoop = true;
  this.lampList = new Array();

  for (lamp of config.lamps) {
    this.lampList.push(this.initLamp(lamp));
  }

  // initialize Lamp
  this.Lamp = new Lamp();
  this.Lamp.startup();

  this.initShutdown();
};

JenkinsLamp.prototype.test = function(value) {
  console.log('from test function: ' + value);
};

JenkinsLamp.prototype.initLamp = function(lampConfig) {
  let lampData = new LampData();
  lampData.id = lampConfig.id;
  lampData.name = lampConfig.name;
  lampData.enabled = lampConfig.enabled;
  lampData.job = new Job();

  lampData.job.type = lampConfig.job.type;
  lampData.job.path = lampConfig.job.path;
  lampData.job.ignore = lampConfig.job.ignore;
  lampData.job.colorJsonPath = lampConfig.job.colorJsonPath;

  console.log('Initialize the lamp: ' + lampConfig.name);
  return lampData;
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

JenkinsLamp.prototype.work = function() {
  let self = this;

  async.forever(
    function(next) {
      if (self.firstLoop) {
        self.firstLoop = false;
      } else {
        clear();
      }

      async.each(self.lampList.filter(function(lamp){
        return lamp.enabled;
      }), self.callJenkins, function(err) {
        // if any of the file processing produced an error, err would equal that error
        if (err) {
          // One of the iterations produced an error.
          // All processing will now stop.
          console.log('A file failed to process');
        } else {
          console.log('All files have been processed successfully');

          self.displayLamps(self.lampList);
          self.displayOutput(self.lampList);
        }
      });
      setTimeout(function() {
        next();
      }, delay);
    },
    function(err) {
      console.error(err);
    }
  );
};

JenkinsLamp.prototype.displayLamps = function(lampList) {
  for (lamp of lampList) {
    if (lamp.id === 'all Jobs') {

      lamp.red === LampState.ON ? this.Lamp.enableRed() : this.Lamp.disableRed();
      lamp.orange === LampState.ON ? this.Lamp.enableOrange() : this.Lamp.disableOrange();
      lamp.green === LampState.ON ? this.Lamp.enableGreen() : this.Lamp.disableGreen();
    }
  }
}
JenkinsLamp.prototype.displayOutput = function(lampList) {
  var lines = [];
  lines[0] = '';
  lines[1] = '';
  lines[2] = '';
  lines[3] = '';
  lines[4] = '';
  lines[5] = '';
  lines[6] = '';
  lines[7] = '';
  console.log('' + lines[0]);

  for (lamp of lampList) {
    let jobId = pad(lamp.id, 11, {"strip":true}) + ' ';
    if (lamp.red === LampState.ON) {
      lines[0] += '{bgRed:' + jobId + '}';
    } else if (lamp.red === LampState.ON) {
      lines[0] += '{bgOrange:' + jobId + '}';
    } else {
      lines[0] += jobId;
    }

    lines[1] += '    ˏ__ˎ    ';
    if (lamp.red === LampState.OFF) {
      lines[2] += '    |○ |    ';
    } else {
      lines[2] += '    {red:|◉ |}    ';
    }
    if (lamp.orange === LampState.OFF) {
      lines[3] += '    |○ |    ';
    } else {
      lines[3] += '    {yellow:|◉ |}    ';
    }
    if (lamp.green === LampState.OFF) {
      lines[4] += '    |○ |    ';
    } else {
      lines[4] += '    {green:|◉ |}    ';
    }
    lines[5] += '    \\ˉˉ/    ';
    lines[6] += '    ˏ⎞⎛ˎ    ';
  }

  console.log(tfunk(lines[0]));
  console.log(tfunk(lines[1]));
  console.log(tfunk(lines[2]));
  console.log(tfunk(lines[3]));
  console.log(tfunk(lines[4]));
  console.log(tfunk(lines[5]));
  console.log(tfunk(lines[6]));
}

JenkinsLamp.prototype.callJenkins = function(lamp, callback) {
  console.log('call: ' + config.jenkins.host + ':' + config.jenkins.port + lamp.job.path);
  let options = {
    host: config.jenkins.host,
    port: config.jenkins.port,
    path: lamp.job.path,
    headers: {
      'Authorization': 'Basic ' + new Buffer(config.jenkins.user + ':' + config.jenkins.password).toString('base64')
    }
  };
  https.get(options, (res) => {
    res.on('data', (d) => {
      //console.log(d.toString());
      let jsonData = JSON.parse(d);
      console.log('----------------------------');
      console.log('call ' + lamp.id + ' : "' + lamp.name + '"');
      let colorResults = jp.query(jsonData, lamp.job.colorJsonPath);

      colorResults = jenkinsLamp.filterJenkinsJobs(colorResults, lamp.job.ignore);

      for (colorResult of colorResults) {
        if (colorResult && colorResult.name) {
          console.log(tfunk(colorResult.name + ' : {' + colorResult.color + ':' + colorResult.color + '}'));
        } else {
          console.log(tfunk('{green:' + colorResults + '}'));
        }
      }

      switch (lamp.job.type) {
        case JobState.CONDITION:
          jenkinsLamp.updateJenkinsStateFromCondition(lamp, colorResults);
          break;
        default:
          jenkinsLamp.updateJenkinsStateFromColor(lamp, colorResults);
      }
      callback();
    }).on('error', (e) => {
      console.error(e);
      throw e;
    });
  });
};

JenkinsLamp.prototype.updateJenkinsStateFromCondition = function(lamp, colorResults) {
  // console.log('updateJenkinsStateFromCondition:');
  // console.log(colorResults);
  // disable all lamps
  lamp.red = LampState.OFF;
  lamp.orange = LampState.OFF;
  lamp.green = LampState.OFF;

  if (colorResults[0] && colorResults[0].indexOf('failed') >= 0) {
    lamp.red = LampState.ON;
  } else  {
    lamp.green = LampState.ON;
  }
};

JenkinsLamp.prototype.updateJenkinsStateFromColor = function(lamp, colorResults) {
  //console.log('updateJenkinsStateFromColor');
  //console.log(colorResults);

  // disable all lamps
  lamp.red = LampState.OFF;
  lamp.orange = LampState.OFF;
  lamp.green = LampState.OFF;

  //console.log('************************');
  //console.log(colorResults);

  // red lamp is on, if one of the jobs has a red or red_anime state
  for (colorResult of colorResults) {
    if (this.getColor(colorResult).startsWith('red')) {
      lamp.red = LampState.ON;
      break;
    }
  }

  // orange lamp is on, if one jobs has yellow state and nobody has red state
  if (lamp.red === LampState.OFF) {
    for (colorResult of colorResults) {
      if (colorResult.color && colorResult.color.startsWith('yellow')) {
        lamp.orange = LampState.ON;
        break;
      }
    }
  }

  // green lamp is on, if the other lamps are off
  if (lamp.red === LampState.OFF && lamp.orange === LampState.OFF) {
    lamp.green = LampState.ON;
  }

  // orange lamp is also on, if one of the jobs color ends with '_anime'
  for (colorResult of colorResults) {
    if (colorResult.color && colorResult.color.endsWith('_anime')) {
      lamp.orange = LampState.ON;
      break;
    }
  }
}

JenkinsLamp.prototype.getColor = function(colorResult) {
  if (typeof colorResult === 'string') {
    return colorResult;
  }
  return colorResult.color;
}

JenkinsLamp.prototype.filterJenkinsJobs = function(colorResults, ignores) {
  return colorResults.filter(function(colorResult){
    if(colorResult) {
      return !ignores.includes(colorResult.name);
    }
    return true;
  });
}

// start jenkins Lamp
var jenkinsLamp = new JenkinsLamp();
jenkinsLamp.work();
