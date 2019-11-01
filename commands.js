var socket = require("./socket");
var game = require("./game");
var vars = require("./vars");
var funct = require("./functions");
var handleProtocol = require("./handleProtocol");

var command = new Command();

function Command() {
    this.msg = async function(msg, ws) {
        try {
            var searchSpace = msg.indexOf(" ");
            var commandText = msg.slice(0, searchSpace);
            var nextText = msg.slice(searchSpace + 1);

            if (searchSpace < 0) {
                commandText = msg;
            }

            if (!game.existPjOrClose(ws)) {
                return;
            }

            switch (commandText) {
                case "/online":
                    handleProtocol.console(
                        `Usuarios online en PvE: ${vars.usuariosOnline}`,
                        "#FFFFFF",
                        0,
                        0,
                        ws
                    );
                    handleProtocol.console(
                        `Usuarios online en PvP: ${vars.usuariosOnlinePvP}`,
                        "#FFFFFF",
                        0,
                        0,
                        ws
                    );
                    break;
                case "/darexp":
                    if (vars.personajes[ws.id].privileges == 1) {
                        vars.personajes[ws.id].exp += 9999999999;
                        game.checkUserLevel(ws.id);
                    }
                    break;
                case "/daroro":
                    if (vars.personajes[ws.id].privileges == 1) {
                        vars.personajes[ws.id].gold += 9999999;
                        handleProtocol.actGold(
                            vars.personajes[ws.id].gold,
                            vars.clients[ws.id]
                        );
                    }
                    break;
                case "/meditar":
                    game.accionMeditar(ws.id);
                    break;
                case "/dobleexp":
                    if (vars.personajes[ws.id].privileges == 1) {
                        if (vars.dobleExp) {
                            vars.dobleExp = false;
                            handleProtocol.consoleToAll(
                                "[Servidor] El evento de experiencia doble ha finalizado.",
                                "#E69500",
                                0,
                                0
                            );
                        } else {
                            vars.dobleExp = true;
                            handleProtocol.consoleToAll(
                                "[Servidor] El evento de experiencia doble ha comenzado.",
                                "#E69500",
                                0,
                                0
                            );
                        }
                    }
                    break;
                case "/dobleoro":
                    if (vars.personajes[ws.id].privileges == 1) {
                        if (vars.dobleGold) {
                            vars.dobleGold = false;
                            handleProtocol.consoleToAll(
                                "[Servidor] El evento de oro doble ha finalizado.",
                                "#E69500",
                                0,
                                0
                            );
                        } else {
                            vars.dobleGold = true;
                            handleProtocol.consoleToAll(
                                "[Servidor] El evento de oro doble ha comenzado.",
                                "#E69500",
                                0,
                                0
                            );
                        }
                    }
                    break;
                case "/telepme":
                    if (vars.personajes[ws.id].privileges == 1) {
                        //mapa@x@y
                        var splitText = nextText.split("@");
                        //var name = splitText[0];
                        var numMap = parseInt(splitText[0]);
                        var posX = parseInt(splitText[1]);
                        var posY = parseInt(splitText[2]);

                        if (!posX) {
                            posX = 50;
                        }

                        if (!posY) {
                            posY = 50;
                        }

                        game.telep(ws, numMap, posX, posY);
                    }
                    break;
                case "/reset":
                    if (
                        vars.personajes[ws.id].privileges == 1 &&
                        vars.personajes[ws.id].nameCharacter == "Midraks"
                    ) {
                        handleProtocol.consoleToAll(
                            "[Servidor] Guardando personajes.",
                            "#E69500",
                            0,
                            0
                        );

                        game.worldSave(function(data) {
                            console.log("[COMANDO] Reset");
                        });
                    }
                    break;
                case "/worldsave":
                    if (vars.personajes[ws.id].privileges == 1) {
                        handleProtocol.consoleToAll(
                            "[Servidor] Guardando personajes.",
                            "#E69500",
                            0,
                            0
                        );

                        game.worldSave(function(data) {
                            console.log("[COMANDO] WorldSave");
                        });
                    }
                    break;
                case "/verip":
                    if (vars.personajes[ws.id].privileges == 1) {
                        var name = nextText;

                        // if (rows.length > 0) {
                        //     handleProtocol.console("[INFO] La ip de " + rows[0].nameCharacter + " es " + rows[0].ip, '#E69500', 0, 0, ws);
                        // } else {
                        //     handleProtocol.console("[INFO] No existe ningun usuario con el nombre " + name, '#E69500', 0, 0, ws);
                        // }
                    }
                    break;

                case "/kick":
                    if (!game.existPjOrClose(ws)) {
                        return;
                    }

                    if (
                        vars.personajes[ws.id].privileges == 1 ||
                        vars.personajes[ws.id].privileges == 2
                    ) {
                        var name = nextText;

                        for (var i in vars.personajes) {
                            if (
                                vars.personajes[
                                    i
                                ].nameCharacter.toLowerCase() ==
                                name.toLowerCase()
                            ) {
                                wsKick = vars.clients[i];
                                handleProtocol.error(
                                    "Has sido expulsado del servidor.",
                                    wsKick
                                );
                                break;
                            }
                        }
                    }
                    break;
                case "/mute":
                    if (!game.existPjOrClose(ws)) {
                        return;
                    }

                    if (
                        vars.personajes[ws.id].privileges == 1 ||
                        vars.personajes[ws.id].privileges == 2
                    ) {
                        var splitText = nextText.split("@");
                        var name = splitText[0];
                        var time = splitText[1];

                        if (!name || !time) {
                            return;
                        }

                        // if (rows.length > 0) {

                        //     handleProtocol.console("[INFO] Has silenciado a " + name + " por " + time + " minutos.", '#E69500', 0, 0, ws);

                        //     for (var i in vars.personajes) {
                        //         if (vars.personajes[i].nameCharacter.toLowerCase() == name.toLowerCase()) {
                        //             var date = new Date();
                        //             var minutos = date.getMinutes();
                        //             var setDate = date.setMinutes(parseInt(minutos) + parseInt(time));

                        //             handleProtocol.console('[INFO] Has sido silenciado por ' + time + ' minutos.', '#E69500', 0, 0, vars.clients[i]);

                        //             vars.personajes[i].muted = date;
                        //             break;
                        //         }
                        //     }
                        // } else {
                        //     handleProtocol.console("[INFO] No existe ningun usuario con el nombre " + name, '#E69500', 0, 0, ws);
                        // }
                    }
                    break;

                case "/resetaciertos":
                    if (!game.existPjOrClose(ws)) {
                        return;
                    }

                    if (vars.personajes[ws.id].privileges == 1) {
                        var name = nextText;

                        // if (rows.length > 0) {
                        //     handleProtocol.console("[INFO] Has reiniciado los aciertos de " + name, '#E69500', 0, 0, ws);

                        //     for (var i in vars.personajes) {
                        //         if (vars.personajes[i].nameCharacter.toLowerCase() == name.toLowerCase()) {
                        //             vars.personajes[i].spellsAcertados = 0;
                        //             vars.personajes[i].spellsErrados = 0;
                        //             break;
                        //         }
                        //     }
                        // } else {
                        //     handleProtocol.console("[INFO] No existe ningun usuario con el nombre " + name, '#E69500', 0, 0, ws);
                        // }
                    }
                    break;
                case "/global":
                    if (
                        vars.personajes[ws.id].privileges == 1 ||
                        vars.personajes[ws.id].privileges == 2
                    ) {
                        var msg = nextText;

                        handleProtocol.consoleToAll(
                            "[Servidor] " + msg,
                            "#E69500",
                            0,
                            0
                        );
                    }
                    break;
                case "/ban":
                    if (!game.existPjOrClose(ws)) {
                        return;
                    }

                    if (vars.personajes[ws.id].privileges == 1) {
                        var splitText = nextText.split("@");

                        var name = splitText[0];
                        var time = splitText[1];

                        if (!name || !time) {
                            return;
                        }

                        // handleProtocol.console("[INFO] Has baneado a " + name + " por " + time + " minutos.", '#E69500', 0, 0, ws);

                        // for (var i in vars.personajes) {
                        //     if (vars.personajes[i].nameCharacter.toLowerCase() == name.toLowerCase()) {

                        //         wsBan = vars.clients[i];

                        //         var date = new Date();
                        //         var minutos = date.getMinutes();
                        //         var setDate = date.setMinutes(parseInt(minutos) + parseInt(time));

                        //         handleProtocol.console("[INFO] Has sido baneado por " + time + " minutos.", '#E69500', 0, 0, wsBan);

                        //         vars.personajes[i].banned = date;
                        //         socket.close(wsBan);
                        //         break;
                        //     }
                        // }
                    } else {
                        handleProtocol.console(
                            "[INFO] No existe ningun usuario con el nombre " +
                                name,
                            "#E69500",
                            0,
                            0,
                            ws
                        );
                    }
                    break;
                case "/unban":
                    if (!game.existPjOrClose(ws)) {
                        return;
                    }

                    if (vars.personajes[ws.id].privileges == 1) {
                        var name = nextText;

                        // if (rows.length > 0) {
                        //     handleProtocol.console("[INFO] Has desbaneado a " + name, '#E69500', 0, 0, ws);
                        // } else {
                        //     handleProtocol.console("[INFO] No existe ningun usuario con el nombre " + name, '#E69500', 0, 0, ws);
                        // }
                    }
                    break;
                case "/banip":
                    if (!game.existPjOrClose(ws)) {
                        return;
                    }

                    if (vars.personajes[ws.id].privileges == 1) {
                        var name = nextText;

                        for (var i in vars.personajes) {
                            if (
                                vars.personajes[
                                    i
                                ].nameCharacter.toLowerCase() ==
                                name.toLowerCase()
                            ) {
                                var ip = vars.clients[i]._socket.remoteAddress;

                                handleProtocol.console(
                                    "[INFO] Has baneado de IP al usuario " +
                                        name +
                                        " | IP: " +
                                        ip,
                                    "#E69500",
                                    0,
                                    0,
                                    ws
                                );

                                handleProtocol.error(
                                    "Has sido baneado del servidor.",
                                    vars.clients[i]
                                );
                                break;
                            } else {
                                if (rows.length > 0) {
                                    database.execute(
                                        "INSERT INTO blacklist (ip) VALUES ('" +
                                            rows[0].ip +
                                            "')"
                                    );

                                    handleProtocol.console(
                                        "[INFO] Has baneado de IP al usuario " +
                                            name +
                                            " | IP: " +
                                            rows[0].ip,
                                        "#E69500",
                                        0,
                                        0,
                                        ws
                                    );
                                } else {
                                    handleProtocol.console(
                                        "[INFO] No existe ningun usuario con el nombre " +
                                            name,
                                        "#E69500",
                                        0,
                                        0,
                                        ws
                                    );
                                }
                            }
                        }
                    }
                    break;
            }
        } catch (err) {
            funct.dumpError(err);
        }
    };
}

module.exports = command;
