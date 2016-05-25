# Argentum Online Web - Servidor

### Requerimientos
* NodeJS v4+
* MySQL

### Instalación

Importar la base de datos 'aoweb.sql' en MySQL

Cambiar sus credenciales de MySQL en 'database.js'

```js
var database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aoweb'
});
```

Instalar dependencias de NodeJS
```sh
$ npm install
```

Iniciar servidor
```sh
$ node server.js
```

### Próximo a desarrollar
* Documentar
* Refactorizar

### Desarrolladores
* [Damián Catanzaro](https://ar.linkedin.com/in/damiancatanzaro)
* [Juan Gallo](https://ar.linkedin.com/in/juangallo)

### Diseñadores
* Nicolas Castro García
* [Agustín Quetto](https://ar.linkedin.com/in/agustín-ramiro-quetto-garay-lima-87136410b)

### Agradecimientos
* [Lucas Panichella](https://ar.linkedin.com/in/lucas-panichella-bb121252) - Nuevos diseños

### Contribuir
[Argentum Online Web](http://argentumonlineweb.com/) pasa a estar desarrollado por todos!

Son libres de cargar nuevas [issues](https://github.com/dcatanzaro/argentumonlineweb-servidor/issues) y enviar sus Pull Requests.

Cada Pull Request que se haga se verá reflejada en el servidor oficial! http://argentumonlineweb.com/