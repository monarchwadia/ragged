// LogLevel type to define various levels of logging
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

/**
 * A simple logger class that logs messages to the console. It supports different log levels and namespaces.
 * 
 * @example 
 * const logger = new Logger('App');
 * logger.info('Application has started');
 */
export class Logger {
    private static level: LogLevel = 'info';

    constructor(private namespace: string, private level?: LogLevel) {
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'none'];
        const currentSetting = this.level || Logger.level;
        return levels.indexOf(level) >= levels.indexOf(currentSetting);
    }

    private formatMessage(level: LogLevel): string {
        return `[${new Date().toISOString()}] [${level.toUpperCase()}] [${this.namespace}]`;
    }

    private _log(logFunction: Function, level: LogLevel, ...params: any[]): void {
        if (this.shouldLog(level)) {
            logFunction(this.formatMessage(level), ...params);
        }
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

    public static setLogLevel(level: LogLevel): void {
        Logger.level = level;
    }

    public setLogLevel(level: LogLevel): void {
        this.level = level;
    }
}