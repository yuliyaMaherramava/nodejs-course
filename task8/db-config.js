const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "{user}",
  password: "{password}",
  database: "shop",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool.promise();
