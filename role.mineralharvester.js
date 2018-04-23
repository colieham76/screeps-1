var roleMineralHarvester = {
    /** @param {Creep} creep */
    run: function(creep) {
        var minerals = creep.room.find(FIND_MINERALS)[0];
        var mineralsType = minerals.mineralType;

        if(minerals.mineralAmount > 0) {
            if(!creep.memory.harvesting && (_.sum(creep.carry) == 0)) {
                creep.memory.harvesting = true;
            } else if(creep.memory.harvesting &&  (_.sum(creep.carry) == creep.carryCapacity)) {
                creep.memory.harvesting = false;
            } else if(creep.memory.harvesting == undefined) {
                creep.memory.harvesting = true;
            }
        } else {
            creep.memory.harvesting = false;
        }
                
        if(creep.memory.harvesting) {
            var tombs = creep.room.find(FIND_TOMBSTONES,{filter: (s) => s.store[mineralsType]>0});
            var dropped = creep.room.find(FIND_DROPPED_RESOURCES, {filter: (s) => s.resourceType == mineralsType});
            if (tombs.length > 0) {
                if (creep.withdraw(tombs[0],mineralsType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(tombs[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else if(dropped.length > 0) {
                if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropped[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else if(creep.harvest(minerals) == ERR_NOT_IN_RANGE) {
                creep.moveTo(minerals, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else if(creep.room.terminal != undefined) { // transfer harvested stuff
            if( (creep.room.terminal.store[mineralsType] < creep.room.terminal.storeCapacity/2) ||
                (creep.room.terminal.store[mineralsType] == undefined)) { // in case there is no minerals in store
                if (creep.transfer(creep.room.terminal, mineralsType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.terminal, {visualizePathStyle: {stroke: '#ffff00'}});
                }
            } else if(creep.room.storage!=undefined) {
                if(creep.transfer(creep.room.storage, mineralsType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage, {visualizePathStyle: {stroke: '#ffff00'}});
                }
            }
        }

	}
};

module.exports = roleMineralHarvester;