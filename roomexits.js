var roomexits = {  

    isHarvestable: function(roomName) {
        var room = Game.rooms[roomName];
        return (room != undefined && // room should be visible
            room.controller != undefined && // room has controller
            !room.controller.my && // not already mine
            room.controller.owner == undefined && // has no owner 
            (room.controller.reservation == undefined || // no reservation
            room.controller.reservation.username == 'danikine')); // or reserved by me
    },

    isClaimable: function(roomName) {
        var room = Game.rooms[roomName];
        return (room != undefined && // room should be visible
            room.controller != undefined && // room has controller
            !room.controller.my && // not already mine
            room.controller.owner == undefined && // has no owner 
            room.controller.reservation == undefined); // no reservation
    },

    hasExit: function(roomName,direction) {
        var room = Game.rooms[roomName];
        if(room.memory.exitInit == undefined) {
            room.memory.exits = [false,false,false,false,false,false,false,false,false];
            var rn = room.name;
            var сx = parseInt(rn.split(/[WSENwsen]/)[1]);
            var сy = parseInt(rn.split(/[WSENwsen]/)[2]);
            var directions = [[3,1],[5,7]];
            for(let i=0; i<=1; i++) {
                for(let j=0; j<=1; j++) {
                    var tx = сx + (i&&j) - (+!i&&!j);
                    var ty = сy + j - i;
                    var str = "W" + tx.toString() + "N" + ty.toString();
                    if(room.findExitTo(str) == directions[i][j]) {
                        room.memory.exits[directions[i][j]] = true;
                    } else {
                        room.memory.exits[directions[i][j]] = false;
                    }
                }
            }
            room.memory.exitInit = false;
        } else {
            return room.memory.exits[direction];
        }
    },

    getRoomsToHarvest: function(roomName) {
        var rooms = [];
        var сx = parseInt(roomName.split(/[WSENwsen]/)[1]);
        var сy = parseInt(roomName.split(/[WSENwsen]/)[2]);
        var directions = [[3,1],[5,7]]; // 3 - right, 1 - up, 5 - down, 7 - left
        for(let i=0; i<=1; i++) {
            for(let j=0; j<=1; j++) {
                var tx = сx + (i&&j) - (+!i&&!j); // adjacent rooms left,right,top,bottom
                var ty = сy + j - i;
                var str = "W" + tx.toString() + "N" + ty.toString(); 
                if(roomexits.hasExit(roomName,directions[i][j])) {
                    if(Game.rooms[str] == undefined) { // room is not visible
                        rooms.push(str);
                    } else if(roomexits.isHarvestable(str)) {
                        rooms.push(str);
                    }
                }
            }
        }
        return rooms;
    },

    getRoomsToClaim: function(roomName) {
        var rooms = [];
        var сx = parseInt(roomName.split(/[WSENwsen]/)[1]);
        var сy = parseInt(roomName.split(/[WSENwsen]/)[2]);
        var directions = [[3,1],[5,7]]; // 3 - right, 1 - up, 5 - down, 7 - left
        for(let i=0; i<=1; i++) {
            for(let j=0; j<=1; j++) {
                var tx = сx + (i&&j) - (+!i&&!j); // adjacent rooms left,right,top,bottom
                var ty = сy + j - i;
                var str = "W" + tx.toString() + "N" + ty.toString(); 
                if(roomexits.hasExit(roomName,directions[i][j]) &&
                        roomexits.isClaimable(str)) {
                    rooms.push(str);
                }
            }
        }
        return rooms;
    },

    isOnExit: function(creep) {
        return ((creep.pos.x == 0)||(creep.pos.x == 49)||(creep.pos.y == 0)||(creep.pos.y == 49));
    },

    stepAwayFromExit: function(creep) {
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

}
module.exports = roomexits;