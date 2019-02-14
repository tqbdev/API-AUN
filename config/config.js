module.exports = {
  PORT: process.env.PORT || 8081,
  DB: {
    database: process.env.DB_NAME || 'aun',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    options: {
      dialect: process.env.DB_DIALECT || 'mysql',
      host: process.env.DB_HOST || 'localhost'
    }
  },
  authencation: {
    jwtSecret: process.env.JWT_SECRET || 'secret',
    jwtExpiresIn: 60 * 60 * 1 // 1 hour
  }
};
