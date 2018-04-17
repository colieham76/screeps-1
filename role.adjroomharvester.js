var roleAdjRoomHarvester = {
    /** @param {Creep} creep */
    run: function(creep) {
        const destpos = new RoomPosition(25,25,'W26N8');
        const originpos = new RoomPosition(25,25,creep.memory.origin);        
        if(creep.pos.roomName != 'W28N8') {
            const roompos = new RoomPosition(12,12,'W28N8');
            creep.moveTo(roompos, {visualizePathStyle: {stroke: '#ffffff'}});
        } else {
            if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            };
        }
    }
};

module.exports = roleAdjRoomHarvester;