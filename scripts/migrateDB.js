const mongoose = require("mongoose");
const _ = require("lodash");

const urlMongo = "mongodb://localhost:27017/aoweb";

mongoose.connect(urlMongo, { useNewUrlParser: true, useFindAndModify: false });

const Characters = require("./models/characters");
const Accounts = require("./models/accounts");

const database = require("./database");
const Database = new database();

const vars = require("../vars");

(async () => {
    await Database.initialize();

    const [users] = await vars.database.execute("SELECT * FROM accounts");

    users.map(async user => {
        const account = new Accounts();

        account.name = user.nameAccount;
        account.nameSanitized = user.nameAccount.toLowerCase();
        account.password = user.password;
        account.email = user.email;
        account.createdAt = user.created_at;
        account.updatedAt = user.updated_at;

        const accountSave = await account.save();

        const [characters] = await vars.database.execute(
            "SELECT * FROM characters WHERE idAccount = ?",
            [user.idAccount]
        );

        characters.map(async character => {
            const [items] = await vars.database.execute(
                "SELECT * FROM inventary WHERE idCharacter = ?",
                [character.idCharacter]
            );

            const [spells] = await vars.database.execute(
                "SELECT * FROM spells WHERE idCharacter = ?",
                [character.idCharacter]
            );

            let newCharacter = new Characters();

            newCharacter = Object.assign(newCharacter, character);
            newCharacter.name = newCharacter.nameCharacter;
            newCharacter.idAccount = accountSave._id;
            newCharacter.createdAt = newCharacter.created_at;
            newCharacter.updatedAt = newCharacter.updated_at;
            newCharacter.items = items;
            newCharacter.spells = spells;
            newCharacter.save();
        });
    });

    console.log("done");
})();
