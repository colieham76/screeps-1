var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleLinkHarvester = require('role.linkharvester');
var roleLinkUpgrader = require('role.linkupgrader');
var roleAdjRoomHarvester = require('role.adjroomharvester');
var roleMineralHarvester = require('role.mineralharvester');
var roleLorry = require('role.lorry');
var roleKiller = require('role.killer');
var roleAgent = require('role.agent');
var spawning = {
    run: function() {
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }

        var roomsq = Object.keys(Game.rooms).length;
        var roomcnt = 0;
        for(let name in Game.rooms) {
            var room = Game.rooms[name];
            roomcnt += 1;
            var spawn = room.find(FIND_MY_SPAWNS, {filter: (s) => s.spawning == null})[0];
            if(spawn!= undefined && spawn.spawning == null) {
                var attacker = room.find(FIND_HOSTILE_CREEPS);

                if(attacker.length > 0) {
                    isAttacked = 1;                 
                    Memory.sosRoomName = room.name;
                    Memory.minOfKillers = 1;
                } else if(roomcnt == roomsq) {
                    Memory.minOfKillers = 0;
                }
                
                var harvesters = _.filter(Game.creeps, (creep) => { return ((creep.memory.role == 'harvester') && (creep.pos.roomName == room.name))});
                var upgraders = _.filter(Game.creeps, (creep) => { return ((creep.memory.role == 'upgrader') && (creep.pos.roomName == room.name))});
                var builders = _.filter(Game.creeps, (creep) => { return ((creep.memory.role == 'builder') && (creep.pos.roomName == room.name))});
                var killers = _.filter(Game.creeps, (creep) => { return ((creep.memory.role == 'killer') && (creep.pos.roomName == room.name))});
                var lorries = _.filter(Game.creeps, (creep) => { return ((creep.memory.role == 'lorry') && (creep.pos.roomName == room.name))});
                var arhs = _.filter(Game.creeps, (creep) => { return ((creep.memory.role == 'adjroomharvester') && (creep.memory.origin == room.name))});
                
                /*if(Memory.minparts == undefined) {
                    Memory.minparts = {  
                        harvester: [WORK,WORK,CARRY,MOVE],
                        builder: [WORK,CARRY,MOVE,MOVE],
                        killer: [TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,RANGED_ATTACK,HEAL],
                        upgrader: [WORK,CARRY,MOVE,MOVE],
                        mineralharvester: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
                        adjroomharvester: [WORK,CARRY,MOVE,MOVE],
                        lorry: [CARRY,MOVE]
                    };
                }*/
                var minparts = {  
                    harvester: [WORK,WORK,CARRY,MOVE],
                    builder: [WORK,CARRY,MOVE,MOVE],
                    killer: [TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,RANGED_ATTACK,HEAL],
                    upgrader: [WORK,CARRY,MOVE,MOVE],
                    mineralharvester: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
                    adjroomharvester: [WORK,CARRY,MOVE,MOVE],
                    lorry: [CARRY,MOVE]
                };

                var mhParts = [WORK,MOVE,CARRY,MOVE,WORK,MOVE,CARRY,MOVE,WORK,MOVE,CARRY,MOVE,WORK,MOVE,CARRY,MOVE,WORK,MOVE,CARRY,MOVE];
                var arhParts = [CLAIM,MOVE];
                var harvesterParts = [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE];                
                var lhParts = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE];
                var luParts = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
                
                function getPartsPrice(parts) {
                    var price = 0;
                    for(i=0; i<parts.length; i++) {
                        price += BODYPART_COST[parts[i]];
                    }
                    return price;
                }

                function partsMultiplyConseq(parts,factor) {
                    var endParts = [];
                    for(i=0; i<factor; i++) {
                        endParts.push(parts);
                    }
                    return endParts;
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

                function getMinParts(parts) {
                    var factor = Math.floor(room.energyAvailable / getPartsPrice(parts));                    
                    factor = factor > 5 ? 5 : factor;
                    return partsMultiply(parts,factor);
                }

                function getMaxParts(parts) {
                    var factor = Math.floor(room.energyCapacityAvailable / getPartsPrice(parts));
                    var maxFactor = Math.floor(50/(parts.length)); // max creep body is 50 parts
                    maxFactor = maxFactor > 5 ? 5 : maxFactor;
                    factor = factor > maxFactor ? maxFactor : factor;
                    return partsMultiply(parts,factor);
                }

                var roomExtractors = room.find(FIND_STRUCTURES,{ 
                    filter: (s) => s.structureType == STRUCTURE_EXTRACTOR
                });
                var roomLinks = room.find(FIND_STRUCTURES,{ 
                    filter: (s) => s.structureType == STRUCTURE_LINK
                });
                var minHarvesters = roomLinks.length > 1 ? 1 : 2;
                var minUpgraders = minHarvesters - 1;
                var minBuilders = room.name == 'W24N8' ? 2 : 1;

                function getMaxHarvester() {
                    var factor = Math.floor(room.energyAvailable / 100);
                    factor = factor > 5 ? 5 : factor;
                    var p = [WORK,WORK,CARRY,MOVE];                    
                    for(let i=0; i<factor; i++) {
                        p.unshift(WORK);
                    }
                    return p;
                }

                function myspawn(role) {
                    var creepName = role.charAt(0) + Game.time;
                    if(role == 'harvester') {
                        var hp = getMaxHarvester();
                        if(spawn.spawnCreep(hp,creepName,{memory: {role: role, origin: room.name}}) == ERR_NOT_ENOUGH_ENERGY) {
                            spawn.spawnCreep(minparts[role],creepName,{memory: {role: role, origin: room.name}});
                        }
                    } else if(spawn.spawnCreep(getMaxParts(minparts[role]),creepName,{memory: {role: role, origin: room.name}}) == ERR_NOT_ENOUGH_ENERGY) {
                        spawn.spawnCreep(getMinParts(minparts[role]),creepName,{memory: {role: role, origin: room.name}});                        
                    }
                }
                if(harvesters.length < minHarvesters) {
                    myspawn('harvester');
                } else if(lorries.length < 1) {
                    myspawn('lorry');
                /*} else if(killers.length < Memory.minOfKillers) {
                    myspawn('killer',3);*/
                } else if(upgraders.length < minUpgraders) {
                    myspawn('upgrader');
                } else if(builders.length < minBuilders) {
                    myspawn('builder');
                }/*else if((arhs.length<1) && (room.name == 'W24N8')) {
                    spawn.spawnCreep(arhParts,'arh'+ Game.time,
                    {memory: {role: 'adjroomharvester', building: false, harvesting:true, origin: room.name}});
                }*/
                
                if(roomExtractors.length > 0) {
                    var mineralharvesters = _.filter(Game.creeps, (creep) => 
                        { return (creep.memory.role == 'mineralharvester') 
                            && (creep.pos.roomName == room.name); });
                    var minerals = room.find(FIND_MINERALS)[0];
                    var minimumOfMineralHarvesters = ((minerals.mineralAmount > 0) && (room.terminal!=undefined)) ? 1 : 0;
                    if (mineralharvesters < minimumOfMineralHarvesters) {
                        spawn.spawnCreep(mhParts,'mh'+ Game.time,{memory: {role: 'mineralharvester', harvesting: true}});
                    }
                }
                
                if(roomLinks.length > 0) {
                    var linkharvesters = _.filter(Game.creeps, (creep) => { 
                        return (creep.memory.role == 'linkharvester') && (creep.pos.roomName == room.name)
                    });
                    var linkupgraders = _.filter(Game.creeps, (creep) => { 
                        return (creep.memory.role == 'linkupgrader') && (creep.pos.roomName == room.name)
                    });
                    if(linkharvesters.length < 1) {
                        spawn.spawnCreep(lhParts,'lh'+ Game.time,
                            {memory: {role: 'linkharvester', harvesting: true}});
                    } else if(linkupgraders.length < 1) {
                        spawn.spawnCreep(luParts,'lu'+ Game.time,
                            {memory: {role: 'linkupgrader', upgrading: false}});
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
                case 'killer': roleKiller.run(creep); break;
                default: break;
            }
        }
        
      

    }
}
module.exports = spawning;