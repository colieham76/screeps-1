var roomexits = require('roomexits');
var roleAdjRoomHarvester = { // transfer stuff
    /** @param {Creep} creep */
    run: function(creep) {
        
        const visualPath = { 
            fill: 'transparent',
            stroke: '#00ffff',
            lineStyle: 'dashed',
            strokeWidth: .1,
            opacity: .8
        };

        if(creep.memory.target == undefined) {
            creep.memory.target = roomexits.getRoomsToHarvest(creep.room)[0];
        } else if (creep.memory.target != false) {
            if(creep.memory.harvesting) {                
                if(creep.pos.roomName == creep.memory.target) {  
                    if(creep.memory.source == undefined) {
                        if(roomexits.isHarvestable(creep.pos.roomName)) {
                            var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                            if(source != undefined) {
                                creep.memory.source = source.id;
                            }
                        } else {
                            creep.memory.target = roomexits.getRoomsToHarvest(creep.room)[0];
                        }
                    } else if(creep.harvest(Game.getObjectById(creep.memory.source)) == ERR_NOT_IN_RANGE) {                        
                        creep.moveTo(Game.getObjectById(creep.memory.source), {visualizePathStyle: visualPath});
                    }                   
                } else {
                    var exit = creep.room.findExitTo(creep.memory.target);
                    creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: visualPath});                   
                }
                if(creep.carry.energy == creep.carryCapacity) {
                    creep.memory.harvesting = false;
                }
            } else if(!creep.memory.harvesting) {
                if(creep.pos.roomName == creep.memory.origin) {
                    if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage, {visualizePathStyle: visualPath});
                    }
                } else {
                    var exit = creep.room.findExitTo(creep.memory.origin);
                    creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: visualPath});
                }
                if(creep.carry.energy == 0) {
                    creep.memory.harvesting = true;
                }
            } else { // harvesting == undefined
                creep.memory.harvesting = true;
            }

        } else {
            creep.say("No room to harvest!");
        }


    }
};
module.exports = roleAdjRoomHarvester;