var funct = require('./functions');
var database = require('./database');
var vars = require('./vars');
var pkg = require('./package');

var socket = new Socket();

function Socket() {
    this.send = function(ws) {
        try {
            if (!ws) {
                return;
            }

            if (this.state(ws) == ws.OPEN) {
                ws.send(pkg.dataSend());
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.sendAll = function(dataSend, callback) {
        try {
            var clients = vars.clients;

            for (var z in clients) {
                if (clients[z] && !vars.clients[z].bot) {
                    if (this.state(clients[z]) == clients[z].OPEN) {
                        client = clients[z];

                        client.send(dataSend);

                        if (callback) {
                            callback(z);
                        }
                    }
                }
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.sendAll2 = function(clients, callback) {
        try {
            for (var z in clients) {
                if (clients[z]) {
                    if (this.state(clients[z]) == clients[z].OPEN) {
                        client = clients[z];

                        callback(client);
                    }
                }
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.getIp = function(ws) {
        try {
            return ws._socket.remoteAddress;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.state = function(ws) {
        try {
            return ws.readyState;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.close = function(ws) {
        try {
            socket.closePj(ws);
            ws.close();
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.closePj = function(ws) {
        try {
            if (typeof ws.id == 'undefined') {
                return;
            }

            var personajeWS = vars.personajes[ws.id];

            socket.deleteUserToAllNpcs(ws.id);

            if (vars.clients[ws.id]) {
                delete vars.clients[ws.id];
            }

            if (personajeWS && !personajeWS.cerrado) {
                personajeWS.cerrado = true;

                vars.mapData[personajeWS.map][personajeWS.pos.y][personajeWS.pos.x].id = 0;

                socket.loopArea(ws.id, function(target) {
                    if (!target.isNpc && target.id != ws.id) {
                        socket.deleteCharacter(ws.id, vars.clients[target.id]);
                    }
                });

                query = "UPDATE characters SET ";

                for (var save in vars.toSave) {
                    if (vars.toSave[save] == "posX") {
                        query += vars.toSave[save] + '="' + personajeWS.pos.x + '"';
                    } else if (vars.toSave[save] == "posY") {
                        query += vars.toSave[save] + '="' + personajeWS.pos.y + '"';
                    } else if (!personajeWS[vars.toSave[save]]) {
                        query += vars.toSave[save] + '=0';
                    } else {
                        query += vars.toSave[save] + '="' + personajeWS[vars.toSave[save]] + '"';
                    }

                    if (vars.toSave.length - 1 != save) {
                        query += ', ';
                    }
                }

                query += ', connected=0, updated_at=NOW() WHERE idCharacter="' + personajeWS.idCharacter + '"';

                database.query(query);

                socket.saveItemsUser(ws.id);

                console.log("El usuario " + personajeWS.nameCharacter + " se ha desconectado.");

                vars.usuariosOnline--;

                database.query('UPDATE usersOnline SET usersOnline="' + vars.usuariosOnline + '"');
                
                socket.actOnline(vars.usuariosOnline);
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.loopArea = function(idUser, callback) {
        try {
            var user = vars.personajes[idUser];

            if (!user) {
                return;
            }

            var posXStart = user.pos.x - 10;
            var posYStart = user.pos.y - 10;

            var posXEnd = user.pos.x + 10;
            var posYEnd = user.pos.y + 10;

            for (var y = posYStart; y <= posYEnd; y++) {
                for (var x = posXStart; x <= posXEnd; x++) {
                    if (x >= 1 && y >= 1 && x <= 100 && y <= 100) {
                        var mapData = vars.mapData[user.map][y][x];

                        if (mapData.id) {
                            var target = vars.npcs[mapData.id];

                            if (!target) {
                                target = vars.personajes[mapData.id];
                            }

                            callback(target);
                        }
                    }
                }
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.actOnline = function(usersOnline) {
        try {
            pkg.setPackageID(pkg.clientPacketID.actOnline);
            pkg.writeShort(usersOnline);
            socket.sendAll(pkg.dataSend());
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.deleteCharacter = function(idUser, client) {
        try {
            pkg.setPackageID(pkg.clientPacketID.deleteCharacter);
            pkg.writeDouble(idUser);
            socket.send(client);
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.deleteUserToAllNpcs = function(idUser) {
        try {
            socket.loopArea(idUser, function(target) {
                if (target.isNpc && target.movement == 3) {
                    var index = vars.areaNpc[target.id].indexOf(idUser);

                    if (index > -1) {
                        vars.areaNpc[target.id].splice(index, 1);
                    }
                }
            });
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.saveItemsUser = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            if (Object.keys(user.inv).length > 0) {

                //Borro todos los items de la base de datos
                var query = 'DELETE FROM inventary WHERE idCharacter="' + user.idCharacter + '"';
                database.query(query);

                //Inserto todos los items de nuevo
                query = 'INSERT INTO inventary (idCharacter, idPos, idItem, cant, equipped, created_at, updated_at) VALUES ';

                var count = 0;

                for (var idPos in user.inv) {
                    count++;

                    var item = user.inv[idPos];
                    var idItem = item.idItem;

                    query += '(' + user.idCharacter + ', ' + idPos + ', ' + idItem + ', ' + item.cant + ', ' + item.equipped + ', NOW(), NOW())';

                    if (Object.keys(user.inv).length > count) {
                        query += ', ';
                    }
                }

                database.query(query);
            } else {
                var query = 'DELETE FROM inventary WHERE idCharacter="' + user.idCharacter + '"';
                
                database.query(query);
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };
}

module.exports = socket;