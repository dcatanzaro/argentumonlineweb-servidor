var game = require('./game');
var login = require('./login');
var socket = require('./socket');
var database = require('./database');
var funct = require('./functions');
var vars = require('./vars');
var command = require('./commands');
var respawn = require('./respawn');
var pkg = require('./package');
var npcs = require('./npcs');
var handleProtocol = require('./handleProtocol');

var protocol = new Protocol();

var dictionaryServer = {};

dictionaryServer[pkg.serverPacketID.changeHeading] = changeHeading;
dictionaryServer[pkg.serverPacketID.click] = eventClick;
dictionaryServer[pkg.serverPacketID.useItem] = useItem;
dictionaryServer[pkg.serverPacketID.equiparItem] = equiparItem;
dictionaryServer[pkg.serverPacketID.connectCharacter] = connectCharacter;
dictionaryServer[pkg.serverPacketID.position] = position;
dictionaryServer[pkg.serverPacketID.dialog] = dialog;
dictionaryServer[pkg.serverPacketID.ping] = ping;
dictionaryServer[pkg.serverPacketID.attackMele] = attackMele;
dictionaryServer[pkg.serverPacketID.attackRange] = attackRange;
dictionaryServer[pkg.serverPacketID.attackSpell] = attackSpell;
dictionaryServer[pkg.serverPacketID.tirarItem] = tirarItem;
dictionaryServer[pkg.serverPacketID.agarrarItem] = agarrarItem;
dictionaryServer[pkg.serverPacketID.buyItem] = buyItem;
dictionaryServer[pkg.serverPacketID.sellItem] = sellItem;
dictionaryServer[pkg.serverPacketID.changeSeguro] = changeSeguro;

function Protocol() {
    try {
        this.handleData = function(ws, packageID) {
            dictionaryServer[packageID](ws);
        };
    } catch (err) {
        funct.dumpError(err);
    }
}

function buyItem(ws) {
    try {
        var idPos = pkg.getByte();
        var cant = pkg.getShort();

        game.buyItem(ws.id, idPos, cant);
    } catch (err) {
        funct.dumpError(err);
    }
}

function changeSeguro(ws) {
    if (vars.personajes[ws.id].seguroActivado) {
        vars.personajes[ws.id].seguroActivado = false;
    } else {
        vars.personajes[ws.id].seguroActivado = true;
    }
}

function sellItem(ws) {
    try {
        var idPos = pkg.getByte();
        var cant = pkg.getShort();

        game.sellItem(ws.id, idPos, cant);
    } catch (err) {
        funct.dumpError(err);
    }
}

function changeHeading(ws) {
    try {
        var heading = pkg.getByte();

        if (heading < 1 || heading > 4) {
            return;
        }

        vars.personajes[ws.id].heading = heading;

        game.loopArea(ws, function(target) {
            if (!target.isNpc && target.id != ws.id) {
                handleProtocol.changeHeading(ws.id, heading, vars.clients[target.id]);
            }
        });
    } catch (err) {
        funct.dumpError(err);
    }
}

function eventClick(ws) {
    try {
        var x = pkg.getByte();
        var y = pkg.getByte();

        if (x < 1 || x > 100) {
            return;
        }

        if (y < 1 || y > 100) {
            return;
        }

        var user = vars.personajes[ws.id];

        if (!user) {
            return;
        }

        var pos = {
            x: x,
            y: y
        };

        var objMap = "",
            obj = "";

        if (game.hayObj(user.map, pos)) {

            objMap = game.objMap(user.map, pos);
            obj = vars.datObj[objMap.objIndex];

            if (obj.objType == vars.objType.puerta) {
                game.openDoor(ws.id, pos, objMap, obj);
            }

            handleProtocol.console(obj.name + ' - ' + objMap.amount, 'white', 1, 0, ws);
        } else if (game.hayObj(user.map, {
                x: pos.x + 1,
                y: pos.y
            })) {

            objMap = game.objMap(user.map, {
                x: pos.x + 1,
                y: pos.y
            });

            obj = vars.datObj[objMap.objIndex];

            if (obj.objType == vars.objType.puerta) {
                game.openDoor(ws.id, {
                    x: pos.x + 1,
                    y: pos.y
                }, objMap, obj);
            }

            handleProtocol.console(obj.name + ' - ' + objMap.amount, 'white', 1, 0, ws);
        } else if (game.hayObj(user.map, {
                x: pos.x + 1,
                y: pos.y + 1
            })) {

            objMap = game.objMap(user.map, {
                x: pos.x + 1,
                y: pos.y + 1
            });
            obj = vars.datObj[objMap.objIndex];

            if (obj.objType == vars.objType.puerta) {
                game.openDoor(ws.id, {
                    x: pos.x + 1,
                    y: pos.y + 1
                }, objMap, obj);
            }

            handleProtocol.console(obj.name + ' - ' + objMap.amount, 'white', 1, 0, ws);
        } else if (game.hayObj(user.map, {
                x: pos.x,
                y: pos.y + 1
            })) {

            objMap = game.objMap(user.map, {
                x: pos.x,
                y: pos.y + 1
            });
            obj = vars.datObj[objMap.objIndex];

            if (obj.objType == vars.objType.puerta) {
                game.openDoor(ws.id, {
                    x: pos.x,
                    y: pos.y + 1
                }, objMap, obj);
            }

            handleProtocol.console(obj.name + ' - ' + objMap.amount, 'white', 1, 0, ws);
        }

        var tileSelected = vars.mapData[vars.personajes[ws.id].map][y][x];

        if (!tileSelected.id) {
            tileSelected = vars.mapData[vars.personajes[ws.id].map][y + 1][x];
        }

        if (tileSelected.id) {
            var pjSelected = vars.personajes[tileSelected.id];

            if (!pjSelected) {
                pjSelected = vars.npcs[tileSelected.id];
            }

            if (pjSelected.isNpc && pjSelected.desc) {
                handleProtocol.dialog(tileSelected.id, pjSelected.desc, '', 'white', 0, ws);
            }

            if (pjSelected.isNpc && (pjSelected.npcType === vars.npcType.sacerdote || pjSelected.npcType === vars.npcType.sacerdoteNewbie)) {
                if (user.dead) {
                    game.revivirUsuario(ws.id);
                } else {
                    if (user.hp < user.maxHp) {
                        user.hp = user.maxHp;

                        handleProtocol.updateHP(user.hp, ws);
                    }
                }
            }

            if (pjSelected.isNpc && pjSelected.npcType === vars.npcType.comerciante && !user.dead) {
                user.npcTrade = tileSelected.id;

                var npcTmp = vars.npcs[tileSelected.id];

                if (npcTmp && Math.abs(user.pos.x - npcTmp.pos.x) > 2 || Math.abs(user.pos.y - npcTmp.pos.y) > 2) {
                    handleProtocol.console('Te encuentras muy lejos para comerciar.', 'white', 1, 0, ws);
                    return;
                }

                handleProtocol.openTrade(ws.id, tileSelected.id, ws);
            }

            var msg = "";

            if (pjSelected.privileges == 1 || pjSelected.privileges == 2) {
                handleProtocol.console('Ves a ' + pjSelected.nameCharacter + ' &lt;AOW Staff&gt', '#419900', 1, 0, ws);
            } else {
                if (pjSelected.isNpc) {
                    msg = 'Ves a ' + pjSelected.nameCharacter + ' [NPC]';

                    if (pjSelected.maxHp > 0) {
                        msg += ' [Vida: ' + pjSelected.hp + '/' + pjSelected.maxHp + ']';
                    }

                    if (pjSelected.paralizado) {
                        msg += ' [Paralizado]';
                    }

                    if (pjSelected.inmovilizado) {
                        msg += ' [Inmovilizado]';
                    }

                    handleProtocol.console(msg, '#FFA500', 1, 0, ws);
                } else {
                    msg = 'Ves a ' + pjSelected.nameCharacter + ' [' + vars.nameClases[pjSelected.idClase] + '] [Nivel: ' + pjSelected.level + ']';

                    var color = "#3333ff";

                    if (pjSelected.criminal) {
                        msg += " - Criminal";
                        color = "red";
                    } else {
                        msg += " - Ciudadano";
                    }

                    if (vars.personajes[ws.id].privileges == 1) {
                        msg += ' - [Aciertos: ' + pjSelected.spellsAcertados + ' | Errados: ' + pjSelected.spellsErrados + ' | Porcentaje de aciertos: ' + (pjSelected.spellsAcertados * 100 / (pjSelected.spellsErrados + pjSelected.spellsAcertados)) + '%]';
                    }

                    handleProtocol.console(msg, color, 1, 0, ws);
                }
            }
        }
    } catch (err) {
        funct.dumpError(err);
    }
}

function useItem(ws) {
    try {
        var idPos = pkg.getInt();

        game.useItem(ws, idPos);
    } catch (err) {
        funct.dumpError(err);
    }
}

function agarrarItem(ws) {
    try {
        game.agarrarItem(ws);
    } catch (err) {
        funct.dumpError(err);
    }
}

function tirarItem(ws) {
    try {
        var idPos = pkg.getInt();
        var cant = pkg.getShort();

        game.tirarItem(ws, idPos, cant);
    } catch (err) {
        funct.dumpError(err);
    }
}

function equiparItem(ws) {
    try {
        var idPos = pkg.getInt();
        var propertiesItem = "";

        var user = vars.personajes[ws.id];

        if (user.dead) {
            handleProtocol.console('Los muertos no pueden equipar items.', 'white', 0, 0, ws);
            return;
        }

        if (user.meditar) {
            handleProtocol.console('Debes dejar de meditar para realizar esta acción.', 'white', 0, 0, ws);
            return;
        }

        if (user.navegando) {
            handleProtocol.console('Debes dejar de navegar para realizar esta acción.', 'white', 0, 0, ws);
            return;
        }

        var itemInventary = user.inv[idPos];

        if (itemInventary) {
            var idItem = itemInventary.idItem;
            var item = vars.datObj[idItem];

            if (item.clasesPermitidas.indexOf(user.idClase) >= 0) {
                handleProtocol.console('Tu clase no puede equipar ese item.', 'white', 0, 0, ws);
                return;
            }

            if ((item.razaEnana && !game.isRazaEnana(user.idRaza) && item.objType == vars.objType.armaduras) || (!item.razaEnana && game.isRazaEnana(user.idRaza) && item.objType == vars.objType.armaduras)) {
                handleProtocol.console('Tu raza no puede equipar ese item.', 'white', 0, 0, ws);
                return;
            }

            switch (item.objType) {
                case vars.objType.armaduras: //Ropa
                    if (itemInventary.equipped) {
                        var bodyNaked = game.bodyNaked(ws.id);
                        user.idBody = bodyNaked;
                        if (user.idItemBody && user.inv[user.idItemBody]) {
                            user.inv[user.idItemBody].equipped = 0;
                        }
                        user.idItemBody = 0;
                    } else {
                        user.idBody = item.anim;
                        if (user.idItemBody && user.inv[user.idItemBody]) {
                            user.inv[user.idItemBody].equipped = 0;
                        }
                        user.idItemBody = idPos;
                        itemInventary.equipped = 1;
                    }

                    game.loopArea(ws, function(target) {
                        if (!target.isNpc) {
                            handleProtocol.changeRopa(ws.id, user.idBody, idPos, vars.clients[target.id]);
                        }
                    });
                    break;

                case vars.objType.armas: //Arma
                    if (itemInventary.equipped) {
                        user.idWeapon = 0;
                        if (user.idItemWeapon && user.inv[user.idItemWeapon]) {
                            user.inv[user.idItemWeapon].equipped = 0;
                        }
                        user.idItemWeapon = 0;
                    } else {
                        user.idWeapon = item.anim;
                        if (user.idItemWeapon && user.inv[user.idItemWeapon]) {
                            user.inv[user.idItemWeapon].equipped = 0;
                        }
                        user.idItemWeapon = idPos;
                        itemInventary.equipped = 1;
                    }

                    game.loopArea(ws, function(target) {
                        if (!target.isNpc) {
                            handleProtocol.changeWeapon(ws.id, user.idWeapon, idPos, vars.clients[target.id]);
                        }
                    });
                    break;

                case vars.objType.flechas: //Flechas
                    if (itemInventary.equipped) {
                        if (user.idItemArrow && user.inv[user.idItemArrow]) {
                            user.inv[user.idItemArrow].equipped = 0;
                        }
                        user.idItemArrow = 0;
                    } else {
                        if (user.idItemArrow && user.inv[user.idItemArrow]) {
                            user.inv[user.idItemArrow].equipped = 0;
                        }
                        user.idItemArrow = idPos;
                        itemInventary.equipped = 1;
                    }

                    game.loopArea(ws, function(target) {
                        if (!target.isNpc) {
                            handleProtocol.changeArrow(ws.id, idPos, vars.clients[target.id]);
                        }
                    });
                    break;

                case vars.objType.escudos: //Escudo
                    if (itemInventary.equipped) {
                        user.idShield = 0;
                        if (user.idItemShield && user.inv[user.idItemShield]) {
                            user.inv[user.idItemShield].equipped = 0;
                        }
                        user.idItemShield = 0;
                    } else {
                        user.idShield = item.anim;
                        if (user.idItemShield && user.inv[user.idItemShield]) {
                            user.inv[user.idItemShield].equipped = 0;
                        }
                        user.idItemShield = idPos;
                        itemInventary.equipped = 1;
                    }

                    game.loopArea(ws, function(target) {
                        if (!target.isNpc) {
                            handleProtocol.changeShield(ws.id, user.idShield, idPos, vars.clients[target.id]);
                        }
                    });
                    break;

                case vars.objType.cascos: //Casco
                    if (itemInventary.equipped) {
                        user.idHelmet = 0;
                        if (user.idItemHelmet && user.inv[user.idItemHelmet]) {
                            user.inv[user.idItemHelmet].equipped = 0;
                        }
                        user.idItemHelmet = 0;
                    } else {
                        user.idHelmet = item.anim;
                        if (user.idItemHelmet && user.inv[user.idItemHelmet]) {
                            user.inv[user.idItemHelmet].equipped = 0;
                        }
                        user.idItemHelmet = idPos;
                        itemInventary.equipped = 1;
                    }

                    game.loopArea(ws, function(target) {
                        if (!target.isNpc) {
                            handleProtocol.changeHelmet(ws.id, user.idHelmet, idPos, vars.clients[target.id]);
                        }
                    });
                    break;
            }
        }
    } catch (err) {
        funct.dumpError(err);
    }
}

function connectCharacter(ws) {
    try {
        var nameAccount = pkg.getString().trim();
        var password = pkg.getString().trim();
        var nameCharacter = pkg.getString().trim();

        login.connect(ws, nameAccount, password, nameCharacter);
    } catch (err) {
        funct.dumpError(err);
    }
}

function position(ws) {
    try {
        if (!game.existPjOrClose(ws)) {
            return;
        }

        var user = vars.personajes[ws.id];

        if (user.walk.pasos >= 30) {
            var tmpDate = +Date.now();

            var msPasos = tmpDate - user.walk.startTimer;

            if (msPasos < 6000) {
                console.log("[ALERT|POSITION | " + funct.dateFormat(new Date(), "%d-%m-%Y %H:%M:%S") + "] Usuario: " + user.nameCharacter + " - intervalo: " + msPasos);
            }

            user.walk.pasos = 0;
            user.walk.startTimer = +Date.now();
        }

        user.walk.pasos++;

        var heading = pkg.getByte();

        if (heading < 1 || heading > 5) {
            return;
        }

        if (user.inmovilizado || user.paralizado) {
            if (+Date.now() - user.cooldownParalizado < vars.timeInmo) {
                user.heading = heading;

                game.loopArea(ws, function(target) {
                    if (!target.isNpc && target.id != ws.id) {
                        handleProtocol.changeHeading(ws.id, heading, vars.clients[target.id]);
                    }
                });
                return;
            } else {
                user.inmovilizado = 0;
                user.paralizado = 0;
                user.cooldownParalizado = 0;

                handleProtocol.inmo(ws.id, 0, ws);
                return;
            }
        }

        if (user.meditar) {
            user.meditar = false;

            handleProtocol.console('Terminas de meditar.', 'white', 0, 0, ws);

            game.loopArea(ws, function(client) {
                if (!client.isNpc) {
                    handleProtocol.animFX(ws.id, 0, vars.clients[client.id]);
                }
            });
        }

        oldX = user.pos.x;
        oldY = user.pos.y;

        newX = 0;
        newY = 0;

        if (heading == vars.direcciones.right) {
            newX = 1;
        } else if (heading == vars.direcciones.left) {
            newX = -1;
        } else if (heading == vars.direcciones.down) {
            newY = 1;
        } else if (heading == vars.direcciones.up) {
            newY = -1;
        }

        posX = oldX + newX;
        posY = oldY + newY;

        user.heading = heading;

        var tileExit = vars.mapa[user.map][posY][posX].tileExit;

        if (typeof tileExit !== 'undefined') {
            npcs.deleteUserToAllNpcs(ws.id);
            game.telep(ws, tileExit.map, tileExit.x, tileExit.y);
            return;
        }

        if (!game.legalPos(posX, posY, user.map, user.navegando)) {
            handleProtocol.actPositionServer(user.pos, user.heading, ws);
            return;
        }

        vars.mapData[user.map][oldY][oldX].id = 0;

        vars.mapData[user.map][posY][posX].id = ws.id;

        user.pos.x = posX;
        user.pos.y = posY;

        //Actualizo la posicion de todos los usuarios de mi area
        game.loopArea(ws, function(target) {
            if (!target.isNpc && target.id != ws.id) {
                handleProtocol.actPosition(ws.id, user.pos, vars.clients[target.id]);
            }
        });

        if (heading == vars.direcciones.right) {

            var positionStartX = user.pos.x + 10;
            var positionStartY = user.pos.y - 10;

            //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
            for (var y = positionStartY; y < positionStartY + 21; y++) {
                if (positionStartX >= 1 && y >= 1 && positionStartX <= 100 && y <= 100) {
                    var mapData = vars.mapData[user.map][y][positionStartX];

                    if (mapData.id) {
                        var newUserID = mapData.id;

                        var target = vars.personajes[newUserID];

                        if (!target) {
                            target = vars.npcs[newUserID];
                            if (target.movement == 3 && !user.dead) {
                                if (vars.areaNpc[newUserID].indexOf(ws.id) < 0) {
                                    vars.areaNpc[newUserID].push(ws.id);
                                }
                            }

                            handleProtocol.sendNpc(target);
                            socket.send(ws);
                        } else {
                            handleProtocol.sendCharacter(target);
                            socket.send(ws);
                        }

                        if (vars.personajes[newUserID]) {
                            handleProtocol.sendCharacter(user);
                            socket.send(vars.clients[newUserID]);
                        }
                    }

                    var pos = {
                        x: positionStartX,
                        y: y
                    };

                    if (game.hayObj(user.map, pos)) {
                        var item = game.objMap(user.map, pos);
                        var obj = vars.datObj[item.objIndex];

                        if (obj.objType == vars.objType.puerta) {
                            if (item.objIndex == obj.indexAbierta) {
                                handleProtocol.blockMap(user.map, pos, 0, ws);
                                handleProtocol.blockMap(user.map, {
                                    x: pos.x - 1,
                                    y: pos.y
                                }, 0, ws);
                            }
                        }

                        handleProtocol.renderItem(item.objIndex, user.map, pos, ws);
                    }
                }
            }

            positionStartX = user.pos.x - 11;
            positionStartY = user.pos.y - 10;


            //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
            for (y = positionStartY; y < positionStartY + 21; y++) {
                if (positionStartX >= 1 && y >= 1 && positionStartX <= 100 && y <= 100) {
                    var mapData = vars.mapData[user.map][y][positionStartX];

                    if (mapData.id) {
                        var newUserID = mapData.id;

                        handleProtocol.deleteCharacter(newUserID, ws);

                        if (vars.personajes[newUserID]) {
                            handleProtocol.deleteCharacter(ws.id, vars.clients[newUserID]);
                        } else if (vars.npcs[newUserID] && vars.npcs[newUserID].movement == 3) {
                            var index = vars.areaNpc[newUserID].indexOf(ws.id);

                            if (index > -1) {
                                vars.areaNpc[newUserID].splice(index, 1);
                            }
                        }
                    }

                    var pos = {
                        x: positionStartX,
                        y: y
                    };

                    if (game.hayObj(user.map, pos)) {
                        handleProtocol.deleteItem(user.map, pos, ws);
                    }
                }
            }
        } else if (heading == vars.direcciones.left) {

            var positionStartX = user.pos.x - 10;
            var positionStartY = user.pos.y - 10;

            //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
            for (var y = positionStartY; y < positionStartY + 21; y++) {
                if (positionStartX >= 1 && y >= 1 && positionStartX <= 100 && y <= 100) {
                    var mapData = vars.mapData[user.map][y][positionStartX];

                    if (mapData.id) {
                        var newUserID = mapData.id;

                        var target = vars.personajes[newUserID];

                        if (!target) {
                            target = vars.npcs[newUserID];
                            if (target.movement == 3 && !user.dead) {
                                if (vars.areaNpc[newUserID].indexOf(ws.id) < 0) {
                                    vars.areaNpc[newUserID].push(ws.id);
                                }
                            }

                            handleProtocol.sendNpc(target);
                            socket.send(ws);
                        } else {
                            handleProtocol.sendCharacter(target);
                            socket.send(ws);
                        }

                        if (vars.personajes[newUserID]) {
                            handleProtocol.sendCharacter(user);
                            socket.send(vars.clients[newUserID]);
                        }
                    }

                    var pos = {
                        x: positionStartX,
                        y: y
                    };

                    if (game.hayObj(user.map, pos)) {
                        var item = game.objMap(user.map, pos);
                        var obj = vars.datObj[item.objIndex];

                        if (obj.objType == vars.objType.puerta) {
                            if (item.objIndex == obj.indexAbierta) {
                                handleProtocol.blockMap(user.map, pos, 0, ws);
                                handleProtocol.blockMap(user.map, {
                                    x: pos.x - 1,
                                    y: pos.y
                                }, 0, ws);
                            }
                        }

                        handleProtocol.renderItem(item.objIndex, user.map, pos, ws);
                    }
                }
            }

            positionStartX = user.pos.x + 11;
            positionStartY = user.pos.y - 10;


            //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
            for (y = positionStartY; y < positionStartY + 21; y++) {
                if (positionStartX >= 1 && y >= 1 && positionStartX <= 100 && y <= 100) {
                    var mapData = vars.mapData[user.map][y][positionStartX];

                    if (mapData.id) {
                        var newUserID = mapData.id;
                        handleProtocol.deleteCharacter(newUserID, ws);

                        if (vars.personajes[newUserID]) {
                            handleProtocol.deleteCharacter(ws.id, vars.clients[newUserID]);
                        } else if (vars.npcs[newUserID] && vars.npcs[newUserID].movement == 3) {
                            var index = vars.areaNpc[newUserID].indexOf(ws.id);

                            if (index > -1) {
                                vars.areaNpc[newUserID].splice(index, 1);
                            }
                        }
                    }

                    var pos = {
                        x: positionStartX,
                        y: y
                    };

                    if (game.hayObj(user.map, pos)) {
                        handleProtocol.deleteItem(user.map, pos, ws);
                    }
                }
            }
        } else if (heading == vars.direcciones.down) {

            var positionStartX = user.pos.x - 10;
            var positionStartY = user.pos.y + 10;

            //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
            for (var x = positionStartX; x < positionStartX + 21; x++) {
                if (x >= 1 && positionStartY >= 1 && x <= 100 && positionStartY <= 100) {
                    var mapData = vars.mapData[user.map][positionStartY][x];

                    if (mapData.id) {
                        var newUserID = mapData.id;

                        var target = vars.personajes[newUserID];

                        if (!target) {
                            target = vars.npcs[newUserID];
                            if (target.movement == 3 && !user.dead) {
                                if (vars.areaNpc[newUserID].indexOf(ws.id) < 0) {
                                    vars.areaNpc[newUserID].push(ws.id);
                                }
                            }

                            handleProtocol.sendNpc(target);
                            socket.send(ws);
                        } else {
                            handleProtocol.sendCharacter(target);
                            socket.send(ws);
                        }

                        if (vars.personajes[newUserID]) {
                            handleProtocol.sendCharacter(user);
                            socket.send(vars.clients[newUserID]);
                        }
                    }

                    var pos = {
                        x: x,
                        y: positionStartY
                    };

                    if (game.hayObj(user.map, pos)) {
                        var item = game.objMap(user.map, pos);
                        var obj = vars.datObj[item.objIndex];

                        if (obj.objType == vars.objType.puerta) {
                            if (item.objIndex == obj.indexAbierta) {
                                handleProtocol.blockMap(user.map, pos, 0, ws);
                                handleProtocol.blockMap(user.map, {
                                    x: pos.x - 1,
                                    y: pos.y
                                }, 0, ws);
                            }
                        }

                        handleProtocol.renderItem(item.objIndex, user.map, pos, ws);
                    }
                }
            }

            positionStartX = user.pos.x - 10;
            positionStartY = user.pos.y - 11;


            //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
            for (x = positionStartX; x < positionStartX + 21; x++) {
                if (x >= 1 && positionStartY >= 1 && x <= 100 && positionStartY <= 100) {
                    var mapData = vars.mapData[user.map][positionStartY][x];

                    if (mapData.id) {
                        var newUserID = mapData.id;
                        handleProtocol.deleteCharacter(newUserID, ws);

                        if (vars.personajes[newUserID]) {
                            handleProtocol.deleteCharacter(ws.id, vars.clients[newUserID]);
                        } else if (vars.npcs[newUserID] && vars.npcs[newUserID].movement == 3) {
                            var index = vars.areaNpc[newUserID].indexOf(ws.id);

                            if (index > -1) {
                                vars.areaNpc[newUserID].splice(index, 1);
                            }
                        }
                    }

                    var pos = {
                        x: x,
                        y: positionStartY
                    };

                    if (game.hayObj(user.map, pos)) {
                        handleProtocol.deleteItem(user.map, pos, ws);
                    }
                }
            }
        } else if (heading == vars.direcciones.up) {

            var positionStartX = user.pos.x - 10;
            var positionStartY = user.pos.y - 10;

            //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
            for (var x = positionStartX; x < positionStartX + 21; x++) {
                if (x >= 1 && positionStartY >= 1 && x <= 100 && positionStartY <= 100) {
                    var mapData = vars.mapData[user.map][positionStartY][x];

                    if (mapData.id) {
                        var newUserID = mapData.id;

                        var target = vars.personajes[newUserID];

                        if (!target) {
                            target = vars.npcs[newUserID];
                            if (target.movement == 3 && !user.dead) {
                                if (vars.areaNpc[newUserID].indexOf(ws.id) < 0) {
                                    vars.areaNpc[newUserID].push(ws.id);
                                }
                            }

                            handleProtocol.sendNpc(target);
                            socket.send(ws);
                        } else {
                            handleProtocol.sendCharacter(target);
                            socket.send(ws);
                        }

                        if (vars.personajes[newUserID]) {
                            handleProtocol.sendCharacter(user);
                            socket.send(vars.clients[newUserID]);
                        }
                    }

                    var pos = {
                        x: x,
                        y: positionStartY
                    };

                    if (game.hayObj(user.map, pos)) {
                        var item = game.objMap(user.map, pos);
                        var obj = vars.datObj[item.objIndex];

                        if (obj.objType == vars.objType.puerta) {
                            if (item.objIndex == obj.indexAbierta) {
                                handleProtocol.blockMap(user.map, pos, 0, ws);
                                handleProtocol.blockMap(user.map, {
                                    x: pos.x - 1,
                                    y: pos.y
                                }, 0, ws);
                            }
                        }

                        handleProtocol.renderItem(item.objIndex, user.map, pos, ws);
                    }
                }
            }

            positionStartX = user.pos.x - 10;
            positionStartY = user.pos.y + 11;


            //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
            for (x = positionStartX; x < positionStartX + 21; x++) {
                if (x >= 1 && positionStartY >= 1 && x <= 100 && positionStartY <= 100) {
                    var mapData = vars.mapData[user.map][positionStartY][x];

                    if (mapData.id) {
                        var newUserID = mapData.id;
                        handleProtocol.deleteCharacter(newUserID, ws);

                        if (vars.personajes[newUserID]) {
                            handleProtocol.deleteCharacter(ws.id, vars.clients[newUserID]);
                        } else if (vars.npcs[newUserID] && vars.npcs[newUserID].movement == 3) {
                            var index = vars.areaNpc[newUserID].indexOf(ws.id);

                            if (index > -1) {
                                vars.areaNpc[newUserID].splice(index, 1);
                            }
                        }
                    }

                    var pos = {
                        x: x,
                        y: positionStartY
                    };

                    if (game.hayObj(user.map, pos)) {
                        handleProtocol.deleteItem(user.map, pos, ws);
                    }
                }
            }
        }
    } catch (err) {
        funct.dumpError(err);
    }
}

function dialog(ws) {
    try {
        if (!game.existPjOrClose(ws)) {
            return;
        }

        var user = vars.personajes[ws.id];

        if (+Date.now() - user.dialogTimer > 500) {
            var msg = pkg.getString().trim();

            var date = new Date();

            if (!msg || user.muted > date) {
                return;
            }

            if (msg.length > vars.textMaxLength) {
                msg = msg.slice(0, vars.textMaxLength);
            }
            user.dialogTimer = +Date.now();

            if (msg[0] == "/") {
                command.msg(msg, ws);
                return;
            }

            var color = "white";

            if (user.privileges == 1 || user.privileges == 2) {
                color = "#419900";
            } else if (user.privileges == 2) {
                color = "red";
            } else {
                color = "white";
            }

            var name = game.getName(ws.id);

            game.loopArea(ws, function(target) {
                if (!target.isNpc) {
                    handleProtocol.dialog(ws.id, msg, name, color, 1, vars.clients[target.id]);
                }
            });
        }
    } catch (err) {
        funct.dumpError(err);
    }
}

function ping(ws) {
    try {
        handleProtocol.pong(ws);
    } catch (err) {
        funct.dumpError(err);
    }
}

function attackMele(ws) {
    try {
        if (!game.existPjOrClose(ws)) {
            return;
        }

        var user = vars.personajes[ws.id];

        if (user.dead) {
            handleProtocol.console('Los muertos no pueden atacar.', 'white', 0, 0, ws);
            return;
        }

        if (user.meditar) {
            handleProtocol.console('Debes dejar de meditar para realizar esta acción.', 'white', 0, 0, ws);
            return;
        }

        var itemWeapon = user.inv[user.idItemWeapon];

        if (itemWeapon) {
            var obj = vars.datObj[itemWeapon.idItem];
            if (obj.proyectil) {
                handleProtocol.console('No puedes usar esta arma así.', 'white', 0, 0, ws);
                return;
            }
        }

        if (user.hit.hits >= 10) {
            var tmpDate = +Date.now();

            var msHits = tmpDate - user.hit.startTimer;

            if (msHits < 9000) {
                console.log("[ALERT|ATTACK | " + funct.dateFormat(new Date(), "%d-%m-%Y %H:%M:%S") + "] Usuario: " + user.nameCharacter + " - intervalo: " + msHits);
            }

            user.hit.hits = 0;
            user.hit.startTimer = +Date.now();
        }

        user.hit.hits++;

        if (+Date.now() - user.hitTimer < 1000) {
            return;
        }

        user.hitTimer = +Date.now();

        var x = user.pos.x;
        var y = user.pos.y;
        var heading = user.heading;
        var valido = false;
        var recibe = "";

        switch (heading) {
            case 1:
                recibe = vars.mapData[user.map][y - 1][x].id;
                if (recibe) {
                    valido = true;
                }
                break;
            case 2:
                recibe = vars.mapData[user.map][y + 1][x].id;
                if (recibe) {
                    valido = true;
                }
                break;
            case 3:
                recibe = vars.mapData[user.map][y][x + 1].id;
                if (recibe) {
                    valido = true;
                }
                break;
            case 4:
                recibe = vars.mapData[user.map][y][x - 1].id;
                if (recibe) {
                    valido = true;
                }
                break;
        }

        if (!recibe) {
            return;
        }

        var pjSelected = vars.personajes[recibe];

        if (!pjSelected) {
            pjSelected = vars.npcs[recibe];
        }

        if (user.idClase == vars.clases.arquero) {
            handleProtocol.console('Los arqueros no pueden atacar cuerpo a cuerpo.', 'white', 0, 0, ws);
            return;
        }

        if (pjSelected.dead) {
            handleProtocol.console('No puedes atacar a un usuario muerto.', 'white', 0, 0, ws);
            return;
        }

        if (pjSelected.hp > 0) {
            var nameWs = game.getName(ws.id);

            var dmg = 0;

            if (pjSelected.isNpc) {
                dmg = game.userDmgNpc(ws.id, pjSelected.id);
            } else {
                dmg = game.userDmgUser(ws.id, pjSelected.id);
            }

            if (dmg) {
                game.loopArea(ws, function(target) {
                    if (!target.isNpc) {
                        handleProtocol.dialog(ws.id, '' + dmg, '', 'red', 0, vars.clients[target.id]);
                    }
                });

                respawn.muere(ws, recibe);
            }
        }
    } catch (err) {
        funct.dumpError(err);
    }
}

function attackRange(ws) {
    try {
        if (!game.existPjOrClose(ws)) {
            return;
        }

        var user = vars.personajes[ws.id];

        if (user.dead) {
            handleProtocol.console('Los muertos no pueden atacar.', 'white', 0, 0, ws);
            return;
        }

        if (user.meditar) {
            handleProtocol.console('Debes dejar de meditar para realizar esta acción.', 'white', 0, 0, ws);
            return;
        }

        var itemWeapon = user.inv[user.idItemWeapon];

        if (!itemWeapon) {
            return;
        }

        var obj = vars.datObj[itemWeapon.idItem];

        if (!user.idItemWeapon) {
            return;
        }

        if (!obj.proyectil) {
            return;
        }

        if (!user.idItemArrow) {
            handleProtocol.console('No tienes flechas equipadas.', 'white', 0, 0, ws);
            return;
        }

        if (user.spell.lanzados >= 10) {
            var tmpDate = +Date.now();

            var msFlechas = tmpDate - user.spell.startTimer;

            if (msFlechas < 7000) {
                console.log("[ALERT|RANGEATTACK | " + funct.dateFormat(new Date(), "%d-%m-%Y %H:%M:%S") + "] Usuario: " + user.nameCharacter + " - intervalo: " + msFlechas);
            }

            user.spell.lanzados = 0;
            user.spell.startTimer = +Date.now();
        }

        user.spell.lanzados++;

        if (+Date.now() - user.hitSpell < 750) {
            return;
        }

        user.hitSpell = +Date.now();

        var pos = {
            x: pkg.getByte(),
            y: pkg.getByte()
        };

        if (pos.x < 0 || pos.x > 100) {
            return;
        }

        if (pos.y < 0 || pos.y > 100) {
            return;
        }

        var tileSelected = vars.mapData[user.map][pos.y][pos.x];

        if (!tileSelected.id) {
            tileSelected = vars.mapData[user.map][pos.y + 1][pos.x];
        }

        if (tileSelected.id) {

            var pjSelected = vars.personajes[tileSelected.id];

            if (!pjSelected) {
                pjSelected = vars.npcs[tileSelected.id];
            }

            if (pjSelected.dead) {
                handleProtocol.console('No puedes atacar a un usuario muerto.', 'white', 0, 0, ws);
                return;
            }

            if (pjSelected.hp > 0) {
                var nameWs = game.getName(ws.id);

                var dmg = 0;

                if (pjSelected.isNpc) {
                    dmg = game.userDmgNpc(ws.id, pjSelected.id);
                } else {
                    dmg = game.userDmgUser(ws.id, pjSelected.id);
                }

                if (dmg) {
                    game.loopArea(ws, function(target) {
                        if (!target.isNpc) {
                            handleProtocol.dialog(ws.id, '' + dmg, '', 'red', 0, vars.clients[target.id]);
                        }
                    });

                    respawn.muere(ws, tileSelected.id);
                }
            }

            user.spellsAcertados++;
        } else {
            user.spellsErrados++;
        }

        game.quitarUserInvItem(ws.id, user.idItemArrow, 1);
    } catch (err) {
        funct.dumpError(err);
    }
}

function attackSpell(ws) {
    try {
        if (!game.existPjOrClose(ws)) {
            return;
        }

        var user = vars.personajes[ws.id];

        if (user.dead) {
            handleProtocol.console('Los muertos no pueden tirar hechizos.', 'white', 0, 0, ws);
            return;
        }

        if (user.spell.lanzados >= 10) {
            var tmpDate = +Date.now();

            var msSpell = tmpDate - user.spell.startTimer;

            if (msSpell < 7000) {
                console.log("[ALERT|ATTACKSPELL | " + funct.dateFormat(new Date(), "%d-%m-%Y %H:%M:%S") + "] Usuario: " + user.nameCharacter + " - intervalo: " + msSpell);
            }

            user.spell.lanzados = 0;
            user.spell.startTimer = +Date.now();
        }

        user.spell.lanzados++;

        if (+Date.now() - user.hitSpell < 750) {
            return;
        }

        user.hitSpell = +Date.now();

        if (user.meditar) {
            handleProtocol.console('Debes dejar de meditar para realizar esta acción.', 'white', 0, 0, ws);
            return;
        }

        var idPos = pkg.getByte();

        if (!user.spells[idPos]) {
            return;
        }

        var idSpell = user.spells[idPos].idSpell;
        var datSpell = vars.datSpell[idSpell];

        if (user.mana < datSpell.manaRequired) {
            return;
        }

        var pos = {
            x: pkg.getByte(),
            y: pkg.getByte()
        };

        if (pos.x < 0 || pos.x > 100) {
            return;
        }

        if (pos.y < 0 || pos.y > 100) {
            return;
        }
            if (vars.datSpell[idSpell].invoca == 1) { 
            for (i = 1; i<3; i++) {
                var spawnx = i; var spawny = 0;
                    if (game.legalPos(spawnx,spawny, vars.personajes[idUser].map))
                game.invocarNPC(idUser,spawnx,spawny, datSpell.NumNpc);
               }
               return
            }
            
        var tileSelected = vars.mapData[user.map][pos.y][pos.x];

        if (!tileSelected.id) {
            tileSelected = vars.mapData[user.map][pos.y + 1][pos.x];
        }

        if (tileSelected.id) {

            var pjSelected = vars.personajes[tileSelected.id];

            if (!pjSelected) {
                pjSelected = vars.npcs[tileSelected.id];
            }

            if (pjSelected.dead) {
                handleProtocol.console('No puedes atacar a un usuario muerto.', 'white', 0, 0, ws);
                return;
            }

            var nameWs = game.getName(ws.id);

            var dmg = 0;

            if (pjSelected.isNpc) {
                dmg = game.userSpellNpc(ws.id, pjSelected.id, idSpell);
            } else {
                dmg = game.userSpellUser(ws.id, pjSelected.id, idSpell);
            }

            if (dmg !== 0) {
                user.mana -= datSpell.manaRequired;
                game.loopArea(ws, function(client) {
                    if (!client.isNpc) {
                        handleProtocol.animFX(tileSelected.id, datSpell.fxGrh, vars.clients[client.id]);
                        handleProtocol.dialog(ws.id, datSpell.palabrasMagicas, '', '#E69500', 0, vars.clients[client.id]);
                    }
                });

                handleProtocol.updateMana(user.mana, ws);
                respawn.muere(ws, tileSelected.id);
            }

            //Updateo mi mana
            user.spellsAcertados++;
        } else {
            user.spellsErrados++;
        }
    } catch (err) {
        funct.dumpError(err);
    }
}

module.exports = protocol;
