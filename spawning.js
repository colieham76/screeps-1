var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleLinkHarvester = require('role.linkharvester');
var roleLinkUpgrader = require('role.linkupgrader');
var roleAdjRoomHarvester = require('role.adjroomharvester');
var roleMineralHarvester = require('role.mineralharvester');
var roleLorry = require('role.lorry');
var roleKiller = require('role.killer');

function deleteOldCreepsMemory() {
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
}
var spawning = {
    run: function() {
        
        deleteOldCreepsMemory();
        for(let name in Game.rooms) {
            var room = Game.rooms[name];
            var spawn = room.find(FIND_MY_SPAWNS, {filter: (s) => s.spawning == null})[0];
            if(spawn != undefined && spawn.spawning == null && room.energyAvailable >= 300) {
                var minparts = {
                    harvester: [WORK,WORK,CARRY,MOVE],
                    builder: [WORK,CARRY,MOVE],
                    upgrader: [WORK,WORK,CARRY,MOVE],
                    mineralharvester: [WORK,CARRY,MOVE],
                    lorry: [CARRY,CARRY,MOVE],
                    adjroomharvester: [WORK,CARRY,MOVE,MOVE],
                    claimer: [CLAIM,MOVE]
                };
                
                var lhParts = [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE];
                var luParts = [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE];
                var killerParts = [TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,RANGED_ATTACK,HEAL];
                
                function getPartsPrice(parts) {
                    var price = 0;
                    for(i=0; i<parts.length; i++) {
                        price += BODYPART_COST[parts[i]];
                    }
                    return price;
                }

                function partsMultiply(parts,factor) {
                    var endParts= [];
                    for(i=0,L=parts.length; i<L; i++) {
                        for(j=0; j<factor; j++) {
                            endParts.push(parts[i]);
                        }
                    }
                    return endParts;
                }

                function getMinParts(role) {
                    var parts = minparts[role];
                    var factor = Math.floor(room.energyAvailable / getPartsPrice(parts));                    
                    factor = factor > 5 ? 5 : factor;
                    return partsMultiply(parts,factor);
                }

                function getMaxParts(role) {
                    if(role == 'harvester') {
                        var factor = Math.floor(room.energyAvailable / 100);
                        factor = factor > 3 ? 3 : factor;
                        var p = [WORK,WORK,CARRY,MOVE];                    
                        for(let i=0; i<factor; i++) {
                            p.unshift(WORK);
                        }
                        return p;
                    } else {
                        var parts = minparts[role];
                        var factor = Math.floor(room.energyCapacityAvailable / getPartsPrice(parts));
                        factor = factor > 5 ? 5 : factor;
                        return partsMultiply(parts,factor);
                    }
                }
               
                function mineralHarvesterNeeded(room) {
                    var mineralharvesters = _.filter(Game.creeps, (creep) => 
                    { return (creep.memory.role == 'mineralharvester') 
                        && (creep.pos.roomName == room.name); });

                    var minerals = room.find(FIND_MINERALS)[0];
                    var roomExtractors = room.find(FIND_STRUCTURES,{ 
                        filter: (s) => s.structureType == STRUCTURE_EXTRACTOR
                    });
                    return (mineralharvesters == 0 &&
                        minerals.mineralAmount > 0 && 
                        room.terminal != undefined &&
                        roomExtractors.length > 0) ? 1 : 0;
                }

                function luNeeded(room) {
                    var roomLinks = room.find(FIND_STRUCTURES,{ 
                        filter: (s) => s.structureType == STRUCTURE_LINK
                    });
                    var linkupgraders = _.filter(Game.creeps, (creep) => { 
                        return (creep.memory.role == 'linkupgrader') && (creep.pos.roomName == room.name)
                    });
                    return (linkupgraders.length == 0 && roomLinks.length > 1) ? 1: 0;
                }
                
                function lhNeeded(room) {
                    var roomLinks = room.find(FIND_STRUCTURES,{ 
                        filter: (s) => s.structureType == STRUCTURE_LINK
                    });
                    var linkharvesters = _.filter(Game.creeps, (creep) => { 
                        return (creep.memory.role == 'linkharvester') && (creep.pos.roomName == room.name)
                    });
                    return (linkharvesters.length == 0 && roomLinks.length > 1) ? 1: 0;
                }

                function secondHarvesterNeeded(room) {
                    var roomLinks = room.find(FIND_STRUCTURES,{ 
                        filter: (s) => s.structureType == STRUCTURE_LINK
                    });
                    return roomLinks.length > 1 ? 0 : 1;
                }

                function upgraderNeeded(room) {
                    var upgraders = _.filter(Game.creeps, (creep) => { 
                        return ((creep.memory.role == 'upgrader') && (creep.pos.roomName == room.name))
                    });
                    var roomLinks = room.find(FIND_STRUCTURES,{ 
                        filter: (s) => s.structureType == STRUCTURE_LINK
                    });
                    return (upgraders.length == 0 && roomLinks.length < 2) ? 1 : 0;
                }

                function buildersNeeded(room) {
                    var builders = _.filter(Game.creeps, (creep) => { 
                        return ((creep.memory.role == 'builder') && (creep.pos.roomName == room.name))
                    });
                    var minBuilders = room.find(FIND_CONSTRUCTION_SITES).length > 0 ? 1 : 0;
                    return ( minBuilders == 1 && builders.length == 0) ? 1 : 0;
                }

                function lorryNeeded(room) {
                    var lorries = _.filter(Game.creeps, (creep) => { 
                        return ((creep.memory.role == 'lorry') && (creep.pos.roomName == room.name))
                    });
                    return lorries.length == 0 ? 1 : 0;
                }

                function harvesterNeeded(room) {
                    var harvesters = _.filter(Game.creeps, (creep) => { 
                        return ((creep.memory.role == 'harvester') && (creep.pos.roomName == room.name))
                    });
                    var roomLinks = room.find(FIND_STRUCTURES,{ 
                        filter: (s) => s.structureType == STRUCTURE_LINK
                    });
                    return (harvesters.length == 0 ||
                        (harvesters.length == 1 && roomLinks.length < 2)) ? 1 : 0;
                }

                function killerNeeded(room) {
                    var killers = _.filter(Game.creeps, (creep) => { 
                        return ((creep.memory.role == 'killer') && (creep.pos.roomName == room.name))
                    });
                    var roomsq = Object.keys(Game.rooms).length;
                    var roomcnt = 0;
                    for(let name in Game.rooms) {
                        roomcnt += 1;
                        var attacker = room.find(FIND_HOSTILE_CREEPS);
                        if(attacker.length > 0) {
                            isAttacked = 1;                 
                            Memory.sosRoomName = room.name;
                            Memory.killerNeeded = 1;
                        } else if(roomcnt == roomsq) { // last room in list 
                            Memory.killerNeeded = 0;
                        }
                    }
                    return (killers.length == 0 && Memory.killerNeeded == 1) ? 1 : 0;
                }

                function arhNeeded(room) {
                    var arhs = _.filter(Game.creeps, (creep) => { 
                        return ((creep.memory.role == 'adjroomharvester') && (creep.memory.origin == room.name))
                    });

                    return arhs.length == 0 ? 1 : 0;

                }

                function getAdjRoomToClaim(room) {
                    for(let x=-1;x<=1;x++) {
                        for(let y=-1;y<=1;y++) {
                            var rn = room.name;
                            
                        }
                    }
                    return null;
                }

                function claimerNeeded(room) {
                    var claimers = _.filter(Game.creeps, (creep) => { 
                        return ((creep.memory.role == 'claimer') && (creep.memory.origin == room.name))
                    });
                    var roomToClaim = getAdjRoomToClaim();
                    return ( roomToClaim != null && claimers.length == 0) ? 1 : 0;
                }

                function myspawn(role) {
                    var creepName = role.charAt(0) + Game.time;
                    if (spawn.spawnCreep(getMaxParts(role),creepName,
                            {memory: {role: role, origin: room.name}}) == ERR_NOT_ENOUGH_ENERGY) {
                        spawn.spawnCreep(getMinParts(role),creepName,
                            {memory: {role: role, origin: room.name}});
                    }
                }

                if(harvesterNeeded(room)) {
                    myspawn('harvester');
                } else if(lorryNeeded(room)) {
                    myspawn('lorry');
                /*} else if(killerNeeded(room)) {
                    spawn.spawnCreep([ATTACK,MOVE],'k'+Game.time,{memory: {role: 'killer', origin: room.name}});
                    */
                } else if(upgraderNeeded(room)) {
                    myspawn('upgrader');
                } else if(buildersNeeded(room)) {
                    myspawn('builder');
                } else if(mineralHarvesterNeeded(room)) {
                    myspawn('mineralharvester');
                } else if(lhNeeded(room)) {
                    spawn.spawnCreep(lhParts,'lh'+ Game.time,
                        {memory: {role: 'linkharvester', harvesting: true}});
                } else if(luNeeded(room)) {
                    spawn.spawnCreep(luParts,'lu'+ Game.time,
                        {memory: {role: 'linkupgrader', upgrading: false}});
                } /*else if(claimerNeeded) { 

                } else if(arhNeeded) { 

                } else if(room.storage.store.energy > 900000) {
                    spawn.spawnCreep([])
                }*/

            } // spawn spawning
        } // room

        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            switch (creep.memory.role) {
                case 'harvester': roleHarvester.run(creep); break;
                case 'builder': roleBuilder.run(creep); break;
                case 'upgrader': roleUpgrader.run(creep); break;
                case 'linkharvester': roleLinkHarvester.run(creep); break;
                case 'linkupgrader': roleLinkUpgrader.run(creep); break;
                case 'adjroomharvester': roleAdjRoomHarvester.run(creep); break;
                case 'mineralharvester': roleMineralHarvester.run(creep); break;
                case 'lorry': roleLorry.run(creep); break;
                case 'killer': roleKiller.run(creep); break;
                default: break;
            }
        }

    }
}
module.exports = spawning;