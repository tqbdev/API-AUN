module.exports = {
  PORT: process.env.PORT || 8081,
  DB: {
    database: process.env.DB_NAME || 'aun',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    options: {
      dialect: process.env.DIALECT || 'mysql',
      host: process.env.HOST || 'localhost'
    }
  }
};
