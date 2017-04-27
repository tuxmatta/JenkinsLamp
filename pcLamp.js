/********************************************************************
 * Lamp mock for the non raspberry pi compatible computers.
 *******************************************************************/
function Lamp() {
    var intervalRed, intervalOrange, intervalGreen,
        ledRed, ledOrange, ledGreen;
    console.log('Lamp constructor');
};

function Led(name, state) {
    var name, state;
    console.log('Led constructor (' + name + ', ' + state + ')');
    this.name = name;
    this.state = state;
};
Led.prototype.toString = function() {
    return 'Led:  name=' + this.name + ' state=' + this.state;
}
Led.prototype.info = function() {
    console.log('The led ' + this.name + ' has the state ' + this.state);
}
Led.prototype.disable = function() {
    this.state = 0;
}

Lamp.prototype.startup = function() {
    this.ledRed = new Led('red', 0);
    this.ledOrange = new Led('orange', 0);
    this.ledGreen = new Led('green', 0);
    console.log('pcLamp start');
};

Lamp.prototype.shutdown = function() {
    this.disableAll();
    console.log('pcLamp shutdown');
};

Lamp.prototype.enableRed = function() {
    enableLed(this.ledRed, this.intervalRed);
}

Lamp.prototype.enableOrange = function() {
    enableLed(this.ledOrange, this.intervalOrange);
}

Lamp.prototype.enableGreen = function() {
    enableLed(this.ledGreen, this.intervalGreen);
}

Lamp.prototype.blinkRed = function() {
    blinkLed(this.ledRed, this.intervalRed);
}

Lamp.prototype.blinkOrange = function() {
    blinkLed(this.ledOrange, this.intervalOrange);
}

Lamp.prototype.blinkGreen = function() {
    blinkLed(this.ledGreen, this.intervalGreen);
}

Lamp.prototype.disableRed = function() {
    disableLed(this.ledRed, this.intervalRed);
}

Lamp.prototype.disableOrange = function() {
    disableLed(this.ledOrange, this.intervalOrange);
}

Lamp.prototype.disableGreen = function() {
    disableLed(this.ledGreen, this.intervalGreen);
}

Lamp.prototype.disableAll = function() {
    console.log('disableAll');
    disableLed(this.ledRed, this.intervalRed);
    disableLed(this.ledOrange, this.intervalOrange);
    disableLed(this.ledGreen, this.intervalGreen);
}

function enableLed(led, interval) {
    clearInterval(interval);
    led.state = 1;
    console.log(' -> Enable led "' + led.name + '"');
}

function blinkLed(led, interval) {
    disableLed(led, interval);
    interval = setInterval(function() {
        var value = (led.state + 1) % 2;
        if (value == 0) {
            led.state = 0;
            console.log(' -> Disable led "' + led.name + '"');
        } else {
            led.state = 1;
            console.log(' -> Enable led "' + led.name + '"');
        }
    }, 2000);
}

function disableLed(led, interval) {
    clearInterval(interval);
    led.state = 0;
    console.log(' -> Disable led "' + led.name + '"');
}

// export the class
module.exports = Lamp;
