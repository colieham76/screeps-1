var market = {    
    run: function() {

        function buyEnergy(amountToBuy) {
            var orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: RESOURCE_ENERGY});
            if(orders.length > 0) {
                var bestTransCost = Game.market.calcTransactionCost(amountToBuy, room.name, orders[0].roomName);
                var bestPriceTrCostOrder = orders[0];
                var bestEndPrice = (orders[0].price * amountToBuy) / (amountToBuy - bestTransCost);
                var bestEndPriceOrder = orders[0];
                for(i=0; i < orders.length; i++) {
                    var newBestTransCost = Game.market.calcTransactionCost(amountToBuy, room.name, orders[i].roomName);
                    var tbestEndPrice = (orders[i].price * amountToBuy) / (amountToBuy - newBestTransCost);
                    if (tbestEndPrice < bestEndPrice) {
                        bestEndPrice = tbestEndPrice;
                        bestEndPriceOrder = orders[i];
                    }
                }
            }                   
            if (room.terminal.store.energy < room.terminal.storeCapacity/3) {
                return Game.market.deal(bestEndPriceOrder.id,amountToBuy,room.name);
            }
        }

        function sellMinerals(amountToSell) {            
            var minerals = room.find(FIND_MINERALS)[0];
            var mineralType = minerals.mineralType;
            var orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: mineralType});
            if (orders.length > 0){
                var bestOrder = orders[0];                    
                var bestTrans = Game.market.calcTransactionCost(amountToSell, room.name, orders[0].roomName);
                var bestEndPrice = (orders[0].price * amountToSell) / (amountToSell - bestTrans);
                for (i=0; i<orders.length; i++) {
                    BestTrans = Game.market.calcTransactionCost(amountToSell, room.name, orders[i].roomName);
                    var newBestEndPrice = (orders[i].price * amountToSell) / (amountToSell - BestTrans);
                    if (newBestEndPrice < bestEndPrice) {
                        bestEndPrice = newBestEndPrice;
                        bestOrder = orders[i];
                    }
                }
                var bestEndPriceOrderTransCont = Game.market.calcTransactionCost(amountToSell, room.name, bestOrder.roomName);
                
                /*console.log(room.name+' Price: '+bestOrder.price.toFixed(3)+' transfer cost: '
                +bestEndPriceOrderTransCont+' to sell '+amountToSell+ ' of '+ mineralType);

                console.log('best price per 1: '+ mineralType+ ' is '+ bestEndPrice);
*/
                if (room.terminal.store.energy >= bestEndPriceOrderTransCont) {
                    Game.market.deal(bestOrder.id, amountToSell, room.name);
                }

            }
        }

        for (let name in Game.rooms) {
            var room = Game.rooms[name];            
            if (room.terminal) {
                sellMinerals(5000);
                /*if(room.name == 'W24N8') {
                    buyEnergy(1000);
                }*/
            }
        }

    }
}
module.exports = market;