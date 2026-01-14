// Assegniamo un valore finto per evitare che Sequelize vada in crash all'avvio dei test.
// Dato che mockiamo le chiamate al DB, questo URL non verrà mai usato davvero.
process.env.DB_CONNECTION_URI = 'postgres://user:pass@localhost:5432/test_db';
process.env.DIALECT = 'postgres';