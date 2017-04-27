/********************************************************************
 * Library for control Lamp on the raspberry pi.
 *******************************************************************/
 //var express = require('express');
 var onoff = require('onoff');

function Lamp() {
    var intervalRed, intervalOrange, intervalGreen,
        ledRed, ledOrange, ledGreen
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
};
Led.prototype.info = function() {
    console.log('The led ' + this.name + ' has the state ' + this.state);
};
Led.prototype.disable = function() {
    this.state = 0;
};

Lamp.prototype.startup = function() {
    this.ledRed = new onoff.Gpio(27, 'out'), // pin13 = gpio 27
    this.ledOrange = new onoff.Gpio(18, 'out'), // pin12 = gpio 18
    this.ledGreen = new onoff.Gpio(17, 'out'); // pin11 = gpio 17
    console.log('raspberryPiLamp started');
};

Lamp.prototype.shutdown = function() {
    this.disableAll();
    this.ledRed.unexport();
    this.ledOrange.unexport();
    this.ledGreen.unexport();
    console.log('raspberryPiLamp shutdown');
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
    led.write(1, function() {
        console.log("Enable led " + led );
    });
}

function blinkLed(led, interval) {
    disableLed(led, interval);
    interval = setInterval(function() {
        var value = (led.readSync() + 1) % 2;
        led.write(value, function() {
        });
    }, 2000);
    console.log('Blink led ' + led);
}

function disableLed(led, interval) {
    clearInterval(interval);
    led.write(0, function() {
        console.log("Disable led " + led );
    });
}

// export the class
module.exports = Lamp;
