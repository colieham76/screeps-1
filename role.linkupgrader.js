var findControllerLink = function(room) { // returns ID of link beside the controller
    var links = room.find(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_LINK } );
    for(let l of links) {
        var x1 = l.pos.x - 3;
        var y1 = l.pos.y - 3;
        var x2 = l.pos.x + 3;
        var y2 = l.pos.y + 3;
        var sourcearea = room.lookForAtArea(LOOK_STRUCTURES,y1,x1,y2,x2,true);
        if (sourcearea.length > 0) {
            for (let str of sourcearea) {
                if (str.structure.structureType == STRUCTURE_CONTROLLER) {
                    return l.id;
                }
            }
        }
    }
    return null;
};

var roleLinkUpgrader = {
    /** @param {Creep} creep */
    run: function(creep) {        
        if (creep.memory.init == undefined) {
            creep.memory.link = findControllerLink(creep.room);
            creep.memory.init = false;
        } else {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {                
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            if (creep.withdraw(Game.getObjectById(creep.memory.link),RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.link), {visualizePathStyle: {stroke: '#ff00ff'}});
            }
        }
	}
};
module.exports = roleLinkUpgrader;