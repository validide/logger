(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.validide_logger = {}));
}(this, (function (exports) { 'use strict';

    var ValuesEnricher = /** @class */ (function () {
        /**
         * Constructor.
         * @param {{ [id: string]: ILogParameterValue }} values The values to add to the log.
         * @param {boolean} overrideExisting Override a value if it already exists.
         */
        function ValuesEnricher(values, overrideExisting) {
            this._values = values;
            this._overrideExisting = overrideExisting;
        }
        /**
         * @inheritdoc
         */
        ValuesEnricher.prototype.enrich = function (message) {
            if (!this._values) {
                return;
            }
            message.extraParams = message.extraParams || {};
            var existingKeys = Object.keys(message.extraParams);
            for (var name_1 in this._values) {
                if (existingKeys.indexOf(name_1) !== -1 && !this._overrideExisting) {
                    continue;
                }
                message.extraParams[name_1] = this._values[name_1];
            }
        };
        return ValuesEnricher;
    }());

    var DynamicValuesEnricher = /** @class */ (function () {
        /**
         * Constructor.
         * @param {() =>{ [id: string]: ILogParameterValue }} valuesFunction The values to add to the log.
         * @param {boolean} overrideExisting Override a value if it already exists.
         */
        function DynamicValuesEnricher(valuesFunction, overrideExisting) {
            this._valuesFn = valuesFunction;
            this._overrideExisting = overrideExisting;
        }
        /**
         * @inheritdoc
         */
        DynamicValuesEnricher.prototype.enrich = function (message) {
            var values = typeof this._valuesFn === 'function' ? this._valuesFn() : undefined;
            if (!values) {
                return;
            }
            message.extraParams = message.extraParams || {};
            var existingKeys = Object.keys(message.extraParams);
            for (var name_1 in values) {
                if (existingKeys.indexOf(name_1) !== -1 && !this._overrideExisting) {
                    continue;
                }
                message.extraParams[name_1] = values[name_1];
            }
        };
        return DynamicValuesEnricher;
    }());

    /**
     * Log level
     */
    (function (LogLevel) {
        /**
         * Logs that contain the most detailed messages. These messages may contain sensitive application data. These messages are disabled by default and should never be enabled in a production environment.
         */
        LogLevel[LogLevel["Trace"] = 0] = "Trace";
        /**
         * Logs that are used for interactive investigation during development. These logs should primarily contain information useful for debugging and have no long-term value.
         */
        LogLevel[LogLevel["Debug"] = 1] = "Debug";
        /**
         * Logs that track the general flow of the application. These logs should have long-term value.
         */
        LogLevel[LogLevel["Information"] = 2] = "Information";
        /**
         * Logs that highlight an abnormal or unexpected event in the application flow, but do not otherwise cause the application execution to stop.
         */
        LogLevel[LogLevel["Warning"] = 3] = "Warning";
        /**
         * Logs that highlight when the current flow of execution is stopped due to a failure. These should indicate a failure in the current activity, not an application-wide failure.
         */
        LogLevel[LogLevel["Error"] = 4] = "Error";
        /**
         * Logs that describe an unrecoverable application or system crash, or a catastrophic failure that requires immediate attention.
         */
        LogLevel[LogLevel["Critical"] = 5] = "Critical";
        /**
         * Not used for writing log messages. Specifies that a logging category should not write any messages.
         */
        LogLevel[LogLevel["None"] = 6] = "None";
    })(exports.LogLevel || (exports.LogLevel = {}));

    /**
     * An implementations that outputs the messages to the console.
     * DO NOT user this in production. This is meant for development only.
     */
    var ConsoleReporter = /** @class */ (function () {
        /**
         * Constructor.
         * @param {Console} console The current console reference.
         */
        function ConsoleReporter(console) {
            this._console = console;
        }
        /**
         * @inheritdoc
         */
        ConsoleReporter.prototype.register = function (message) {
            var fn = null;
            if (this._console) {
                switch (message.level) {
                    case exports.LogLevel.Trace:
                        fn = this._console.trace;
                        break;
                    case exports.LogLevel.Debug:
                        fn = this._console.debug;
                        break;
                    case exports.LogLevel.Information:
                        fn = this._console.info;
                        break;
                    case exports.LogLevel.Warning:
                        fn = this._console.warn;
                        break;
                    case exports.LogLevel.Error:
                        fn = this._console.error;
                        break;
                    case exports.LogLevel.Critical:
                        fn = this._console.error;
                        break;
                }
            }
            if (typeof fn === 'function') {
                fn.call(this._console, message);
            }
        };
        /**
         * @inheritdoc
         */
        ConsoleReporter.prototype.dispose = function () {
            return Promise.resolve();
        };
        return ConsoleReporter;
    }());

    /**
     * HTTP Reporter options.
     */
    var HttpReporterOptions = /** @class */ (function () {
        function HttpReporterOptions() {
            /**
             * Endpoint that receives the logs.
             */
            this.endpoint = '';
            /**
             * HTTP verb used when calling the endpoint.
             */
            this.verb = 'POST';
            /**
             * The minimum number of items to send in a batch.
             */
            this.minimumBatchSize = 20;
            /**
             * The maximum interval, in milliseconds, to wait for the batch size to be achieved before reporting.
             */
            this.interval = 2000;
        }
        return HttpReporterOptions;
    }());
    var HttpReporter = /** @class */ (function () {
        function HttpReporter(options) {
            if (!options) {
                throw new Error('Argument "options" is required');
            }
            this._messageQueue = [];
            this._options = options;
            this._reportActionTimeoutRef = null;
            this._reportActionPromise = null;
            this._disposed = false;
        }
        /**
         * @inheritdoc
         */
        HttpReporter.prototype.register = function (message) {
            if (this._disposed) {
                return;
            }
            this._messageQueue.push(message);
            this._signalReport(false);
        };
        /**
         * @inheritdoc
         */
        HttpReporter.prototype.dispose = function () {
            var _this = this;
            if (this._disposed) {
                return Promise.resolve();
            }
            this._signalReport(true);
            var result = this._reportActionPromise === null
                ? Promise.resolve()
                : this._reportActionPromise;
            return result.then(function () {
                _this._disposed = true;
                _this._clearPreviousTimeout();
            });
        };
        HttpReporter.prototype._signalReport = function (triggerNow) {
            var _this = this;
            if (this._reportActionPromise !== null || this._messageQueue.length === 0) {
                return; // We are in the process of reporting now.
            }
            if (triggerNow || this._messageQueue.length >= this._options.minimumBatchSize) {
                this._reportActionPromise = this._reportCore()
                    .then(function () {
                    // Reset promise and signal a new reporting action.
                    _this._reportActionPromise = null;
                    _this._signalReport(false);
                });
                // Once reporting is done a new interval shall be started.
                this._clearPreviousTimeout();
            }
            else {
                this._scheduleNextReportAction();
            }
        };
        HttpReporter.prototype._clearPreviousTimeout = function () {
            if (!this._reportActionTimeoutRef) {
                return;
            }
            clearTimeout(this._reportActionTimeoutRef);
            this._reportActionTimeoutRef = 0;
        };
        HttpReporter.prototype._scheduleNextReportAction = function () {
            var _this = this;
            if (this._reportActionTimeoutRef) {
                return;
            }
            this._clearPreviousTimeout();
            this._reportActionTimeoutRef = setTimeout(function () {
                _this._clearPreviousTimeout();
                _this._signalReport(true);
            }, this._options.interval);
        };
        HttpReporter.prototype._reportCore = function () {
            var _this = this;
            var messages = this._messageQueue.splice(0);
            return new Promise(function (resolve, _reject) {
                var completeFn = function (success) {
                    if (!success) {
                        _this._messageQueue = _this._messageQueue.concat(messages);
                    }
                    resolve();
                };
                var request = new XMLHttpRequest();
                request.open(_this._options.verb, _this._options.endpoint);
                request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                // tslint:disable: only-arrow-functions
                request.onload = function () {
                    completeFn(this.status >= 200 && this.status < 300);
                };
                request.onerror = function () {
                    completeFn(false);
                };
                request.onabort = function () {
                    completeFn(false);
                };
                // tslint:enable: only-arrow-functions
                request.send(JSON.stringify(messages));
            });
        };
        return HttpReporter;
    }());

    /**
     * An implementations that keeps the messages in memory in a collection.
     * DO NOT user this in production. This is meant for unit tests.
     */
    var InMemoryReporter = /** @class */ (function () {
        function InMemoryReporter() {
            this._messages = [];
        }
        Object.defineProperty(InMemoryReporter.prototype, "messages", {
            get: function () {
                return this._messages.slice();
            },
            enumerable: false,
            configurable: true
        });
        /**
         * @inheritdoc
         */
        InMemoryReporter.prototype.register = function (message) {
            this._messages.push(message);
        };
        /**
         * @inheritdoc
         */
        InMemoryReporter.prototype.dispose = function () {
            return Promise.resolve();
        };
        return InMemoryReporter;
    }());

    var __awaiter = (window && window.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (window && window.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    /**
     * An implementations that can report to multiple implementations of `ILogsReporter`.
     */
    var MultipleReporter = /** @class */ (function () {
        function MultipleReporter(reporters) {
            this._reporters = reporters || [];
        }
        /**
         * @inheritdoc
         */
        MultipleReporter.prototype.register = function (message) {
            for (var _i = 0, _a = this._reporters; _i < _a.length; _i++) {
                var reporter = _a[_i];
                reporter.register(message);
            }
        };
        /**
         * @inheritdoc
         */
        MultipleReporter.prototype.dispose = function () {
            return __awaiter(this, void 0, void 0, function () {
                var proms, _i, _a, reporter;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            proms = new Array();
                            for (_i = 0, _a = this._reporters; _i < _a.length; _i++) {
                                reporter = _a[_i];
                                proms.push(reporter.dispose());
                            }
                            if (!proms.length) return [3 /*break*/, 2];
                            return [4 /*yield*/, Promise.all(proms)];
                        case 1:
                            _b.sent();
                            _b.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        return MultipleReporter;
    }());

    /**
     * Base logging message
     */
    var LogMessage = /** @class */ (function () {
        function LogMessage() {
            this.timestamp = new Date().getTime();
            this.level = exports.LogLevel.None;
            this.name = '';
            this.message = '';
        }
        return LogMessage;
    }());

    var __awaiter$1 = (window && window.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator$1 = (window && window.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    /**
     * Logging service.
     */
    var Logger = /** @class */ (function () {
        /**
         * Constructor.
         * @param {LoggerOptions} options The logger options.
         */
        function Logger(options) {
            this._options = options;
        }
        /**
         * The core logging method.
         *  All implementations must implement this to do the actual logging.
         * @param {LogMessage} message The message to log.
         */
        Logger.prototype.logCore = function (message) {
            var _a;
            (_a = this._options.reporter) === null || _a === void 0 ? void 0 : _a.register(message);
        };
        /**
         * @inheritdoc
         */
        Logger.prototype.dispose = function () {
            var _a;
            return __awaiter$1(this, void 0, void 0, function () {
                return __generator$1(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, ((_a = this._options.reporter) === null || _a === void 0 ? void 0 : _a.dispose())];
                        case 1:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Indicates if the specified level will be logged.
         * @param {LogLevel} level The log level.
         */
        Logger.prototype.isEnabled = function (level) {
            return level !== exports.LogLevel.None && level >= this._options.minimumLevel;
        };
        /**
         * Log trace.
         * @param msg The message to log.
         */
        Logger.prototype.trace = function (msg) {
            var message = new LogMessage();
            message.level = exports.LogLevel.Trace;
            message.message = msg;
            this.logMessage(message);
        };
        /**
         * Log debug.
         * @param msg The message to log.
         */
        Logger.prototype.debug = function (msg) {
            var message = new LogMessage();
            message.level = exports.LogLevel.Debug;
            message.message = msg;
            this.logMessage(message);
        };
        /**
         * Log information.
         * @param msg The message to log.
         */
        Logger.prototype.info = function (msg) {
            var message = new LogMessage();
            message.level = exports.LogLevel.Information;
            message.message = msg;
            this.logMessage(message);
        };
        /**
         * Log warning.
         * @param msg The message to log.
         */
        Logger.prototype.warn = function (msg) {
            var message = new LogMessage();
            message.level = exports.LogLevel.Warning;
            message.message = msg;
            this.logMessage(message);
        };
        /**
         * Log error.
         * @param msg The message to log.
         */
        Logger.prototype.error = function (msg) {
            var message = new LogMessage();
            message.level = exports.LogLevel.Error;
            message.message = msg;
            this.logMessage(message);
        };
        /**
         * Log error.
         * @param msg The message to log.
         */
        Logger.prototype.crit = function (msg) {
            var message = new LogMessage();
            message.level = exports.LogLevel.Critical;
            message.message = msg;
            this.logMessage(message);
        };
        /**
         * Log an event.
         * @param {LogLevel} level The level to log the event.
         * @param {String} message Custom message.
         * @param {Error} e The error associated with the event.
         * @param {{ [id: string]: ILogParameterValue }} params Extra parameters.
         */
        Logger.prototype.log = function (level, message, e, params) {
            var msg = new LogMessage();
            msg.level = level;
            msg.message = message;
            msg.errorMessage = e === null || e === void 0 ? void 0 : e.message;
            msg.stackTrace = e === null || e === void 0 ? void 0 : e.stack;
            msg.extraParams = params;
            this.logMessage(msg);
        };
        /**
         * Log a message.
         * @param {LogMessage} message The message to log.
         */
        Logger.prototype.logMessage = function (message) {
            if (!this.isEnabled(message.level))
                return;
            message.name = this._options.name;
            // tslint:disable-next-line: prefer-for-of
            for (var index = 0; index < this._options.enriches.length; index++) {
                this._options.enriches[index].enrich(message);
            }
            this.logCore(message);
        };
        return Logger;
    }());

    /**
     * Options class for logger configuration.
     */
    var LoggerOptions = /** @class */ (function () {
        function LoggerOptions() {
            /**
             * The name of the logger.
             */
            this.name = '';
            /**
             * The reporter for the messages.
             */
            this.reporter = null;
            /**
             * The minimum log level.
             */
            this.minimumLevel = exports.LogLevel.Warning;
            /**
             * Log enrichers.
             */
            this.enriches = [];
        }
        /**
         * Get the LogLevel from a string value.
         * @param {String} level The log level as string.
         */
        LoggerOptions.getLevel = function (level) {
            switch ((level || '').toUpperCase()) {
                case 'TRACE': return exports.LogLevel.Trace;
                case 'DEBUG': return exports.LogLevel.Debug;
                case 'INFORMATION': return exports.LogLevel.Information;
                case 'WARNING': return exports.LogLevel.Warning;
                case 'ERROR': return exports.LogLevel.Error;
                case 'CRITICAL': return exports.LogLevel.Critical;
                case 'NONE': return exports.LogLevel.None;
                default: return exports.LogLevel.None;
            }
        };
        return LoggerOptions;
    }());

    exports.ConsoleReporter = ConsoleReporter;
    exports.DynamicValuesEnricher = DynamicValuesEnricher;
    exports.HttpReporter = HttpReporter;
    exports.HttpReporterOptions = HttpReporterOptions;
    exports.InMemoryReporter = InMemoryReporter;
    exports.LogMessage = LogMessage;
    exports.Logger = Logger;
    exports.LoggerOptions = LoggerOptions;
    exports.MultipleReporter = MultipleReporter;
    exports.ValuesEnricher = ValuesEnricher;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
