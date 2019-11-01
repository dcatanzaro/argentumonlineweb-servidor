var fs = require("fs");
var funct = require("./functions");
var socket = require("./socket");
var vars = require("./vars");
var handleProtocol = require("./handleProtocol");

var game = new Game();

/**
 * [Game description]
 */
function Game() {
    /**
     * [legalPos Permite saber si hay bloqueos o agua en determinada posición]
     * @param  {number} x          [description]
     * @param  {number} y          [description]
     * @param  {number} idMapa     [description]
     * @param  {boolean} aguaValida [description]
     * @return {Boolean}            [description]
     */
    this.legalPos = function(x, y, idMapa, aguaValida) {
        try {
            if (x >= 1 && y >= 1 && x <= 100 && y <= 100) {
                var ret = true;

                if (!vars.mapa[idMapa][y][x].blocked) {
                    if (vars.mapData[idMapa][y][x].id) {
                        ret = false;
                    } else {
                        ret = true;
                    }
                } else {
                    ret = false;
                }

                if (
                    game.hayAgua(idMapa, {
                        x: x,
                        y: y
                    })
                ) {
                    if (aguaValida && !vars.mapData[idMapa][y][x].id) {
                        ret = true;
                    } else {
                        ret = false;
                    }
                } else {
                    if (aguaValida) {
                        ret = false;
                    }
                }

                return ret;
            } else {
                return false;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [hayAgua Permite saber si hay agua en determinada posición]
     * @param  {number} idMap [description]
     * @param  {object} pos   [description]
     * @return {Boolean}       [description]
     */
    this.hayAgua = function(idMap, pos) {
        if (
            (vars.mapa[idMap][pos.y][pos.x].graphics[1] >= 1505 &&
                vars.mapa[idMap][pos.y][pos.x].graphics[1] <= 1520 &&
                !vars.mapa[idMap][pos.y][pos.x].graphics[2]) ||
            (vars.mapa[idMap][pos.y][pos.x].graphics[1] >= 5665 &&
                vars.mapa[idMap][pos.y][pos.x].graphics[1] <= 5680 &&
                !vars.mapa[idMap][pos.y][pos.x].graphics[2]) ||
            (vars.mapa[idMap][pos.y][pos.x].graphics[1] >= 13547 &&
                vars.mapa[idMap][pos.y][pos.x].graphics[1] <= 13562 &&
                !vars.mapa[idMap][pos.y][pos.x].graphics[2])
        ) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * [isBlocked Permite saber si está bloqueada determinada posición]
     * @param  {number}  idMap [description]
     * @param  {object}  pos   [description]
     * @return {Boolean}       [description]
     */
    this.isBlocked = function(idMap, pos) {
        try {
            if (vars.mapa[idMap][pos.y][pos.x].blocked) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [legalPosUser Permite saber si es una posición legal para el usuario]
     * @param  {number} x      [description]
     * @param  {number} y      [description]
     * @param  {number} idMapa [description]
     * @return {Boolean}        [description]
     */
    this.legalPosUser = function(x, y, idMapa) {
        try {
            if (
                x >= 1 &&
                y >= 1 &&
                x <= 100 &&
                y <= 100 &&
                !vars.mapData[idMapa][y][x].id
            ) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [getName Devuelve el nombre del usuario o npc]
     * @param  {number} id [description]
     * @return {String}    [description]
     */
    this.getName = function(id) {
        try {
            var pjSelected = vars.personajes[id];

            if (!pjSelected) {
                pjSelected = vars.npcs[id];
            }

            return pjSelected.nameCharacter;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [isBanned Devuelve si el usuario está baneado]
     * @param  {object}  pj [description]
     * @return {Boolean}    [description]
     */
    this.isBanned = function(pj) {
        try {
            var date = new Date();
            if (pj.banned < date || pj.banned === 0) {
                return false;
            } else {
                return true;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [useItem Acción de usar items]
     * @param  {object} ws    [description]
     * @param  {number} idPos [description]
     * @return {}       [description]
     */
    this.useItem = async (ws, idPos) => {
        try {
            var user = vars.personajes[ws.id];

            if (user.useObj.usos >= 20) {
                var tmpDate = +Date.now();

                var msUseObj = tmpDate - user.useObj.startTimer;

                if (msUseObj < 3800) {
                    console.log(
                        "[ALERT|USAR | " +
                            funct.dateFormat(new Date(), "%d-%m-%Y %H:%M:%S") +
                            "] Usuario: " +
                            user.nameCharacter +
                            " - intervalo: " +
                            msUseObj
                    );
                }

                user.useObj.usos = 0;
                user.useObj.startTimer = +Date.now();
            }

            user.useObj.usos++;

            if (+Date.now() - user.hitUseItem < 190) {
                return;
            }

            user.hitUseItem = +Date.now();

            if (user.meditar) {
                handleProtocol.console(
                    "Debes dejar de meditar para realizar esta acción.",
                    "white",
                    0,
                    0,
                    ws
                );
                return;
            }

            var item = user.inv[idPos];

            if (!item) {
                return;
            }

            var idItem = item.idItem;

            var obj = vars.datObj[idItem];

            var maxAttr = 0;

            switch (obj.objType) {
                case vars.objType.pociones: //Pociones
                    if (user.dead) {
                        handleProtocol.console(
                            "Los muertos no pueden usar items.",
                            "white",
                            0,
                            0,
                            ws
                        );
                        return;
                    }

                    if (obj.tipoPocion == vars.typePociones.vida) {
                        //Vida
                        if (user.hp < user.maxHp) {
                            user.hp += funct.randomIntFromInterval(
                                obj.minModificador,
                                obj.maxModificador
                            );

                            if (user.hp > user.maxHp) {
                                user.hp = user.maxHp;
                            }

                            handleProtocol.updateHP(user.hp, ws);
                        }
                        game.quitarUserInvItem(ws.id, idPos, 1);
                    } else if (obj.tipoPocion == vars.typePociones.mana) {
                        //Mana
                        if (user.mana < user.maxMana) {
                            user.mana += parseInt(
                                user.maxMana * 0.04 +
                                    user.level / 2 +
                                    40 / user.level
                            );

                            if (user.mana > user.maxMana) {
                                user.mana = user.maxMana;
                            }

                            handleProtocol.updateMana(user.mana, ws);
                        }
                        game.quitarUserInvItem(ws.id, idPos, 1);
                    } else if (obj.tipoPocion == vars.typePociones.agilidad) {
                        //Agilidad
                        maxAttr = user.bkAttrAgilidad + 19;

                        if (user.attrAgilidad < maxAttr) {
                            user.attrAgilidad += funct.randomIntFromInterval(
                                obj.minModificador,
                                obj.maxModificador
                            );

                            if (user.attrAgilidad > maxAttr) {
                                user.attrAgilidad = maxAttr;
                            }

                            handleProtocol.updateAgilidad(
                                user.attrAgilidad,
                                ws
                            );
                        }

                        user.cooldownAgilidad = +Date.now();
                        game.quitarUserInvItem(ws.id, idPos, 1);
                    } else if (obj.tipoPocion == vars.typePociones.fuerza) {
                        //Fuerza
                        maxAttr = user.bkAttrFuerza + 19;

                        if (user.attrFuerza < maxAttr) {
                            user.attrFuerza += funct.randomIntFromInterval(
                                obj.minModificador,
                                obj.maxModificador
                            );

                            if (user.attrFuerza > maxAttr) {
                                user.attrFuerza = maxAttr;
                            }

                            handleProtocol.updateFuerza(user.attrFuerza, ws);
                        }

                        user.cooldownFuerza = +Date.now();
                        game.quitarUserInvItem(ws.id, idPos, 1);
                    }

                    game.loopArea(ws, function(client) {
                        if (!client.isNpc) {
                            handleProtocol.playSound(
                                user.id,
                                vars.arSounds.SND_BEBER,
                                vars.clients[client.id]
                            );
                        }
                    });
                    break;
                case vars.objType.pergaminos:
                    if (user.dead) {
                        handleProtocol.console(
                            "Los muertos no pueden usar items.",
                            "white",
                            0,
                            0,
                            ws
                        );
                        return;
                    }

                    if (!user.maxMana) {
                        handleProtocol.console(
                            "Tu clase no puede aprender este hechizo.",
                            "white",
                            0,
                            0,
                            ws
                        );
                        return;
                    }

                    var spellAprendido = false;
                    var arIdPos = [];
                    var idPosFinal = 1;

                    for (var spellIndex in user.spells) {
                        var spell = user.spells[spellIndex];
                        if (spell.idSpell == obj.spellIndex) {
                            spellAprendido = true;
                        }

                        arIdPos.push(spellIndex);
                    }

                    if (spellAprendido) {
                        handleProtocol.console(
                            "Este hechizo ya lo has aprendido.",
                            "white",
                            0,
                            0,
                            ws
                        );
                    } else {
                        arIdPos.sort(sorter);

                        while (arIdPos[idPosFinal - 1] == idPosFinal) {
                            idPosFinal++;
                        }

                        user.spells[idPosFinal] = {
                            idSpell: obj.spellIndex
                        };

                        let tmpSpells = [];
                        Object.keys(user.spells).map(idPos => {
                            tmpSpells.push({
                                idPos: idPos,
                                idSpell: user.spells[idPos].idSpell
                            });
                        });

                        const bodyPersonaje = {
                            spells: tmpSpells,
                            updatedAt: new Date()
                        };

                        const characterSave = await funct.fetchUrl(
                            `/character_save/${user._id}`,
                            {
                                method: "PUT",
                                body: JSON.stringify(bodyPersonaje),
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: vars.tokenAuth
                                }
                            }
                        );

                        handleProtocol.aprenderSpell(ws.id, idPosFinal);
                        game.quitarUserInvItem(ws.id, idPos, 1);
                    }

                    break;
                case vars.objType.barcos:
                    game.navegar(ws.id);
                    break;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [hayObjAndBlock Devuelve si hay un objeto y está bloqueado en determinada posición]
     * @param  {number} idMap [description]
     * @param  {number} pos   [description]
     * @return {Boolean}       [description]
     */
    this.hayObjAndBlock = function(idMap, pos) {
        try {
            if (game.hayObj(idMap, pos)) {
                return true;
            } else {
                if (game.isBlocked(idMap, pos)) {
                    return true;
                } else {
                    return false;
                }
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [agarrarItem Acción de agarrar item]
     * @param  {object} ws [description]
     * @return {}    [description]
     */
    this.agarrarItem = function(ws) {
        try {
            var user = vars.personajes[ws.id];

            if (!user) {
                return;
            }

            if (user.dead) {
                handleProtocol.console(
                    "Los muertos no pueden agarrar items.",
                    "white",
                    0,
                    0,
                    ws
                );
                return;
            }

            var idPosFinal = 1;
            var arIdPos = [];
            var agarreItem = false;

            if (game.hayObj(user.map, user.pos)) {
                var item = game.objMap(user.map, user.pos);
                var datObj = vars.datObj[item.objIndex];

                if (datObj.agarrable) {
                    return;
                }

                if (datObj.objType == vars.objType.dinero) {
                    user.gold += item.amount;

                    handleProtocol.actGold(user.gold, ws);
                } else {
                    for (var idPos in user.inv) {
                        if (
                            user.inv[idPos] &&
                            user.inv[idPos].idItem == item.objIndex &&
                            user.inv[idPos].cant + item.amount <= 10000
                        ) {
                            user.inv[idPos].cant += item.amount;
                            agarreItem = true;
                            idPosFinal = idPos;
                            break;
                        }

                        arIdPos.push(idPos);
                    }

                    if (!agarreItem) {
                        if (Object.keys(user.inv).length >= 21) {
                            handleProtocol.console(
                                "Tienes el inventario lleno.",
                                "white",
                                0,
                                0,
                                ws
                            );
                            return;
                        }

                        arIdPos.sort(sorter);

                        while (arIdPos[idPosFinal - 1] == idPosFinal) {
                            idPosFinal++;
                        }

                        user.inv[idPosFinal] = {
                            idItem: item.objIndex,
                            cant: item.amount,
                            equipped: 0
                        };
                    }

                    handleProtocol.agregarUserInvItem(ws.id, idPosFinal, ws);
                }

                delete vars.mapa[user.map][user.pos.y][user.pos.x].objInfo;

                game.loopAreaPos(user.map, user.pos, function(target) {
                    handleProtocol.deleteItem(
                        user.map,
                        user.pos,
                        vars.clients[target.id]
                    );
                });
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [putItemToInv Acción de meter item en inventario]
     * @param  {number} idUser [description]
     * @param  {number} idItem [description]
     * @param  {number} cant   [description]
     * @return {}        [description]
     */
    this.putItemToInv = function(idUser, idItem, cant) {
        try {
            var user = vars.personajes[idUser];

            var idPosFinal = 1;
            var arIdPos = [];
            var agarreItem = false;

            var datObj = vars.datObj[idItem];

            if (datObj.objType == vars.objType.dinero) {
                user.gold += cant;

                handleProtocol.actGold(user.gold, vars.clients[idUser]);
            } else {
                for (var idPos in user.inv) {
                    if (
                        user.inv[idPos] &&
                        user.inv[idPos].idItem == idItem &&
                        user.inv[idPos].cant + cant <= 10000
                    ) {
                        user.inv[idPos].cant += cant;
                        agarreItem = true;
                        idPosFinal = idPos;
                        break;
                    }

                    arIdPos.push(idPos);
                }

                if (!agarreItem) {
                    if (Object.keys(user.inv).length >= 21) {
                        handleProtocol.console(
                            "Tienes el inventario lleno.",
                            "white",
                            0,
                            0,
                            vars.clients[idUser]
                        );
                        return;
                    }

                    arIdPos.sort(sorter);

                    while (arIdPos[idPosFinal - 1] == idPosFinal) {
                        idPosFinal++;
                    }

                    user.inv[idPosFinal] = {
                        idItem: idItem,
                        cant: cant,
                        equipped: 0
                    };
                }

                handleProtocol.agregarUserInvItem(
                    idUser,
                    idPosFinal,
                    vars.clients[idUser]
                );
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [tirarItem Acción de tirar item]
     * @param  {object} ws    [description]
     * @param  {number} idPos [description]
     * @param  {number} cant  [description]
     * @return {}       [description]
     */
    this.tirarItem = function(ws, idPos, cant) {
        try {
            var user = vars.personajes[ws.id];

            var item = user.inv[idPos];

            if (cant < 1) {
                return;
            }

            if (!item) {
                return;
            }

            var idItem = item.idItem;

            if (item.equipped) {
                handleProtocol.console(
                    "Debes desequipar el item para poder tirarlo.",
                    "white",
                    0,
                    0,
                    ws
                );
                return;
            }

            if (vars.datObj[idItem].newbie || user.pvpChar) {
                handleProtocol.console(
                    "No puedes tirar este item.",
                    "white",
                    0,
                    0,
                    ws
                );
                return;
            }

            if (cant > item.cant) {
                cant = item.cant;
            }

            var tmpPos = {
                x: user.pos.x,
                y: user.pos.y
            };

            var count = 0;
            var level = 1;

            while (game.hayObjAndBlock(user.map, tmpPos)) {
                if (count === 0) {
                    tmpPos.x = user.pos.x - level;
                    tmpPos.y = user.pos.y - level;
                } else {
                    tmpPos.x++;
                }

                var filas = 3 * level - (level - 1);

                if (count % filas === 0 && count !== 0) {
                    tmpPos.y++;
                    tmpPos.x = user.pos.x - level;
                }

                count++;

                if (count == filas * filas) {
                    count = 0;
                    level++;
                }

                if (count > 10000) {
                    console.log(
                        "<<<>>> NO HAY LUGAR EN EL PISO MAPA:" + user.map
                    );
                    handleProtocol.console(
                        "No hay lugar en el piso.",
                        "white",
                        0,
                        0,
                        ws
                    );
                    return;
                }
            }

            game.quitarUserInvItem(ws.id, idPos, cant);

            vars.mapa[user.map][tmpPos.y][tmpPos.x].objInfo = {
                objIndex: idItem,
                amount: cant
            };

            game.loopAreaPos(user.map, tmpPos, function(target) {
                handleProtocol.renderItem(
                    idItem,
                    user.map,
                    tmpPos,
                    vars.clients[target.id]
                );
            });
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [existPj Devuelve si el personaje existe o no]
     * @param  {number} id [description]
     * @return {Boolean}    [description]
     */
    this.existPj = function(id) {
        try {
            if (vars.personajes[id]) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [existPjOrClose Si el personaje no existe cierra la conexión]
     * @param  {object} ws [description]
     * @return {Boolean}    [description]
     */
    this.existPjOrClose = function(ws) {
        try {
            if (ws.readyState == ws.OPEN) {
                if (ws.id) {
                    if (vars.personajes[ws.id]) {
                        return true;
                    } else {
                        console.log("ID desconectada: " + ws.id);
                        socket.close(ws);
                        return false;
                    }
                } else {
                    console.log("WS desconectado");
                    socket.close(ws);
                    return false;
                }
            } else {
                console.log("WS desconectado por diferente state");
                socket.close(ws);
                return false;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [worldSave Guardado del mundo]
     * @param  {Function} callback [description]
     * @return {}            [description]
     */
    this.worldSave = async callback => {
        try {
            for (var i in vars.personajes) {
                var user = vars.personajes[i];
                if (!user.pvpChar) {
                    user.posX = user.pos.x;
                    user.posY = user.pos.y;
                    user.connected = false;

                    let tmpSpells = [];
                    Object.keys(user.spells).map(idPos => {
                        tmpSpells.push({
                            idPos: idPos,
                            idSpell: user.spells[idPos].idSpell
                        });
                    });

                    let tmpItems = [];
                    Object.keys(user.inv).map(idPos => {
                        const item = user.inv[idPos];

                        tmpItems.push({
                            idPos: idPos,
                            idItem: item.idItem,
                            cant: item.cant,
                            equipped: item.equipped
                        });
                    });

                    user.spells = tmpSpells;
                    user.items = tmpItems;
                    user.updatedAt = new Date();

                    const characterSave = await funct.fetchUrl(
                        `/character_save/${user._id}`,
                        {
                            method: "PUT",
                            body: JSON.stringify(user),
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: vars.tokenAuth
                            }
                        }
                    );
                }
            }

            callback(true);
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [respawnNpc Devuelve la posición de nacimiento del nuevo NPC]
     * @param  {number} map        [description]
     * @param  {boolean} aguaValida [description]
     * @return {Object}            [description]
     */
    this.respawnNpc = function(map, aguaValida) {
        try {
            var posNewX = funct.randomIntFromInterval(1, 100);
            var posNewY = funct.randomIntFromInterval(1, 100);

            var count = 0;

            while (
                !game.validPosRespawn(
                    {
                        x: posNewX,
                        y: posNewY
                    },
                    map,
                    aguaValida
                )
            ) {
                posNewX = funct.randomIntFromInterval(1, 100);
                posNewY = funct.randomIntFromInterval(1, 100);

                count++;

                if (count > 10000) {
                    console.log("<<<>>> EXPLOTO UN NPC EN EL MAPA " + map);

                    return {
                        posNewX: funct.randomIntFromInterval(1, 100),
                        posNewY: funct.randomIntFromInterval(1, 100)
                    };
                }
            }

            return {
                posNewX: posNewX,
                posNewY: posNewY
            };
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [validPosRespawn description]
     * @param  {[type]} pos        [description]
     * @param  {[type]} map        [description]
     * @param  {[type]} aguaValida [description]
     * @return {[type]}            [description]
     */
    this.validPosRespawn = function(pos, map, aguaValida) {
        try {
            if (
                game.legalPos(pos.x, pos.y, map, aguaValida) &&
                !game.isTelep(pos.x, pos.y)
            ) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [isTelep description]
     * @param  {[type]}  posX [description]
     * @param  {[type]}  posY [description]
     * @return {Boolean}      [description]
     */
    this.isTelep = function(posX, posY) {
        try {
            if (posX >= 52 && posX <= 55 && (posY >= 48 && posY <= 51)) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [setNewAreas description]
     * @param {[type]} ws [description]
     */
    this.setNewAreas = function(ws) {
        try {
            var user = vars.personajes[ws.id];

            handleProtocol.nameMap(ws.id);

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

                                if (mapData.id != ws.id) {
                                    handleProtocol.sendCharacter(user);
                                    socket.send(vars.clients[mapData.id]);

                                    handleProtocol.sendCharacter(target);
                                    socket.send(ws);
                                }
                            } else {
                                if (target.movement == 3 && !user.dead) {
                                    if (
                                        vars.areaNpc[mapData.id].indexOf(
                                            ws.id
                                        ) < 0
                                    ) {
                                        vars.areaNpc[mapData.id].push(ws.id);
                                    }
                                }

                                handleProtocol.sendNpc(target);
                                socket.send(ws);
                            }
                        }

                        var pos = {
                            x: x,
                            y: y
                        };

                        if (game.hayObj(user.map, pos)) {
                            var item = game.objMap(user.map, pos);
                            var obj = vars.datObj[item.objIndex];

                            if (obj.objType == vars.objType.puerta) {
                                if (item.objIndex == obj.indexAbierta) {
                                    handleProtocol.blockMap(
                                        user.map,
                                        pos,
                                        0,
                                        ws
                                    );
                                    handleProtocol.blockMap(
                                        user.map,
                                        {
                                            x: pos.x - 1,
                                            y: pos.y
                                        },
                                        0,
                                        ws
                                    );
                                }
                            }

                            handleProtocol.renderItem(
                                item.objIndex,
                                user.map,
                                pos,
                                ws
                            );
                        }
                    }
                }
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [loopArea description]
     * @param  {[type]}   ws       [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    this.loopArea = function(ws, callback) {
        try {
            if (!ws) {
                return;
            }

            var user = vars.personajes[ws.id];

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

    /**
     * [loopAreaPos description]
     * @param  {[type]}   idMap    [description]
     * @param  {[type]}   pos      [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    this.loopAreaPos = function(idMap, pos, callback) {
        try {
            var posXStart = pos.x - 10;
            var posYStart = pos.y - 10;

            var posXEnd = pos.x + 10;
            var posYEnd = pos.y + 10;

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

    /**
     * [telep description]
     * @param  {[type]} ws     [description]
     * @param  {[type]} numMap [description]
     * @param  {[type]} posX   [description]
     * @param  {[type]} posY   [description]
     * @return {[type]}        [description]
     */
    this.telep = function(ws, numMap, posX, posY) {
        try {
            var user = vars.personajes[ws.id];
            vars.mapData[user.map][user.pos.y][user.pos.x].id = 0;

            game.loopArea(ws, function(target) {
                if (!target.isNpc && target.id != ws.id) {
                    handleProtocol.deleteCharacter(target.id, ws);
                    handleProtocol.deleteCharacter(
                        ws.id,
                        vars.clients[target.id]
                    );
                } else if (target.isNpc && vars.npcs[target.id].movement == 3) {
                    var index = vars.areaNpc[target.id].indexOf(ws.id);

                    if (index > -1) {
                        vars.areaNpc[target.id].splice(index, 1);
                    }
                }

                if (target.isNpc) {
                    handleProtocol.deleteCharacter(target.id, ws);
                }
            });

            var tileExit = vars.mapa[numMap][posY][posX].tileExit;

            if (typeof tileExit !== "undefined") {
                game.deleteUserToAllNpcs(ws.id);
                game.telep(ws, tileExit.map, tileExit.x, tileExit.y);
                return;
            }

            var tmpPos = {
                x: posX,
                y: posY
            };

            var count = 0;
            var level = 1;

            while (
                !game.legalPos(tmpPos.x, tmpPos.y, numMap, false) &&
                !user.navegando &&
                user.privileges !== 1
            ) {
                if (count === 0) {
                    tmpPos.x = posX - level;
                    tmpPos.y = posY - level;
                } else {
                    tmpPos.x++;
                }

                var filas = 3 * level - (level - 1);

                if (count % filas === 0 && count !== 0) {
                    tmpPos.y++;
                    tmpPos.x = posX - level;
                }

                count++;

                if (count == filas * filas) {
                    count = 0;
                    level++;
                }

                if (
                    (tmpPos.x > 100 || tmpPos.x < 0) &&
                    (tmpPos.y > 100 || tmpPos.y < 0)
                ) {
                    tmpPos.x = 50;
                    tmpPos.y = 50;
                    numMap = 1;
                }

                if (count > 20000) {
                    console.log(
                        "CIERRO A USUARIO " +
                            user.nameCharacter +
                            " ESTÁ EXPLOTANDO TODO MAPA " +
                            numMap
                    );

                    tmpPos.x = 50;
                    tmpPos.y = 50;
                    numMap = 1;

                    user.map = parseInt(numMap);
                    user.pos.x = parseInt(tmpPos.x);
                    user.pos.y = parseInt(tmpPos.y);

                    vars.mapData[user.map][user.pos.y][user.pos.x].id = ws.id;

                    game.closeForce(ws.id);

                    return;
                }
            }

            user.map = parseInt(numMap);
            user.pos.x = parseInt(tmpPos.x);
            user.pos.y = parseInt(tmpPos.y);

            vars.mapData[user.map][user.pos.y][user.pos.x].id = ws.id;

            handleProtocol.telepMe(ws.id, user.map, user.pos, ws);

            game.setNewAreas(ws);
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [getFreeSpace description]
     * @param  {[type]} ws     [description]
     * @param  {[type]} numMap [description]
     * @param  {[type]} posX   [description]
     * @param  {[type]} posY   [description]
     * @return {[type]}        [description]
     */
    this.getFreeSpace = function(ws, numMap, posX, posY) {
        try {
            const user = vars.personajes[ws.id];

            var tmpPos = {
                x: posX,
                y: posY
            };

            var count = 0;
            var level = 1;

            while (
                !game.legalPos(tmpPos.x, tmpPos.y, numMap, false) &&
                !user.navegando
            ) {
                if (count === 0) {
                    tmpPos.x = posX - level;
                    tmpPos.y = posY - level;
                } else {
                    tmpPos.x++;
                }

                var filas = 3 * level - (level - 1);

                if (count % filas === 0 && count !== 0) {
                    tmpPos.y++;
                    tmpPos.x = posX - level;
                }

                count++;

                if (count == filas * filas) {
                    count = 0;
                    level++;
                }

                if (
                    (tmpPos.x > 100 || tmpPos.x < 0) &&
                    (tmpPos.y > 100 || tmpPos.y < 0)
                ) {
                    tmpPos.x = 50;
                    tmpPos.y = 50;
                    numMap = 1;
                }

                if (count > 20000) {
                    console.log(
                        "CIERRO A USUARIO " +
                            user.nameCharacter +
                            " ESTÁ EXPLOTANDO TODO MAPA " +
                            numMap
                    );

                    tmpPos.x = 50;
                    tmpPos.y = 50;
                    numMap = 1;

                    game.closeForce(ws.id);

                    return;
                }
            }

            return tmpPos;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [puedePegar description]
     * @param  {[type]} posX [description]
     * @param  {[type]} posY [description]
     * @return {[type]}      [description]
     */
    this.puedePegar = function(posX, posY) {
        try {
            return true;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [bodyNaked description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.bodyNaked = function(idUser) {
        try {
            var user = vars.personajes[idUser],
                $idBody = 0;

            if (user.idGenero == vars.genero.hombre) {
                switch (user.idRaza) {
                    case vars.razas.humano:
                        $idBody = 21;
                        break;

                    case vars.razas.elfo:
                        $idBody = 210;
                        break;

                    case vars.razas.elfoDrow:
                        $idBody = 32;
                        break;

                    case vars.razas.enano:
                        $idBody = 53;
                        break;

                    case vars.razas.gnomo:
                        $idBody = 222;
                        break;
                }
            }

            if (user.idGenero == vars.genero.mujer) {
                switch (user.idRaza) {
                    case vars.razas.humano:
                        $idBody = 39;
                        break;

                    case vars.razas.elfo:
                        $idBody = 259;
                        break;

                    case vars.razas.elfoDrow:
                        $idBody = 40;
                        break;

                    case vars.razas.enano:
                        $idBody = 60;
                        break;

                    case vars.razas.gnomo:
                        $idBody = 260;
                        break;
                }
            }

            return $idBody;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [putBodyAndHeadDead description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.putBodyAndHeadDead = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            if (!user.navegando) {
                user.idLastHead = JSON.parse(user.idHead);
                user.idBody = 8;
                user.idHead = 500;
            } else {
                user.idBody = 87;
            }

            user.idWeapon = 0;
            user.idHelmet = 0;
            user.idShield = 0;
            user.dead = 1;

            user.idLastHelmet = 0;
            user.idLastWeapon = 0;
            user.idLastShield = 0;

            user.idItemBody = 0;
            user.idItemWeapon = 0;
            user.idItemArrow = 0;
            user.idItemShield = 0;
            user.idItemHelmet = 0;

            for (var idSlot in user.inv) {
                user.inv[idSlot].equipped = 0;
            }

            game.loopArea(vars.clients[idUser], function(target) {
                if (!target.isNpc) {
                    handleProtocol.putBodyAndHeadDead(
                        idUser,
                        vars.clients[target.id]
                    );
                }
            });
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [revivirUsuario description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.revivirUsuario = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            user.idBody = game.bodyNaked(idUser);
            user.idHead = user.idLastHead;
            user.hp = user.maxHp;
            user.dead = 0;

            handleProtocol.updateHP(user.hp, vars.clients[idUser]);

            game.loopArea(vars.clients[idUser], function(target) {
                if (!target.isNpc) {
                    handleProtocol.revivirUsuario(
                        idUser,
                        vars.clients[target.id]
                    );
                }
            });
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [checkUserLevel description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.checkUserLevel = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            var client = vars.clients[idUser];

            if (user.exp < user.expNextLevel) {
                handleProtocol.actExp(user.exp, client);
                return;
            }

            while (user.exp >= user.expNextLevel) {
                if (user.level >= 42) {
                    break;
                }

                user.level++;
                user.exp -= user.expNextLevel;

                if (user.level < 15) {
                    user.expNextLevel *= 1.4;
                } else if (user.level < 21) {
                    user.expNextLevel *= 1.35;
                } else if (user.level < 33) {
                    user.expNextLevel *= 1.3;
                } else if (user.level < 41) {
                    user.expNextLevel *= 1.225;
                } else {
                    user.expNextLevel *= 1.25;
                }

                aumentoHP = vars.modVida[user.attrConstitucion][user.idClase];

                var aumentoHIT = 0;
                var aumentoMana = 0;

                switch (user.idClase) {
                    case vars.clases.guerrero:
                        if (user.level > 35) {
                            aumentoHIT = 2;
                        } else {
                            aumentoHIT = 3;
                        }
                        break;

                    case vars.clases.cazador:
                        if (user.level > 35) {
                            aumentoHIT = 2;
                        } else {
                            aumentoHIT = 3;
                        }
                        break;

                    case vars.clases.pirata:
                        aumentoHIT = 3;
                        break;

                    case vars.clases.paladin:
                        if (user.level > 35) {
                            aumentoHIT = 1;
                        } else {
                            aumentoHIT = 3;
                        }

                        aumentoMana = user.attrInteligencia;
                        break;

                    case vars.clases.mago:
                        aumentoHIT = 1;

                        aumentoMana = 2.8 * user.attrInteligencia;
                        break;

                    case vars.clases.trabajador:
                        aumentoHIT = 2;
                        break;

                    case vars.clases.clerigo:
                        aumentoHIT = 2;

                        aumentoMana = 2 * user.attrInteligencia;
                        break;

                    case vars.clases.druida:
                        aumentoHIT = 2;

                        aumentoMana = 2 * user.attrInteligencia;
                        break;

                    case vars.clases.asesino:
                        if (user.level > 35) {
                            aumentoHIT = 1;
                        } else {
                            aumentoHIT = 3;
                        }

                        aumentoMana = user.attrInteligencia;
                        break;

                    case vars.clases.bardo:
                        aumentoHIT = 2;

                        aumentoMana = 2 * user.attrInteligencia;
                        break;

                    default:
                        aumentoHIT = 2;
                }

                aumentoMana = parseInt(aumentoMana);
                aumentoHP = parseInt(aumentoHP);

                user.maxHp += aumentoHP;
                user.hp = user.maxHp;
                user.maxMana += aumentoMana;

                user.minHit += aumentoHIT;
                user.maxHit += aumentoHIT;

                handleProtocol.console(
                    "¡Has subido a nivel " + user.level + "!",
                    "red",
                    1,
                    0,
                    client
                );

                handleProtocol.console(
                    "¡Has ganado " + aumentoHP + " puntos de vida!",
                    "red",
                    1,
                    0,
                    client
                );

                if (aumentoMana) {
                    handleProtocol.console(
                        "¡Has ganado " + aumentoMana + " puntos de maná!",
                        "red",
                        1,
                        0,
                        client
                    );
                }

                handleProtocol.console(
                    "¡Tu golpe máximo aumento en " + aumentoHIT + " puntos!",
                    "red",
                    1,
                    0,
                    client
                );
                handleProtocol.console(
                    "¡Tu golpe mínimo aumento en " + aumentoHIT + " puntos!",
                    "red",
                    1,
                    0,
                    client
                );

                handleProtocol.actMyLevel(idUser, client);
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [quitarUserInvItem description]
     * @param  {[type]} idUser [description]
     * @param  {[type]} idPos  [description]
     * @param  {[type]} cant   [description]
     * @return {[type]}        [description]
     */
    this.quitarUserInvItem = function(idUser, idPos, cant) {
        try {
            var user = vars.personajes[idUser];
            var item = user.inv[idPos];

            if (user.pvpChar) return;

            item.cant -= cant;

            handleProtocol.quitarUserInvItem(
                idUser,
                idPos,
                cant,
                vars.clients[idUser]
            );

            if (item.cant <= 0) {
                if (user.idItemArrow == idPos) {
                    user.idItemArrow = 0;
                }

                delete user.inv[idPos];
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [userSpellNpc description]
     * @param  {[type]} idUser  [description]
     * @param  {[type]} idNpc   [description]
     * @param  {[type]} idSpell [description]
     * @return {[type]}         [description]
     */
    this.userSpellNpc = function(idUser, idNpc, idSpell) {
        try {
            var user = vars.personajes[idUser];
            var npc = vars.npcs[idNpc];

            var datSpell = vars.datSpell[idSpell];

            var dmg = 0;

            if (datSpell.paraliza) {
                if (npc.npcType == 6) {
                    handleProtocol.console(
                        "Este hechizo no funciona sobre esta criatura.",
                        "white",
                        1,
                        0,
                        vars.clients[idUser]
                    );
                    return;
                } else {
                    npc.paralizado = 1;
                    npc.cooldownParalizado = +Date.now();

                    dmg = "Paraliza";
                }
            } else if (datSpell.inmoviliza) {
                if (npc.npcType == 6) {
                    handleProtocol.console(
                        "Este hechizo no funciona sobre esta criatura.",
                        "white",
                        1,
                        0,
                        vars.clients[idUser]
                    );
                    return;
                } else {
                    npc.inmovilizado = 1;
                    npc.cooldownParalizado = +Date.now();

                    dmg = "Inmoviliza";
                }
            } else {
                if (datSpell.subeHp === 1) {
                    //Cura HP
                    curo = funct.randomIntFromInterval(
                        datSpell.minHp,
                        datSpell.maxHp
                    );

                    curo += Math.round((curo * (3 * user.level)) / 100);

                    if (curo < 1) {
                        curo = 1;
                    }

                    if (npc.hp + curo > npc.maxHp) {
                        curo = npc.maxHp - npc.hp;
                    }

                    npc.hp += curo;

                    dmg = -curo;
                } else if (datSpell.subeHp == 2) {
                    //Resta HP
                    dmg = funct.randomIntFromInterval(
                        datSpell.minHp,
                        datSpell.maxHp
                    );

                    dmg += Math.round((dmg * (3 * user.level)) / 100);

                    if (
                        datSpell.staffAffected &&
                        user.idClase == vars.clases.mago &&
                        user.idItemWeapon
                    ) {
                        var itemInventary = user.inv[user.idItemWeapon];

                        if (itemInventary) {
                            var idItem = itemInventary.idItem;
                            var itemWeapon = vars.datObj[idItem];

                            if (itemWeapon.staffDamageBonus > 0) {
                                dmg = parseInt(
                                    (dmg * (70 + itemWeapon.staffDamageBonus)) /
                                        100
                                );
                            }
                        }
                    }

                    if (dmg < 1) {
                        dmg = 1;
                    }

                    npc.hp -= dmg;
                }
            }

            handleProtocol.console(
                "Has lanzado " + datSpell.name + " sobre " + npc.nameCharacter,
                "red",
                1,
                0,
                vars.clients[idUser]
            );

            if (dmg > 0) {
                handleProtocol.console(
                    "Le has quitado " +
                        dmg +
                        " puntos de vida a " +
                        npc.nameCharacter,
                    "red",
                    1,
                    0,
                    vars.clients[idUser]
                );
                game.calcularExp(idUser, idNpc, dmg);
            } else if (dmg < 0) {
                handleProtocol.console(
                    "Le has curado " +
                        Math.abs(dmg) +
                        " puntos de vida a " +
                        npc.nameCharacter,
                    "red",
                    1,
                    0,
                    vars.clients[idUser]
                );
            }

            return dmg;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [userSpellUser description]
     * @param  {[type]} idUser         [description]
     * @param  {[type]} idUserAttacked [description]
     * @param  {[type]} idSpell        [description]
     * @return {[type]}                [description]
     */
    this.userSpellUser = function(idUser, idUserAttacked, idSpell) {
        try {
            var user = vars.personajes[idUser];
            var userAttacked = vars.personajes[idUserAttacked];

            if (
                vars.mapData[user.map].pk &&
                !user.isNpc &&
                idUser != idUserAttacked &&
                (vars.mapa[user.map][user.pos.y][user.pos.x].trigger != 6 ||
                    vars.mapa[userAttacked.map][userAttacked.pos.y][
                        userAttacked.pos.x
                    ].trigger != 6)
            ) {
                handleProtocol.console(
                    "No puedes atacar a otro usuario estando en una zona segura.",
                    "white",
                    0,
                    0,
                    vars.clients[idUser]
                );
                return 0;
            }

            var datSpell = vars.datSpell[idSpell];

            var dmg = 0;

            if (datSpell.paraliza) {
                if (idUser == idUserAttacked) {
                    handleProtocol.console(
                        "¡No puedes atacarte a ti mismo!",
                        "white",
                        1,
                        0,
                        vars.clients[idUser]
                    );
                    return 0;
                }

                if (!user.criminal && !userAttacked.criminal) {
                    if (user.seguroActivado) {
                        handleProtocol.console(
                            "Debes desactivar el seguro para poder atacar a ciudadanos (S). ¡Te convertiras en un criminal!",
                            "white",
                            1,
                            0,
                            vars.clients[idUser]
                        );

                        return 0;
                    }

                    game.hacerCriminal(idUser);
                }

                userAttacked.paralizado = 1;
                userAttacked.cooldownParalizado = +Date.now();

                handleProtocol.inmo(
                    idUserAttacked,
                    1,
                    vars.clients[idUserAttacked]
                );

                dmg = "Paraliza";
            } else if (datSpell.inmoviliza) {
                if (idUser == idUserAttacked) {
                    handleProtocol.console(
                        "¡No puedes atacarte a ti mismo!",
                        "white",
                        1,
                        0,
                        vars.clients[idUser]
                    );
                    return 0;
                }

                if (!user.criminal && !userAttacked.criminal) {
                    if (user.seguroActivado) {
                        handleProtocol.console(
                            "Debes desactivar el seguro para poder atacar a ciudadanos (S). ¡Te convertiras en un criminal!",
                            "white",
                            1,
                            0,
                            vars.clients[idUser]
                        );

                        return 0;
                    }

                    game.hacerCriminal(idUser);
                }

                userAttacked.inmovilizado = 1;
                userAttacked.cooldownParalizado = +Date.now();

                handleProtocol.inmo(
                    idUserAttacked,
                    1,
                    vars.clients[idUserAttacked]
                );

                dmg = "Inmoviliza";
            } else if (datSpell.removerParalisis) {
                userAttacked.inmovilizado = 0;
                userAttacked.paralizado = 0;
                userAttacked.cooldownParalizado = 0;

                handleProtocol.inmo(
                    idUserAttacked,
                    0,
                    vars.clients[idUserAttacked]
                );

                dmg = "Remueve";
            } else {
                var maxAttr = 0;

                if (datSpell.subeHp === 1) {
                    //Cura HP
                    curo = funct.randomIntFromInterval(
                        datSpell.minHp,
                        datSpell.maxHp
                    );

                    curo += Math.round((curo * (3 * user.level)) / 100);

                    if (curo < 1) {
                        curo = 1;
                    }

                    if (userAttacked.hp + curo > userAttacked.maxHp) {
                        curo = userAttacked.maxHp - userAttacked.hp;
                    }

                    userAttacked.hp += curo;

                    dmg = -curo;
                } else if (datSpell.subeHp == 2) {
                    //Resta HP
                    if (idUser == idUserAttacked) {
                        handleProtocol.console(
                            "¡No puedes atacarte a ti mismo!",
                            "white",
                            1,
                            0,
                            vars.clients[idUser]
                        );
                        return 0;
                    }

                    if (
                        !user.criminal &&
                        !userAttacked.criminal &&
                        (vars.mapa[user.map][user.pos.y][user.pos.x].trigger !=
                            6 ||
                            vars.mapa[userAttacked.map][userAttacked.pos.y][
                                userAttacked.pos.x
                            ].trigger != 6)
                    ) {
                        if (user.seguroActivado) {
                            handleProtocol.console(
                                "Debes desactivar el seguro para poder atacar a ciudadanos (S). ¡Te convertiras en un criminal!",
                                "white",
                                1,
                                0,
                                vars.clients[idUser]
                            );

                            return 0;
                        }

                        game.hacerCriminal(idUser);
                    }

                    dmg = funct.randomIntFromInterval(
                        datSpell.minHp,
                        datSpell.maxHp
                    );

                    dmg += Math.round((dmg * (3 * user.level)) / 100);

                    if (
                        datSpell.staffAffected &&
                        user.idClase == vars.clases.mago &&
                        user.idItemWeapon
                    ) {
                        var itemInventary = user.inv[user.idItemWeapon];

                        if (itemInventary) {
                            var idItem = itemInventary.idItem;
                            var itemWeapon = vars.datObj[idItem];

                            if (itemWeapon.staffDamageBonus > 0) {
                                dmg = parseInt(
                                    (dmg * (70 + itemWeapon.staffDamageBonus)) /
                                        100
                                );
                            }
                        }
                    }

                    if (userAttacked.idItemHelmet) {
                        var itemInventaryHelmet =
                            userAttacked.inv[userAttacked.idItemHelmet];
                        if (itemInventaryHelmet) {
                            var idItemHelmet = itemInventaryHelmet.idItem;
                            var itemHelmet = vars.datObj[idItemHelmet];

                            if (itemHelmet.minDefMag && itemHelmet.maxDefMag) {
                                dmg -= funct.randomIntFromInterval(
                                    itemHelmet.minDefMag,
                                    itemHelmet.maxDefMag
                                );
                            }
                        }
                    }

                    if (dmg < 1) {
                        dmg = 1;
                    }

                    userAttacked.hp -= dmg;
                } else if (datSpell.subeAg === 1) {
                    maxAttr = user.bkAttrAgilidad + 19;

                    if (user.attrAgilidad < maxAttr) {
                        user.attrAgilidad += funct.randomIntFromInterval(
                            datSpell.minAg,
                            datSpell.maxAg
                        );

                        if (user.attrAgilidad > maxAttr) {
                            user.attrAgilidad = maxAttr;
                        }

                        handleProtocol.updateAgilidad(
                            user.attrAgilidad,
                            vars.clients[idUserAttacked]
                        );
                    }

                    user.cooldownAgilidad = +Date.now();

                    dmg = "Agilidad";
                } else if (datSpell.subeFz === 1) {
                    maxAttr = user.bkAttrFuerza + 19;

                    if (user.attrFuerza < maxAttr) {
                        user.attrFuerza += funct.randomIntFromInterval(
                            datSpell.minFz,
                            datSpell.maxFz
                        );

                        if (user.attrFuerza > maxAttr) {
                            user.attrFuerza = maxAttr;
                        }

                        handleProtocol.updateFuerza(
                            user.attrFuerza,
                            vars.clients[idUserAttacked]
                        );
                    }

                    user.cooldownFuerza = +Date.now();

                    dmg = "Fuerza";
                }
            }

            if (idUser == idUserAttacked) {
                handleProtocol.console(
                    "Has lanzado " + datSpell.name + " sobre ti.",
                    "red",
                    1,
                    0,
                    vars.clients[idUser]
                );
            } else {
                handleProtocol.console(
                    "Has lanzado " +
                        datSpell.name +
                        " sobre " +
                        userAttacked.nameCharacter,
                    "red",
                    1,
                    0,
                    vars.clients[idUser]
                );
                handleProtocol.console(
                    user.nameCharacter +
                        " ha lanzado " +
                        datSpell.name +
                        " sobre ti",
                    "red",
                    1,
                    0,
                    vars.clients[idUserAttacked]
                );
            }

            if (dmg > 0) {
                handleProtocol.console(
                    "Le has quitado " +
                        dmg +
                        " puntos de vida a " +
                        userAttacked.nameCharacter,
                    "red",
                    1,
                    0,
                    vars.clients[idUser]
                );
                handleProtocol.console(
                    user.nameCharacter +
                        " te ha quitado " +
                        dmg +
                        " puntos de vida",
                    "red",
                    1,
                    0,
                    vars.clients[idUserAttacked]
                );
            } else if (dmg < 0) {
                handleProtocol.console(
                    "Le has curado " +
                        Math.abs(dmg) +
                        " puntos de vida a " +
                        userAttacked.nameCharacter,
                    "red",
                    1,
                    0,
                    vars.clients[idUser]
                );
                handleProtocol.console(
                    user.nameCharacter +
                        " te ha curado " +
                        Math.abs(dmg) +
                        " puntos de vida",
                    "red",
                    1,
                    0,
                    vars.clients[idUserAttacked]
                );
            }

            return dmg;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [calcularDmg description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.calcularDmg = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            var dmgArma = 0;
            var dmgMaxArma = 0;

            if (user.idItemWeapon) {
                var itemInventary = user.inv[user.idItemWeapon];
                var idItem = itemInventary.idItem;
                var itemWeapon = vars.datObj[idItem];

                dmgArma = funct.randomIntFromInterval(
                    itemWeapon.minHit,
                    itemWeapon.maxHit
                );

                if (itemWeapon.proyectil) {
                    var itemInventaryArrow = user.inv[user.idItemArrow];

                    if (!itemInventaryArrow) {
                        return;
                    }

                    var idItemArrow = itemInventaryArrow.idItem;
                    var itemArrow = vars.datObj[idItemArrow];

                    dmgArma += funct.randomIntFromInterval(
                        itemArrow.minHit,
                        itemArrow.maxHit
                    );

                    modClase = vars.modDmgProyectiles[user.idClase];
                } else {
                    modClase = vars.modDmgArmas[user.idClase];
                }

                dmgMaxArma = itemWeapon.maxHit;
            } else {
                dmgArma = funct.randomIntFromInterval(4, 9);
                modClase = vars.modDmgWrestling[user.idClase];

                dmgMaxArma = 9;
            }

            var dmgUser = funct.randomIntFromInterval(user.minHit, user.maxHit);

            var dmg = parseInt(
                (3 * dmgArma +
                    (dmgMaxArma / 5) * Math.max(0, user.attrFuerza - 15) +
                    dmgUser) *
                    modClase
            );

            return dmg;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [userDmgNpc description]
     * @param  {[type]} idUser [description]
     * @param  {[type]} idNpc  [description]
     * @return {[type]}        [description]
     */
    this.userDmgNpc = function(idUser, idNpc) {
        try {
            var user = vars.personajes[idUser];
            var npc = vars.npcs[idNpc];

            var modClase = 0;

            var poderAtaque = game.poderAtaqueArma(idUser);

            var probExito = Math.max(
                10,
                Math.min(90, 50 + (poderAtaque - npc.poderEvasion) * 0.4)
            );

            var userImpacto = funct.randomIntFromInterval(1, 100) <= probExito;

            if (userImpacto) {
                var dmg = game.calcularDmg(idUser);

                dmg -= npc.def;

                if (dmg < 1) {
                    dmg = 1;
                }

                npc.hp -= dmg;

                handleProtocol.console(
                    "Le has pegado a " + npc.nameCharacter + " por " + dmg,
                    "red",
                    1,
                    0,
                    vars.clients[idUser]
                );

                game.calcularExp(idUser, idNpc, dmg);

                if (npc.hp > 0 && game.puedeApu(idUser)) {
                    game.apuNpc(idUser, idNpc, dmg);
                }

                return dmg;
            } else {
                return "¡Fallas!";
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [userDmgUser description]
     * @param  {[type]} idUser         [description]
     * @param  {[type]} idUserAttacked [description]
     * @return {[type]}                [description]
     */
    this.userDmgUser = function(idUser, idUserAttacked) {
        try {
            var user = vars.personajes[idUser];
            var userAttacked = vars.personajes[idUserAttacked];

            if (idUser == idUserAttacked) {
                handleProtocol.console(
                    "¡No puedes atacarte a ti mismo!",
                    "white",
                    0,
                    0,
                    vars.clients[idUser]
                );
                return;
            }

            if (
                vars.mapData[user.map].pk &&
                !userAttacked.isNpc &&
                idUser != idUserAttacked &&
                (vars.mapa[user.map][user.pos.y][user.pos.x].trigger != 6 &&
                    vars.mapa[userAttacked.map][userAttacked.pos.y][
                        userAttacked.pos.x
                    ].trigger != 6)
            ) {
                handleProtocol.console(
                    "No puedes atacar a otro usuario estando en una zona segura.",
                    "white",
                    0,
                    0,
                    vars.clients[idUser]
                );
                return;
            }

            var modClase = 0;

            var poderAtaque = game.poderAtaqueArma(idUser);
            var userAttackedEvasion = game.poderEvasion(idUserAttacked),
                userAttackedPoderEvasionEscudo = game.poderEvasionEscudo(
                    idUserAttacked
                );

            if (userAttacked.idItemShield) {
                userAttackedEvasion += userAttackedPoderEvasionEscudo;
            }

            var probExito = Math.max(
                10,
                Math.min(90, 50 + (poderAtaque - userAttackedEvasion) * 0.4)
            );

            var userImpacto = funct.randomIntFromInterval(1, 100) <= probExito;

            var dmg = 0;

            if (
                !user.criminal &&
                !userAttacked.criminal &&
                (vars.mapa[user.map][user.pos.y][user.pos.x].trigger != 6 ||
                    vars.mapa[userAttacked.map][userAttacked.pos.y][
                        userAttacked.pos.x
                    ].trigger != 6)
            ) {
                if (user.seguroActivado) {
                    handleProtocol.console(
                        "Debes desactivar el seguro para poder atacar a ciudadanos (S). ¡Te convertiras en un criminal!",
                        "white",
                        1,
                        0,
                        vars.clients[idUser]
                    );

                    return;
                }

                game.hacerCriminal(idUser);
            }

            if (userImpacto) {
                dmg = game.calcularDmg(idUser);

                var lugarCuerpo = funct.randomIntFromInterval(
                        vars.partesCuerpo.cabeza,
                        vars.partesCuerpo.torso
                    ),
                    absorbeDmg = 0;

                switch (lugarCuerpo) {
                    case vars.partesCuerpo.cabeza:
                        if (userAttacked.idItemHelmet) {
                            var itemInventaryHelmet =
                                userAttacked.inv[userAttacked.idItemHelmet];
                            var idItemHelmet = itemInventaryHelmet.idItem;
                            var itemHelmet = vars.datObj[idItemHelmet];

                            absorbeDmg = funct.randomIntFromInterval(
                                itemHelmet.minDef,
                                itemHelmet.maxDef
                            );
                        }

                        break;
                    default:
                        var minDef = 0,
                            maxDef = 0;

                        if (userAttacked.idItemBody) {
                            var itemInventaryBody =
                                userAttacked.inv[userAttacked.idItemBody];
                            var idItemBody = itemInventaryBody.idItem;
                            var itemBody = vars.datObj[idItemBody];

                            minDef = itemBody.minDef;
                            maxDef = itemBody.maxDef;
                        }

                        if (userAttacked.idItemShield) {
                            var itemInventaryShield =
                                userAttacked.inv[userAttacked.idItemShield];
                            var idItemShield = itemInventaryShield.idItem;
                            var itemShield = vars.datObj[idItemShield];

                            minDef += itemShield.minDef;
                            maxDef += itemShield.maxDef;
                        }

                        if (maxDef > 0) {
                            absorbeDmg = funct.randomIntFromInterval(
                                minDef,
                                maxDef
                            );
                        }
                        break;
                }

                dmg -= absorbeDmg;

                if (dmg < 1) {
                    dmg = 1;
                }

                userAttacked.hp -= dmg;

                handleProtocol.updateHP(
                    userAttacked.hp,
                    vars.clients[idUserAttacked]
                );

                switch (lugarCuerpo) {
                    case vars.partesCuerpo.cabeza:
                        handleProtocol.console(
                            user.nameCharacter +
                                " te ha pegado en la cabeza por " +
                                dmg,
                            "red",
                            1,
                            0,
                            vars.clients[idUserAttacked]
                        );
                        handleProtocol.console(
                            "Le has pegado a " +
                                userAttacked.nameCharacter +
                                " en la cabeza por " +
                                dmg,
                            "red",
                            1,
                            0,
                            vars.clients[idUser]
                        );
                        break;
                    case vars.partesCuerpo.piernaIzquierda:
                        handleProtocol.console(
                            user.nameCharacter +
                                " te ha pegado en la pierna izquierda por " +
                                dmg,
                            "red",
                            1,
                            0,
                            vars.clients[idUserAttacked]
                        );
                        handleProtocol.console(
                            "Le has pegado a " +
                                userAttacked.nameCharacter +
                                " en la pierna izquierda por " +
                                dmg,
                            "red",
                            1,
                            0,
                            vars.clients[idUser]
                        );
                        break;
                    case vars.partesCuerpo.piernaDerecha:
                        handleProtocol.console(
                            user.nameCharacter +
                                " te ha pegado en la pierna derecha por " +
                                dmg,
                            "red",
                            1,
                            0,
                            vars.clients[idUserAttacked]
                        );
                        handleProtocol.console(
                            "Le has pegado a " +
                                userAttacked.nameCharacter +
                                " en la pierna derecha por " +
                                dmg,
                            "red",
                            1,
                            0,
                            vars.clients[idUser]
                        );
                        break;
                    case vars.partesCuerpo.brazoDerecho:
                        handleProtocol.console(
                            user.nameCharacter +
                                " te ha pegado en el brazo derecho por " +
                                dmg,
                            "red",
                            1,
                            0,
                            vars.clients[idUserAttacked]
                        );
                        handleProtocol.console(
                            "Le has pegado a " +
                                userAttacked.nameCharacter +
                                " en el brazo derecho por " +
                                dmg,
                            "red",
                            1,
                            0,
                            vars.clients[idUser]
                        );
                        break;
                    case vars.partesCuerpo.brazoIzquierdo:
                        handleProtocol.console(
                            user.nameCharacter +
                                " te ha pegado en el brazo izquierdo por " +
                                dmg,
                            "red",
                            1,
                            0,
                            vars.clients[idUserAttacked]
                        );
                        handleProtocol.console(
                            "Le has pegado a " +
                                userAttacked.nameCharacter +
                                " en el brazo izquierdo por " +
                                dmg,
                            "red",
                            1,
                            0,
                            vars.clients[idUser]
                        );
                        break;
                    case vars.partesCuerpo.torso:
                        handleProtocol.console(
                            user.nameCharacter +
                                " te ha pegado en el torso por " +
                                dmg,
                            "red",
                            1,
                            0,
                            vars.clients[idUserAttacked]
                        );
                        handleProtocol.console(
                            "Le has pegado a " +
                                userAttacked.nameCharacter +
                                " en el torso por " +
                                dmg,
                            "red",
                            1,
                            0,
                            vars.clients[idUser]
                        );
                        break;
                }

                if (userAttacked.hp > 0 && game.puedeApu(idUser)) {
                    game.apuUser(idUser, idUserAttacked, dmg);
                }

                game.loopArea(vars.clients[idUser], function(target) {
                    if (!target.isNpc) {
                        handleProtocol.playSound(
                            user.id,
                            vars.arSounds.SND_IMPACTO,
                            vars.clients[client.id]
                        );
                    }
                });
            } else {
                var rechazo = false;

                if (userAttacked.idItemShield) {
                    var skillDefensa = game.getSkillDefensa(idUserAttacked);
                    var skillTacticasCombate = game.getSkillTacticasCombate(
                        idUserAttacked
                    );

                    if (skillDefensa + skillTacticasCombate > 0) {
                        var probRechazo = Math.max(
                            10,
                            Math.min(
                                90,
                                (100 * skillDefensa) / skillDefensa +
                                    skillTacticasCombate
                            )
                        );

                        rechazo =
                            funct.randomIntFromInterval(1, 100) <= probRechazo;
                    }
                }

                dmg = "¡Fallas!";

                if (rechazo) {
                    handleProtocol.console(
                        "¡Has bloqueado el golpe con el escudo a " +
                            user.nameCharacter +
                            "!",
                        "red",
                        1,
                        0,
                        vars.clients[idUserAttacked]
                    );
                    handleProtocol.console(
                        userAttacked.nameCharacter +
                            " te ha bloqueado el ataque con el escudo.",
                        "red",
                        1,
                        0,
                        vars.clients[idUser]
                    );

                    game.loopArea(vars.clients[idUser], function(target) {
                        if (!target.isNpc) {
                            handleProtocol.playSound(
                                user.id,
                                vars.arSounds.SND_ESCUDO,
                                vars.clients[client.id]
                            );
                        }
                    });
                } else {
                    handleProtocol.console(
                        user.nameCharacter + " ha fallado un golpe.",
                        "red",
                        1,
                        0,
                        vars.clients[idUserAttacked]
                    );
                    handleProtocol.console(
                        "Le has fallado un golpe a  " +
                            userAttacked.nameCharacter,
                        "red",
                        1,
                        0,
                        vars.clients[idUser]
                    );

                    game.loopArea(vars.clients[idUser], function(target) {
                        if (!target.isNpc) {
                            handleProtocol.playSound(
                                user.id,
                                vars.arSounds.SND_SWING,
                                vars.clients[client.id]
                            );
                        }
                    });
                }
            }

            if (userAttacked.meditar) {
                userAttacked.meditar = false;

                handleProtocol.console(
                    "Terminas de meditar.",
                    "white",
                    0,
                    0,
                    vars.clients[idUserAttacked]
                );

                game.loopArea(vars.clients[idUserAttacked], function(client) {
                    if (!client.isNpc) {
                        handleProtocol.animFX(
                            idUserAttacked,
                            0,
                            vars.clients[client.id]
                        );
                    }
                });
            }

            return dmg;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [apuNpc description]
     * @param  {[type]} idUser [description]
     * @param  {[type]} idNpc  [description]
     * @param  {[type]} dmg    [description]
     * @return {[type]}        [description]
     */
    this.apuNpc = function(idUser, idNpc, dmg) {
        try {
            var user = vars.personajes[idUser];
            var npc = vars.npcs[idNpc];

            var probExito = 0;
            var skillApu = game.getSkillApu(idUser);

            if (user.idClase == vars.clases.asesino) {
                probExito = 24;
            } else if (
                user.idClase == vars.clases.clerigo ||
                user.idClase == vars.clases.paladin
            ) {
                probExito = parseInt(
                    ((0.000003 * skillApu + 0.0006) * skillApu + 0.0107) *
                        skillApu +
                        4.93
                );
            } else {
                probExito = parseInt(0.0361 * skillApu + 4.39);
            }

            if (funct.randomIntFromInterval(0, 100) < probExito) {
                npc.hp -= dmg * 2;

                handleProtocol.console(
                    "¡Has apuñalado a " +
                        npc.nameCharacter +
                        " por " +
                        dmg * 2 +
                        "!",
                    "red",
                    1,
                    0,
                    vars.clients[idUser]
                );

                game.calcularExp(idUser, idNpc, dmg * 2);
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [apuUser description]
     * @param  {[type]} idUser         [description]
     * @param  {[type]} idUserAttacked [description]
     * @param  {[type]} dmg            [description]
     * @return {[type]}                [description]
     */
    this.apuUser = function(idUser, idUserAttacked, dmg) {
        try {
            var user = vars.personajes[idUser];
            var userAttacked = vars.personajes[idUserAttacked];

            var probExito = 0;
            var skillApu = game.getSkillApu(idUser);

            var tmpDmg = 0;

            if (user.idClase == vars.clases.asesino) {
                probExito = parseInt(
                    ((0.00003 * skillApu - 0.002) * skillApu + 0.098) *
                        skillApu +
                        4.25
                );
            } else if (
                user.idClase == vars.clases.clerigo ||
                user.idClase == vars.clases.paladin
            ) {
                probExito = parseInt(
                    ((0.000003 * skillApu + 0.0006) * skillApu + 0.0107) *
                        skillApu +
                        4.93
                );
            } else {
                probExito = parseInt(0.0361 * skillApu + 4.39);
            }

            if (funct.randomIntFromInterval(0, 100) < probExito) {
                if (user.idClase == vars.clases.asesino) {
                    tmpDmg = parseInt(dmg * 1.4);
                    userAttacked.hp -= tmpDmg;
                } else {
                    tmpDmg = parseInt(dmg * 1.5);
                    userAttacked.hp -= tmpDmg;
                }

                handleProtocol.console(
                    "¡Has apuñalado a " +
                        userAttacked.nameCharacter +
                        " por " +
                        tmpDmg +
                        "!",
                    "red",
                    1,
                    0,
                    vars.clients[idUser]
                );
                handleProtocol.console(
                    user.nameCharacter + " te ha apuñalado por " + tmpDmg + "!",
                    "red",
                    1,
                    0,
                    vars.clients[idUserAttacked]
                );
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [getSkillTacticasCombate description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.getSkillTacticasCombate = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            var skillTacticasCombate = user.level * 3;

            if (skillTacticasCombate > 100) {
                skillTacticasCombate = 100;
            }

            return skillTacticasCombate;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [getSkillDefensa description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.getSkillDefensa = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            var skillDefensa = user.level * 3;

            if (skillDefensa > 100) {
                skillDefensa = 100;
            }

            return skillDefensa;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [getSkillArmas description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.getSkillArmas = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            var skillArmas = user.level * 3;

            if (skillArmas > 100) {
                skillArmas = 100;
            }

            return skillArmas;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [getSkillApu description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.getSkillApu = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            var skillApu = user.level * 3;

            if (skillApu > 100) {
                skillApu = 100;
            }

            return skillApu;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [puedeApu description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.puedeApu = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            if (!user.idItemWeapon) {
                return false;
            }

            var itemInventary = user.inv[user.idItemWeapon];
            var idItem = itemInventary.idItem;
            var itemWeapon = vars.datObj[idItem];

            if (!itemWeapon.apu) {
                return false;
            }

            var skillApu = game.getSkillApu(idUser);

            if (skillApu < 10 && user.idClase != vars.clases.asesino) {
                return false;
            } else {
                return true;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [poderEvasion description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.poderEvasion = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            var skillTacticasCombate = game.getSkillTacticasCombate(idUser);

            var tmpCalc =
                (skillTacticasCombate +
                    (skillTacticasCombate / 33) * user.attrAgilidad) *
                vars.modEvasion[user.idClase];

            return tmpCalc + 2.5 * Math.max(user.level - 12, 0);
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [poderEvasionEscudo description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.poderEvasionEscudo = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            var skillDefensa = game.getSkillDefensa(idUser);

            return (skillDefensa * vars.modEscudo[user.idClase]) / 2;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [poderAtaqueArma description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.poderAtaqueArma = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            var skillArmas = game.getSkillArmas(idUser);
            var poderAtaqueArmaTmp = 0;

            if (user.idItemWeapon) {
                var itemWeapon = vars.datObj[user.idItemWeapon];

                if (itemWeapon.proyectil) {
                    poderAtaqueArmaTmp =
                        (skillArmas + 3 * user.attrAgilidad) *
                        vars.modAtaqueProyectiles[user.idClase];
                } else {
                    poderAtaqueArmaTmp =
                        (skillArmas + 3 * user.attrAgilidad) *
                        vars.modAtaqueArmas[user.idClase];
                }
            } else {
                poderAtaqueArmaTmp =
                    (skillArmas + 3 * user.attrAgilidad) *
                    vars.modAtaqueWrestling[user.idClase];
            }

            return poderAtaqueArmaTmp + 2.5 * Math.max(user.level - 12, 0);
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [hayObj description]
     * @param  {[type]} idMap [description]
     * @param  {[type]} pos   [description]
     * @return {[type]}       [description]
     */
    this.hayObj = function(idMap, pos) {
        try {
            if (
                vars.mapa[idMap][pos.y][pos.x] &&
                vars.mapa[idMap][pos.y][pos.x].objInfo &&
                vars.mapa[idMap][pos.y][pos.x].objInfo.objIndex > 0 &&
                vars.mapa[idMap][pos.y][pos.x].objInfo.amount > 0
            ) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [objMap description]
     * @param  {[type]} idMap [description]
     * @param  {[type]} pos   [description]
     * @return {[type]}       [description]
     */
    this.objMap = function(idMap, pos) {
        try {
            return vars.mapa[idMap][pos.y][pos.x].objInfo;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [tirarItemsUser description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.tirarItemsUser = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            var ws = vars.clients[idUser];

            for (var idPos in user.inv) {
                var item = user.inv[idPos];
                var idItem = item.idItem;
                var datObj = vars.datObj[idItem];

                if (!datObj.newbie && !datObj.noSeCae) {
                    game.tirarItem(ws, idPos, item.cant);
                }
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [blockMap description]
     * @param  {[type]} idMap [description]
     * @param  {[type]} pos   [description]
     * @param  {[type]} block [description]
     * @return {[type]}       [description]
     */
    this.blockMap = function(idMap, pos, block) {
        try {
            vars.mapa[idMap][pos.y][pos.x].blocked = block;

            game.loopAreaPos(idMap, pos, function(target) {
                handleProtocol.blockMap(
                    idMap,
                    pos,
                    block,
                    vars.clients[target.id]
                );
            });
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [changeObjIndex description]
     * @param  {[type]} idMap    [description]
     * @param  {[type]} pos      [description]
     * @param  {[type]} objIndex [description]
     * @return {[type]}          [description]
     */
    this.changeObjIndex = function(idMap, pos, objIndex) {
        try {
            vars.mapa[idMap][pos.y][pos.x].objInfo.objIndex = objIndex;

            game.loopAreaPos(idMap, pos, function(target) {
                handleProtocol.renderItem(
                    objIndex,
                    idMap,
                    pos,
                    vars.clients[target.id]
                );
            });
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [openDoor description]
     * @param  {[type]} idUser [description]
     * @param  {[type]} pos    [description]
     * @param  {[type]} objMap [description]
     * @param  {[type]} obj    [description]
     * @return {[type]}        [description]
     */
    this.openDoor = function(idUser, pos, objMap, obj) {
        try {
            var user = vars.personajes[idUser];

            if (
                Math.abs(user.pos.x - pos.x) > 2 ||
                Math.abs(user.pos.y - pos.y) > 2
            ) {
                handleProtocol.console(
                    "Te encuentras muy lejos para abrir la puerta.",
                    "white",
                    1,
                    0,
                    vars.clients[idUser]
                );
                return;
            }

            if (obj.llave) {
                handleProtocol.console(
                    "La puerta está cerrada con llave.",
                    "white",
                    1,
                    0,
                    vars.clients[idUser]
                );
                return;
            }

            if (objMap.objIndex == obj.indexCerrada) {
                vars.mapa[user.map][pos.y][pos.x].objInfo.objIndex =
                    obj.indexAbierta;

                game.blockMap(user.map, pos, 0);
                game.blockMap(
                    user.map,
                    {
                        x: pos.x - 1,
                        y: pos.y
                    },
                    0
                );
            } else {
                vars.mapa[user.map][pos.y][pos.x].objInfo.objIndex =
                    obj.indexCerrada;

                game.blockMap(user.map, pos, 1);
                game.blockMap(
                    user.map,
                    {
                        x: pos.x - 1,
                        y: pos.y
                    },
                    1
                );
            }

            game.changeObjIndex(
                user.map,
                pos,
                vars.mapa[user.map][pos.y][pos.x].objInfo.objIndex
            );
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [buyItem description]
     * @param  {[type]} idUser [description]
     * @param  {[type]} idPos  [description]
     * @param  {[type]} cant   [description]
     * @return {[type]}        [description]
     */
    this.buyItem = function(idUser, idPos, cant) {
        try {
            var user = vars.personajes[idUser];

            if (cant < 1) {
                return;
            }

            if (user.dead) {
                handleProtocol.console(
                    "Los muertos no pueden comprar items.",
                    "white",
                    0,
                    0,
                    vars.clients[idUser]
                );
                return;
            }

            if (Object.keys(user.inv).length >= 21) {
                handleProtocol.console(
                    "Tienes el inventario lleno.",
                    "white",
                    0,
                    0,
                    vars.clients[idUser]
                );
                return;
            }

            if (user.npcTrade) {
                var npc = vars.npcs[user.npcTrade];

                if (
                    Math.abs(user.pos.x - npc.pos.x) > 2 ||
                    Math.abs(user.pos.y - npc.pos.y) > 2
                ) {
                    handleProtocol.console(
                        "Te encuentras muy lejos para comerciar.",
                        "white",
                        1,
                        0,
                        vars.clients[idUser]
                    );
                    return;
                }

                var itemNpc = npc.objs[idPos];
                var objItem = vars.datObj[itemNpc.item];

                if (parseInt((objItem.valor * cant) / 2) > user.gold) {
                    handleProtocol.console(
                        "No tienes oro suficiente.",
                        "white",
                        1,
                        0,
                        vars.clients[idUser]
                    );
                    return;
                }
                //Comercio 100 en skils es dividido 2

                user.gold -= parseInt((objItem.valor * cant) / 2);

                game.putItemToInv(idUser, itemNpc.item, cant);

                handleProtocol.actGold(user.gold, vars.clients[idUser]);
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [sellItem description]
     * @param  {[type]} idUser [description]
     * @param  {[type]} idPos  [description]
     * @param  {[type]} cant   [description]
     * @return {[type]}        [description]
     */
    this.sellItem = function(idUser, idPos, cant) {
        try {
            var user = vars.personajes[idUser];

            if (cant < 1) {
                return;
            }

            if (user.dead) {
                handleProtocol.console(
                    "Los muertos no pueden vender items.",
                    "white",
                    0,
                    0,
                    vars.clients[idUser]
                );
                return;
            }

            if (user.npcTrade) {
                var npc = vars.npcs[user.npcTrade];

                if (
                    Math.abs(user.pos.x - npc.pos.x) > 2 ||
                    Math.abs(user.pos.y - npc.pos.y) > 2
                ) {
                    handleProtocol.console(
                        "Te encuentras muy lejos para comerciar.",
                        "white",
                        1,
                        0,
                        vars.clients[idUser]
                    );
                    return;
                }

                var itemUser = user.inv[idPos];

                if (!itemUser) {
                    return;
                }

                if (itemUser.equipped) {
                    handleProtocol.console(
                        "Debes desequipar el item para poder venderlo.",
                        "white",
                        0,
                        0,
                        vars.clients[idUser]
                    );
                    return;
                }

                var cantSell = cant;

                if (cantSell > itemUser.cant) {
                    cantSell = itemUser.cant;
                }

                var objItem = vars.datObj[itemUser.idItem];

                /*if (objItem.newbie) {
                    handleProtocol.console('No se puede vender este item.', 'white', 1, 0, vars.clients[idUser]);
                    return;
                }*/

                user.gold += parseInt((objItem.valor * cantSell) / 3);

                game.quitarUserInvItem(idUser, idPos, cantSell);

                handleProtocol.actGold(user.gold, vars.clients[idUser]);
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [accionMeditar description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.accionMeditar = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            if (user.meditar) {
                user.meditar = false;

                handleProtocol.console(
                    "Terminas de meditar.",
                    "white",
                    0,
                    0,
                    vars.clients[idUser]
                );

                game.loopArea(vars.clients[idUser], function(client) {
                    if (!client.isNpc) {
                        handleProtocol.animFX(
                            idUser,
                            0,
                            vars.clients[client.id]
                        );
                    }
                });

                return;
            }

            if (user.dead) {
                handleProtocol.console(
                    "Los muertos no pueden meditar.",
                    "white",
                    0,
                    0,
                    vars.clients[idUser]
                );
                return;
            }

            if (!user.maxMana) {
                handleProtocol.console(
                    "Solo las clases mágicas pueden meditar.",
                    "white",
                    0,
                    0,
                    vars.clients[idUser]
                );
                return;
            }

            if (user.mana == user.maxMana) {
                handleProtocol.console(
                    "Tienes la maná al máximo.",
                    "white",
                    0,
                    0,
                    vars.clients[idUser]
                );
                return;
            }

            var fxMeditar = 0;

            if (user.level < 13) {
                fxMeditar = vars.meditacion.chica;
            } else if (user.level < 25) {
                fxMeditar = vars.meditacion.mediana;
            } else if (user.level < 35) {
                fxMeditar = vars.meditacion.grande;
            } else if (user.level < 42) {
                fxMeditar = vars.meditacion.xgrande;
            } else {
                fxMeditar = vars.meditacion.xxgrande;
            }

            game.loopArea(vars.clients[idUser], function(client) {
                if (!client.isNpc) {
                    handleProtocol.animFX(
                        idUser,
                        fxMeditar,
                        vars.clients[client.id]
                    );
                }
            });

            user.meditar = true;
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [meditar description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.meditar = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            var cantMana = parseInt((user.maxMana * 6) / 100);

            if (user.maxMana <= user.mana + cantMana) {
                cantMana = user.maxMana - user.mana;
            }

            user.mana += cantMana;

            handleProtocol.updateMana(user.mana, vars.clients[idUser]);

            handleProtocol.console(
                "¡Has recuperado " + cantMana + " puntos de maná!",
                "white",
                0,
                0,
                vars.clients[idUser]
            );

            if (user.maxMana == user.mana) {
                user.meditar = false;

                handleProtocol.console(
                    "Terminas de meditar.",
                    "white",
                    0,
                    0,
                    vars.clients[idUser]
                );

                game.loopArea(vars.clients[idUser], function(client) {
                    if (!client.isNpc) {
                        handleProtocol.animFX(
                            idUser,
                            0,
                            vars.clients[client.id]
                        );
                    }
                });
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [closeForce description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.closeForce = function(idUser) {
        try {
            handleProtocol.closeForce(idUser);

            socket.close(vars.clients[idUser]);
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [calcularExp description]
     * @param  {[type]} idUser [description]
     * @param  {[type]} idNpc  [description]
     * @param  {[type]} dmg    [description]
     * @return {[type]}        [description]
     */
    this.calcularExp = function(idUser, idNpc, dmg) {
        try {
            var user = vars.personajes[idUser];
            var npc = vars.npcs[idNpc];

            if (dmg < 0) {
                dmg = 0;
            }

            if (dmg > npc.minHp) {
                dmg = npc.minHp;
            }

            var exp = parseInt(
                dmg * (npc.exp / npc.maxHp) * vars.multiplicadorExp
            );

            if (!exp) {
                return;
            }

            if (vars.dobleExp) {
                exp *= 2;
            }

            user.exp += exp;

            handleProtocol.console(
                "¡Has ganado " + exp + " puntos de experiencia!",
                "red",
                1,
                0,
                vars.clients[idUser]
            );

            game.checkUserLevel(idUser);
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [navegar description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.navegar = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            if (user.navegando) {
                if (
                    game.legalPos(
                        user.pos.x - 1,
                        user.pos.y,
                        user.map,
                        false
                    ) ||
                    game.legalPos(
                        user.pos.x,
                        user.pos.y - 1,
                        user.map,
                        false
                    ) ||
                    game.legalPos(
                        user.pos.x + 1,
                        user.pos.y,
                        user.map,
                        false
                    ) ||
                    game.legalPos(user.pos.x, user.pos.y + 1, user.map, false)
                ) {
                    if (user.dead) {
                        user.idBody = 8;
                        user.idHead = 500;
                    } else {
                        user.idBody = user.idLastBody;
                        user.idHead = user.idLastHead;
                    }
                    user.idWeapon = user.idLastWeapon;
                    user.idHelmet = user.idLastHelmet;
                    user.idShield = user.idLastShield;

                    user.navegando = 0;

                    handleProtocol.navegando(idUser, vars.clients[idUser]);

                    game.loopArea(vars.clients[idUser], function(client) {
                        if (!client.isNpc) {
                            handleProtocol.changeBody(
                                idUser,
                                vars.clients[client.id]
                            );
                        }
                    });
                } else {
                    handleProtocol.console(
                        "¡Debes aproximarte a la costa para poder bajar del barco!",
                        "white",
                        0,
                        0,
                        vars.clients[idUser]
                    );
                    return;
                }
            } else {
                if (
                    game.legalPos(user.pos.x - 1, user.pos.y, user.map, true) ||
                    game.legalPos(user.pos.x, user.pos.y - 1, user.map, true) ||
                    game.legalPos(user.pos.x + 1, user.pos.y, user.map, true) ||
                    game.legalPos(user.pos.x, user.pos.y + 1, user.map, true)
                ) {
                    if (user.idHead != 500) {
                        user.idLastHead = JSON.parse(user.idHead);
                    }
                    if (user.idBody != 8) {
                        user.idLastBody = JSON.parse(user.idBody);
                    }
                    user.idLastHelmet = JSON.parse(user.idHelmet);
                    user.idLastWeapon = JSON.parse(user.idWeapon);
                    user.idLastShield = JSON.parse(user.idShield);

                    if (user.dead) {
                        user.idBody = 87;
                    } else {
                        user.idBody = 84;
                    }

                    user.idHead = 0;
                    user.idWeapon = 0;
                    user.idHelmet = 0;
                    user.idShield = 0;

                    user.navegando = 1;

                    handleProtocol.navegando(idUser, vars.clients[idUser]);

                    game.loopArea(vars.clients[idUser], function(client) {
                        if (!client.isNpc) {
                            handleProtocol.changeBody(
                                idUser,
                                vars.clients[client.id]
                            );
                        }
                    });
                } else {
                    handleProtocol.console(
                        "¡Debes aproximarte al agua para usar el barco!",
                        "white",
                        0,
                        0,
                        vars.clients[idUser]
                    );
                    return;
                }
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [deleteUserToAllNpcs description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
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

    /**
     * [hacerCriminal description]
     * @param  {[type]} idUser [description]
     * @return {[type]}        [description]
     */
    this.hacerCriminal = function(idUser) {
        try {
            var user = vars.personajes[idUser];

            user.criminal = 1;
            user.color = "red";

            game.loopArea(vars.clients[idUser], function(client) {
                if (!client.isNpc) {
                    handleProtocol.actColorName(
                        idUser,
                        "red",
                        vars.clients[client.id]
                    );
                }
            });
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [isRazaEnana description]
     * @param  {[type]}  idRaza [description]
     * @return {Boolean}        [description]
     */
    this.isRazaEnana = function(idRaza) {
        try {
            if (idRaza == vars.razas.gnomo || idRaza == vars.razas.enano) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    /**
     * [sorter description]
     * @param  {[type]} a [description]
     * @param  {[type]} b [description]
     * @return {[type]}   [description]
     */
    function sorter(a, b) {
        try {
            return a - b;
        } catch (err) {
            funct.dumpError(err);
        }
    }
}

module.exports = game;
