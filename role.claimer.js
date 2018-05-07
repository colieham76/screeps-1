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
                if(Game.time%50 == 0) { // sometimes move away from spot to let other creeps to pass
                    var source = creep.room.find(FIND_SOURCES);
                    if(source.length > 0) {
                        creep.moveTo(source[0]);
                    }
                }
                var controller = creep.room.controller;
                if(controller.owner == undefined) {
                    if(creep.reserveController(controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(controller, {visualizePathStyle: visualPath});
                    }
                } else {
                    if(creep.attackController(controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(controller, {visualizePathStyle: visualPath});
                    }
                    //console.log(controller.progress);
                }

            } else {
                var exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: visualPath});

            }

        }
    }
};
module.exports = roleClaimer;