const fs = require("fs");
const vars = require("./vars");
const jsonObjs = require("./jsons/objs.json");

class LoadObjs {
    constructor() {}

    async initialize() {
        await this.load();

        console.log("Objs Cargados.");
    }

    load() {
        return new Promise((resolve, reject) => {
            vars.datObj = jsonObjs;

            resolve(true);
        });
    }

    createJson() {
        return new Promise((resolve, reject) => {
            let objIndex = 0;

            fs.readFile("obj.dat", "UTF-8", function read(err, data) {
                var responseArr = data.split("\n");

                vars.datObj = {};

                for (var line in responseArr) {
                    var response = responseArr[line];

                    var responseSplit = response.split("[OBJ");
                    let npcNum = responseSplit[1];

                    if (npcNum) {
                        objIndex = npcNum.trim().split("]")[0];
                        vars.datObj[objIndex] = {
                            name: "",
                            objType: 0,
                            tipoPocion: 0,
                            minModificador: 0,
                            maxModificador: 0,
                            grhIndex: 0,
                            anim: 0,
                            agarrable: 0,
                            valor: 0,
                            minHit: 0,
                            maxHit: 0,
                            minDef: 0,
                            maxDef: 0,
                            newbie: 0,
                            proyectil: 0,
                            noSeCae: 0,
                            clasesPermitidas: [],
                            indexAbierta: 0,
                            indexCerrada: 0,
                            llave: 0,
                            cerrada: 0,
                            spellIndex: 0,
                            razaEnana: 0,
                            apu: 0,
                            staffDamageBonus: 0,
                            minDefMag: 0,
                            maxDefMag: 0
                        };
                    }

                    responseSplit = response.split("Name=");
                    var name = responseSplit[1];

                    if (name) {
                        vars.datObj[objIndex].name = name.trim();
                    }

                    responseSplit = response.split("ObjType=");
                    var objType = responseSplit[1];

                    if (objType) {
                        vars.datObj[objIndex].objType = parseInt(
                            objType.trim()
                        );
                    }

                    responseSplit = response.split("TipoPocion=");
                    var tipoPocion = responseSplit[1];

                    if (tipoPocion) {
                        vars.datObj[objIndex].tipoPocion = parseInt(
                            tipoPocion.trim()
                        );
                    }

                    responseSplit = response.split("MinModificador=");
                    var minModificador = responseSplit[1];

                    if (minModificador) {
                        vars.datObj[objIndex].minModificador = parseInt(
                            minModificador.trim()
                        );
                    }

                    responseSplit = response.split("MaxModificador=");
                    var maxModificador = responseSplit[1];

                    if (maxModificador) {
                        vars.datObj[objIndex].maxModificador = parseInt(
                            maxModificador.trim()
                        );
                    }

                    responseSplit = response.split("Proyectil=");
                    var proyectil = responseSplit[1];

                    if (proyectil) {
                        vars.datObj[objIndex].proyectil = parseInt(
                            proyectil.trim()
                        );
                    }

                    responseSplit = response.split("GrhIndex=");
                    var grhIndex = responseSplit[1];

                    if (grhIndex) {
                        vars.datObj[objIndex].grhIndex = parseInt(
                            grhIndex.trim()
                        );
                    }

                    responseSplit = response.split("Anim=");
                    var anim = responseSplit[1];

                    if (anim) {
                        vars.datObj[objIndex].anim = parseInt(anim.trim());
                    }

                    responseSplit = response.split("NumRopaje=");
                    var numRopaje = responseSplit[1];

                    if (numRopaje) {
                        vars.datObj[objIndex].anim = parseInt(numRopaje.trim());
                    }

                    responseSplit = response.split("Valor=");
                    var valor = responseSplit[1];

                    if (valor) {
                        vars.datObj[objIndex].valor = parseInt(valor.trim());
                    }

                    responseSplit = response.split("Agarrable=");
                    var agarrable = responseSplit[1];

                    if (agarrable) {
                        vars.datObj[objIndex].agarrable = parseInt(
                            agarrable.trim()
                        );
                    }

                    responseSplit = response.split("MinHit=");
                    var minHit = responseSplit[1];

                    if (minHit) {
                        vars.datObj[objIndex].minHit = parseInt(minHit.trim());
                    }

                    responseSplit = response.split("MaxHit=");
                    var maxHit = responseSplit[1];

                    if (maxHit) {
                        vars.datObj[objIndex].maxHit = parseInt(maxHit.trim());
                    }

                    responseSplit = response.split("MinDef=");
                    var minDef = responseSplit[1];

                    if (minDef) {
                        vars.datObj[objIndex].minDef = parseInt(minDef.trim());
                    }

                    responseSplit = response.split("MaxDef=");
                    var maxDef = responseSplit[1];

                    if (maxDef) {
                        vars.datObj[objIndex].maxDef = parseInt(maxDef.trim());
                    }

                    responseSplit = response.split("Newbie=");
                    var newbie = responseSplit[1];

                    if (newbie) {
                        vars.datObj[objIndex].newbie = parseInt(newbie.trim());
                    }

                    responseSplit = response.split("NoSeCae=");
                    var noSeCae = responseSplit[1];

                    if (noSeCae) {
                        vars.datObj[objIndex].noSeCae = parseInt(
                            noSeCae.trim()
                        );
                    }

                    responseSplit = response.split("TieneLlave=");
                    var llave = responseSplit[1];

                    if (llave) {
                        vars.datObj[objIndex].llave = parseInt(llave.trim());
                    }

                    responseSplit = response.split("PuertaAbierta=");
                    var cerrada = responseSplit[1];

                    if (cerrada) {
                        vars.datObj[objIndex].cerrada = parseInt(
                            cerrada.trim()
                        );
                    }

                    responseSplit = response.split("IndexCerrada=");
                    var indexCerrada = responseSplit[1];

                    if (indexCerrada) {
                        vars.datObj[objIndex].indexCerrada = parseInt(
                            indexCerrada.trim()
                        );
                    }

                    responseSplit = response.split("IndexAbierta=");
                    var indexAbierta = responseSplit[1];

                    if (indexAbierta) {
                        vars.datObj[objIndex].indexAbierta = parseInt(
                            indexAbierta.trim()
                        );
                    }

                    responseSplit = response.split("HechizoIndex=");
                    var spellIndex = responseSplit[1];

                    if (spellIndex) {
                        vars.datObj[objIndex].spellIndex = parseInt(
                            spellIndex.trim()
                        );
                    }

                    responseSplit = response.split("RazaEnana=");
                    var razaEnana = responseSplit[1];

                    if (razaEnana) {
                        vars.datObj[objIndex].razaEnana = parseInt(
                            razaEnana.trim()
                        );
                    }

                    responseSplit = response.split("StaffDamageBonus=");
                    var staffDamageBonus = responseSplit[1];

                    if (staffDamageBonus) {
                        vars.datObj[objIndex].staffDamageBonus = parseInt(
                            staffDamageBonus.trim()
                        );
                    }

                    responseSplit = response.split("DefensaMagicaMin=");
                    var minDefMag = responseSplit[1];

                    if (minDefMag) {
                        vars.datObj[objIndex].minDefMag = parseInt(
                            minDefMag.trim()
                        );
                    }

                    responseSplit = response.split("DefensaMagicaMax=");
                    var maxDefMag = responseSplit[1];

                    if (maxDefMag) {
                        vars.datObj[objIndex].maxDefMag = parseInt(
                            maxDefMag.trim()
                        );
                    }

                    responseSplit = response.split("Apuñala=");
                    var apu = responseSplit[1];

                    if (apu) {
                        vars.datObj[objIndex].apu = parseInt(apu.trim());
                    }

                    for (var i = 1; i <= 11; i++) {
                        responseSplit = response.split("CP" + i + "=");
                        var CP = responseSplit[1];

                        if (CP) {
                            var clase = CP.trim().toLowerCase();

                            if (clase != "bandido") {
                                vars.datObj[objIndex].clasesPermitidas.push(
                                    vars.clases[CP.trim().toLowerCase()]
                                );
                            }
                        }
                    }
                }

                fs.writeFile(
                    "./asd/objs.json",
                    JSON.stringify(vars.datObj),
                    "utf8",
                    () => {}
                );

                resolve(true);
            });
        });
    }
}

module.exports = LoadObjs;
