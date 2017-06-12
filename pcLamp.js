/********************************************************************
 * Lamp mock for the non raspberry pi compatible computers.
 *******************************************************************/
function Lamp() {
    var intervalRed, intervalOrange, intervalGreen,
        ledRed, ledOrange, ledGreen;
};

function Led(name, state, color) {
    var name, state;
    this.name = name;
    this.state = state;
    this.color = color;
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
Led.prototype.printLed = function() {
    if(this.state === 0) {
        console.log(' ○');
    } else {
        console.log(this.color, '◉', '\x1b[0m');
    }
}

Lamp.prototype.startup = function() {
    this.ledRed = new Led('red', 0, '\x1b[31m');
    this.ledOrange = new Led('orange', 0, '\x1b[33m');
    this.ledGreen = new Led('green', 1, '\x1b[32m');
};
Lamp.prototype.shutdown = function() {
    this.disableAll();
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
    disableLed(this.ledRed, this.intervalRed);
    disableLed(this.ledOrange, this.intervalOrange);
    disableLed(this.ledGreen, this.intervalGreen);
}

function enableLed(led, interval) {
    clearInterval(interval);
    led.state = 1;
    led.printLed();
}

function blinkLed(led, interval) {
    disableLed(led, interval);
    interval = setInterval(function() {
        var value = (led.state + 1) % 2;
        if (value == 0) {
            led.state = 0;
        } else {
            led.state = 1;
        }
        led.printLed();
    }, 2000);
}

function disableLed(led, interval) {
    clearInterval(interval);
    led.state = 0;
    led.printLed();
}

// export the class
module.exports = Lamp;
