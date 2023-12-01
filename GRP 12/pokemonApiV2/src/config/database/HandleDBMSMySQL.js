var fs = require("fs");
var mysql = require("mysql");

class HandleDBMSMySQL {
  constructor() {
    var envFile = JSON.parse(
      fs.readFileSync("src/config/server/env.json", "utf-8")
    );
    this.database = envFile.database;
    this.host = envFile.host;
    this.password = envFile.password;
    this.port = envFile.port;
    this.user = envFile.user;
    
    this.connect();
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      this.connection.end((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  connect() {
    this.connection = mysql.createConnection({
      database: this.database,
      host: this.host,
      password: this.password,
      port: this.port,
      user: this.user,
    });

    // Abra a conexão explicitamente
    this.connection.connect((err) => {
      if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
      } else {
        console.log('Conexão com o banco de dados estabelecida.');
      }
    });
  }

  sqlSelect(sql, args) {
    return new Promise((resolve, reject) => {
      // Verifique se a conexão está estabelecida antes de executar a consulta
      if (this.connection && this.connection.state === 'authenticated') {
        this.connection.query(sql, args, (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            var resultsJSON = { results: {}, fields: {} };
            resultsJSON.results = results.map((r) => Object.assign({}, r));
            resultsJSON.fields = fields.map((r) => Object.assign({}, r));
            resolve(resultsJSON);
          }
        });
      } else {
        reject(new Error('Conexão com o banco de dados não está estabelecida.'));
      }
    });
  }

  sqlInsert(sql, args) {
    return new Promise((resolve, reject) => {
      // Verifique se a conexão está estabelecida antes de executar a consulta
      if (this.connection && this.connection.state === 'authenticated') {
        this.connection.query(sql, args, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      } else {
        reject(new Error('Conexão com o banco de dados não está estabelecida.'));
      }
    });
  }
}

module.exports = HandleDBMSMySQL;
