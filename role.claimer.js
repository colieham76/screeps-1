var roleClaimer = { // transfer stuff
    /** @param {Creep} creep */
    run: function(creep) {
        
        const visualPath = { 
            fill: 'transparent',
            stroke: '#05f0f0',
            lineStyle: 'dashed',
            strokeWidth: .1,
            opacity: .8
        };
        
        function getRoomToClaim(room) {

            return room;
        }

        if(creep.memory.init == undefined) {
            creep.memory.target = getRoomToClaim(creep.room);
            creep.memory.init = false;
        } else {
            if(creep.pos.roomName == creep.memory.target) {
                if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            } else {
                var exit = creep.room.findExitTo(target);
                creep.moveTo(creep.pos.findClosestByRange(exit));
            }
        }

    }
};
module.exports = roleClaimer;