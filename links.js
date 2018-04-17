/*
    works for 2 links only now
    1st - near source of energy 
    2nd - anywhere else
*/
var links = { 
    run: function() {        
        for (let name in Game.rooms) {
            var room = Game.rooms[name];
            var links = room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LINK
            });            

            loop1:for(var i=0; i<links.length; i++) {             
                var x1 = links[i].pos.x-3;
                var y1 = links[i].pos.y-3;
                var x2 = links[i].pos.x+3;
                var y2 = links[i].pos.y+3;
                var sourcearea = room.lookForAtArea(LOOK_SOURCES,y1,x1,y2,x2,true);
                if (sourcearea.length > 0) { // there is source of energy near this link so send energy from it
                    links[i].transferEnergy(links[1-i]); 
                }
            }
            
        }

    }
}
module.exports = links;