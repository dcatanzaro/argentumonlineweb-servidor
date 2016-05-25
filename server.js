var fs = require('fs');

var WebSocketServer = require('ws').Server,
    ws = new WebSocketServer({
        port: 7666
    }),
    util = require('util');

var funct = require('./functions');
var protocol = require('./protocol');
var game = require('./game');
var socket = require('./socket');
var vars = require('./vars');
var database = require('./database');
var pkg = require('./package');
var npcs = require('./npcs');
//var loadMaps = require('./createMaps');
var loadMaps = require('./loadMaps');
var loadObjs = require('./loadObjs');
var loadSpells = require('./loadSpells');
var handleProtocol = require('./handleProtocol');

console.log("[INFO | " + funct.dateFormat(new Date(), "%d-%m-%Y %H:%M:%S") + "] Iniciando servidor.");
console.log("[INFO | " + funct.dateFormat(new Date(), "%d-%m-%Y %H:%M:%S") + "] Cargando hechizos.");
console.log("[INFO | " + funct.dateFormat(new Date(), "%d-%m-%Y %H:%M:%S") + "] Iniciando WebSockets.");

ws.on('connection', function(ws) {
    ws.on('message', function(res) {
        try {
            if (ws.readyState != ws.OPEN) {
                return;
            }

            pkg.setData(res);
            protocol.handleData(ws, pkg.getPackageID());

        } catch (err) {
            funct.dumpError(err);
        }
    });

    ws.on('close', function(message) {
        try {
            socket.closePj(ws);
        } catch (err) {
            funct.dumpError(err);
        }
    });
});

setInterval(function() {
    for (var idNpc in vars.npcs) {
        var npc = vars.npcs[idNpc];

        if (npc.movement == 3 && vars.areaNpc[idNpc].length > 0 && !npc.rute.length) {
            npcs.npcAttackUser(idNpc);
        }
    }
}, 650);

setInterval(function() {
    for (var idUser in vars.personajes) {
        var user = vars.personajes[idUser];

        if (user.meditar && user.mana < user.maxMana) {
            game.meditar(idUser);
        }

        if (user.cooldownFuerza > 0 && +Date.now() - user.cooldownFuerza > vars.cooldownFA) {
            user.attrFuerza = user.bkAttrFuerza;
            user.cooldownFuerza = 0;
            handleProtocol.updateFuerza(user.attrFuerza, vars.clients[idUser]);
        }

        if (user.cooldownAgilidad > 0 && +Date.now() - user.cooldownAgilidad > vars.cooldownFA) {
            user.attrAgilidad = user.bkAttrAgilidad;
            user.cooldownAgilidad = 0;
            handleProtocol.updateAgilidad(user.attrAgilidad, vars.clients[idUser]);
        }
    }
}, 500);

//Limpio los personajes cerrados
setInterval(function() {
    for (var idUser in vars.personajes) {
        if (vars.personajes[idUser].cerrado) {
            delete vars.personajes[idUser];
        }
    }
}, 60000);

//TaskManager 60 ticks por segundo

setInterval(function() {
    game.worldSave(function(data) {
        console.log("[INFO | " + funct.dateFormat(new Date(), "%d-%m-%Y %H:%M:%S") + "] WorldSave");
    });
}, 300000);