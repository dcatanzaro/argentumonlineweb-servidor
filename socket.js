var funct = require("./functions");
var vars = require("./vars");
var pkg = require("./package");
const _ = require("lodash");

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

    this.closePj = async ws => {
        try {
            if (typeof ws.id == "undefined") {
                return;
            }

            var personajeWS = vars.personajes[ws.id];

            socket.deleteUserToAllNpcs(ws.id);

            if (vars.clients[ws.id]) {
                delete vars.clients[ws.id];
            }

            if (personajeWS && !personajeWS.cerrado) {
                personajeWS.cerrado = true;

                vars.mapData[personajeWS.map][personajeWS.pos.y][
                    personajeWS.pos.x
                ].id = 0;

                socket.loopArea(ws.id, function(target) {
                    if (!target.isNpc && target.id != ws.id) {
                        socket.deleteCharacter(ws.id, vars.clients[target.id]);
                    }
                });

                if (!personajeWS.pvpChar) {
                    personajeWS.posX = personajeWS.pos.x;
                    personajeWS.posY = personajeWS.pos.y;
                    personajeWS.connected = false;

                    let tmpSpells = [];
                    Object.keys(personajeWS.spells).map(idPos => {
                        tmpSpells.push({
                            idPos: idPos,
                            idSpell: personajeWS.spells[idPos].idSpell
                        });
                    });

                    let tmpItems = [];
                    Object.keys(personajeWS.inv).map(idPos => {
                        const item = personajeWS.inv[idPos];

                        tmpItems.push({
                            idPos: idPos,
                            idItem: item.idItem,
                            cant: item.cant,
                            equipped: item.equipped
                        });
                    });

                    personajeWS.spells = tmpSpells;
                    personajeWS.items = tmpItems;
                    personajeWS.updatedAt = new Date();

                    const characterSave = await funct.fetchUrl(
                        `/character_save/${personajeWS._id}`,
                        {
                            method: "PUT",
                            body: JSON.stringify(personajeWS),
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: vars.tokenAuth
                            }
                        }
                    );

                    funct.sendTelegramMessage(
                        `[Servidor] Usuario ${
                            personajeWS.nameCharacter
                        } desconectado.`
                    );

                    vars.usuariosOnline--;

                    funct.sendTelegramMessage(
                        `[Servidor] Usuarios online: ${vars.usuariosOnline}`
                    );

                    socket.actOnline(vars.usuariosOnline);
                } else {
                    vars.usuariosOnlinePvP--;

                    funct.sendTelegramMessage(
                        `[Servidor-PVP] Usuario ${
                            personajeWS.nameCharacter
                        } desconectado.`
                    );

                    funct.sendTelegramMessage(
                        `[Servidor-PVP] Usuarios online: ${
                            vars.usuariosOnlinePvP
                        }`
                    );
                }
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
}

module.exports = socket;
