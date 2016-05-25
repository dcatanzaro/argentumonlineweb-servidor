var vars = require('./vars');
var database = require('./database');

var query = 'SELECT * FROM characters';

database.query(query, function(err, rows, fields) {
	for (var index in rows) {
		var user = rows[index];

		var maxHp = user.attrConstitucion;

		for (var i = 1; i < user.level; i++) {
			maxHp += vars.modVida[user.attrConstitucion][user.idClase];
		}

		console.log("Nombre: " + user.nameCharacter + " | Vida Anterior: " + user.maxHp + " | Vida Final: " + maxHp);

		var hp = maxHp;

		if (user.dead) {
			hp = 0;
		}

		database.query('UPDATE characters SET hp="' + hp + '", maxHp="' + maxHp + '" WHERE idCharacter="' + user.idCharacter + '"', function(err, result) {
			if (err) {
				console.log(err);
			}

			console.log('changed ' + result.changedRows + ' rows');
		});
	}
});