var funct = require('./functions');
var database = require('./database');
var vars = require('./vars');
var game = require('./game');
var socket = require('./socket');
var bcrypt = require('bcrypt-nodejs');
var pkg = require('./package');
var npcs = require('./npcs');
var handleProtocol = require('./handleProtocol');

var login = new Login();

function Login() {

    this.disconnectAllCharacters = function(ws, account) {
        for (var i in vars.personajes) {
            if (vars.clients[i] && vars.personajes[i].idAccount == account.idAccount) {
                game.closeForce(i);
            }
        }
    };

    this.connect = function(ws, nameAccount, password, nameCharacter) {
        try {
            if (nameAccount && password && nameCharacter) {

                database.query('SELECT * FROM blacklist WHERE ip = ? LIMIT 1', [ws._socket.remoteAddress], function(err, rows, fields) {
                    if (rows.length > 0) {
                        handleProtocol.error("No tienes permitido el acceso al servidor.", ws);
                        return;
                    }

                    database.query('SELECT idAccount, password FROM accounts WHERE nameAccount = ? LIMIT 1', [nameAccount], function(err, rows, fields) {

                        if (err) throw err;

                        var account = rows[0];

                        if (!account) {
                            return;
                        }

                        var passwordCharacter = account.password.replace('$2y$', '$2a$');

                        if (bcrypt.compareSync(password, passwordCharacter)) {
                            var query = 'SELECT * FROM characters WHERE nameCharacter = ? AND idAccount = ?';

                            database.query(query, [nameCharacter, account.idAccount], function(err, rows, fields) {

                                if (!rows) {
                                    return;
                                }

                                login.disconnectAllCharacters(ws, account);

                                var personaje = rows[0];

                                if (!personaje) {
                                    return;
                                }

                                var date = new Date();

                                if (personaje.banned > date) {
                                    handleProtocol.error("Tu personaje se encuentra baneado.", ws);
                                    return;
                                }

                                var query = 'SELECT idItem, idPos, cant, equipped FROM inventary WHERE idCharacter="' + personaje.idCharacter + '"';
                                database.query(query, function(err, itemsInventary, fields) {

                                    var query = 'SELECT idSpell, idPos FROM spells WHERE idCharacter="' + personaje.idCharacter + '"';
                                    database.query(query, function(err, spells, fields) {

                                        ws.id = login.createId();
                                        personaje.id = String(ws.id);

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

                                        for (var item in itemsInventary) {
                                            var idPos = itemsInventary[item].idPos;

                                            personaje.inv[idPos] = {
                                                idItem: itemsInventary[item].idItem,
                                                cant: itemsInventary[item].cant,
                                                equipped: itemsInventary[item].equipped
                                            };

                                            var obj = vars.datObj[itemsInventary[item].idItem];

                                            if (!personaje.dead && itemsInventary[item].equipped) {
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
                                        }

                                        personaje.pasosGenerales = 0;

                                        personaje.spells = {};

                                        for (var indexSpell in spells) {
                                            var spell = spells[indexSpell];

                                            personaje.spells[spell.idPos] = {
                                                idSpell: spell.idSpell
                                            };
                                        }

                                        vars.personajes[ws.id] = personaje;

                                        vars.clients[ws.id] = ws;
                                        
                                        //ANTIPISADAS
                                        if (vars.mapData[vars.personajes[ws.id].map][vars.personajes[ws.id].pos.y][vars.personajes[ws.id].pos.x].id) {
                                            var i = 0;
                                            var z = 1;
                                            tmpPosX = vars.personajes[ws.id].pos.x;
                                            tmpPosY = vars.personajes[ws.id].pos.y;
                                            while (!game.legalPos(tmpPosX, tmpPosY, vars.personajes[ws.id].map)) {
                                
                                                if (i == 0) {
                                                    var tmpPosX = vars.personajes[ws.id].pos.x - z;
                                                    var tmpPosY = vars.personajes[ws.id].pos.y - z;
                                                } else {
                                                    tmpPosX++;
                                                }
                                
                                                var filas = (3 * z) - (z - 1);
                                
                                                if (i % filas === 0 && i !== 0) {
                                                    tmpPosY++;
                                                    tmpPosX = vars.personajes[ws.id].pos.x - z;
                                                }
                                
                                                i++;
                                
                                                if (i == (filas * filas)) {
                                                    i = 0;
                                                    z++;
                                                }
                                
                                                if (i > 10000) {
                                                    login.disconnectAllCharacters(ws, account);
                                                    return
                                                }
                                            }
                                            vars.personajes[ws.id].pos.x = tmpPosX;
                                            vars.personajes[ws.id].pos.y = tmpPosY;
                                        }
                                        // END ANTIPISADAS
                                        
                                        vars.mapData[vars.personajes[ws.id].map][vars.personajes[ws.id].pos.y][vars.personajes[ws.id].pos.x].id = ws.id;

                                        personaje.ip = socket.getIp(ws);

                                        database.query('UPDATE characters SET connected=1, updated_at=NOW(), ip="' + personaje.ip + '" WHERE idCharacter="' + personaje.idCharacter + '"');

                                        var personajeWS = vars.personajes[ws.id];

                                        if (personajeWS.privileges == 1 || personajeWS.privileges == 2) {
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

                                        console.log("[INFO | " + funct.dateFormat(new Date(), "%d-%m-%Y %H:%M:%S") + "] Se ha conectado: " + personajeWS.nameCharacter + " al mapa " + vars.personajes[ws.id].map);

                                        vars.usuariosOnline++;

                                        database.query('UPDATE usersOnline SET usersOnline="' + vars.usuariosOnline + '"');

                                        handleProtocol.actOnline(vars.usuariosOnline);

                                        game.setNewAreas(ws);
                                    });
                                });
                            });
                        }
                    });
                });
            }
        } catch (err) {
            funct.dumpError(err);
        }
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
