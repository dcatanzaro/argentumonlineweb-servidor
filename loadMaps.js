var vars = require('./vars');
var fs = require('fs');
var loadNpcs = require('./loadNpcs');
var funct = require('./functions');

console.log("[INFO | " + funct.dateFormat(new Date(), "%d-%m-%Y %H:%M:%S") + "] Cargando Mapas...");

for (var i = 1; i < 291; i++) {
    readMap(i);
}

console.log("[INFO | " + funct.dateFormat(new Date(), "%d-%m-%Y %H:%M:%S") + "] Mapas Cargados.");

loadNpcs.load();

function readMap(mapNum) {
    var tmpMap = JSON.parse(fs.readFileSync('mapas/mapa_' + mapNum + '.map', 'utf8'));
    vars.mapa[mapNum] = {};
    vars.mapa[mapNum] = tmpMap[mapNum];

    vars.mapData[mapNum] = [];

    for (var y = 1; y <= 100; y++) {
        vars.mapData[mapNum][y] = [];

        for (var x = 1; x <= 100; x++) {
            vars.mapData[mapNum][y][x] = {
                id: 0
            };
        }
    }

    vars.mapData[mapNum].name = "";
    vars.mapData[mapNum].musicNum = 0;
    vars.mapData[mapNum].magiaSinEfecto = 0;
    vars.mapData[mapNum].noEncriptarMp = 0;
    vars.mapData[mapNum].terreno = "";
    vars.mapData[mapNum].zona = "";
    vars.mapData[mapNum].restringir = 0;
    vars.mapData[mapNum].backup = 0;
    vars.mapData[mapNum].pk = 0;

    fs.readFile('Maps/Mapa' + mapNum + '.dat', 'UTF-8', function read(err, data) {
        var responseArr = data.split('\n');

        for (var line in responseArr) {
            var response = responseArr[line];
 
            var responseSplit = response.split('Name=');
            var name = responseSplit[1];

            if (name) {
                vars.mapData[mapNum].name = name.trim();
            }

            responseSplit = response.split('MusicNum=');
            var musicNum = responseSplit[1];

            if (musicNum) {
                vars.mapData[mapNum].musicNum = parseInt(musicNum.trim());
            }

            responseSplit = response.split('MagiaSinefecto=');
            var magiaSinEfecto = responseSplit[1];

            if (magiaSinEfecto) {
                vars.mapData[mapNum].magiaSinEfecto = parseInt(magiaSinEfecto.trim());
            }

            responseSplit = response.split('NoEncriptarMP=');
            var noEncriptarMp = responseSplit[1];

            if (noEncriptarMp) {
                vars.mapData[mapNum].noEncriptarMp = parseInt(noEncriptarMp.trim());
            }

            responseSplit = response.split('Terreno=');
            var terreno = responseSplit[1];

            if (terreno) {
                vars.mapData[mapNum].terreno = terreno.trim();
            }

            responseSplit = response.split('Zona=');
            var zona = responseSplit[1];

            if (zona) {
                vars.mapData[mapNum].zona = zona.trim();
            }

            responseSplit = response.split('Restringir=');
            var restringir = responseSplit[1];

            if (restringir) {
                vars.mapData[mapNum].restringir = restringir.trim();
            }

            responseSplit = response.split('BackUp=');
            var backup = responseSplit[1];

            if (backup) {
                vars.mapData[mapNum].backup = parseInt(backup.trim());
            }

            responseSplit = response.split('Pk=');
            var pk = responseSplit[1];

            if (pk) {
                vars.mapData[mapNum].pk = parseInt(pk.trim());
            }
        }
    });
}
