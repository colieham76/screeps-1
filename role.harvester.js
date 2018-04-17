/* 
container harvester harvests only in container 
if there is no container it build it for himself
*/
var getNotLinkSource = function(room) { // returns ID of source with no link
    var sources = room.find(FIND_SOURCES);
    for(let s of sources) {
        var isLinked = 0;
        var x1 = s.pos.x - 3;
        var y1 = s.pos.y - 3;
        var x2 = s.pos.x + 3;
        var y2 = s.pos.y + 3;
        var sourcearea = room.lookForAtArea(LOOK_STRUCTURES,y1,x1,y2,x2,true);
        for(let str of sourcearea) {            
            if(str.structure.structureType == STRUCTURE_LINK) {
                isLinked = 1;
            }
        }
        if(isLinked == 0) {
            return s.id;
        }
    }
    return null;
};

var hasLinks = function(room) {
    var links = room.find(FIND_STRUCTURES,{
        filter: (s) => s.structureType == STRUCTURE_LINK
    });
    return links.length > 1 ? 1 : 0;
}

const visualPath = { 
    fill: 'transparent',
    stroke: '#ff0000',
    lineStyle: 'dashed',
    strokeWidth: .2,
    opacity: .8
};

var roleHarvester = {
    /** @param {Creep} creep */
    run: function(creep) {
        if(creep.memory.init == undefined) { // choose the source to harvest for life
            if(hasLinks(creep.room)) {
                creep.memory.source = getNotLinkSource(creep.room);
            } else {
                var harvester = creep.room.find(FIND_MY_CREEPS, {
                    filter: (c) => c.memory.source != undefined
                });
                if(harvester.length > 0) { // there is already a harvester with a source in his memory
                    var sources = creep.room.find(FIND_SOURCES);
                    for(let s of sources) {
                        if(s.id != harvester[0].memory.source) {
                            creep.memory.source = s.id;
                            break;
                        }
                    }
                } else { // just take the closest energy source as your favorite
                    creep.memory.source = creep.room.findClosestByPath(FIND_SOURCES).id;
                }
            }
            creep.memory.init = false;

        } else if(creep.memory.source != null) {
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
            }).length;
            var range = creep.pos.getRangeTo(Game.getObjectById(creep.memory.source));
            if(range > 1) {
                creep.moveTo(Game.getObjectById(creep.memory.source));
            } else {
                creep.harvest(Game.getObjectById(creep.memory.source))
                if(containers < 3) { // minimum available containers to build by source in any room
                    var cx = creep.pos.x;
                    var cy = creep.pos.y;
                    for(let x=-1; x<=1; x++) {
                        for(let y=-1; y<=1; y++) {
                            if(creep.room.lookForAt(LOOK_CONSTRUCTION_SITES,cx+x,cy+y).length == 0 &&
                                    creep.room.lookForAt(LOOK_STRUCTURES,cx+x,cy+y).length == 0) {
                                creep.room.createConstructionSite(cx+x, cy+y, STRUCTURE_CONTAINER);
                            }
                        }
                    }
                    var constructions = creep.room.find(FIND_CONSTRUCTION_SITES, {
                        filter: (cs) => {return cs.structureType == STRUCTURE_CONTAINER}
                    });
                    creep.build(constructions[0]);
                    
                } else {
                    var emptycontainers = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => { return ((structure.structureType == STRUCTURE_CONTAINER) &&
                            (structure.store.energy < structure.storeCapacity)) }
                    });
                    if(creep.transfer(creep.pos.findClosestByPath(emptycontainers), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.pos.findClosestByPath(emptycontainers));
                    }
                }

            }

        }
    }
};
module.exports = roleHarvester;