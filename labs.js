var labs = {
    run: function() {        
        for (let name in Game.rooms) {
            
            var room = Game.rooms[name];
            var labs = room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LAB
            });
            
            // if (labs.length > 2) {
            //     labs[2].runReaction(labs[0], labs[1]);
            //     if (labs.length > 5) {
            //         labs[5].runReaction(labs[3], labs[4]);
            //     }
            // }

        }
    }
}
module.exports = labs;