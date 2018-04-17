var findSourceLink = function(room) { // returns IDs of source and link near it
    var res = {};
    var sources = room.find(FIND_SOURCES);
    for(let s of sources) {
        var x1 = s.pos.x - 3;
        var y1 = s.pos.y - 3;
        var x2 = s.pos.x + 3;
        var y2 = s.pos.y + 3;
        var sourcearea = room.lookForAtArea(LOOK_STRUCTURES,y1,x1,y2,x2,true);
        if (sourcearea.length > 0) {
            for (let str of sourcearea) {
                if (str.structure.structureType == STRUCTURE_LINK) {
                    res.link = str.structure.id;
                    res.source = s.id;
                    return res;
                }
            }
        }
    }
    return null;
};

var roleLinkHarvester = {
    /** @param {Creep} creep */
    run: function(creep) {
        if (creep.memory.init == undefined) {
            creep.memory.link = findSourceLink(creep.room).link;
            creep.memory.source = findSourceLink(creep.room).source;
            creep.memory.init = false;
        } else {
            if ((creep.memory.source !== undefined) && (creep.carry.energy < creep.carryCapacity-(2*creep.getActiveBodyparts(WORK)))) {
                if(creep.harvest(Game.getObjectById(creep.memory.source)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.source), {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } 
            if (creep.memory.link !== undefined) {
                if (creep.transfer(Game.getObjectById(creep.memory.link),RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.link), {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};
module.exports = roleLinkHarvester;