var roleBuilder = {

    /** @param {Creep} creep */
    run: function(creep) {
        
        const visualPath = { 
            fill: 'transparent',
            stroke: '#ff0000',
            lineStyle: 'dashed',
            strokeWidth: .2,
            opacity: .8
        };

        if(creep.memory.building && _.sum(creep.carry) == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        } else if(!creep.memory.building && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('🚧 build');
        } else if(creep.memory.building == undefined) {
            creep.memory.building = false;
        }
       
        if(creep.memory.building) {          
            if(_.sum(creep.carry) > creep.carry.energy) { // throw picked up resources
                function getCarryResType(creep) {
                    for(let resType of RESOURCES_ALL){
                        if((creep.carry[resType] != undefined) &&
                        (creep.carry[resType] != 0)) {
                            return resType;
                        }
                    }
                }
                
                var terminal = creep.room.terminal;
                var storage = creep.room.storage;

                if((terminal != undefined) && (_.sum(terminal.store) < terminal.storeCapacity)) {
                    if(creep.transfer(terminal,getCarryResType(creep))) {
                        creep.moveTo(terminal);
                    }
                } else if((storage != undefined) && (_.sum(storage.store) < storage.storeCapacity)) {
                    if(creep.transfer(storage,getCarryResType(creep))) {
                        creep.moveTo(storage);
                    }
                } else {
                    var containers = creep.room.find(FIND_STRUCTURES, {
                        filter: (s) => {
                            return((s.structureType == STRUCTURE_CONTAINER) && (s.store.energy < s.storeCapacity));
                        }
                    });
                    if(containers.length > 0) {
                        if(creep.transfer(creep.pos.findClosestByPath(containers),getCarryResType(creep))) {
                            creep.moveTo(creep.pos.findClosestByPath(containers));
                        }
                    }
                }
            } else { // build
                if(creep.memory.target == undefined) {
                    creep.memory.target = creep.memory.origin == undefined ? creep.pos.roomName : creep.memory.origin;
                } else if(creep.pos.roomName == creep.memory.target 
                        // && creep.pos.x!=0 &&
                        // creep.pos.y!=0 &&
                        // creep.pos.x!=49 &&
                        // creep.pos.y!=49
                        ) {
                    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);   
                    var urgentrepcontainers = creep.room.find(FIND_STRUCTURES, {
                        filter: (s) => {
                            return s.structureType == STRUCTURE_CONTAINER && s.hits < s.hitsMax / 3;
                        }
                    });                
                    var urgentwallsramparts = creep.room.find(FIND_STRUCTURES, {
                        filter: (s) => {
                            return (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL) && s.hits < 2000;
                        }
                    });              
                    var reptargets = creep.room.find(FIND_STRUCTURES, {
                        filter: (s) => {
                            return s.structureType != STRUCTURE_WALL 
                                && s.structureType != STRUCTURE_RAMPART 
                                && s.hits < s.hitsMax-creep.carryCapacity;
                        }
                    });       
                    var wallsramparts = creep.room.find(FIND_STRUCTURES, {
                        filter: (s) => {
                            return (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL) 
                                && s.hits < Memory.wallsHP;
                        }
                    });  
                    
                    if(urgentrepcontainers.length > 0) {
                        urgentrepcontainers.sort((a,b) => a.hits - b.hits);
                        if(creep.repair(urgentrepcontainers[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(urgentrepcontainers[0], {visualizePathStyle: visualPath});
                        }
                    } else if(urgentwallsramparts.length > 0) {
                        urgentwallsramparts.sort((a,b) => a.hits - b.hits);
                        if(creep.repair(urgentwallsramparts[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(urgentwallsramparts[0], {visualizePathStyle: visualPath});
                        }                    
                    } else if(targets.length > 0) {
                        targets.sort((a,b) => ((a.progressTotal-a.progress) - (b.progressTotal-b.progress)));
                        //var bt = targets[0];
                        var minimals = [];
                        var minProgress = targets[0].progress;
                        for(target of targets) {
                            if(target.progress == minProgress) {
                                minimals.push(target);
                            } else {
                                break;
                            }
                        }
                        //console.log(minimalsminimals[0].progress);
                        var bt = creep.pos.findClosestByPath(minimals);
                        if(creep.build(bt) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(bt, {visualizePathStyle: visualPath});
                        }
                    } else if(reptargets.length > 0) {
                        var rt = creep.pos.findClosestByRange(reptargets);
                        if(creep.repair(rt) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(rt, {visualizePathStyle: visualPath});
                        }                    
                    } else if(wallsramparts.length > 0) { // repair walls to full
                        /*wallsramparts.sort((a,b) => a.hits - b.hits);
                        if(creep.repair(wallsramparts[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(wallsramparts[0], {visualizePathStyle: visualPath});
                        }*/
                        var wr = creep.pos.findClosestByRange(wallsramparts);
                        if(creep.repair(wr) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(wr, {visualizePathStyle: visualPath});
                        }
                        
                    } else if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller, {visualizePathStyle: visualPath});
                    }
                } else {
                    var postar = new RoomPosition(25,25,creep.memory.target);
                    creep.moveTo(postar, {visualizePathStyle: visualPath});
                }
            }
        } else { // find energy        
            var tombs = creep.room.find(FIND_TOMBSTONES, {
                filter: (tomb) => {
                    return (_.sum(tomb.store) > 0);
                }
            });
            var dropped = creep.room.find(FIND_DROPPED_RESOURCES);
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ( (structure.structureType == STRUCTURE_CONTAINER) && (structure.store.energy >= creep.carryCapacity/2) );
                }
            });
        
            function getStoreResType(tomb) {
                for(i=0,L=RESOURCES_ALL.length; i<L; i++) {
                    if((tomb.store[RESOURCES_ALL[i]] != undefined) && 
                            (tomb.store[RESOURCES_ALL[i]] != 0)) {
                        return RESOURCES_ALL[i];
                    }
                }
            }
            
            if(dropped.length > 0) {
                if (creep.pickup(creep.pos.findClosestByPath(dropped)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.pos.findClosestByPath(dropped), {visualizePathStyle: visualPath});
                }
            } else if(tombs.length > 0) {
                var tomb = creep.pos.findClosestByPath(tombs);                
                if (tomb != undefined) {                    
                    if (creep.withdraw(tomb, getStoreResType(tomb)) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(tomb, {visualizePathStyle: visualPath});
                    }
                }
            } else if(creep.room.storage != undefined && creep.room.storage.store.energy > 0) {
                if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage, {visualizePathStyle: visualPath});
                }
            } else if((containers.length > 0) && (creep.room.energyAvailable >= creep.room.energyCapacityAvailable-600)) { // minus spawn energy //so extentions would always be full
                if (creep.withdraw(creep.pos.findClosestByPath(containers),RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.pos.findClosestByPath(containers), {visualizePathStyle: visualPath});
                }
            } else if(creep.room.terminal != undefined && creep.room.terminal.store.energy > 2000) {
                if(creep.withdraw(creep.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.terminal, {visualizePathStyle: visualPath});
                }
            } else {
                var sources = creep.room.find(FIND_SOURCES);
                var closestSource = creep.pos.findClosestByPath(sources);

                if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestSource, {visualizePathStyle: visualPath});
                }

            }
        }
        
	}//run: function(creep) {
};//var roleBuilder = {
module.exports = roleBuilder;