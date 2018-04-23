var roleKiller = {

    /** @param {Creep} creep */
    run: function(creep) {
        var minOfKillers;// how much of killers to send in a sos room
        var roomName;
        
        if(Memory.sosRoomName == undefined) {
            Memory.sosRoomName = 'W24N8'; 
            roomName = 'W24N8';
        } else {
            roomName = Memory.sosRoomName;
        }
        var roompos = new RoomPosition(13,43,roomName);

        if(Memory.killerNeeded == undefined) {
            Memory.killerNeeded = 0;
            minOfKillers = 0;
        } else {
            minOfKillers = Memory.killerNeeded;
        }

        var killers = _.filter(Game.creeps, (creep) => { 
            return ((creep.memory.role == 'killer') && (creep.pos.roomName == roomName))
        });

        if(creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
        
        if(creep.pos.roomName != roomName) {
            creep.moveTo(roompos, {visualizePathStyle: {stroke: '#ffffff'}});
        } else {
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
            }
        }//if room
	}//run: function(creep) {
}; // var roleKiller = {
module.exports = roleKiller;