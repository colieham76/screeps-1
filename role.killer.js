var roleKiller = {
    /** @param {Creep} creep */
    run: function(creep) {
        if(creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
        function attackEverybody(creep) {
            var commontarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(commontarget != null) {
                if(creep.attack(commontarget) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(commontarget);
                }
            } else {
                return false;
            }
        }
        if(creep.memory.target == undefined || creep.pos.roomName == creep.memory.target) {
            attackEverybody(creep);
        } else {
            var tarpos = new RoomPosition(25,25,creep.memory.target);
            //if(!attackEverybody(creep)) {
                creep.moveTo(tarpos, {visualizePathStyle: {stroke: '#ffffff'}});
            //}
            //if(!attackEverybody(creep)) {
                /*            
                var healer = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: function(obj) {
                        return obj.getActiveBodyparts(HEAL) > 0;
                    }
                });
                if(healer) {
                    if(creep.attack(healer) == ERR_NOT_IN_RANGE) {
                        if(creep.rangedAttack(healer) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(healer);
                        }
                        creep.moveTo(healer);
                    }
                } else {
                    var attacker = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                        filter: function(obj) {
                            return obj.getActiveBodyparts(ATTACK) > 0;
                        }
                    });
                    if(attacker) {
                        if(creep.attack(attacker) == ERR_NOT_IN_RANGE) {
                            if(creep.rangedAttack(attacker) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(attacker);
                            }
                            creep.moveTo(attacker);
                        }
                    } else {
                        var commontarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                        if(commontarget) {
                            if(creep.attack(commontarget) == ERR_NOT_IN_RANGE) {
                                if(creep.rangedAttack(commontarget) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(commontarget);
                                }
                                creep.moveTo(commontarget);
                            }
                        } else { // no hostile creeps in sos room
                            var constructions = creep.room.find(FIND_HOSTILE_STRUCTURES);
                            if(constructions.length > 0) {
                                if(creep.attack(constructions[0]) == ERR_NOT_IN_RANGE) {
                                    if(creep.rangedAttack(commontarget) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(creep.pos.findClosestByPath(constructions));
                                    }
                                    creep.moveTo(creep.pos.findClosestByPath(constructions));
                                }
                            } else {
                                creep.moveTo(roompos, {visualizePathStyle: {stroke: '#ffffff'}});                         
                            }
                        }
                    }
                }*/
           // }

        }
	}
};
module.exports = roleKiller;