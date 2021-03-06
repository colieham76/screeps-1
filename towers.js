var towers = {
    run: function() {        
        if ((Memory.wallsHP == undefined) || (Memory.wallsHP < 1234567)) {
            Memory.wallsHP = 1234567;
        } else if (Memory.wallsHP < 300000000) {
            Memory.wallsHP += 1;
        }
        for (let name in Game.rooms) {
            var room = Game.rooms[name];
            var towers = room.find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_TOWER
            });            

            for(tower of towers) {                
                var healer = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: function(object) {
                        return object.getActiveBodyparts(HEAL) > 0;
                    }
                });
                
                var attacker = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: function(object) {
                        return object.getActiveBodyparts(ATTACK) > 0;
                    }
                });

                function repairWallsRamparts(tower) {
                    var wr = tower.room.find(FIND_STRUCTURES, {
                        filter: (s) => (s.structureType == STRUCTURE_WALL 
                            || s.structureType == STRUCTURE_RAMPART) && s.hits < Memory.wallsHP
                    });
                    if (wr.length > 0) {
                        wr.sort((a,b) => a.hits - b.hits);
                        tower.repair(wr[0]);
                    }
                }

                var roads = tower.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_ROAD && s.hits < s.hitsMax
                });
            
                var containers = tower.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.hits < s.hitsMax
                });

                var hostilecreeps = tower.room.find(FIND_HOSTILE_CREEPS);

                if(healer == null) { // attack only if there is no healers
                    if(attacker != null) {
                        tower.attack(attacker);
                    } else {
                        if(hostilecreeps.length > 0) {
                            hostilecreeps.sort((a,b) => a.hits - b.hits);
                            tower.attack(hostilecreeps[0]);
                        } else if(containers.length > 0 && tower.energy > 2*tower.energyCapacity/3) { // no hostile creeps: repair containers
                            containers.sort((a,b) => a.hits - b.hits);
                            tower.repair(containers[0]);
                        } else if(roads.length > 0 && tower.energy > 2*tower.energyCapacity/3) {
                            roads.sort((a,b) => a.hits - b.hits);
                            tower.repair(roads[0]);
                        } else if(tower.energy > 2*tower.energyCapacity/3) { // repair walls but leave energy for attackers
                            repairWallsRamparts(tower);
                        }
                    }
                } else if(hostilecreeps != undefined) { // otherwise just repair walls when creeps attack
                    repairWallsRamparts(tower);
                }

            }
        }
    }
}
module.exports = towers;