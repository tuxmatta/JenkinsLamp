/********************************************************************
 * The model.
 *******************************************************************/

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

// export the class
module.exports.LampData = LampData;
