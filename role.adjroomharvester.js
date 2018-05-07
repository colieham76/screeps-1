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
            //creep.memory.target = roomexits.getRoomsToHarvest(creep.pos.roomName)[0];
            creep.memory.target = 'W23N7';
        } else if (creep.memory.target != false) {
            if(creep.memory.harvesting) {
                
                if(creep.pos.roomName == creep.memory.target) {
                    /*var dismantle = creep.room.find(FIND_STRUCTURES,{filter: (s) =>{
                        return (s.structureType == STRUCTURE_WALL)
                    }});
                    if(dismantle.length > 0) {
                        if(creep.dismantle(findClosestByRange(dismantle))==ERR_NOT_IN_RANGE) {
                            creep.moveTo(findClosestByRange(dismantle));
                        }
                    } else {*/
                    if(creep.ticksToLive > 55) {
                        var dropped = creep.room.find(FIND_DROPPED_RESOURCES);
                        var tombs = creep.room.find(FIND_TOMBSTONES, {
                            filter: (tomb) => {
                                return (tomb.store.energy > 0);
                            }
                        });
                        if(dropped.length > 0) {
                            if(creep.pickup(dropped[0])==ERR_NOT_IN_RANGE) {
                                creep.moveTo(dropped[0]);
                            }
                        } else if(tombs.length > 0) {
                            if( creep.withdraw(creep.pos.findClosestByRange(tombs),RESOURCE_ENERGY) == ERR_NOT_IN_RANGE ) {
                                creep.moveTo(creep.pos.findClosestByPath(tombs));
                            }
                        } else if(creep.memory.source == undefined) {
                            if(roomexits.isHarvestable(creep.pos.roomName)) {
                                var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                                if(source != undefined) {
                                    creep.memory.source = source.id;
                                }
                            }
                        } else {
                            var source = Game.getObjectById(creep.memory.source);
                            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                                let path = creep.room.findPath(creep.pos, source.pos, {
                                    swampCost:1, ignoreDestructibleStructures: true
                                });
                                
                                if(path.length) {
                                    creep.move(path[0].direction);
                                }
                            }
                        }
                    } else {
                        creep.memory.harvesting = false; // go die in origin room
                    }

                } else {
                    var exit = creep.room.findExitTo(creep.memory.target);
                    creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: visualPath});
                    // var tarpos = new RoomPosition(25,25,creep.memory.target);
                    // creep.moveTo(tarpos, {visualizePathStyle: visualPath});
                }
                if(creep.carry.energy == creep.carryCapacity) {
                    creep.memory.harvesting = false;
                }
            } else if(!creep.memory.harvesting) {
                if(creep.pos.roomName == creep.memory.origin) {
                    if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage, {visualizePathStyle: visualPath});
                    } else {
                        var containers = creep.room.find(FIND_STRUCTURES,{
                            filter: (s)=> {
                                return (s.structureType == STRUCTURE_CONTAINER && 
                                s.store.energy < s.storeCapacity)
                            }
                        });
                        if(creep.transfer(containers[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(containers[0]);
                        }
                    }
                 
                } else {
                    var tarpos = new RoomPosition(25,25,creep.memory.origin);
                    creep.moveTo(tarpos, {visualizePathStyle: visualPath});
                    
                    // var exit = creep.room.findExitTo(creep.memory.origin);
                    // var exitpos = creep.pos.findClosestByRange(exit);
                    // var path = creep.room.findPath(creep.pos,exitpos,{ignoreDestructibleStructures:true});
                    // if(creep.pos.roomName == 'W24N11') {
                    //     //creep.move(path[0].direction);
                    //     console.log(exitpos);
                    // }

                    // var tarpos = Game.getObjectById(creep.memory.origin);
                    // if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    //     let path = creep.room.findPath(creep.pos, source.pos, {
                    //         swampCost:1, ignoreDestructibleStructures: true
                    //     });
                        
                    //     if(path.length) {
                    //         creep.move(path[0].direction);
                    //     }
                    // }

                }
                if((creep.carry.energy == 0)&&(creep.ticksToLive>65)) {
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