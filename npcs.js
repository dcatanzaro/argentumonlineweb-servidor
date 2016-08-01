var vars = require('./vars');
var socket = require('./socket');
var pkg = require('./package');
var funct = require('./functions');
var pathfinding = require('./pathfinding');
var game = require('./game');
var handleProtocol = require('./handleProtocol');

var npcs = new Npcs();

function Npcs() {
    this.createNpc = function() {
        var newNpc = {
            id: 0,
            nameCharacter: '',
            idClase: 1,
            idHead: 0,
            idHelmet: 0,
            idWeapon: 0,
            idBody: 0,
            idShield: 0,
            npcType: 0,
            hp: 0,
            maxHp: 0,
            minHit: 0,
            maxHit: 0,
            def: 0,
            poderAtaque: 0,
            poderEvasion: 0,
            movement: 1,
            color: 'white',
            map: 0,
            pos: {
                x: 0,
                y: 0
            },
            gold: 0,
            heading: 2,
            moveOffsetX: 0,
            moveOffsetY: 0,
            inmovilizado: 0,
            paralizado: 0,
            fxId: 0,
            frameFxCounter: 0,
            zonaSegura: 0,
            exp: 0,
            isNpc: true,
            drop: [],
            rute: [],
            clan: '',
            cooldownAtaque: 0,
            cooldownParalizado: 0,
            aguaValida: 0,
            desc: ""
        };

        return newNpc;
    };

    this.muereNpc = function(idNpc) {
        try {
            var npc = vars.npcs[idNpc];

            vars.mapData[npc.map][npc.pos.y][npc.pos.x].id = 0;

            for (var indexNpc in vars.areaNpc[idNpc]) {
                handleProtocol.deleteCharacter(idNpc, vars.clients[vars.areaNpc[idNpc][indexNpc]]);
            }

            npcs.loopArea(idNpc, function(target) {
                handleProtocol.deleteCharacter(idNpc, vars.clients[target.id]);
            });

            //Ver que onda con esto para que revivan
            vars.areaNpc[idNpc] = [];

            var posNewNpc = game.respawnNpc(npc.map, npc.aguaValida),
                posNewNpcX = posNewNpc.posNewX,
                posNewNpcY = posNewNpc.posNewY;

            npc.pos.x = posNewNpcX;
            npc.pos.y = posNewNpcY;

            npc.cooldownAtaque = +Date.now() + 2000;
            npc.hp = npc.maxHp;
            npc.cooldownParalizado = 0;
            npc.inmovilizado = 0;
            npc.paralizado = 0;

            vars.mapData[npc.map][npc.pos.y][npc.pos.x].id = idNpc;

            npcs.loopArea(idNpc, function(target) {
                if (vars.areaNpc[idNpc].indexOf(target.id) < 0) {
                    vars.areaNpc[idNpc].push(target.id);
                    handleProtocol.sendNpc(npc);
                    socket.send(vars.clients[target.id]);
                }
            });
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.findDirection = function(posNpc, posUser) {
        try {
            var X = Math.sign(posNpc.x - posUser.x),
                Y = Math.sign(posNpc.y - posUser.y);

            if (X == -1 && Y == 1) {
                return vars.direcciones.up;
            } else if (X == 1 && Y == 1) {
                return vars.direcciones.left;
            } else if (X == 1 && Y == -1) {
                return vars.direcciones.left;
            } else if (X == -1 && Y == -1) {
                return vars.direcciones.down;
            } else if (X == 0 && Y == -1) {
                return vars.direcciones.down;
            } else if (X == 0 && Y == 1) {
                return vars.direcciones.up;
            } else if (X == 1 && Y == 0) {
                return vars.direcciones.left;
            } else if (X == -1 && Y == 0) {
                return vars.direcciones.right;
            } else if (X == 0 && Y == 0) {
                return 0;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.findDirectionBlock = function(direction) {
        if (vars.direcciones.up == direction || vars.direcciones.down == direction) {
            return funct.randomIntFromInterval(vars.direcciones.right, vars.direcciones.left);
        } else if (vars.direcciones.left == direction || vars.direcciones.right == direction) {
            return funct.randomIntFromInterval(vars.direcciones.up, vars.direcciones.down);
        }
    };

    this.isUserAttackable = function(idUser, idNpc) {
        try {
            var user = vars.personajes[idUser],
                npc = vars.npcs[idNpc],
                x = user.pos.x - npc.pos.x,
                y = user.pos.y - npc.pos.y;

            if ((x == 0 && y == 1) || (x == -1 && y == 0) || (x == 0 && y == -1) || (x == 1 && y == 0)) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.npcAttackUser = function(idNpc) {
        try {
            var idUser = vars.areaNpc[idNpc][0];

            var user = vars.personajes[idUser];

            if (!user) {
                var index = vars.areaNpc[idNpc].indexOf(idUser);

                if (index > -1) {
                    vars.areaNpc[idNpc].splice(index, 1);
                }

                console.log("No existe user " + idUser);
                return;
            }

            var npc = vars.npcs[idNpc];

            if (!npc) {
                console.log("No existe npc " + idNpc);
                return;
            }

            if (npc.map != user.map) {
                var index = vars.areaNpc[idNpc].indexOf(idUser);

                if (index > -1) {
                    vars.areaNpc[idNpc].splice(index, 1);
                }

                console.log("Borro al Usuario " + idUser + " del NPC " + idNpc);

                return;
            }

            if (user.hp <= 0) {
                return;
            }
            if (vars.npcs[idNpc].summonedBy  && user.id == vars.npcs[idNpc].summonedBy) {
                return
            }
            if (+Date.now() - npc.cooldownParalizado < vars.cooldownParalisisNpc) {
                return;
            }

            if (npc.paralizado) {
                npc.paralizado = 0;
            }

            if (npc.inmovilizado) {
                npc.inmovilizado = 0;
            }

            if (!npcs.isUserAttackable(idUser, idNpc)) {
                var direction = npcs.findDirection(npc.pos, user.pos);

                if (!direction) {
                    direction = npc.heading;
                }

                /*var newX = 0,
                    newY = 0;

                if (direction == vars.direcciones.right) {
                    newX = 1;
                } else if (direction == vars.direcciones.left) {
                    newX = -1;
                } else if (direction == vars.direcciones.down) {
                    newY = 1;
                } else if (direction == vars.direcciones.up) {
                    newY = -1;
                }

                var tmpPosX = npc.pos.x + newX;
                var tmpPosY = npc.pos.y + newY;

                console.log(direction);

                if (!game.legalPos(tmpPosX, tmpPosY, npc.map, npc.aguaValida)) {
                    direction = npcs.findDirectionBlock(direction);
                }

                console.log(direction);*/

                npcs.moveNpc(idNpc, direction);
            } else {
                if (+Date.now() - npc.cooldownAtaque < vars.cooldownAtaqueNpc) {
                    return;
                }

                var directionNpc = npcs.findDirection(npc.pos, user.pos);

                if (directionNpc != npc.heading) {
                    npc.heading = directionNpc;
                    npcs.loopArea(idNpc, function(client) {
                        handleProtocol.changeHeading(idNpc, npc.heading, vars.clients[client.id]);
                    });
                }

                npc.cooldownAtaque = +Date.now();

                var userEvasion = game.poderEvasion(idUser),
                    npcPoderAtaque = npc.poderAtaque,
                    poderEvasionEscudo = game.poderEvasionEscudo(idUser);

                if (user.idItemShield) {
                    userEvasion += poderEvasionEscudo;
                }

                var probExito = Math.max(10, Math.min(90, 50 + ((npcPoderAtaque - userEvasion) * 0.4))),
                    npcImpacto = (funct.randomIntFromInterval(1, 100) <= probExito),
                    dmg = 0;

                if (npcImpacto) {
                    dmg = parseInt(funct.randomIntFromInterval(npc.minHit, npc.maxHit));

                    var lugarCuerpo = funct.randomIntFromInterval(vars.partesCuerpo.cabeza, vars.partesCuerpo.torso),
                        absorbeDmg = 0;

                    switch (lugarCuerpo) {
                        case vars.partesCuerpo.cabeza:
                            if (user.idItemHelmet) {
                                var itemInventaryHelmet = user.inv[user.idItemHelmet];
                                var idItemHelmet = itemInventaryHelmet.idItem;
                                var itemHelmet = vars.datObj[idItemHelmet];

                                absorbeDmg = funct.randomIntFromInterval(itemHelmet.minDef, itemHelmet.maxDef);
                            }

                            break;
                        default:
                            var minDef = 0,
                                maxDef = 0;

                            if (user.idItemBody) {
                                var itemInventaryBody = user.inv[user.idItemBody];
                                var idItemBody = itemInventaryBody.idItem;
                                var itemBody = vars.datObj[idItemBody];

                                minDef = itemBody.minDef;
                                maxDef = itemBody.maxDef;
                            }

                            if (user.idItemShield) {
                                var itemInventaryShield = user.inv[user.idItemShield];
                                var idItemShield = itemInventaryShield.idItem;
                                var itemShield = vars.datObj[idItemShield];

                                minDef += itemShield.minDef;
                                maxDef += itemShield.maxDef;
                            }

                            if (maxDef > 0) {
                                absorbeDmg = funct.randomIntFromInterval(minDef, maxDef);
                            }
                            break;
                    }

                    dmg -= absorbeDmg;

                    if (dmg < 1) {
                        dmg = 1;
                    }

                    //var lugar = funct.randomIntFromInterval(1, 6);

                    //Agregar golpes a la cabeza y al cuerpo;

                    user.hp -= dmg;

                    handleProtocol.updateHP(user.hp, vars.clients[idUser]);

                    switch (lugarCuerpo) {
                        case vars.partesCuerpo.cabeza:
                            handleProtocol.console(npc.nameCharacter + ' te ha pegado en la cabeza por ' + dmg, 'red', 1, 0, vars.clients[idUser]);
                            break;
                        case vars.partesCuerpo.piernaIzquierda:
                            handleProtocol.console(npc.nameCharacter + ' te ha pegado en la pierna izquierda por ' + dmg, 'red', 1, 0, vars.clients[idUser]);
                            break;
                        case vars.partesCuerpo.piernaDerecha:
                            handleProtocol.console(npc.nameCharacter + ' te ha pegado en la pierna derecha por ' + dmg, 'red', 1, 0, vars.clients[idUser]);
                            break;
                        case vars.partesCuerpo.brazoDerecho:
                            handleProtocol.console(npc.nameCharacter + ' te ha pegado en el brazo derecho por ' + dmg, 'red', 1, 0, vars.clients[idUser]);
                            break;
                        case vars.partesCuerpo.brazoIzquierdo:
                            handleProtocol.console(npc.nameCharacter + ' te ha pegado en el brazo izquierdo por ' + dmg, 'red', 1, 0, vars.clients[idUser]);
                            break;
                        case vars.partesCuerpo.torso:
                            handleProtocol.console(npc.nameCharacter + ' te ha pegado en el torso por ' + dmg, 'red', 1, 0, vars.clients[idUser]);
                            break;
                    }

                    if (user.hp <= 0) {
                        npcs.deleteUserToAllNpcs(idUser);

                        user.hp = 0;
                        handleProtocol.updateHP(user.hp, vars.clients[idUser]);
                        game.putBodyAndHeadDead(idUser);

                        if (!user.navegando) {
                            game.tirarItemsUser(idUser);
                        }

                        handleProtocol.console(npc.nameCharacter + ' te ha matado.', 'red', 1, 0, vars.clients[idUser]);
                    }
                } else {
                    var rechazo = false;

                    if (user.idItemShield) {
                        var skillDefensa = game.getSkillDefensa(idUser);
                        var skillTacticasCombate = game.getSkillTacticasCombate(idUser);

                        if (skillDefensa + skillTacticasCombate > 0) {
                            var probRechazo = Math.max(10, Math.min(90, 100 * skillDefensa / skillDefensa + skillTacticasCombate));

                            rechazo = (funct.randomIntFromInterval(1, 100) <= probRechazo);
                        }
                    }

                    dmg = '¡Fallas!';

                    if (rechazo) {
                        handleProtocol.console('¡Has bloqueado el golpe con el escudo!', 'red', 1, 0, vars.clients[idUser]);
                    } else {
                        handleProtocol.console(npc.nameCharacter + ' ha fallado un golpe.', 'red', 1, 0, vars.clients[idUser]);
                    }
                }

                npcs.loopArea(idNpc, function(target) {
                    handleProtocol.dialog(idNpc, '' + dmg, '', 'red', 0, vars.clients[target.id]);
                });

                if (user.meditar) {
                    user.meditar = false;

                    handleProtocol.console('Terminas de meditar.', 'white', 0, 0, vars.clients[idUser]);

                    game.loopArea(vars.clients[idUser], function(client) {
                        if (!client.isNpc) {
                            handleProtocol.animFX(idUser, 0, vars.clients[client.id]);
                        }
                    });
                }
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.posMovement = function(heading, idNpc) {
        try {
            var newX = 0;
            var newY = 0;

            var npc = vars.npcs[idNpc];

            var oldX = npc.pos.x;
            var oldY = npc.pos.y;

            if (heading == vars.direcciones.right) {
                newX = 1;
            } else if (heading == vars.direcciones.left) {
                newX = -1;
            } else if (heading == vars.direcciones.down) {
                newY = 1;
            } else if (heading == vars.direcciones.up) {
                newY = -1;
            }

            var posX = oldX + newX;
            var posY = oldY + newY;

            return {
                x: posX,
                y: posY
            };
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.moveNpc = function(idNpc, heading) {
        try {
            var npc = vars.npcs[idNpc];

            var oldX = npc.pos.x;
            var oldY = npc.pos.y;

            var pos = npcs.posMovement(heading, idNpc);

            npc.heading = heading;
            vars.oldHeading = heading;

            if (!game.legalPos(pos.x, pos.y, npc.map, npc.aguaValida)) {
                return;
            }

            vars.mapData[npc.map][oldY][oldX].id = 0;

            vars.mapData[npc.map][pos.y][pos.x].id = idNpc;

            npc.pos.x = pos.x;
            npc.pos.y = pos.y;

            npcs.npcToArea(idNpc, heading);
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.moveNpcByPos = function(idNpc, pos) {
        try {
            var npc = vars.npcs[idNpc];

            var oldX = npc.pos.x;
            var oldY = npc.pos.y;

            var newX = 0;
            var newY = 0;

            var heading = 0;

            newX = pos.x - oldX;
            newY = pos.y - oldY;

            if (funct.sign(newX) == 1) {
                heading = vars.direcciones.right;
            } else if (funct.sign(newX) == -1) {
                heading = vars.direcciones.left;
            } else if (funct.sign(newY) == 1) {
                heading = vars.direcciones.down;
            } else if (funct.sign(newY) == -1) {
                heading = vars.direcciones.up;
            }

            npc.heading = heading;

            /*if (!game.legalPos(pos.x, pos.y, npc.map)) {
                npcs.moveNpcToCoord(idNpc, npc.toPos, function(rute) {
                    npcs.moveNpcByPos(idNpc, {
                        x: rute.x,
                        y: rute.y
                    });
                });
                return;
            }*/

            vars.mapData[npc.map][oldY][oldX].id = 0;

            vars.mapData[npc.map][pos.y][pos.x].id = idNpc;

            npc.pos.x = pos.x;
            npc.pos.y = pos.y;

            npc.rute.shift();

            npcs.npcToArea(idNpc, heading);
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.moveNpcToCoord = function(idNpc, coord, callback) {
        try {
            var npc = vars.npcs[idNpc];

            var rute = pathfinding.generateRute(npc.map, npc.pos, coord);

            npc.rute = rute;
            npc.toPos = coord;

            if (callback && rute.length > 0) {
                callback({
                    x: rute[0][0] + 1,
                    y: rute[0][1] + 1
                });
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.loopArea = function(idNpc, callback) {
        try {
            var npc = vars.npcs[idNpc];

            var posXStart = npc.pos.x - 10;
            var posYStart = npc.pos.y - 10;

            var posXEnd = npc.pos.x + 10;
            var posYEnd = npc.pos.y + 10;

            for (var y = posYStart; y <= posYEnd; y++) {
                for (var x = posXStart; x <= posXEnd; x++) {

                    if (x >= 1 && x <= 100 && y >= 1 && y <= 100) {
                        var mapData = vars.mapData[npc.map][y][x];

                        if (mapData.id) {
                            var target = vars.personajes[mapData.id];

                            if (target) {
                                callback(target);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.loopAreaPos = function(idMap, pos, callback) {
        try {
            var posXStart = pos.x - 8;
            var posYStart = pos.y - 8;

            var posXEnd = pos.x + 8;
            var posYEnd = pos.y + 8;

            for (var y = posYStart; y <= posYEnd; y++) {
                for (var x = posXStart; x <= posXEnd; x++) {

                    if (x >= 1 && x <= 100 && y >= 1 && y <= 100) {
                        var mapData = vars.mapData[idMap][y][x];

                        if (mapData.id) {
                            var target = vars.personajes[mapData.id];

                            if (target) {
                                callback(target);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.npcToArea = function(idNpc, heading) {
        try {
            var npc = vars.npcs[idNpc];

            npcs.loopArea(idNpc, function(client) {
                handleProtocol.actPosition(idNpc, npc.pos, vars.clients[client.id]);
            });

            if (heading == vars.direcciones.right) {

                var positionStartX = npc.pos.x + 10;
                var positionStartY = npc.pos.y - 10;

                //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
                for (var y = positionStartY; y < positionStartY + 21; y++) {
                    if (positionStartX >= 1 && y >= 1 && positionStartX <= 100 && y <= 100) {
                        var mapData = vars.mapData[npc.map][y][positionStartX];

                        if (mapData.id) {
                            var newUserID = mapData.id;

                            var target = vars.personajes[newUserID];

                            if (target) {
                                if (vars.areaNpc[idNpc].indexOf(newUserID) < 0) {
                                    vars.areaNpc[idNpc].push(newUserID);

                                    handleProtocol.sendNpc(npc);
                                    socket.send(vars.clients[newUserID]);
                                }
                            }
                        }
                    }
                }

                positionStartX = npc.pos.x - 11;
                positionStartY = npc.pos.y - 10;

                //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
                for (y = positionStartY; y < positionStartY + 21; y++) {
                    if (positionStartX >= 1 && y >= 1 && positionStartX <= 100 && y <= 100) {
                        var mapData = vars.mapData[npc.map][y][positionStartX];

                        if (mapData.id) {
                            var newUserID = mapData.id;

                            if (vars.personajes[newUserID]) {
                                var index = vars.areaNpc[idNpc].indexOf(newUserID);

                                if (index > -1) {
                                    vars.areaNpc[idNpc].splice(index, 1);
                                    handleProtocol.deleteCharacter(idNpc, vars.clients[newUserID]);
                                }
                            }
                        }
                    }
                }
            } else if (heading == vars.direcciones.left) {

                var positionStartX = npc.pos.x - 10;
                var positionStartY = npc.pos.y - 10;

                //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
                for (var y = positionStartY; y < positionStartY + 21; y++) {
                    if (positionStartX >= 1 && y >= 1 && positionStartX <= 100 && y <= 100) {
                        var mapData = vars.mapData[npc.map][y][positionStartX];

                        if (mapData.id) {
                            var newUserID = mapData.id;

                            var target = vars.personajes[newUserID];

                            if (target) {
                                if (vars.areaNpc[idNpc].indexOf(newUserID) < 0) {
                                    vars.areaNpc[idNpc].push(newUserID);

                                    handleProtocol.sendNpc(npc);
                                    socket.send(vars.clients[newUserID]);
                                }
                            }
                        }
                    }
                }

                positionStartX = npc.pos.x + 11;
                positionStartY = npc.pos.y - 10;


                //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
                for (y = positionStartY; y < positionStartY + 21; y++) {
                    if (positionStartX >= 1 && y >= 1 && positionStartX <= 100 && y <= 100) {
                        var mapData = vars.mapData[npc.map][y][positionStartX];

                        if (mapData.id) {
                            var newUserID = mapData.id;

                            if (vars.personajes[newUserID]) {
                                var index = vars.areaNpc[idNpc].indexOf(newUserID);

                                if (index > -1) {
                                    vars.areaNpc[idNpc].splice(index, 1);
                                    handleProtocol.deleteCharacter(idNpc, vars.clients[newUserID]);
                                }
                            }
                        }
                    }
                }
            } else if (heading == vars.direcciones.down) {

                var positionStartX = npc.pos.x - 10;
                var positionStartY = npc.pos.y + 10;

                //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
                for (var x = positionStartX; x < positionStartX + 21; x++) {
                    if (x >= 1 && positionStartY >= 1 && x <= 100 && positionStartY <= 100) {
                        var mapData = vars.mapData[npc.map][positionStartY][x];

                        if (mapData.id) {
                            var newUserID = mapData.id;

                            var target = vars.personajes[newUserID];

                            if (target) {
                                if (vars.areaNpc[idNpc].indexOf(newUserID) < 0) {
                                    vars.areaNpc[idNpc].push(newUserID);

                                    handleProtocol.sendNpc(npc);
                                    socket.send(vars.clients[newUserID]);
                                }
                            }
                        }
                    }
                }

                positionStartX = npc.pos.x - 10;
                positionStartY = npc.pos.y - 11;


                //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
                for (x = positionStartX; x < positionStartX + 21; x++) {
                    if (x >= 1 && positionStartY >= 1 && x <= 100 && positionStartY <= 100) {
                        var mapData = vars.mapData[npc.map][positionStartY][x];

                        if (mapData.id) {
                            var newUserID = mapData.id;

                            if (vars.personajes[newUserID]) {
                                var index = vars.areaNpc[idNpc].indexOf(newUserID);

                                if (index > -1) {
                                    vars.areaNpc[idNpc].splice(index, 1);
                                    handleProtocol.deleteCharacter(idNpc, vars.clients[newUserID]);
                                }
                            }
                        }
                    }
                }
            } else if (heading == vars.direcciones.up) {

                var positionStartX = npc.pos.x - 10;
                var positionStartY = npc.pos.y - 10;

                //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
                for (var x = positionStartX; x < positionStartX + 21; x++) {
                    if (x >= 1 && positionStartY >= 1 && x <= 100 && positionStartY <= 100) {

                        var mapData = vars.mapData[npc.map][positionStartY][x];

                        if (mapData.id) {
                            var newUserID = mapData.id;

                            var target = vars.personajes[newUserID];

                            if (target) {
                                if (vars.areaNpc[idNpc].indexOf(newUserID) < 0) {
                                    vars.areaNpc[idNpc].push(newUserID);

                                    handleProtocol.sendNpc(npc);
                                    socket.send(vars.clients[newUserID]);
                                }
                            }
                        }
                    }
                }

                positionStartX = npc.pos.x - 10;
                positionStartY = npc.pos.y + 11;


                //Acá guarda y actualiza las posiciones del usuario y los usuarios del nuevo tile
                for (x = positionStartX; x < positionStartX + 21; x++) {
                    if (x >= 1 && positionStartY >= 1 && x <= 100 && positionStartY <= 100) {
                        var mapData = vars.mapData[npc.map][positionStartY][x];

                        if (mapData.id) {
                            var newUserID = mapData.id;

                            if (vars.personajes[newUserID]) {
                                var index = vars.areaNpc[idNpc].indexOf(newUserID);

                                if (index > -1) {
                                    vars.areaNpc[idNpc].splice(index, 1);
                                    handleProtocol.deleteCharacter(idNpc, vars.clients[newUserID]);
                                }
                            }
                        }
                    }
                }
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.deleteUserToAllNpcs = function(idUser) {
        try {
            game.loopArea(vars.clients[idUser], function(target) {
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

    this.tirarItems = function(idNpc, ws) {
        try {
            var npc = vars.npcs[idNpc],
                random = funct.randomIntFromInterval(1, 100),
                cantDrop = 0;

            var user = vars.personajes[ws.id];

            if (!npc.drop) {
                return;
            }

            //Hay un 10% de chance de que el npc no tire nada
            if (random <= 90) {
                cantDrop++;

                if (random <= 10) {
                    cantDrop++;

                    for (var i = 0; i < 3; i++) {
                        random = funct.randomIntFromInterval(1, 100);

                        if (random <= 10) {
                            cantDrop++;
                        } else {
                            break;
                        }
                    }
                }
            }

            if (cantDrop > 0) {
                for (var i = 0; i < cantDrop; i++) {
                    var item = npc.drop[i];

                    if (item) {
                        var datObj = vars.datObj[item.item];

                        if (datObj.objType == vars.objType.dinero) {
                            var goldGanado = item.cant * vars.multiplicadorGold;
                            user.gold += goldGanado;

                            handleProtocol.console('¡Has ganado ' + goldGanado + ' monedas de oro!', 'red', 1, 0, ws);

                            handleProtocol.actGold(user.gold, ws);
                        } else {
                            npcs.tirarItemAlSuelo(item.item, item.cant, npc.map, npc.pos);
                        }
                    }
                }
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.tirarItemAlSuelo = function(idItem, cant, idMap, pos) {
        try {
            var tmpPos = {
                x: pos.x,
                y: pos.y
            };

            var count = 0;
            var level = 1;

            while (game.hayObjAndBlock(idMap, tmpPos)) {
                if (count === 0) {
                    tmpPos.x = pos.x - level;
                    tmpPos.y = pos.y - level;
                } else {
                    tmpPos.x++;
                }

                var filas = (3 * level) - (level - 1);

                if (count % filas === 0 && count !== 0) {
                    tmpPos.y++;
                    tmpPos.x = pos.x - level;
                }

                count++;

                if (count == (filas * filas)) {
                    count = 0;
                    level++;
                }
            }

            vars.mapa[idMap][tmpPos.y][tmpPos.x].objInfo = {
                objIndex: idItem,
                amount: cant
            };

            npcs.loopAreaPos(idMap, tmpPos, function(target) {
                handleProtocol.renderItem(idItem, idMap, tmpPos, vars.clients[target.id]);
            });
        } catch (err) {
            funct.dumpError(err);
        }
    };
}

module.exports = npcs;
