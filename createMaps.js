var vars = require('./vars');
var fs = require('fs');
var ByteBuffer = require("bytebuffer");
var bufferRcv = new ByteBuffer(0);

var MapData = {};
var YMinMapSize = 1;
var YMaxMapSize = 100;

var XMinMapSize = 1;
var XMaxMapSize = 100;

var number = 1;

createMap(number);

function createMap(mapNumber) {
    var map = fs.createReadStream("Maps/Mapa" + mapNumber + ".map", {
        end: false
    });

    map.on('error', function(e) {
        console.log('debug -- got file read error: ', e);
    }).on('readable', function() {
        var buffer = map.read();
        var ByFlags;

        if (buffer) {
            bufferRcv = new ByteBuffer.wrap(buffer);
            //Versión del Mapa
            bufferRcv.readUInt16();

            //Cabeceras
            bufferRcv.readUTF8String(255);
            bufferRcv.readUint32();
            bufferRcv.readUint32();

            //Cosas al pedo
            bufferRcv.readUInt16();
            bufferRcv.readUInt16();
            bufferRcv.readUInt16();
            bufferRcv.readUInt16();

            MapData = {};
            MapData[mapNumber] = {};

            for (var y = YMinMapSize; y <= YMaxMapSize; y++) {
                MapData[mapNumber][y] = {};

                for (var x = XMinMapSize; x <= XMaxMapSize; x++) {

                    MapData[mapNumber][y][x] = {};

                    ByFlags = bufferRcv.readUInt8();

                    if (ByFlags & 1) {
                        MapData[mapNumber][y][x].blocked = 1;
                    }

                    MapData[mapNumber][y][x].graphics = {};
                    MapData[mapNumber][y][x].graphics[1] = bufferRcv.readUInt16();

                    if (ByFlags & 2) {
                        MapData[mapNumber][y][x].graphics[2] = bufferRcv.readUInt16();
                    }

                    if (ByFlags & 4) {
                        MapData[mapNumber][y][x].graphics[3] = bufferRcv.readUInt16();
                    }

                    if (ByFlags & 8) {
                        MapData[mapNumber][y][x].graphics[4] = bufferRcv.readUInt16();
                    }

                    if (ByFlags & 16) {
                        MapData[mapNumber][y][x].trigger = bufferRcv.readUInt16();
                    }
                }
            }

            var inf = fs.createReadStream("Maps/Mapa" + mapNumber + ".inf", {
                end: false
            });

            inf.on('error', function(e) {
                console.log('debug -- got file read error: ', e);
            }).on('readable', function() {
                var buffer = inf.read();
                var ByFlags;

                if (buffer) {
                    bufferRcv = new ByteBuffer.wrap(buffer);

                    //Cosas al pedo
                    bufferRcv.readUInt16();
                    bufferRcv.readUInt16();
                    bufferRcv.readUInt16();
                    bufferRcv.readUInt16();
                    bufferRcv.readUInt16();

                    //MapData[mapNumber] = {};
                    //vars.infoMapData[mapNumber] = {};

                    /*for (var y = YMinMapSize; y <= YMaxMapSize; y++) {
                    vars.infoMapData[mapNumber][y] = {};

                    for (var x = XMinMapSize; x <= XMaxMapSize; x++) {
                        vars.infoMapData[mapNumber][y][x] = {};

                        ByFlags = bufferRcv.readUInt8();

                        if (ByFlags & 1) {
                            vars.infoMapData[mapNumber][y][x].tileExit = {};
                            vars.infoMapData[mapNumber][y][x].tileExit.map = bufferRcv.readUInt16();
                            vars.infoMapData[mapNumber][y][x].tileExit.x = bufferRcv.readUInt16();
                            vars.infoMapData[mapNumber][y][x].tileExit.y = bufferRcv.readUInt16();
                        }

                        if (ByFlags & 2) {
                            vars.infoMapData[mapNumber][y][x].npcIndex = bufferRcv.readUInt16();
                        }

                        if (ByFlags & 4) {
                            vars.infoMapData[mapNumber][y][x].objInfo = {};
                            vars.infoMapData[mapNumber][y][x].objInfo.objIndex = bufferRcv.readUInt16();
                            vars.infoMapData[mapNumber][y][x].objInfo.amount = bufferRcv.readUInt16();
                        }
                    }
                }*/

                    for (var y = YMinMapSize; y <= YMaxMapSize; y++) {
                        //MapData[mapNumber][y] = {};

                        for (var x = XMinMapSize; x <= XMaxMapSize; x++) {
                            //MapData[mapNumber][y][x] = {};

                            ByFlags = bufferRcv.readUInt8();

                            if (ByFlags & 1) {
                                MapData[mapNumber][y][x].tileExit = {};
                                MapData[mapNumber][y][x].tileExit.map = bufferRcv.readUInt16();
                                MapData[mapNumber][y][x].tileExit.x = bufferRcv.readUInt16();
                                MapData[mapNumber][y][x].tileExit.y = bufferRcv.readUInt16();
                            }

                            if (ByFlags & 2) {
                                MapData[mapNumber][y][x].npcIndex = bufferRcv.readUInt16();
                            }

                            if (ByFlags & 4) {
                                MapData[mapNumber][y][x].objInfo = {};
                                MapData[mapNumber][y][x].objInfo.objIndex = bufferRcv.readUInt16();
                                MapData[mapNumber][y][x].objInfo.amount = bufferRcv.readUInt16();
                            }
                        }
                    }

                    //console.log(JSON.stringify(MapData));
                }
            }).on('end', function() {
                fs.writeFile('mapas/mapa_' + mapNumber + '.map', JSON.stringify(MapData), function(err) {
                    if (err) return console.log(err);
                    console.log('Mapa' + mapNumber + ' creado.');
                });

                if (number < 290){
                    number++;
                    createMap(number);
                }
                //process.exit(1);
            });

            //console.log(JSON.stringify(MapData));
        }
    }).on('end', function() {
        //process.exit(1);
    });
}