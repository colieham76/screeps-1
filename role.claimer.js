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

        function isClaimable(roomName) { // room should be visible
            return (Game.rooms[roomName].controller != undefined && // room has controller
                Game.rooms[roomName].controller.my == false && // not already mine
                Game.rooms[roomName].controller.owner == undefined && // has no owner 
                (Game.rooms[roomName].controller.reservation == undefined || // no reservation
                Game.rooms[roomName].controller.reservation.username == 'danikine')); // or reserved by me
        }
        
        function getRoomToClaim(room) {
            var rn = room.name;
            var сx = parseInt(rn.split(/[WSENwsen]/)[1]);
            var сy = parseInt(rn.split(/[WSENwsen]/)[2]);
            for(let x=-1;x<=1;x++) {
                for(let y=-1;y<=1;y++) {
                    if(x!=0||y!=0) {
                        var tx = сx + x;
                        var ty = сy + y;
                        var str = "W" + tx.toString() + "N" + ty.toString();
                        if(Game.rooms[str] == undefined) { // room is not visible
                            return str;
                        } else if(roomHarvestable(str)) {
                            return str;
                        }
                    }
                }
            }
            return null;
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