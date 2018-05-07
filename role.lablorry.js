var roleLabLorry = { // transfer stuff
    /** @param {Creep} creep */
    run: function(creep) {
        
        const visualPath = { 
            fill: 'transparent',
            stroke: '#ffff00',
            lineStyle: 'dashed',
            strokeWidth: .1,
            opacity: .8
        };

        if(!creep.memory.harvesting && _.sum(creep.carry) == 0) {
            creep.memory.harvesting = true;
        } else if(creep.memory.harvesting && _.sum(creep.carry) != 0) {
            creep.memory.harvesting = false;
        } else if(creep.memory.harvesting == undefined) {
            creep.memory.harvesting = true;
        }

        const resourceTypes = [
            RESOURCE_CATALYZED_UTRIUM_ACID, // ATTACK
            RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, // HEAL
            RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, // MOVE
            RESOURCE_CATALYZED_GHODIUM_ALKALIDE, // TOUGH
            RESOURCE_CATALYZED_KEANIUM_ALKALIDE, // RANGED ATTACK
            RESOURCE_CATALYZED_ZYNTHIUM_ACID // DISMANTLE
        ];

        if(creep.memory.harvesting) { // from
            if(creep.room.terminal != undefined) {
                for(resourceType of resourceTypes) {
                    if(creep.withdraw(creep.room.terminal, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.terminal, {visualizePathStyle: visualPath});
                    }
                }
            }

        } else { // to
            var labs = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => { return (s.structureType == STRUCTURE_LAB); }
            });
            
            for(let i=0, L=resourceTypes.length; i<L; i++) {
                if(creep.transfer(labs[i],resourceTypes[i]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(labs[i], {visualizePathStyle: visualPath});
                }
            }
            
        }

    }
};
module.exports = roleLabLorry;