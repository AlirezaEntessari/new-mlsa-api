const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: "rootroot",
    host: "localhost",
    port: 5432,
    database: "newmlsa"
})

module.exports = pool;