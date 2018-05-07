var memory = {    
    run: function() {

        function deleteOldCreepsMemory() {
            for(let name in Memory.creeps) {
                if(!Game.creeps[name]) {
                    delete Memory.creeps[name];
                }
            }
        }
        if(Game.time % 20 == 0) {
            deleteOldCreepsMemory();
        }    

        function deleteRooms() {
            for(let name in Memory.rooms) {
                if(!Game.rooms[name]) {
                    delete Memory.rooms[name];
                }
            }
        }            
        if(Memory.clearRooms == undefined) {
            Memory.clearRooms = true;
        }
        if(Memory.clearRooms) {
            deleteRooms();
            Memory.clearRooms = false;
        }
    }
}
module.exports = memory;