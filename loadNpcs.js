const fs = require("fs");
const vars = require("./vars");
const npcs = require("./npcs");
const login = require("./login");
const jsonNpcs = require("./jsons/npcs.json");
const npcsInMap = require("./jsons/npcsInMap.json");

const _ = require("lodash");

class LoadNpcs {
    constructor() {}

    async initialize() {
        await this.load();

        console.log("NPCS Cargados.");
    }

    load() {
        return new Promise((resolve, reject) => {
            vars.datNpc = jsonNpcs;

            npcsInMap.map(npc => {
                this.createNpcInMap(npc);
            });

            resolve(true);
        });
    }

    createNpcInMap(npc) {
        const { x, y, mapNum, npcIndex } = npc;

        if (!vars.mapData[mapNum]) return;

        let tmpNPC = _.cloneDeep(npcs.createNpc());

        tmpNPC.id = login.createId();
        tmpNPC.map = mapNum;

        const datNpc = vars.datNpc[npcIndex];

        tmpNPC.pos.x = parseInt(x);
        tmpNPC.pos.y = parseInt(y);
        tmpNPC.nameCharacter = datNpc.name;
        tmpNPC.color = "white";
        tmpNPC.isNpc = true;
        tmpNPC.idBody = datNpc.idBody;
        tmpNPC.idHead = datNpc.idHead;
        tmpNPC.movement = datNpc.movement;
        tmpNPC.npcType = parseInt(datNpc.npcType);
        tmpNPC.exp = datNpc.exp;
        if (datNpc.gold) tmpNPC.gold = datNpc.gold;
        tmpNPC.hp = datNpc.hp;
        tmpNPC.maxHp = datNpc.maxHp;
        tmpNPC.minHit = datNpc.minHit;
        tmpNPC.maxHit = datNpc.maxHit;
        tmpNPC.def = datNpc.def;
        tmpNPC.poderAtaque = datNpc.poderAtaque;
        tmpNPC.poderEvasion = datNpc.poderEvasion;
        if (datNpc.drop) tmpNPC.drop = datNpc.drop;
        if (datNpc.objs) tmpNPC.objs = datNpc.objs;
        tmpNPC.aguaValida = datNpc.aguaValida;
        if (datNpc.desc) tmpNPC.desc = datNpc.desc;

        const clan = vars.clanNpc[tmpNPC.npcType];

        if (clan) {
            tmpNPC.clan = clan;
        }

        vars.npcs[tmpNPC.id] = tmpNPC;
        vars.npcs[tmpNPC.id].cooldownAtaque = +Date.now() + 4000;

        if (tmpNPC.movement == 3) {
            vars.areaNpc[tmpNPC.id] = [];
        }

        vars.mapData[mapNum][y][x].id = tmpNPC.id;
    }

    createJsonNpcsInMap() {
        return new Promise((resolve, reject) => {
            for (let mapNum = 1; mapNum < 291; mapNum++) {
                for (let mapaY = 1; mapaY <= 100; mapaY++) {
                    for (let mapaX = 1; mapaX <= 100; mapaX++) {
                        if (!vars.mapa[mapNum]) break;

                        const npcIndex =
                            vars.mapa[mapNum][mapaY][mapaX].npcIndex;

                        if (npcIndex) {
                            arNpcInMap.push({
                                mapNum: mapNum,
                                y: mapaY,
                                x: mapaX,
                                npcIndex: npcIndex
                            });
                        }
                    }
                }
            }

            fs.writeFile(
                "./jsons/npcsInMap.json",
                JSON.stringify(arNpcInMap),
                "utf8",
                () => {}
            );

            resolve(true);
        });
    }

    createJson() {
        return new Promise((resolve, reject) => {
            let npcIndex = 0;

            fs.readFile("npcs.dat", "UTF-8", function read(err, data) {
                var responseArr = data.split("\n");

                var nroItems = 0;

                for (var line in responseArr) {
                    var response = responseArr[line];

                    var responseSplit = response.split("[NPC");
                    var npcNum = responseSplit[1];

                    if (npcNum) {
                        npcIndex = npcNum.trim().split("]")[0];
                        vars.datNpc[npcIndex] = {};
                    }

                    responseSplit = response.split("Name=");
                    var name = responseSplit[1];

                    if (name) {
                        vars.datNpc[npcIndex].name = name.trim();
                    }

                    responseSplit = response.split("Head=");
                    var head = responseSplit[1];

                    if (head) {
                        vars.datNpc[npcIndex].idHead = parseInt(head.trim());
                    }

                    responseSplit = response.split("Body=");
                    var body = responseSplit[1];

                    if (body) {
                        vars.datNpc[npcIndex].idBody = parseInt(body.trim());
                    }

                    responseSplit = response.split("Movement=");
                    var movement = responseSplit[1];

                    if (movement) {
                        vars.datNpc[npcIndex].movement = parseInt(
                            movement.trim()
                        );
                    }

                    responseSplit = response.split("NpcType=");
                    var npcType = responseSplit[1];

                    if (npcType) {
                        vars.datNpc[npcIndex].npcType = parseInt(
                            npcType.trim()
                        );
                    }

                    responseSplit = response.split("GiveEXP=");
                    var exp = responseSplit[1];

                    if (exp) {
                        vars.datNpc[npcIndex].exp = parseInt(exp.trim());
                    }

                    responseSplit = response.split("GiveGLD=");
                    var gold = responseSplit[1];

                    if (gold) {
                        vars.datNpc[npcIndex].gold = parseInt(gold.trim());
                    }

                    responseSplit = response.split("MinHP=");
                    var hp = responseSplit[1];

                    if (hp) {
                        vars.datNpc[npcIndex].hp = parseInt(hp.trim());
                    }

                    responseSplit = response.split("MaxHP=");
                    var maxHp = responseSplit[1];

                    if (maxHp) {
                        vars.datNpc[npcIndex].maxHp = parseInt(maxHp.trim());
                    }

                    responseSplit = response.split("MinHIT=");
                    var minHit = responseSplit[1];

                    if (minHit) {
                        vars.datNpc[npcIndex].minHit = parseInt(minHit.trim());
                    }

                    responseSplit = response.split("MaxHIT=");
                    var maxHit = responseSplit[1];

                    if (maxHit) {
                        vars.datNpc[npcIndex].maxHit = parseInt(maxHit.trim());
                    }

                    responseSplit = response.split("DEF=");
                    var def = responseSplit[1];

                    if (def) {
                        vars.datNpc[npcIndex].def = parseInt(def.trim());
                    }

                    responseSplit = response.split("PoderAtaque=");
                    var poderAtaque = responseSplit[1];

                    if (poderAtaque) {
                        vars.datNpc[npcIndex].poderAtaque = parseInt(
                            poderAtaque.trim()
                        );
                    }

                    responseSplit = response.split("PoderEvasion=");
                    var poderEvasion = responseSplit[1];

                    if (poderEvasion) {
                        vars.datNpc[npcIndex].poderEvasion = parseInt(
                            poderEvasion.trim()
                        );
                    }

                    responseSplit = response.split("Comercia=");
                    var comercia = responseSplit[1];

                    if (comercia && parseInt(comercia) === 1) {
                        vars.datNpc[npcIndex].npcType = 10; //Comerciante
                    }

                    responseSplit = response.split("AguaValida=");
                    var aguaValida = responseSplit[1];

                    if (aguaValida) {
                        vars.datNpc[npcIndex].aguaValida = parseInt(
                            aguaValida.trim()
                        );
                    }

                    responseSplit = response.split("Desc=");
                    var desc = responseSplit[1];

                    if (desc) {
                        vars.datNpc[npcIndex].desc = desc.trim();
                    }

                    responseSplit = response.split("NROITEMS=");
                    var tmpNroItems = responseSplit[1];

                    if (tmpNroItems) {
                        nroItems = parseInt(tmpNroItems);
                    }

                    if (nroItems > 0) {
                        var infoItem = "";

                        for (var i = 1; i <= nroItems; i++) {
                            responseSplit = response.split("Drop" + i + "=");
                            var item = responseSplit[1];

                            if (item) {
                                infoItem = item.split("-");

                                if (!vars.datNpc[npcIndex].drop) {
                                    vars.datNpc[npcIndex].drop = [];
                                }

                                vars.datNpc[npcIndex].drop.push({
                                    item: parseInt(infoItem[0]),
                                    cant: parseInt(infoItem[1])
                                });
                            }

                            responseSplit = response.split("Obj" + i + "=");
                            item = responseSplit[1];

                            if (typeof item !== "undefined") {
                                infoItem = item.split("-");

                                if (!vars.datNpc[npcIndex].objs) {
                                    vars.datNpc[npcIndex].objs = [];
                                }

                                vars.datNpc[npcIndex].objs.push({
                                    item: parseInt(infoItem[0]),
                                    cant: parseInt(infoItem[1])
                                });
                            }
                        }
                    }
                }

                fs.writeFile(
                    "./jsons/npcs.json",
                    JSON.stringify(vars.datNpc),
                    "utf8",
                    () => {}
                );

                resolve(true);
            });
        });
    }
}

module.exports = LoadNpcs;
