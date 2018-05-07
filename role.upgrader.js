var roleUpgrader = {

    /** @param {Creep} creep */
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 withdraw');
	    }
	    
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
        }
        
	    if(creep.memory.upgrading) {
            var controller = creep.room.controller;
            var signStr = '🍅🍄🍉';
            if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
            } else if((controller.sign == undefined) || (controller.sign.text != signStr)) {
                if (creep.signController(controller,signStr) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller);
                }
            }
        } else { //find energy
            /*var energyStructures = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => {
                    return ((s.structureType == STRUCTURE_CONTAINER) && (s.store.energy > 0))
                }
            });
            if (energyStructures.length > 0) {
                if (creep.withdraw(creep.pos.findClosestByPath(energyStructures),RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.pos.findClosestByPath(energyStructures));
                }
            } else */if((creep.room.storage != undefined) && (creep.room.storage.store.energy > 2000)) {
                if(creep.withdraw(creep.room.storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            } else {
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
	}
};

module.exports = roleUpgrader;