var roleOverKiller = {
    /** @param {Creep} creep */
    run: function(creep) {
        
        if(creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }

        function attackEverybody(creep) {
            var commontarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(commontarget != null) {
                var res = creep.attack(commontarget);
                switch (res) {
                    case ERR_NOT_IN_RANGE: 
                        creep.moveTo(commontarget);
                        break;
                    case ERR_NO_PATH:
                        return false;
                        break;
                    default: 
                        break;
                }
            } else {
                return false;
            }
        }
        
        function dismantleEverything(creep,sort) {
            var targets = [];
            if(sort || sort == undefined) {
                targets = creep.room.find(FIND_HOSTILE_STRUCTURES);
                targets.sort((a,b) => a.hits - b.hits);
            } else {
                targets[0] = creep.room.findClosestByRange(FIND_HOSTILE_STRUCTURES);
            }

            if(targets[0] != null && targets[0] != undefined) {
                var res = creep.attack(targets[0]);
                switch (res) {
                    case ERR_NOT_IN_RANGE: 
                        creep.moveTo(targets[0]);
                        break;
                    case ERR_NO_PATH:
                        dismantleEverything(creep,false);
                        break;
                    default: 
                        break;
                }
            } else {
                return false;
            }
        }
        
        if(creep.memory.target == undefined) {
            creep.memory.target = creep.memory.origin;
        }

        if(creep.memory.boosted == undefined) {
            var labpos = new RoomPosition(28,27,'W23N9');
            if(creep.pos.x != labpos.x && creep.pos.y != labpos.y) {
                creep.moveTo(labpos);                
            } else if(creep.body){
                var labs = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_LAB
                });
                var i = 0;
                for(lab of labs) {
                    lab.boostCreep(creep);
                    i++;
                    if(i == labs.length) {
                        creep.memory.boosted = true;
                    }
                }
            }

        } else {
            if(creep.pos.roomName == creep.memory.target) {
                if(!attackEverybody(creep)) {
                    dismantleEverything(creep);
                }
            } else {
                var tarpos = new RoomPosition(25,25,creep.memory.target);
                if(!attackEverybody(creep)) {
                    var exitDirection = creep.room.findExitTo(creep.memory.target);
                    var exit = creep.pos.findClosestByRange(exitDirection);
                    creep.moveTo(exit);
                }

            }

        }

	}
};
module.exports = roleOverKiller;