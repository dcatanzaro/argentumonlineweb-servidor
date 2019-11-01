var vars = require("./vars");
var pkg = require("./package");
var socket = require("./socket");

var handleServer = new HandleServer();

function HandleServer() {
    this.changeHeading = function(idUser, heading, client) {
        pkg.setPackageID(pkg.clientPacketID.changeHeading);
        pkg.writeDouble(idUser);
        pkg.writeByte(heading);
        socket.send(client);
    };

    this.console = function(msg, color, bold, italica, client) {
        pkg.setPackageID(pkg.clientPacketID.console);
        pkg.writeString(msg);

        if (color) {
            pkg.writeByte(1);
            pkg.writeString(color);
        } else {
            pkg.writeByte(0);
        }

        pkg.writeByte(bold);
        pkg.writeByte(italica);
        socket.send(client);
    };

    this.consoleToAll = function(msg, color, bold, italica) {
        pkg.setPackageID(pkg.clientPacketID.console);
        pkg.writeString(msg);

        if (color) {
            pkg.writeByte(1);
            pkg.writeString(color);
        } else {
            pkg.writeByte(0);
        }

        pkg.writeByte(bold);
        pkg.writeByte(italica);
        socket.sendAll(pkg.dataSend());
    };

    this.changeHelmet = function(idUser, idHelmet, idPos, client) {
        pkg.setPackageID(pkg.clientPacketID.changeHelmet);
        pkg.writeDouble(idUser);
        pkg.writeShort(idHelmet);
        pkg.writeByte(idPos);
        socket.send(client);
    };

    this.changeRopa = function(idUser, idBody, idPos, client) {
        pkg.setPackageID(pkg.clientPacketID.changeRopa);
        pkg.writeDouble(idUser);
        pkg.writeShort(idBody);
        pkg.writeByte(idPos);
        socket.send(client);
    };

    this.changeWeapon = function(idUser, idWeapon, idPos, client) {
        pkg.setPackageID(pkg.clientPacketID.changeWeapon);
        pkg.writeDouble(idUser);
        pkg.writeShort(idWeapon);
        pkg.writeByte(idPos);
        socket.send(client);
    };

    this.changeArrow = function(idUser, idPos, client) {
        pkg.setPackageID(pkg.clientPacketID.changeArrow);
        pkg.writeDouble(idUser);
        pkg.writeByte(idPos);
        socket.send(client);
    };

    this.changeShield = function(idUser, idShield, idPos, client) {
        pkg.setPackageID(pkg.clientPacketID.changeShield);
        pkg.writeDouble(idUser);
        pkg.writeShort(idShield);
        pkg.writeByte(idPos);
        socket.send(client);
    };

    this.inmo = function(idUser, inmo, client) {
        var user = vars.personajes[idUser];

        pkg.setPackageID(pkg.clientPacketID.inmo);
        pkg.writeByte(inmo);
        pkg.writeByte(user.pos.x);
        pkg.writeByte(user.pos.y);
        socket.send(client);
    };

    this.actPositionServer = function(pos, heading, client) {
        pkg.setPackageID(pkg.clientPacketID.actPositionServer);
        pkg.writeByte(pos.x);
        pkg.writeByte(pos.y);
        pkg.writeByte(heading);
        socket.send(client);
    };

    this.actPosition = function(idUser, pos, client) {
        pkg.setPackageID(pkg.clientPacketID.actPosition);
        pkg.writeDouble(idUser);
        pkg.writeByte(pos.x);
        pkg.writeByte(pos.y);
        socket.send(client);
    };

    this.deleteCharacter = function(idUser, client) {
        pkg.setPackageID(pkg.clientPacketID.deleteCharacter);
        pkg.writeDouble(idUser);
        socket.send(client);
    };

    this.dialog = function(idUser, msg, name, color, console, client) {
        pkg.setPackageID(pkg.clientPacketID.dialog);
        pkg.writeDouble(idUser);
        pkg.writeString(msg);
        if (name) {
            pkg.writeByte(1);
            pkg.writeString(name);
        } else {
            pkg.writeByte(0);
        }
        pkg.writeString(color);
        pkg.writeByte(console);
        socket.send(client);
    };

    this.pong = function(client) {
        pkg.setPackageID(pkg.clientPacketID.pong);
        socket.send(client);
    };

    this.animFX = function(idUser, fxGrh, client) {
        pkg.setPackageID(pkg.clientPacketID.animFX);
        pkg.writeDouble(idUser);
        pkg.writeShort(fxGrh);
        socket.send(client);
    };

    this.playSound = function(idUser, idSound, client) {
        pkg.setPackageID(pkg.clientPacketID.playSound);
        pkg.writeByte(idSound);
        socket.send(client);
    };

    this.updateMana = function(mana, client) {
        pkg.setPackageID(pkg.clientPacketID.updateMana);
        pkg.writeShort(mana);
        socket.send(client);
    };

    this.updateAgilidad = function(agilidad, client) {
        pkg.setPackageID(pkg.clientPacketID.updateAgilidad);
        pkg.writeByte(agilidad);
        socket.send(client);
    };

    this.updateFuerza = function(fuerza, client) {
        pkg.setPackageID(pkg.clientPacketID.updateFuerza);
        pkg.writeByte(fuerza);
        socket.send(client);
    };

    this.updateHP = function(hp, client) {
        pkg.setPackageID(pkg.clientPacketID.updateHP);
        pkg.writeShort(hp);
        socket.send(client);
    };

    this.updateMaxHP = function(idUser, hp, maxHP, client) {
        pkg.setPackageID(pkg.clientPacketID.updateMaxHP);
        pkg.writeShort(hp);
        pkg.writeShort(maxHP);
        socket.send(client);
    };

    this.telepMe = function(idUser, idMap, pos, client) {
        pkg.setPackageID(pkg.clientPacketID.telepMe);
        pkg.writeDouble(idUser);
        pkg.writeShort(idMap);
        pkg.writeByte(pos.x);
        pkg.writeByte(pos.y);
        socket.send(client);
    };

    this.sendMyCharacter = function(character) {
        pkg.setPackageID(pkg.clientPacketID.getMyCharacter);
        pkg.writeDouble(character.id);
        pkg.writeString(character.nameCharacter);
        pkg.writeByte(character.idClase);
        pkg.writeShort(character.map);
        pkg.writeByte(character.pos.x);
        pkg.writeByte(character.pos.y);
        pkg.writeShort(character.idHead);
        pkg.writeShort(character.idHelmet);
        pkg.writeShort(character.idWeapon);
        pkg.writeShort(character.idShield);
        pkg.writeShort(character.idBody);
        pkg.writeShort(character.hp);
        pkg.writeShort(character.maxHp);
        pkg.writeShort(character.mana);
        pkg.writeShort(character.maxMana);
        pkg.writeByte(character.privileges);
        pkg.writeDouble(character.exp);
        pkg.writeDouble(character.expNextLevel);
        pkg.writeByte(character.level);
        pkg.writeInt(character.gold);
        pkg.writeByte(character.heading);
        pkg.writeByte(character.inmovilizado);
        pkg.writeByte(character.zonaSegura);
        pkg.writeString(character.color);
        pkg.writeString(character.clan);
        pkg.writeByte(character.navegando);
        pkg.writeByte(character.attrAgilidad);
        pkg.writeByte(character.attrFuerza);
        pkg.writeByte(Object.keys(character.inv).length);

        for (var idPos in character.inv) {
            var item = character.inv[idPos];
            var idItem = item.idItem;

            pkg.writeByte(idPos);
            pkg.writeInt(idItem);
            pkg.writeString(vars.datObj[idItem].name);
            pkg.writeByte(item.equipped);
            pkg.writeShort(vars.datObj[idItem].grhIndex);
            pkg.writeShort(item.cant);
            pkg.writeInt(vars.datObj[idItem].valor);
            pkg.writeByte(vars.datObj[idItem].objType);
            pkg.writeByte(itemValidUser(character.id, idItem));
            pkg.writeString(dataObj(idItem));
        }

        if (character.maxMana > 0) {
            pkg.writeByte(Object.keys(character.spells).length);

            for (idPos in character.spells) {
                var spell = character.spells[idPos];
                var idSpell = spell.idSpell;

                var datSpell = vars.datSpell[idSpell];

                pkg.writeByte(idPos);
                pkg.writeShort(idSpell);
                pkg.writeString(datSpell.name);
                pkg.writeShort(datSpell.manaRequired);
            }
        }
    };

    this.sendNpc = function(npc) {
        pkg.setPackageID(pkg.clientPacketID.getNpc);
        pkg.writeDouble(npc.id);
        pkg.writeString(npc.nameCharacter);
        pkg.writeByte(npc.idClase);
        pkg.writeShort(npc.map);
        pkg.writeByte(npc.pos.x);
        pkg.writeByte(npc.pos.y);
        pkg.writeShort(npc.idHead);
        pkg.writeShort(npc.idHelmet);
        pkg.writeShort(npc.idWeapon);
        pkg.writeShort(npc.idShield);
        pkg.writeShort(npc.idBody);
        pkg.writeByte(npc.heading);
        pkg.writeString(npc.color);
        pkg.writeString(npc.clan);
    };

    this.sendCharacter = function(character) {
        pkg.setPackageID(pkg.clientPacketID.getCharacter);
        pkg.writeDouble(character.id);
        pkg.writeString(character.nameCharacter);
        pkg.writeByte(character.idClase);
        pkg.writeShort(character.map);
        pkg.writeByte(character.pos.x);
        pkg.writeByte(character.pos.y);
        pkg.writeShort(character.idHead);
        pkg.writeShort(character.idHelmet);
        pkg.writeShort(character.idWeapon);
        pkg.writeShort(character.idShield);
        pkg.writeShort(character.idBody);
        pkg.writeByte(character.privileges);
        pkg.writeByte(character.heading);
        pkg.writeString(character.color);
        pkg.writeString(character.clan);
    };

    this.actMyLevel = function(idUser, client) {
        var user = vars.personajes[idUser];

        pkg.setPackageID(pkg.clientPacketID.actMyLevel);
        pkg.writeDouble(user.exp);
        pkg.writeDouble(user.expNextLevel);
        pkg.writeByte(user.level);
        pkg.writeShort(user.maxHp);
        pkg.writeShort(user.maxMana);
        socket.send(client);
    };

    this.actExp = function(exp, client) {
        pkg.setPackageID(pkg.clientPacketID.actExp);
        pkg.writeDouble(exp);
        socket.send(client);
    };

    this.actGold = function(gold, client) {
        pkg.setPackageID(pkg.clientPacketID.actGold);
        pkg.writeInt(gold);
        socket.send(client);
    };

    this.actOnline = function(usersOnline) {
        pkg.setPackageID(pkg.clientPacketID.actOnline);
        pkg.writeShort(usersOnline);
        socket.sendAll(pkg.dataSend());
    };

    this.error = function(msg, client) {
        pkg.setPackageID(pkg.clientPacketID.error);
        pkg.writeString(msg);
        socket.send(client);
        socket.close(client);
    };

    this.putBodyAndHeadDead = function(idUser, client) {
        var user = vars.personajes[idUser];

        pkg.setPackageID(pkg.clientPacketID.putBodyAndHeadDead);
        pkg.writeDouble(idUser);
        pkg.writeShort(user.idHead);
        pkg.writeShort(user.idHelmet);
        pkg.writeShort(user.idWeapon);
        pkg.writeShort(user.idShield);
        pkg.writeShort(user.idBody);

        socket.send(client);
    };

    this.revivirUsuario = function(idUser, client) {
        var user = vars.personajes[idUser];

        pkg.setPackageID(pkg.clientPacketID.revivirUsuario);
        pkg.writeDouble(idUser);
        pkg.writeShort(user.idHead);
        pkg.writeShort(user.idBody);

        socket.send(client);
    };

    this.quitarUserInvItem = function(idUser, idPos, cant, client) {
        var user = vars.personajes[idUser];

        pkg.setPackageID(pkg.clientPacketID.quitarUserInvItem);
        pkg.writeDouble(idUser);
        pkg.writeByte(idPos);
        pkg.writeShort(cant);

        socket.send(client);
    };

    this.renderItem = function(idItem, idMap, pos, client) {
        pkg.setPackageID(pkg.clientPacketID.renderItem);
        pkg.writeInt(idItem);
        pkg.writeShort(idMap);
        pkg.writeByte(pos.x);
        pkg.writeByte(pos.y);

        socket.send(client);
    };

    this.deleteItem = function(idMap, pos, client) {
        pkg.setPackageID(pkg.clientPacketID.deleteItem);
        pkg.writeShort(idMap);
        pkg.writeByte(pos.x);
        pkg.writeByte(pos.y);

        socket.send(client);
    };

    this.agregarUserInvItem = function(idUser, idPos, client) {
        pkg.setPackageID(pkg.clientPacketID.agregarUserInvItem);

        var user = vars.personajes[idUser];
        var item = user.inv[idPos];
        var idItem = item.idItem;

        pkg.writeByte(idPos);
        pkg.writeInt(idItem);
        pkg.writeString(vars.datObj[idItem].name);
        pkg.writeByte(item.equipped);
        pkg.writeShort(vars.datObj[idItem].grhIndex);
        pkg.writeShort(item.cant);
        pkg.writeInt(parseInt(vars.datObj[idItem].valor / 3));
        pkg.writeByte(vars.datObj[idItem].objType);
        pkg.writeByte(itemValidUser(idUser, idItem));
        pkg.writeString(dataObj(idItem));

        socket.send(client);
    };

    this.blockMap = function(idMap, pos, block, client) {
        pkg.setPackageID(pkg.clientPacketID.blockMap);

        pkg.writeShort(idMap);
        pkg.writeByte(pos.x);
        pkg.writeByte(pos.y);
        pkg.writeByte(block);

        socket.send(client);
    };

    this.openTrade = function(idUser, idNpc, client) {
        var user = vars.personajes[idUser],
            npc = vars.npcs[idNpc];

        pkg.setPackageID(pkg.clientPacketID.openTrade);

        pkg.writeByte(Object.keys(npc.objs).length);

        for (var indexObj in npc.objs) {
            var item = npc.objs[indexObj];
            var objItem = vars.datObj[item.item];

            pkg.writeShort(objItem.grhIndex);
            pkg.writeString(objItem.name);
            pkg.writeShort(item.cant);
            pkg.writeInt(objItem.valor);
            pkg.writeByte(itemValidUser(idUser, item.item));
            pkg.writeString(dataObj(item.item));
        }

        pkg.writeByte(Object.keys(user.inv).length);

        for (var idPos in user.inv) {
            var itemUser = user.inv[idPos];
            var idItem = itemUser.idItem;

            pkg.writeShort(vars.datObj[idItem].grhIndex);
            pkg.writeString(vars.datObj[idItem].name);
            pkg.writeShort(itemUser.cant);
            pkg.writeInt(parseInt(vars.datObj[idItem].valor / 3));
            pkg.writeByte(itemUser.equipped);

            pkg.writeByte(idPos);
            pkg.writeByte(itemValidUser(idUser, idItem));
            pkg.writeString(dataObj(idItem));
        }

        socket.send(client);
    };

    this.aprenderSpell = function(idUser, idPosSpell) {
        var user = vars.personajes[idUser];

        var spell = user.spells[idPosSpell];
        var idSpell = spell.idSpell;

        var datSpell = vars.datSpell[idSpell];

        pkg.setPackageID(pkg.clientPacketID.aprenderSpell);

        pkg.writeByte(idPosSpell);
        pkg.writeShort(idSpell);
        pkg.writeString(datSpell.name);
        pkg.writeShort(datSpell.manaRequired);

        socket.send(vars.clients[idUser]);
    };

    this.closeForce = function(idUser) {
        pkg.setPackageID(pkg.clientPacketID.closeForce);
        socket.send(vars.clients[idUser]);
    };

    this.nameMap = function(idUser) {
        var user = vars.personajes[idUser];

        pkg.setPackageID(pkg.clientPacketID.nameMap);
        pkg.writeString(vars.mapData[user.map].name);
        socket.send(vars.clients[idUser]);
    };

    this.changeBody = function(idUser, client) {
        var user = vars.personajes[idUser];

        pkg.setPackageID(pkg.clientPacketID.changeBody);
        pkg.writeDouble(idUser);
        pkg.writeShort(user.idHead);
        pkg.writeShort(user.idBody);
        pkg.writeShort(user.idHelmet);
        pkg.writeShort(user.idWeapon);
        pkg.writeShort(user.idShield);
        socket.send(client);
    };

    this.navegando = function(idUser, client) {
        var user = vars.personajes[idUser];

        pkg.setPackageID(pkg.clientPacketID.navegando);
        pkg.writeByte(user.navegando);
        socket.send(client);
    };

    this.actColorName = function(idUser, color, client) {
        pkg.setPackageID(pkg.clientPacketID.actColorName);
        pkg.writeDouble(idUser);
        pkg.writeString(color);
        socket.send(client);
    };

    function isRazaEnana(idRaza) {
        if (idRaza == vars.razas.gnomo || idRaza == vars.razas.enano) {
            return true;
        } else {
            return false;
        }
    }

    function itemValidUser(idUser, idItem) {
        var user = vars.personajes[idUser];
        var obj = vars.datObj[idItem];

        if (
            (obj.clasesPermitidas &&
                obj.clasesPermitidas.indexOf(user.idClase) >= 0) ||
            (obj.razaEnana &&
                !isRazaEnana(user.idRaza) &&
                obj.objType == vars.objType.armaduras) ||
            (!obj.razaEnana &&
                isRazaEnana(user.idRaza) &&
                obj.objType == vars.objType.armaduras)
        ) {
            return 0;
        } else {
            return 1;
        }
    }

    function dataObj(idItem) {
        try {
            var obj = vars.datObj[idItem];

            var data = "";

            switch (obj.objType) {
                case vars.objType.armas:
                    data = "Daño: " + obj.minHit + "/" + obj.maxHit;

                    if (obj.apu) {
                        data += " | Apuñala";
                    }

                    if (obj.staffDamageBonus) {
                        data += " | Daño mágico: " + obj.staffDamageBonus;
                    }
                    break;

                case vars.objType.armaduras:
                    data = "Defensa: " + obj.minDef + "/" + obj.maxDef;
                    break;

                case vars.objType.escudos:
                    data = "Defensa: " + obj.minDef + "/" + obj.maxDef;
                    break;

                case vars.objType.cascos:
                    data = "Defensa: " + obj.minDef + "/" + obj.maxDef;

                    if (obj.minDefMag && obj.maxDefMag) {
                        data +=
                            " | Defensa Mágica: " +
                            obj.minDefMag +
                            "/" +
                            obj.maxDefMag;
                    }
                    break;

                case vars.objType.flechas:
                    data = "Daño: " + obj.minHit + "/" + obj.maxHit;
                    break;

                case vars.objType.pergaminos:
                    var spell = vars.datSpell[obj.spellIndex];

                    if (spell.minHp && spell.maxHp) {
                        if (spell.subeHp === 1) {
                            data =
                                "Curación: " +
                                spell.minHp +
                                "/" +
                                spell.maxHp +
                                " | ";
                        } else if (spell.subeHp == 2) {
                            data =
                                "Daño: " +
                                spell.minHp +
                                "/" +
                                spell.maxHp +
                                " | ";
                        }
                    }

                    data += "Maná requerida: " + spell.manaRequired;
                    break;
            }

            return data;
        } catch (err) {
            funct.dumpError(err);
        }
    }
}

module.exports = handleServer;
