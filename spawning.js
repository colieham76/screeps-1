var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleLinkHarvester = require('role.linkharvester');
var roleLinkUpgrader = require('role.linkupgrader');
var roleAdjRoomHarvester = require('role.adjroomharvester');
var roleMineralHarvester = require('role.mineralharvester');
var roleLorry = require('role.lorry');
var roleLabLorry = require('role.lablorry');
var roleKiller = require('role.killer');
var roleClaimer = require('role.claimer');
var roomexits = require('roomexits');
var roleOverKiller = require('role.overkiller');



var spawning = {
    run: function() {
        
        
        for(let name in Game.rooms) {
            var room = Game.rooms[name];
            var spawn = room.find(FIND_MY_SPAWNS, {filter: (s) => s.spawning == null})[0];
            if(spawn != undefined && spawn.spawning == null && room.energyAvailable >= 300) {
                var minparts = {
                    harvester: [WORK,WORK,CARRY,MOVE],
                    builder: [WORK,CARRY,MOVE],
                    upgrader: [WORK,WORK,CARRY,MOVE],
                    lorry: [CARRY,CARRY,MOVE],
                    adjroomharvester: [WORK,CARRY,MOVE,MOVE],
                    claimer: [CLAIM,MOVE]
                };
                
                var lhParts = [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE];
                var luParts = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
                var killerParts = [TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,RANGED_ATTACK,HEAL];
                var mhParts = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
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
                        roomExtractors.length > 0) ? true : false;
                }

                function luNeeded(room) {
                    var roomLinks = room.find(FIND_STRUCTURES,{ 
                        filter: (s) => s.structureType == STRUCTURE_LINK
                    });
                    var linkupgraders = _.filter(Game.creeps, (creep) => { 
                        return (creep.memory.role == 'linkupgrader') && (creep.pos.roomName == room.name)
                    });
                    return (linkupgraders.length == 0 && roomLinks.length > 1) ? true: false;
                }
                
                function lhNeeded(room) {
                    var roomLinks = room.find(FIND_STRUCTURES,{ 
                        filter: (s) => s.structureType == STRUCTURE_LINK
                    });
                    var linkharvesters = _.filter(Game.creeps, (creep) => { 
                        return (creep.memory.role == 'linkharvester') && (creep.pos.roomName == room.name)
                    });
                    return (linkharvesters.length == 0 && roomLinks.length > 1) ? true: false;
                }

                function secondHarvesterNeeded(room) {
                    var roomLinks = room.find(FIND_STRUCTURES,{ 
                        filter: (s) => s.structureType == STRUCTURE_LINK
                    });
                    return roomLinks.length > 1 ? false : true;
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

                function builderNeeded(roomName) {
                    var builders = _.filter(Game.creeps, (creep) => { 
                        return ((creep.memory.role == 'builder') && (creep.memory.origin == roomName))
                    });                    
                    return builders.length == 0 ? true : false;
                }

                function lorryNeeded(roomName) {
                    var lorries = _.filter(Game.creeps, (creep) => { 
                        return ((creep.memory.role == 'lorry') && (creep.memory.origin == roomName))
                    });
                    return lorries.length == 0 ? true : false;
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

                function killerNeeded(roomName) {
                    var killers = _.filter(Game.creeps, (creep) => { 
                        return ((creep.memory.role == 'killer') && (creep.memory.origin == roomName))
                    });
                    /*var roomsq = Object.keys(Game.rooms).length;
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
                    }*/
                    return killers.length == 0 ? true : false;
                }

                function arhNeeded(roomName) {
                    if(roomName == 'W23N8') {
                        var arhs = _.filter(Game.creeps, (creep) => { 
                            return ((creep.memory.role == 'adjroomharvester') && (creep.memory.origin == roomName))
                        });
                        if(arhs.length < 3) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        var roomsToHarvest = roomexits.getRoomsToHarvest(roomName);
                        return (roomsToHarvest.length > 0) ? roomsToHarvest[0] : false;
                    }
                }

                function claimerNeeded(roomName) {
                    var claimers = _.filter(Game.creeps, (creep) => { 
                        return ((creep.memory.role == 'claimer') && (creep.memory.origin == roomName))
                    });
                    var roomsToClaim = roomexits.getRoomsToClaim(roomName);
                    //return (claimers.length < roomsToClaim.length && roomsToClaim.length > 0) ? roomsToClaim[claimers.length] : false;
                    return (claimers.length == 0) ? true : false;
                }

                function myspawn(role) {
                    var creepName = role.charAt(0) + Game.time;
                    if (spawn.spawnCreep(getMaxParts(role),creepName,
                            {memory: {role: role, origin: room.name}}) == ERR_NOT_ENOUGH_ENERGY) {
                        spawn.spawnCreep(getMinParts(role),creepName,
                            {memory: {role: role, origin: room.name}});
                    }
                }

                function lablorryNeeded(room) {
                    var lablorries = _.filter(Game.creeps, (creep) => {
                        return ((creep.memory.role == 'lablorry') && (creep.memory.origin == room.name))
                    });
                    var labs = room.find(FIND_STRUCTURES, {
                        filter: (s) => s.structureType == STRUCTURE_LAB
                    });
                    return (lablorries.length == 0 && labs.length > 0 && room.terminal!=undefined) ? true : false;
                }

                // spawn.spawnCreep([MOVE,WORK,CARRY,MOVE,MOVE,WORK,CARRY,MOVE,MOVE,WORK,CARRY,MOVE,MOVE,WORK,CARRY,MOVE],'b'+ Game.time,
                //     {memory: {role: 'builder', origin: room.name, target: 'W21N5'}});

                if(harvesterNeeded(room)) {
                    myspawn('harvester');
                } else if(lorryNeeded(room.name)) {
                    myspawn('lorry');
                } else if(upgraderNeeded(room)) {
                    myspawn('upgrader');
                } else if(builderNeeded(room.name)) {
                    myspawn('builder');
                } else if(lhNeeded(room)) {
                    spawn.spawnCreep(lhParts,'lh'+ Game.time,
                        { memory: {role: 'linkharvester', origin: room.name} });
                } else if(luNeeded(room)) {
                    spawn.spawnCreep(luParts,'lu'+ Game.time,
                        { memory: {role: 'linkupgrader', origin: room.name} });
                } else if(lablorryNeeded(room)) {
                    spawn.spawnCreep([WORK,MOVE,CARRY,MOVE],'ll'+ Game.time,
                        { memory: {role: 'lablorry', origin: room.name} });
                } else if(mineralHarvesterNeeded(room)) {
                    spawn.spawnCreep(mhParts,'mh'+ Game.time,
                        { memory: {role: 'mineralharvester', origin: room.name} });
                } else if(killerNeeded(room.name) && room.name == 'W23N8') {
                    spawn.spawnCreep([MOVE,ATTACK],'k'+Game.time,
                        {memory: {role: 'killer', origin: room.name, target: 'W23N7'}});
                } else if(arhNeeded(room.name)) {
                    if(room.name == 'W23N8') {
                        spawn.spawnCreep([CARRY,CARRY,CARRY,CARRY,CARRY,
                            MOVE,MOVE,MOVE,MOVE,MOVE], 'arh' + Game.time,
                            { memory: {role: 'adjroomharvester', 
                                origin: room.name, 
                                target: 'W23N7' }
                            });
                    } else if(room.name!='W24N8') {
                        spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE], 'arh' + Game.time,
                            { memory: {role: 'adjroomharvester', 
                                origin: room.name, 
                                target: arhNeeded(room.name) } 
                            });
                    }
                } else if(claimerNeeded(room.name) && room.name == 'W23N8') { 
                    spawn.spawnCreep([CLAIM,MOVE], 'c' + Game.time,
                        { memory: {role: 'claimer', 
                        origin: room.name,
                        target: 'W23N7' }
                        });
                }
                else if(room.name == 'W23N9') {
                    var ok = _.filter(Game.creeps, (creep) => {
                        return ((creep.memory.role == 'overkiller') && (creep.memory.origin == room.name))
                    });
                    if(ok.length == 0) {
                        spawn.spawnCreep([TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,MOVE,WORK,MOVE,WORK,MOVE,WORK,MOVE,MOVE,MOVE,ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL], 'ok' + Game.time,
                            {memory: {role: 'overkiller', origin: room.name, target: 'W22N5'}});
                    }
                }
                
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
                case 'lablorry': roleLabLorry.run(creep); break;
                case 'killer': roleKiller.run(creep); break;
                case 'overkiller': roleOverKiller.run(creep); break;
                case 'claimer': roleClaimer.run(creep); break;
                default: break;
            }
        }

    }
}
module.exports = spawning;