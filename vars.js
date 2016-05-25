var vars = new Vars();

function Vars() {
    this.mapData = {};
    this.mapa = {};
    this.infoMapData = {};
    this.personajes = {};
    this.npcs = {};
    this.datNpc = {};
    this.datObj = {};
    this.datSpell = {};
    this.clients = {};
    this.textMaxLength = 140;
    this.maxUsersOnline = 0;
    this.usuariosOnline = 0;

    this.dobleExp = false;
    this.dobleGold = false;

    this.versions = {
        config: 103,
        messages: 108,
        connection: 108,
        console: 103,
        engine: 109,
        package: 102
    };

    this.cooldownParalisisNpc = 50000;

    this.cooldownFA = 45000;

    this.direcciones = {
        up: 1,
        down: 2,
        right: 3,
        left: 4
    };

    this.meditacion = {
        'chica': 4,
        'mediana': 5,
        'grande': 6,
        'xgrande': 16,
        'xxgrande': 34
    };

    this.multiplicadorExp = 5;
    this.multiplicadorGold = 3;

    this.cooldownAtaqueNpc = 2000;

    this.arTasks = [];
    this.arTasks.dialogs = [];
    this.arTasks.moveUser = [];

    this.functNpc = {
        actPos: 1,
        telep: 2
    };

    this.clases = {
        'mago': 1,
        'clerigo': 2,
        'guerrero': 3,
        'asesino': 4,
        'ladron': 5,
        'bardo': 6,
        'druida': 7,
        'paladin': 8,
        'cazador': 9,
        'trabajador': 10,
        'pirata': 11
    };

    this.nameClases = [];
    this.nameClases[this.clases.mago] = 'Mago';
    this.nameClases[this.clases.clerigo] = 'Clérigo';
    this.nameClases[this.clases.guerrero] = 'Guerrero';
    this.nameClases[this.clases.asesino] = 'Asesino';
    this.nameClases[this.clases.ladron] = 'Ladrón';
    this.nameClases[this.clases.bardo] = 'Bardo';
    this.nameClases[this.clases.druida] = 'Druida';
    this.nameClases[this.clases.paladin] = 'Paladín';
    this.nameClases[this.clases.cazador] = 'Cazador';
    this.nameClases[this.clases.trabajador] = 'Trabajador';
    this.nameClases[this.clases.pirata] = 'Pirata';

    this.genero = {
        'hombre': 1,
        'mujer': 2
    };

    this.razas = {
        'humano': 1,
        'elfo': 2,
        'elfoDrow': 3,
        'enano': 4,
        'gnomo': 5
    };

    this.nameRazas = [];
    this.nameRazas[this.razas.humano] = 'Humano';
    this.nameRazas[this.razas.elfo] = 'Elfo';
    this.nameRazas[this.razas.elfoDrow] = 'Elfo Drow';
    this.nameRazas[this.razas.enano] = 'Enano';
    this.nameRazas[this.razas.gnomo] = 'Gnomo';

    this.npcType = {
        'comun': 0,
        'sacerdote': 1,
        'guardia': 2,
        'entrenador': 3,
        'banquero': 4,
        'noble': 5,
        'dragon': 6,
        'timbero': 7,
        'guardiaCaos': 8,
        'sacerdoteNewbie': 9,
        'comerciante': 10
    };

    this.typePociones = {
        'agilidad': 1,
        'fuerza': 2,
        'vida': 3,
        'mana': 4,
        'curaVeneno': 5
    };

    this.maxAttr = 40;

    this.objType = {
        'comida': 1,
        'armas': 2,
        'armaduras': 3,
        'arboles': 4,
        'dinero': 5,
        'puerta': 6,
        'objetoContenedor': 7,
        'carteles': 8,
        'llaves': 9,
        'foros': 10,
        'pociones': 11,
        'libros': 12,
        'bebidas': 13,
        'lenia': 14,
        'fogata': 15,
        'escudos': 16,
        'cascos': 17,
        'anillos': 18,
        'teleport': 19,
        'muebles': 20,
        'joyas': 21,
        'yacimientos': 22,
        'metales': 23,
        'pergaminos': 24,
        'aura': 25,
        'instrumentosMusicales': 26,
        'yunque': 27,
        'fraguas': 28,
        'gemas': 29,
        'flores': 30,
        'barcos': 31,
        'flechas': 32,
        'botellasVacias': 33,
        'botellasLlenas': 34,
        'manchas': 35
    };

    this.partesCuerpo = {
        'cabeza': 1,
        'piernaIzquierda': 2,
        'piernaDerecha': 3,
        'brazoDerecho': 4,
        'brazoIzquierdo': 5,
        'torso': 6
    };

    this.clanNpc = [];
    this.clanNpc[this.npcType.sacerdote] = "<Sacerdote>";
    this.clanNpc[this.npcType.guardia] = "<Guardia>";
    this.clanNpc[this.npcType.entrenador] = "<Entrenador>";
    this.clanNpc[this.npcType.banquero] = "<Banquero>";
    this.clanNpc[this.npcType.guardiaCaos] = "<Guardia Del Caos>";
    this.clanNpc[this.npcType.comerciante] = "<Comerciante>";

    this.modVida = {
        18: [],
        19: [],
        20: [],
        21: []
    };

    this.modVida[18][this.clases.guerrero] = 8;
    this.modVida[18][this.clases.paladin] = 8;
    this.modVida[18][this.clases.cazador] = 8;
    this.modVida[18][this.clases.asesino] = 7;
    this.modVida[18][this.clases.clerigo] = 7;
    this.modVida[18][this.clases.bardo] = 7;
    this.modVida[18][this.clases.druida] = 7;
    this.modVida[18][this.clases.mago] = 6;

    this.modVida[19][this.clases.guerrero] = 8;
    this.modVida[19][this.clases.paladin] = 8;
    this.modVida[19][this.clases.cazador] = 8;
    this.modVida[19][this.clases.asesino] = 7;
    this.modVida[19][this.clases.clerigo] = 7;
    this.modVida[19][this.clases.bardo] = 7;
    this.modVida[19][this.clases.druida] = 7;
    this.modVida[19][this.clases.mago] = 6;

    this.modVida[20][this.clases.guerrero] = 9;
    this.modVida[20][this.clases.paladin] = 9;
    this.modVida[20][this.clases.cazador] = 9;
    this.modVida[20][this.clases.asesino] = 8;
    this.modVida[20][this.clases.clerigo] = 8;
    this.modVida[20][this.clases.bardo] = 8;
    this.modVida[20][this.clases.druida] = 8;
    this.modVida[20][this.clases.mago] = 7;

    this.modVida[21][this.clases.guerrero] = 9;
    this.modVida[21][this.clases.paladin] = 9;
    this.modVida[21][this.clases.cazador] = 9;
    this.modVida[21][this.clases.asesino] = 8;
    this.modVida[21][this.clases.clerigo] = 8;
    this.modVida[21][this.clases.bardo] = 8;
    this.modVida[21][this.clases.druida] = 8;
    this.modVida[21][this.clases.mago] = 7;

    this.modEscudo = [];
    this.modEscudo[this.clases.mago] = 0.6;
    this.modEscudo[this.clases.clerigo] = 0.85;
    this.modEscudo[this.clases.guerrero] = 1;
    this.modEscudo[this.clases.asesino] = 0.8;
    this.modEscudo[this.clases.ladron] = 0.7;
    this.modEscudo[this.clases.bardo] = 0.8;
    this.modEscudo[this.clases.druida] = 0.75;
    this.modEscudo[this.clases.paladin] = 1;
    this.modEscudo[this.clases.cazador] = 0.8;
    this.modEscudo[this.clases.trabajador] = 0.7;
    this.modEscudo[this.clases.pirata] = 0.6;

    this.modDmgWrestling = [];
    this.modDmgWrestling[this.clases.mago] = 0.4;
    this.modDmgWrestling[this.clases.clerigo] = 0.4;
    this.modDmgWrestling[this.clases.guerrero] = 0.4;
    this.modDmgWrestling[this.clases.asesino] = 0.4;
    this.modDmgWrestling[this.clases.ladron] = 1.05;
    this.modDmgWrestling[this.clases.bardo] = 0.4;
    this.modDmgWrestling[this.clases.druida] = 0.4;
    this.modDmgWrestling[this.clases.paladin] = 0.4;
    this.modDmgWrestling[this.clases.cazador] = 0.4;
    this.modDmgWrestling[this.clases.trabajador] = 0.4;
    this.modDmgWrestling[this.clases.pirata] = 0.4;

    this.modDmgProyectiles = [];
    this.modDmgProyectiles[this.clases.mago] = 0.5;
    this.modDmgProyectiles[this.clases.clerigo] = 0.7;
    this.modDmgProyectiles[this.clases.guerrero] = 0.9;
    this.modDmgProyectiles[this.clases.asesino] = 0.8;
    this.modDmgProyectiles[this.clases.ladron] = 0.85;
    this.modDmgProyectiles[this.clases.bardo] = 0.7;
    this.modDmgProyectiles[this.clases.druida] = 0.75;
    this.modDmgProyectiles[this.clases.paladin] = 0.8;
    this.modDmgProyectiles[this.clases.cazador] = 1.1;
    this.modDmgProyectiles[this.clases.trabajador] = 0.7;
    this.modDmgProyectiles[this.clases.pirata] = 0.8;

    this.modDmgArmas = [];
    this.modDmgArmas[this.clases.mago] = 0.5;
    this.modDmgArmas[this.clases.clerigo] = 0.8;
    this.modDmgArmas[this.clases.guerrero] = 1.1;
    this.modDmgArmas[this.clases.asesino] = 0.9;
    this.modDmgArmas[this.clases.ladron] = 0.75;
    this.modDmgArmas[this.clases.bardo] = 0.75;
    this.modDmgArmas[this.clases.druida] = 0.7;
    this.modDmgArmas[this.clases.paladin] = 0.925;
    this.modDmgArmas[this.clases.cazador] = 0.9;
    this.modDmgArmas[this.clases.trabajador] = 0.8;
    this.modDmgArmas[this.clases.pirata] = 0.95;

    this.modAtaqueWrestling = [];
    this.modAtaqueWrestling[this.clases.mago] = 0.3;
    this.modAtaqueWrestling[this.clases.clerigo] = 0.4;
    this.modAtaqueWrestling[this.clases.guerrero] = 0.6;
    this.modAtaqueWrestling[this.clases.asesino] = 0.4;
    this.modAtaqueWrestling[this.clases.ladron] = 0.8;
    this.modAtaqueWrestling[this.clases.bardo] = 0.4;
    this.modAtaqueWrestling[this.clases.druida] = 0.4;
    this.modAtaqueWrestling[this.clases.paladin] = 0.4;
    this.modAtaqueWrestling[this.clases.cazador] = 0.5;
    this.modAtaqueWrestling[this.clases.trabajador] = 0.5;
    this.modAtaqueWrestling[this.clases.pirata] = 0.5;

    this.modAtaqueProyectiles = [];
    this.modAtaqueProyectiles[this.clases.mago] = 0.5;
    this.modAtaqueProyectiles[this.clases.clerigo] = 0.7;
    this.modAtaqueProyectiles[this.clases.guerrero] = 0.8;
    this.modAtaqueProyectiles[this.clases.asesino] = 0.75;
    this.modAtaqueProyectiles[this.clases.ladron] = 0.85;
    this.modAtaqueProyectiles[this.clases.bardo] = 0.7;
    this.modAtaqueProyectiles[this.clases.druida] = 0.75;
    this.modAtaqueProyectiles[this.clases.paladin] = 0.75;
    this.modAtaqueProyectiles[this.clases.cazador] = 1;
    this.modAtaqueProyectiles[this.clases.trabajador] = 0.7;
    this.modAtaqueProyectiles[this.clases.pirata] = 0.9;

    this.modAtaqueArmas = [];
    this.modAtaqueArmas[this.clases.mago] = 0.5;
    this.modAtaqueArmas[this.clases.clerigo] = 0.85;
    this.modAtaqueArmas[this.clases.guerrero] = 1;
    this.modAtaqueArmas[this.clases.asesino] = 0.9;
    this.modAtaqueArmas[this.clases.ladron] = 0.8;
    this.modAtaqueArmas[this.clases.bardo] = 0.7;
    this.modAtaqueArmas[this.clases.druida] = 0.65;
    this.modAtaqueArmas[this.clases.paladin] = 0.95;
    this.modAtaqueArmas[this.clases.cazador] = 0.8;
    this.modAtaqueArmas[this.clases.trabajador] = 0.8;
    this.modAtaqueArmas[this.clases.pirata] = 0.9;

    this.modEvasion = [];
    this.modEvasion[this.clases.mago] = 0.4;
    this.modEvasion[this.clases.clerigo] = 0.8;
    this.modEvasion[this.clases.guerrero] = 1;
    this.modEvasion[this.clases.asesino] = 1.1;
    this.modEvasion[this.clases.ladron] = 1.1;
    this.modEvasion[this.clases.bardo] = 1.075;
    this.modEvasion[this.clases.druida] = 0.75;
    this.modEvasion[this.clases.paladin] = 0.9;
    this.modEvasion[this.clases.cazador] = 0.9;
    this.modEvasion[this.clases.trabajador] = 0.8;
    this.modEvasion[this.clases.pirata] = 1.25;

    this.items = {};

    this.areaPjs = {};

    this.areaNpc = {};

    this.descClient = [
        "Bievenido a Argentum Online Web - Beta",
        "Para usar los macros, da click derecho sobre alguno de ellos."
    ];
    this.db = {};

    this.lastActRanking = "";

    this.crearRanking = false;

    this.exp = 50;
    this.gold = 10;

    //8 segundos dura el inmo
    this.timeInmo = 8000;

    this.toSave = ['idHead', 'minHit', 'maxHit', 'idLastHead', 'idLastBody', 'idLastWeapon', 'idLastShield', 'idLastHelmet', 'navegando', 'idHelmet', 'idWeapon', 'idBody', 'idShield', 'spellsAcertados', 'spellsErrados', 'countDie', 'exp', 'expNextLevel', 'level', 'hp', 'mana', 'maxHp', 'maxMana', 'posX', 'posY', 'map', 'dead', 'gold', 'criminal', 'npcMatados', 'ciudadanosMatados', 'criminalesMatados', 'fianza'];
}

module.exports = vars;