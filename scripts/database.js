const NODE_ENV = process.env.NODE_ENV;
const vars = require("../vars");
const mysql = require("mysql2/promise");

class Database {
    constructor() {}

    async initialize() {
        await this.load();

        console.log("Database Cargada.");
    }

    async load() {
        let options = {};

        if (NODE_ENV === "development") {
            options = {
                host: "localhost",
                user: "root",
                password: "",
                database: "aoweb",
                connectTimeout: 30000
            };
        } else {
            options = {
                host: "",
                user: "",
                password: "",
                database: "",
                connectTimeout: 30000
            };
        }

        const database = await mysql.createConnection(options);

        vars.database = database;
    }
}

module.exports = Database;
