const NODE_ENV = process.env.NODE_ENV;
const vars = require("./vars");
const fs = require("fs");
const loadNpcs = require("./loadNpcs");

class LoadMaps {
    constructor() {}

    async initialize() {
        let arMapsToLoad = [];

        if (NODE_ENV === "development") {
            arMapsToLoad.push(this.readMap(272));
        } else {
            for (let i = 1; i < 291; i++) {
                arMapsToLoad.push(this.readMap(i));
            }
        }

        await Promise.all(arMapsToLoad);

        console.log("Mapas Cargados.");

        const LoadNpcs = new loadNpcs();
        await LoadNpcs.initialize();
    }

    readMap(mapNum) {
        return new Promise((resolve, reject) => {
            const tmpMap = require(`./mapas/mapa_${mapNum}.json`);
            const tmpDataMap = require(`./mapas/dats/mapa_${mapNum}.json`);

            vars.mapa[mapNum] = {};
            vars.mapa[mapNum] = tmpMap[mapNum];

            vars.mapData[mapNum] = [];

            for (var y = 1; y <= 100; y++) {
                vars.mapData[mapNum][y] = [];

                for (var x = 1; x <= 100; x++) {
                    vars.mapData[mapNum][y][x] = {
                        id: 0
                    };
                }
            }

            vars.mapData[mapNum].name = tmpDataMap.name || "";
            vars.mapData[mapNum].musicNum = tmpDataMap.musicNum || 0;
            vars.mapData[mapNum].magiaSinEfecto =
                tmpDataMap.magiaSinEfecto || 0;
            vars.mapData[mapNum].noEncriptarMp = tmpDataMap.noEncriptarMp || 0;
            vars.mapData[mapNum].terreno = tmpDataMap.terreno || "";
            vars.mapData[mapNum].zona = tmpDataMap.zona || "";
            vars.mapData[mapNum].restringir = tmpDataMap.restringir || 0;
            vars.mapData[mapNum].backup = tmpDataMap.backup || 0;
            vars.mapData[mapNum].pk = tmpDataMap.pk || 0;

            resolve(mapNum);
        });
    }

    createJsonsDatMap() {
        fs.readFile("Maps/Mapa" + mapNum + ".dat", "UTF-8", function read(
            err,
            data
        ) {
            const responseArr = data.split("\n");
            let dataMap = {};

            for (var line in responseArr) {
                var response = responseArr[line];

                var responseSplit = response.split("Name=");
                var name = responseSplit[1];

                if (name) {
                    vars.mapData[mapNum].name = name.trim();
                    dataMap.name = vars.mapData[mapNum].name;
                }

                responseSplit = response.split("MusicNum=");
                var musicNum = responseSplit[1];

                if (musicNum) {
                    vars.mapData[mapNum].musicNum = parseInt(musicNum.trim());

                    dataMap.musicNum = vars.mapData[mapNum].musicNum;
                }

                responseSplit = response.split("MagiaSinefecto=");
                var magiaSinEfecto = responseSplit[1];

                if (magiaSinEfecto) {
                    vars.mapData[mapNum].magiaSinEfecto = parseInt(
                        magiaSinEfecto.trim()
                    );

                    dataMap.magiaSinEfecto =
                        vars.mapData[mapNum].magiaSinEfecto;
                }

                responseSplit = response.split("NoEncriptarMP=");
                var noEncriptarMp = responseSplit[1];

                if (noEncriptarMp) {
                    vars.mapData[mapNum].noEncriptarMp = parseInt(
                        noEncriptarMp.trim()
                    );

                    dataMap.noEncriptarMp = vars.mapData[mapNum].noEncriptarMp;
                }

                responseSplit = response.split("Terreno=");
                var terreno = responseSplit[1];

                if (terreno) {
                    vars.mapData[mapNum].terreno = terreno.trim();

                    dataMap.terreno = vars.mapData[mapNum].terreno;
                }

                responseSplit = response.split("Zona=");
                var zona = responseSplit[1];

                if (zona) {
                    vars.mapData[mapNum].zona = zona.trim();

                    dataMap.zona = vars.mapData[mapNum].zona;
                }

                responseSplit = response.split("Restringir=");
                var restringir = responseSplit[1];

                if (restringir) {
                    vars.mapData[mapNum].restringir = restringir.trim();

                    dataMap.restringir = vars.mapData[mapNum].restringir;
                }

                responseSplit = response.split("BackUp=");
                var backup = responseSplit[1];

                if (backup) {
                    vars.mapData[mapNum].backup = parseInt(backup.trim());

                    dataMap.backup = vars.mapData[mapNum].backup;
                }

                responseSplit = response.split("Pk=");
                var pk = responseSplit[1];

                if (pk) {
                    vars.mapData[mapNum].pk = parseInt(pk.trim());

                    dataMap.pk = vars.mapData[mapNum].pk;
                }
            }

            fs.writeFile(
                `./mapas/dats/mapa_${mapNum}.json`,
                JSON.stringify(dataMap),
                "utf8",
                () => {}
            );
        });
    }
}

module.exports = LoadMaps;
