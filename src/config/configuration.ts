import { registerAs } from "@nestjs/config"

export default registerAs('config',() => ({
 port: process.env.PORT || 8080,
 serverHost: process.env.SERVER_HOST || 'http://localhost:3000',
 database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 12345678,
    name: process.env.DB_NAME || 'tagmark'
 },
 privateAccessKey: process.env.PRIVATE_KEY || '12345678',
 privateRefreshKey: process.env.REFRESH_PRIVATE_KEY || '12345678',
 cryptoSecretKey: process.env.CRYPTOJS_SECRET_KEY || '12345678',
 loggerPretty: process.env.PRETTY_LOGS || true,
}));