var roleClaimer = { // transfer stuff
    /** @param {Creep} creep */
    run: function(creep) {
        
        const visualPath = { 
            fill: 'transparent',
            stroke: '#a5aaf0',
            lineStyle: 'dashed',
            strokeWidth: .1,
            opacity: .8
        };

        if(creep.memory.target == undefined) {
            creep.memory.target = roomexits.getRoomToClaim(creep.room);            
        } else if(creep.memory.target != false) {
            if(creep.pos.roomName == creep.memory.target) {
                if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: visualPath});
                }
            } else {
                var exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: visualPath});
            }
        }
    }
};
module.exports = roleClaimer;