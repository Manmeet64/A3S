import winston from "winston";

const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} - a3s-modifier - ${level}: ${message}`;
        })
    ),
    transports: [new winston.transports.Console()],
});

export default logger;
