import mysql from 'mysql';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '730126890Ss!',
  database: 'tododb',
});

export default db;
