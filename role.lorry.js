var roleLorry = { // transfer stuff
    /** @param {Creep} creep */
    run: function(creep) {
        
        const visualPath = { 
            fill: 'transparent',
            stroke: '#00ffff',
            lineStyle: 'dashed',
            strokeWidth: .1,
            opacity: .8
        };

        var minerals = creep.room.find(FIND_MINERALS);
        var mineralsType = minerals[0].mineralType;       
                
        var storage = creep.room.storage;
        var terminal = creep.room.terminal;       
       
        if(!creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = true;
        } else if(creep.memory.harvesting &&
            (creep.carry.energy == creep.carryCapacity ||
            creep.carry[mineralsType] == creep.carryCapacity )) {
            creep.memory.harvesting = false;
        } else if(creep.memory.harvesting == undefined) {
            creep.memory.harvesting = true;
        }

        if(creep.memory.harvesting) { // from                            
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => {return (s.structureType == STRUCTURE_CONTAINER && s.store.energy > creep.carryCapacity );}
            });
            
            if(containers.length > 0) {
                containers.sort((a,b) => b.store.energy - a.store.energy);
                if(creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers[0], {visualizePathStyle: visualPath});
                }
             } else if(storage!=undefined && storage.store.energy > 0) {
                if(creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage, {visualizePathStyle: visualPath});
                }
            } else if(terminal!=undefined && terminal.store.energy > 1000) {
                if(creep.withdraw(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(terminal, {visualizePathStyle: visualPath});
                }
            } else { //step away from harvester's spot
                var spawn = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => { return (s.structureType == STRUCTURE_SPAWN); }
                });
                creep.moveTo(spawn[0], {visualizePathStyle: visualPath});
            }

        } else { // to
            var extentions = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => { return (s.structureType == STRUCTURE_EXTENSION && s.energy < s.energyCapacity); }
            });
            var towers = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => { return (s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity-300); }
            });
            
            if(extentions.length > 0) {
                var ext = creep.pos.findClosestByPath(extentions);
                if(creep.transfer(ext,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(ext, {visualizePathStyle: visualPath});
                }
            } else if(towers.length > 0) {
                var tower = creep.pos.findClosestByPath(towers);
                if(creep.transfer(tower,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(tower, {visualizePathStyle: visualPath});
                }
            } else if (terminal != undefined 
                    && terminal.store.energy < 100000
                    && creep.transfer(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
                    ) {
                creep.moveTo(terminal, {visualizePathStyle: visualPath});               
            } else if (storage !== undefined) {
                if(creep.transfer(storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage, {visualizePathStyle: visualPath});
                }
            }
            
        }

    }
};
module.exports = roleLorry;