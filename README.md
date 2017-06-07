# JenkinsLamp
A build lamp for jenkins.

# Setup

## Package from rasbian repository

        apt-get vim git python-dev python-rpi.gpio npm

## Install WiringPi

http://raspberrypiguide.de/howtos/raspberry-pi-gpio-how-to/

## Install node

    wget https://nodejs.org/dist/latest-v6.x/node-v6.10.2-linux-armv6l.tar.gz
    sudo mv node-v6.10.2-linux-armv6l.tar.gz /opt
    cd /opt
    sudo tar -xzf node-v6.10.2-linux-armv6l.tar.gz
    sudo rm node-v6.10.2-linux-armv6l.tar.gz
    sudo mv node-v6.10.2-linux-armv6l nodejs
    sudo ln -s /opt/nodejs/bin/node /usr/bin/node
    sudo ln -s /opt/nodejs/bin/npm /usr/bin/npm
