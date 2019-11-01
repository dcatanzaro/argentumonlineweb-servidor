var fs = require("fs");
var PF = require("pathfinding");
var vars = require("./vars");

var bloqueos = [];

/*for (var index in mapa.bloqueos) {
    bloqueos.push(mapa.bloqueos[index]);
}*/

var pathfinding = new Pathfinding();

function Pathfinding() {
    this.generateRute = function(map, posStart, posEnd) {
        console.log("--------");
        console.log(posStart);
        console.log(posEnd);
        console.log("--------");

        var grid = new PF.Grid(100, 100);

        /*for (var idPj in vars.personajes){
        	grid.setWalkableAt(vars.personajes[idPj].pos.x - 1, vars.personajes[idPj].pos.y - 1, false);
        }

        for (var idNpc in vars.npcs){
        	grid.setWalkableAt(vars.npcs[idNpc].pos.x - 1, vars.npcs[idNpc].pos.y - 1, false);
        }*/

        for (var indexMap in vars.mapData[map]) {
            if (vars.mapData[map][indexMap].id) {
                var pos = indexMap.split("-");

                grid.setWalkableAt(pos[0] - 1, pos[1] - 1, false);
            }
        }

        var finder = new PF.AStarFinder();

        var path = finder.findPath(
            posStart.x - 1,
            posStart.y - 1,
            posEnd.x - 1,
            posEnd.y - 1,
            grid
        );
        path.shift();
        return path;
    };
}

module.exports = pathfinding;
