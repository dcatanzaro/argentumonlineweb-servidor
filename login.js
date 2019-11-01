const funct = require("./functions");
const vars = require("./vars");
const game = require("./game");
const socket = require("./socket");
const bcrypt = require("bcrypt-nodejs");
const pkg = require("./package");
const npcs = require("./npcs");
const handleProtocol = require("./handleProtocol");
const _ = require("lodash");

const login = new Login();

function Login() {
    this.disconnectAllCharacters = function(ws, account) {
        for (var i in vars.personajes) {
            if (
                vars.clients[i] &&
                vars.personajes[i].idAccount == account._id
            ) {
                game.closeForce(i);
            }
        }
    };

    this.connect = async function(
        ws,
        idAccount,
        idCharacter,
        email,
        typeGame,
        idChar
    ) {
        try {
            if (idAccount && email) {
                const result = await funct.fetchUrl(
                    `/character?idAccount=${idAccount}&idCharacter=${idCharacter}&email=${email}`,
                    {
                        headers: {
                            Authorization: vars.tokenAuth
                        }
                    }
                );

                const { account, character } = result;

                if (
                    !result.account._id ||
                    (typeGame == 1 && !result.character._id)
                ) {
                    ws.close();
                    return;
                }

                login.disconnectAllCharacters(ws, account);

                if (typeGame == 2) {
                    return this.connectCharacterPvP(
                        ws,
                        account.name,
                        account._id,
                        idChar
                    );
                }

                const date = new Date();

                let personaje = _.cloneDeep(character);

                if (personaje.banned > date) {
                    handleProtocol.error(
                        "Tu personaje se encuentra baneado.",
                        ws
                    );
                    return;
                }

                ws.id = login.createId();

                personaje.id = String(ws.id);
                personaje.nameCharacter = personaje.name;

                if (!personaje.posX) {
                    personaje.posX = 50;
                }

                if (!personaje.posY) {
                    personaje.posY = 50;
                }

                if (!personaje.map) {
                    personaje.map = 1;
                }

                personaje.pos = {
                    x: personaje.posX,
                    y: personaje.posY
                };

                personaje.heading = 2;

                personaje.moveOffsetX = 0;
                personaje.moveOffsetY = 0;

                personaje.dialogTimer = 0;
                personaje.hitTimer = 0;
                personaje.hitSpell = 0;
                personaje.hitUseItem = 0;

                personaje.cooldownFuerza = 0;
                personaje.cooldownAgilidad = 0;

                personaje.bkAttrFuerza = personaje.attrFuerza;
                personaje.bkAttrAgilidad = personaje.attrAgilidad;

                personaje.seguroActivado = true;

                personaje.cerrado = false;

                personaje.meditar = false;

                personaje.inmovilizado = 0;

                personaje.fxId = 0;
                personaje.frameFxCounter = 0;

                personaje.zonaSegura = 0;

                personaje.spell = {
                    lanzados: 0,
                    tiempoTotal: 0,
                    startTimer: 0
                };

                personaje.hit = {
                    hits: 0,
                    tiempoTotal: 0,
                    startTimer: 0
                };

                personaje.walk = {
                    pasos: 0,
                    tiempoTotal: 0,
                    startTimer: 0
                };

                personaje.useObj = {
                    startTimer: 0,
                    usos: 0,
                    tiempoTotal: 0,
                    adv: 0
                };

                personaje.inv = {};

                personaje.items.map(item => {
                    const idPos = item.idPos;

                    personaje.inv[idPos] = {
                        idItem: item.idItem,
                        cant: item.cant,
                        equipped: item.equipped
                    };

                    const obj = vars.datObj[item.idItem];

                    if (!personaje.dead && item.equipped) {
                        if (obj.objType == vars.objType.armaduras) {
                            if (!personaje.navegando) {
                                personaje.idBody = obj.anim;
                            }
                            personaje.idItemBody = idPos;
                        } else if (obj.objType == vars.objType.armas) {
                            if (!personaje.navegando) {
                                personaje.idWeapon = obj.anim;
                            }
                            personaje.idItemWeapon = idPos;
                        } else if (obj.objType == vars.objType.escudos) {
                            if (!personaje.navegando) {
                                personaje.idShield = obj.anim;
                            }
                            personaje.idItemShield = idPos;
                        } else if (obj.objType == vars.objType.cascos) {
                            if (!personaje.navegando) {
                                personaje.idHelmet = obj.anim;
                            }
                            personaje.idItemHelmet = idPos;
                        } else if (obj.objType == vars.objType.flechas) {
                            personaje.idItemArrow = idPos;
                        }
                    }
                });

                personaje.pasosGenerales = 0;

                let spells = {};

                personaje.spells.map(spell => {
                    spells[spell.idPos] = {
                        idSpell: spell.idSpell
                    };
                });

                personaje.spells = spells;

                vars.personajes[ws.id] = personaje;

                vars.clients[ws.id] = ws;

                if (
                    vars.mapData[vars.personajes[ws.id].map][
                        vars.personajes[ws.id].pos.y
                    ][vars.personajes[ws.id].pos.x].id
                ) {
                    const pos = game.getFreeSpace(ws, 272, 77, 48);

                    vars.personajes[ws.id].pos.y = pos.y;
                    vars.personajes[ws.id].pos.x = pos.x;
                }

                vars.mapData[vars.personajes[ws.id].map][
                    vars.personajes[ws.id].pos.y
                ][vars.personajes[ws.id].pos.x].id = ws.id;

                personaje.ip = socket.getIp(ws);

                const bodyPersonaje = {
                    ip: personaje.ip,
                    updatedAt: new Date()
                };

                const characterSave = await funct.fetchUrl(
                    `/character_save/${personaje._id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(bodyPersonaje),
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: vars.tokenAuth
                        }
                    }
                );

                var personajeWS = vars.personajes[ws.id];

                if (
                    personajeWS.privileges == 1 ||
                    personajeWS.privileges == 2
                ) {
                    personajeWS.color = "#419900";
                    personajeWS.clan = "<AOW Staff>";
                } else {
                    if (personajeWS.criminal) {
                        personajeWS.color = "red";
                        personajeWS.clan = "";
                    } else {
                        personajeWS.color = "#3333ff";
                        personajeWS.clan = "";
                    }
                }

                handleProtocol.sendMyCharacter(personajeWS);
                socket.send(ws);

                funct.sendTelegramMessage(
                    `[Servidor] Usuario ${
                        personajeWS.nameCharacter
                    } conectado en mapa ${vars.personajes[ws.id].map}.`
                );

                vars.usuariosOnline++;

                funct.sendTelegramMessage(
                    `[Servidor] Usuarios online: ${vars.usuariosOnline}`
                );

                handleProtocol.actOnline(vars.usuariosOnline);

                game.setNewAreas(ws);
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };

    this.connectCharacterPvP = (ws, nameCharacter, idAccount, idChar) => {
        const character = _.cloneDeep(vars.charactersPvP[idChar]);

        ws.id = login.createId();

        const newCharacter = {
            idAccount: idAccount,
            pvpChar: true,
            nameCharacter: nameCharacter,
            idClase: character.idClase,
            map: 272,
            posX: 77,
            posY: 48,
            gold: 0,
            idHead: character.idHead,
            idLastHead: 0,
            idLastBody: 0,
            idLastHelmet: 0,
            idLastWeapon: 0,
            idLastShield: 0,
            idHelmet: character.idHelmet,
            idWeapon: character.idWeapon,
            idShield: character.idShield,
            idBody: character.idBody,
            idItemWeapon: 0,
            idItemBody: 0,
            idItemShield: 0,
            idItemHelmet: 0,
            spellsAcertados: 0,
            spellsErrados: 0,
            hp: character.hp,
            maxHp: character.hp,
            mana: character.mana,
            maxMana: character.mana,
            idRaza: character.idRaza,
            idGenero: 1,
            muerto: 0,
            minHit: character.hit,
            maxHit: character.hit,
            attrFuerza: 18 + vars.balanceRazas[character.idRaza].fuerza,
            attrAgilidad: 18 + vars.balanceRazas[character.idRaza].agilidad,
            attrInteligencia:
                18 + vars.balanceRazas[character.idRaza].inteligencia,
            attrConstitucion:
                18 + vars.balanceRazas[character.idRaza].constitucion,
            privileges: 0,
            countKilled: 0,
            countDie: 0,
            exp: 1,
            expNextLevel: 1,
            level: 42,
            ip: socket.getIp(ws),
            banned: null,
            dead: 0,
            criminal: 0,
            navegando: 0,
            npcMatados: 0,
            ciudadanosMatados: 0,
            criminalesMatados: 0,
            fianza: 0,
            connected: 0,
            id: ws.id,
            pos: { x: 77, y: 48 },
            heading: 2,
            moveOffsetX: 0,
            moveOffsetY: 0,
            dialogTimer: 0,
            hitTimer: 0,
            hitSpell: 0,
            hitUseItem: 0,
            cooldownFuerza: 0,
            cooldownAgilidad: 0,
            bkAttrFuerza: 18 + vars.balanceRazas[character.idRaza].fuerza,
            bkAttrAgilidad: 18 + vars.balanceRazas[character.idRaza].agilidad,
            seguroActivado: true,
            cerrado: false,
            meditar: false,
            inmovilizado: 0,
            fxId: 0,
            frameFxCounter: 0,
            zonaSegura: 0,
            color: "#3333ff",
            clan: "",
            spell: { lanzados: 0, tiempoTotal: 0, startTimer: 0 },
            hit: { hits: 0, tiempoTotal: 0, startTimer: 0 },
            walk: { pasos: 0, tiempoTotal: 0, startTimer: 0 },
            useObj: { startTimer: 0, usos: 0, tiempoTotal: 0, adv: 0 },
            inv: character.inv,
            pasosGenerales: 0,
            spells: character.spells,
            idItemWeapon: character.idItemWeapon || 0,
            idItemBody: character.idItemBody || 0,
            idItemShield: character.idItemShield || 0,
            idItemHelmet: character.idItemHelmet || 0,
            idItemArrow: character.idItemArrow || 0
        };

        vars.personajes[ws.id] = newCharacter;

        vars.clients[ws.id] = ws;

        if (
            vars.mapData[vars.personajes[ws.id].map][
                vars.personajes[ws.id].pos.y
            ][vars.personajes[ws.id].pos.x].id
        ) {
            const pos = game.getFreeSpace(ws, 272, 77, 48);

            vars.personajes[ws.id].pos.y = pos.y;
            vars.personajes[ws.id].pos.x = pos.x;
        }

        vars.mapData[vars.personajes[ws.id].map][vars.personajes[ws.id].pos.y][
            vars.personajes[ws.id].pos.x
        ].id = ws.id;

        handleProtocol.sendMyCharacter(newCharacter);
        socket.send(ws);

        game.setNewAreas(ws);

        funct.sendTelegramMessage(
            `[Servidor-PVP] Usuario ${
                newCharacter.nameCharacter
            } conectado en mapa ${vars.personajes[ws.id].map}.`
        );

        vars.usuariosOnlinePvP++;

        funct.sendTelegramMessage(
            `[Servidor-PVP] Usuarios online: ${vars.usuariosOnlinePvP}`
        );
    };

    this.createId = function() {
        var unica = true;
        var id;

        while (unica) {
            id = new Date().getTime();

            if (!vars.personajes[id] && !vars.npcs[id]) {
                unica = false;
            }
        }

        return id;
    };
}

module.exports = login;
