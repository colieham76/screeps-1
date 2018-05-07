var market = require('market');
var spawning = require('spawning');
var towers = require('towers');
var links = require('links');
var labs = require('labs');
var memory = require('memory');

module.exports.loop = function () {
    spawning.run();
    towers.run();
    market.run();
    links.run();
    labs.run();
    memory.run();
    
}