var market = {    
    run: function() {

        function sell(room,resourceType,amount) {
            var orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: resourceType});
            if (orders.length > 0){
                var bestTrans = Game.market.calcTransactionCost(amount, room.name, orders[0].roomName);
                var bestEndPrice = (orders[0].price * amount) / (amount - bestTrans);
                var bestOrder = orders[0];
                for (i=0; i<orders.length; i++) {
                    bestTrans = Game.market.calcTransactionCost(amount, room.name, orders[i].roomName);
                    var newBestEndPrice = (orders[i].price * amount) / (amount - bestTrans);
                    if (newBestEndPrice < bestEndPrice) {
                        bestEndPrice = newBestEndPrice;
                        bestOrder = orders[i];
                    }
                }
                return Game.market.deal(bestOrder.id, amount, room.name);
            }
            
        }

        function buy(room,resourceType,amount) {
            var orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: resourceType});
            if(orders.length > 0) {
                var bestTransCost = Game.market.calcTransactionCost(amount, room.name, orders[0].roomName);
                var bestPriceTrCostOrder = orders[0];
                var bestEndPrice = (orders[0].price * amount) / (amount - bestTransCost);
                var bestEndPriceOrder = orders[0];
                for(i=0; i < orders.length; i++) {
                    var newBestTransCost = Game.market.calcTransactionCost(amount, room.name, orders[i].roomName);
                    var tbestEndPrice = (orders[i].price * amount) / (amount - newBestTransCost);
                    if (tbestEndPrice < bestEndPrice) {
                        bestEndPrice = tbestEndPrice;
                        bestEndPriceOrder = orders[i];
                    }
                }
            }                   
            return Game.market.deal(bestEndPriceOrder.id,amount,room.name);
        }

        const resourceTypes = [
            RESOURCE_CATALYZED_UTRIUM_ACID, // ATTACK
            RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, // HEAL
            RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, // MOVE
            RESOURCE_CATALYZED_GHODIUM_ALKALIDE, // TOUGH
            RESOURCE_CATALYZED_KEANIUM_ALKALIDE, // RANGED ATTACK
            RESOURCE_CATALYZED_ZYNTHIUM_ACID // DISMANTLE
        ];

        function getLabsResourceAmount(room,resourceType) {
            var labs = room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LAB
            });
            var amount = 0;
            for(lab of labs) {
                if(lab.mineralType == resourceType) {
                    amount += lab.mineralAmount;
                }
            }
            return amount;
        }
        
        function checkBuy(room, resourceType, amount) {                        
            if(room.terminal != undefined) {
                var x = room.terminal.store[resourceType];
                var labsAmount = getLabsResourceAmount(room,resourceType);
                //console.log(resourceType + ' : ' + labsAmount);
                if( x == undefined || x < amount ) {
                    buy(room, resourceType, 30);
                }
            }
        }

        for (let name in Game.rooms) {
            var room = Game.rooms[name];
            if (room.terminal) {
                if(room.terminal.store.energy > 1000) {
                    if(room.terminal.store.energy > 2000 && room.find(FIND_MINERALS).length > 0) {
                        sell(room,room.find(FIND_MINERALS)[0].mineralType,1000);
                    }
                    if(room.name == 'W23N9') {
                        for(resourceType of resourceTypes) {
                            checkBuy(room,resourceType,600);
                        }
                    }
                    
                }
            }
        }


        

    }
}
module.exports = market;