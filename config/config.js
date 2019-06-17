module.exports = {
  PORT: process.env.PORT || 8081,
  DB: {
    database: process.env.DB_NAME || 'aun',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    options: {
      operatorsAliases: false,
      dialect: process.env.DB_DIALECT || 'mysql',
      host: process.env.DB_HOST || 'localhost',
      logging: +process.env.DB_LOGGING ? true : false
    }
  },
  authencation: {
    jwtSecret: process.env.JWT_SECRET || 'secret',
    jwtExpiresIn: +process.env.JWT_EXPIRE_TIME || 60 * 60 * 1 // 1 hour
  }
};
