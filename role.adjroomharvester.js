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

        function isHarvestable(roomName) { 
            var room = Game.rooms[roomName];
            return (room != undefined &&// room should be visible
                    room.controller != undefined && // room has controller
                    room.controller.my == false && // not already mine
                    room.controller.owner == undefined && // has no owner 
                   (room.controller.reservation == undefined || // no reservation
                    room.controller.reservation.username == 'danikine')); // or reserved by me
        }

        function getRoomToHarvest(room) {
            var rn = room.name;
            var сx = parseInt(rn.split(/[WSENwsen]/)[1]);
            var сy = parseInt(rn.split(/[WSENwsen]/)[2]);
            for(let x=-1;x<=1;x++) {
                for(let y=-1;y<=1;y++) {
                    if( (x == 0 && y != 0) || (y == 0 && x != 0) ) {
                        var tx = сx + x;
                        var ty = сy + y;
                        var str = "W" + tx.toString() + "N" + ty.toString();
                        if(isHarvestable(str)) {
                            return str;
                        }
                    }
                }
            }
            /*var directions = [[7,1],[5,3]];
            for(let i=0; i<=1; i++) {
                for(let j=0; j<=1; j++) {
                    var tx = сx + (i&&j) - (+!i&&!j); // adjacent rooms left,right,top,bottom
                    var ty = сy + j - i;
                    var str = "W" + tx.toString() + "N" + ty.toString(); 
                    if(room.findExitTo(Game.rooms[str]) == directions[i,j]) {
                        if(Game.rooms[str] == undefined) { // room is not visible
                            return str;
                        } else if(isHarvestable(str)) {
                            return str;
                        }
                    }
                }
            }
*/
            return false;
        }

        function isOnExit(creep) {
            return ((creep.pos.x == 0)||(creep.pos.x == 49)||(creep.pos.y == 0)||(creep.pos.y == 49));
        }

        function stepAwayFromExit(creep) {
            if(creep.pos.x == 0) {
                creep.move(RIGHT);
            } else if(creep.pos.x == 49) {
                creep.move(LEFT);
            } else if(creep.pos.y == 0) {
                creep.move(BOTTOM);
            } else if(creep.pos.y == 49) {
                creep.move(TOP);
            }
            creep.say("Fckn exit!");
        }

        if(creep.memory.target == undefined) {
            creep.memory.target = getRoomToHarvest(creep.room);
        } else if (creep.memory.target != false) {
            if(creep.memory.harvesting) {
                //if(creep.pos.roomName=='W22N8'){console.log(isHarvestable('W22N8'));}
                if(creep.pos.roomName == creep.memory.target) {
                    
                    if (isOnExit(creep)) {
                                    
                        stepAwayFromExit(creep);

                    } else {
                        
                        if(creep.memory.source == undefined) {

                            if(isHarvestable(creep.pos.roomName)) {
                                var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                                if(source != undefined) {
                                    creep.memory.source = source.id;
                                }
                            } else {
                                creep.memory.init = undefined;
                            }
                        } else if(creep.harvest(Game.getObjectById(creep.memory.source)) == ERR_NOT_IN_RANGE) {
                            
                            var s = Game.getObjectById(creep.memory.source);
                            let path = creep.room.findPath(creep.pos, s.pos);
                            if( !path.length || !s.pos.isEqualTo(path[path.length - 1]) ) {
                                path = creep.room.findPath(creep.pos, s.pos, {
                                    ignoreDestructibleStructures: true
                                });
                            }
                            if( path.length ) {
                                const look = creep.room.lookAt(path[0].x,path[0].y);
                                look.forEach(function(lookObject) {
                                    if(lookObject.type == LOOK_STRUCTURES &&
                                    lookObject[LOOK_STRUCTURES].structureType == STRUCTURE_WALL) {
                                        creep.dismantle(lookObject.structure);
                                    }
                                });
                                creep.move(path[0].direction);
                            }
                           
                        }

                    }
                } else {
                    if (isOnExit(creep)) {
                                    
                        stepAwayFromExit(creep);
                        

                    } else {
                        var exit = creep.room.findExitTo(creep.memory.target);
                        creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: visualPath});
                    }
                   
                }
                if(creep.carry.energy == creep.carryCapacity) {
                    creep.memory.harvesting = false;
                }
            } else if(!creep.memory.harvesting) {
                if(creep.pos.roomName == creep.memory.origin) {
                    if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage, {visualizePathStyle: visualPath});
                    }
                } else {
                    var exit = creep.room.findExitTo(creep.memory.origin);
                    creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: visualPath});
                }
                if(creep.carry.energy == 0) {
                    creep.memory.harvesting = true;
                }
            } else { // harvesting == undefined
                creep.memory.harvesting = true;
            }

        } else {
            creep.say("No room to harvest!");
        }


    }
};
module.exports = roleAdjRoomHarvester;