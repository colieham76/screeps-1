var roleAdjRoomHarvester = { // transfer stuff
    /** @param {Creep} creep */
    run: function(creep) {
        
        const visualPath = { 
            fill: 'transparent',
            stroke: '#00ffff',
            lineStyle: 'dashed',
            strokeWidth: .1,
            opacity: .8
        };

        function getRoomToHarvest(room) {
            var rn = room.name;
            var сx = parseInt(rn.split(/[wsen]/)[1]);
            var сy = parseInt(rn.split(/[wsen]/)[2]);
            for(let x=-1;x<=1;x++) {
                for(let y=-1;y<=1;y++) {
                    if(x!=0||y!=0) {
                        сx += x;
                        сy += y;
                        var str = "w" + String(сx) + "n" + String(сy);
                        if(Game.rooms[str] == undefined) { // room is not visible
                            return str;
                        } else if(Game.rooms[str].controller.my == false) {
                            return str;
                        }
                    }
                }
            }
            return null;
        }

        if(creep.memory.init == undefined) {
            creep.memory.target = getRoomToHarvest(creep.room);
            creep.memory.init = false;
        } else if (creep.memory.target!=undefined) {
            if(creep.memory.harvesting) {
                if(creep.pos.roomName == creep.memory.target) {
                    if(creep.memory.source == undefined) {
                        creep.memory.source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id;
                    } else if(creep.harvest(Game.getObjectById(creep.memory.source)) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.source), {visualizePathStyle: visualPath});
                    }
                } else {
                    var exit = creep.room.findExitTo(creep.memory.target);
                    creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: visualPath});
                }
                if(creep.carry.energy == creep.carryCapacity) {
                    creep.memory.harvesting = false;
                }
            } else if(!creep.memory.harvesting) {
                if(creep.pos.roomName == creep.memory.origin) {
                    if(creep.transfer(creep.room.storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage, {visualizePathStyle: visualPath});
                    }
                } else {
                    var exit = creep.room.findExitTo(creep.room.origin);
                    creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: visualPath});
                }
                if(creep.carry.energy == 0) {
                    creep.memory.harvesting = true;
                }
            } else {
                creep.memory.harvesting = true;
            }

        }


    }
};
module.exports = roleAdjRoomHarvester;