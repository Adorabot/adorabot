const { createLogger, format, transports, winstonconfig } = require('winston');
const { config } = require('./../config.json'); 

const httpTransportOptions = {
  host: 'http-intake.logs.datadoghq.com',
  path: `/v1/input/${config.datadogapi}?ddsource=nodejs&service=adora`,
  ssl: true
};

export const logger = {
  discordDebugLogger: createLogger({
    level: 'debug',
    exitOnError: false,
    format: format.json(),
    transports: [
        new transports.Http(httpTransportOptions)
      ]
  }),
  discordWarnLogger: createLogger({
    level: 'warn',
    exitOnError: false,
    format: format.json(),
    transports: [
        new transports.Http(httpTransportOptions)
      ]
  }),
  discordInfoLogger: createLogger({
    level: 'info',
    exitOnError: false,
    format: format.json(),
    transports: [
        new transports.Http(httpTransportOptions)
      ]
  })
}