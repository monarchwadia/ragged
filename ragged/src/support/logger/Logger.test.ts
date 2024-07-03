import { LogLevel, Logger } from "./Logger";

describe("Logger", () => {
    it("should save new instances to static", () => {
        try {
            expect(Logger.getInstances()['Example']).toBe(undefined);
            const logger = new Logger('Example');
            expect(Logger.getInstances()['Example']).toBe(logger);
        } finally {
            delete Logger.getInstances()['Example'];
        }
    });

    describe("log levels", () => {
        let originalConsoleLog = console.log;
        let originalConsoleWarn = console.warn;
        let originalConsoleError = console.error;

        let logger: Logger;

        afterAll(() => {
            Logger.setLogLevel('info');
            console.log = originalConsoleLog;
            console.warn = originalConsoleWarn;
            console.error = originalConsoleError;
        })

        beforeEach(() => {
            jest.clearAllMocks();
            // console.log, console.warn, console.error should be mocked
            originalConsoleLog = console.log;
            originalConsoleWarn = console.warn;
            originalConsoleError = console.error;

            console.log = jest.fn();
            console.warn = jest.fn();
            console.error = jest.fn();


            logger = new Logger('App');
        })

        afterEach(() => {
            delete Logger.getInstances()['App'];

            console.log = originalConsoleLog;
            console.warn = originalConsoleWarn;
            console.error = originalConsoleError;

            Logger.setLogLevel('info')
        });

        describe("none", () => {
            beforeEach(() => {
                Logger.setLogLevel('none');
            })

            it("should not log on debug", () => {
                logger.debug('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should not log on info", () => {
                logger.info('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should not log on warn", () => {
                logger.warn('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should not log on error", () => {
                logger.error('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).not.toHaveBeenCalled();
            });
        })

        describe("error", () => {
            beforeEach(() => {
                Logger.setLogLevel('error');
            })

            it("should not log on debug", () => {
                logger.debug('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should not log on info", () => {
                logger.info('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should not log on warn", () => {
                logger.warn('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should log on error", () => {
                logger.error('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).toHaveBeenCalledTimes(1);
            });
        })

        describe("warn", () => {
            beforeEach(() => {
                Logger.setLogLevel('warn');
            })

            it("should not log on debug", () => {
                logger.debug('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should not log on info", () => {
                logger.info('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should log on warn", () => {
                logger.warn('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).toHaveBeenCalledTimes(1);
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should log on error", () => {
                logger.error('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).toHaveBeenCalledTimes(1);
            });
        });

        describe("info", () => {
            beforeEach(() => {
                Logger.setLogLevel('info');
            })

            it("should not log on debug", () => {
                logger.debug('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should log on info", () => {
                logger.info('foo');
                expect(console.log).toHaveBeenCalledTimes(1);
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should log on warn", () => {
                logger.warn('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).toHaveBeenCalledTimes(1);
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should log on error", () => {
                logger.error('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).toHaveBeenCalledTimes(1);
            });
        });

        describe("debug", () => {
            beforeEach(() => {
                Logger.setLogLevel('debug');
            })

            it("should log on debug", () => {
                logger.debug('foo');
                expect(console.log).toHaveBeenCalledTimes(1);
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should log on info", () => {
                logger.info('foo');
                expect(console.log).toHaveBeenCalledTimes(1);
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should log on warn", () => {
                logger.warn('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).toHaveBeenCalledTimes(1);
                expect(console.error).not.toHaveBeenCalled();
            });

            it("should log on error", () => {
                logger.error('foo');
                expect(console.log).not.toHaveBeenCalled();
                expect(console.warn).not.toHaveBeenCalled();
                expect(console.error).toHaveBeenCalledTimes(1);
            });
        });
    });
})