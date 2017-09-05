/********************************************************************
 * The model.
 *******************************************************************/

 var JenkinsState = {
     OK: 1,
     FAIL: 2,
     OK_AND_BUILD: 3,
     FAIL_AND_BUILD: 4
 };

var LampState = {
    ON: 1,
    OFF: 2,
    BLINK: 3
};

var JobState = {
   COLOR: 'color',
   CONDITION: 'condition'
};

function Job() {
  this.type = 'color';
  this.path = null;
  this.ignore = [];
  this.colorJsonPath = '';
}

function LampData() {
    var id, type, name, path, ignore, colorJsonPath,
    red, orange, green;
    this.id = '?';
    this.name = 'undefined';
    this.enabled = true;
    this.job = null;

    this.red = LampState.OFF;
    this.orange = LampState.OFF;
    this.green = LampState.OFF;
}

// export the class
module.exports.JenkinsState = JenkinsState;
module.exports.LampState = LampState;
module.exports.LampData = LampData;
module.exports.JobState = JobState;
module.exports.Job = Job;
