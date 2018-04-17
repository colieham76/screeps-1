var roleAgent = {

    /** @param {Creep} creep */
    run: function(creep) {
        
        const cp = new RoomPosition(30, 6, 'W24N7'); //controller
        const ss = new RoomPosition(17,18, 'W24N7'); //harvest
        const at = new RoomPosition(6, 28, 'W23N9'); //enemy controller
        const ar = new RoomPosition(2,18,'W23N8'); //just a point in the adjacent room
        const klad = Game.getObjectById('5a5f7a2d038f4445b23e06a8'); //enemy storage to steal energy from
        const kladpos = new RoomPosition(39,35,'W23N9'); //position besides this storage

        const visualPathHarvest = { 
            fill: 'transparent',
            stroke: '#ff0000',
            lineStyle: 'dashed',
            strokeWidth: .2,
            opacity: .8
        };

        const visualPathBack = { 
            fill: 'transparent',
            stroke: '#00ff00',
            lineStyle: 'dashed',
            strokeWidth: .2,
            opacity: .8
        };
   
        if (!creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = true;
        }
        
        if (creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = false;
        }        
        
        if(creep.memory.harvesting) {
            //console.log(creep.withdraw(klad,RESOURCE_ENERGY));
            if (creep.withdraw(klad,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE||ERR_INVALID_TARGET) {
                creep.moveTo(kladpos,{ visualizePathStyle: visualPathHarvest});
            }

        } else { 
            // transfer harvested energy to original room
            
            var targets = Game.rooms.W24N8.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                               return ((  structure.structureType == STRUCTURE_EXTENSION || 
                                            structure.structureType == STRUCTURE_SPAWN || 
                                            structure.structureType == STRUCTURE_TOWER ) && (structure.energy < structure.energyCapacity));
                               //return structure.structureType == STRUCTURE_TERMINAL;
                    }
            });
           
            if (targets.length > 0) { // transfer to the closest structure
                if (creep.pos.roomName=='W24N8') {
                    if(creep.transfer(creep.pos.findClosestByPath(targets), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.pos.findClosestByPath(targets), { visualizePathStyle: visualPathBack} );
                    }
                } else {
                    if(creep.transfer(targets[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], { visualizePathStyle: visualPathBack} );
                    }
                }
            } else if (targets.length == 0) { // transfer to storage if everything is filled with energy already
                if (creep.transfer(Game.rooms.W24N8.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.rooms.W24N8.storage);
                }
            }
/*
if (creep.transfer(Game.rooms.W24N8.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(Game.rooms.W24N8.storage);
}
*/

        }

	}
};

module.exports = roleAgent;