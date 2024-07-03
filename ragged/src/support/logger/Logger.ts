import { InstantiationError } from "../RaggedErrors";

// LogLevel type to define various levels of logging
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const instances: Record<string, Logger> = {};

/**
 * A simple logger class that logs messages to the console. It supports different log levels and namespaces.
 * 
 * @example 
 * const logger = new Logger('App');
 * logger.info('Application has started');
 */
export class Logger {
    private static level: LogLevel = 'info';

    public static setLogLevel(level: LogLevel): void {
        Logger.level = level;
    }

    constructor(private namespace: string) {
        if (instances[namespace]) {
            console.warn(`Ragged Logger with namespace ${namespace} already exists. This might indicate an issue with Ragged's logging setup, \
or you might be instantiating the same logger with the same namespace multiple times.`)
        } else {
            instances[namespace] = this;
        }
    }

    public static getInstances() {
        return instances;
    }


    debug(...params: any[]): void {
        this._log(console.log, 'debug', ...params);
    }

    info(...params: any[]): void {
        this._log(console.log, 'info', ...params);
    }

    warn(...params: any[]): void {
        this._log(console.warn, 'warn', ...params);
    }

    error(...params: any[]): void {
        this._log(console.error, 'error', ...params);
    }

    private formatMessage(level: LogLevel): string {
        return `[${new Date().toISOString()}] [${level.toUpperCase()}] [${this.namespace}]`;
    }

    private _log(logFunction: Function, level: LogLevel, ...params: any[]): void {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'none'];

        const shouldLog = levels.indexOf(level) >= levels.indexOf(Logger.level);

        if (shouldLog) {
            logFunction(this.formatMessage(level), ...params);
        }
    }
}