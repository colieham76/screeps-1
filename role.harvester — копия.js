var getNotLinkSource = function(room) { // returns ID of source with no link
    var sources = room.find(FIND_SOURCES);
    for(let s of sources) {
        var x1 = s.pos.x-3;
        var y1 = s.pos.y-3;
        var x2 = s.pos.x+3;
        var y2 = s.pos.y+3;
        var sourcearea = room.lookForAtArea(LOOK_STRUCTURES,y1,x1,y2,x2,true);
        if(sourcearea.length > 0) {
            var isLinked = 0;
            for(let str of sourcearea) {            
                if(str.structure.structureType == STRUCTURE_LINK) {
                    isLinked = 1;
                }
            }
            if(isLinked == 0) {
                return s.id;
            }
        }
    }
    return null;
};

var hasLinks = function(room) {
    var links = room.find(FIND_STRUCTURES,{
        filter: (s) => s.structureType == STRUCTURE_LINK
    });
    return links.length > 1 ? 1 : 0;
}

var roleHarvester = {

    /** @param {Creep} creep */
    run: function(creep) {

        if (!creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = true;
        } else if (creep.memory.harvesting // not ot overflood the carry and throw energy
            && (creep.carry.energy >= creep.carryCapacity-2*creep.getActiveBodyparts(WORK))) {
            creep.memory.harvesting = false;            
        } else if(creep.memory.harvesting == undefined) {
            creep.memory.harvesting = true;
        }

        if(creep.memory.init == undefined) { // choose the source to harvest for life
            if(hasLinks(creep.room)) {
                creep.memory.source = getNotLinkSource(creep.room);
            } else {
                var harvester = creep.room.find(FIND_MY_CREEPS, {
                    filter: (c) => c.memory.source != undefined
                });
                if(harvester.length > 0) { // there is already a harvester with a source in his memory
                    var sources = creep.room.find(FIND_SOURCES);
                    for(let s of sources) {
                        if(s.id != harvester[0].memory.source) {
                            creep.memory.source = s.id;
                            break;
                        }
                    }
                } else { // just take the closest energy source as your favorite
                    creep.memory.source = creep.room.findClosestByPath(FIND_SOURCES).id;
                }
            }
            creep.memory.init = false;

        } else if(creep.memory.harvesting) {
            if(creep.room.find(FIND_SOURCES_ACTIVE).length > 0) {
                if (creep.harvest(Game.getObjectById(creep.memory.source)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.source));
                }                    
            } else {
                if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }

        } else { // transfer harvested energy
            var towers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ( (structure.structureType == STRUCTURE_TOWER)
                            && (structure.energy < structure.energyCapacity/2) );
                }
            });

            var towersfull = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ( (structure.structureType == STRUCTURE_TOWER)
                            && (structure.energy < structure.energyCapacity) );
                }
            });
            
            var extcont   = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (( (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN)
                            && (structure.energy < structure.energyCapacity) ) ||
                            ((structure.structureType == STRUCTURE_CONTAINER) 
                    && (_.sum(structure.store) < structure.storeCapacity)));
                }
            });
            
            var terminals = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => {
                    return ((s.structureType == STRUCTURE_TERMINAL) && (s.store.energy < s.storeCapacity/2));
                }
            });

            var other = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => { 
                    return ((s.structureType != STRUCTURE_LINK)&&(s.energy < s.energyCapacity));
                }
            });

            var transferto = function(targets) { // transfer to closest of the specified targets list
                if(creep.transfer(creep.pos.findClosestByPath(targets), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.pos.findClosestByPath(targets));
                } 
            }

            if(extcont.length > 0) {
                transferto(extcont);
            } else if(towers.length > 0) {
                transferto(towers);
            } else if(towersfull.length > 0) {
                transferto(towersfull);
            } else if(terminals.length > 0) {
                transferto(terminals);
            } else if(other.length > 0) {
                transferto(other);
            } else if(creep.room.storage != undefined) {
                if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }

        }
	}
};

module.exports = roleHarvester;