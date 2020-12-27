import { IDisposable } from './idisposable';
import { LoggerOptions } from './loggerOptions';
import { LogLevel } from './logLevel';
import { ILogParameterValue, LogMessage } from './logMessage';

/**
 * Logging service.
 */
export class Logger implements IDisposable {
  private _options: LoggerOptions;

  /**
   * Constructor.
   * @param {LoggerOptions} options The logger options.
   */
  constructor(options: LoggerOptions) {
    this._options = options;
  }

  /**
   * The core logging method.
   * @param {LogMessage} message The message to log.
   */
  private logMessageCore(message: LogMessage): void {
    message.name = this._options.name;
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this._options.enrichers.length; index++) {
      this._options.enrichers[index].enrich(message);
    }
    this._options.reporter?.register(message);
  }

  /**
   * @inheritdoc
   */
  public async dispose(): Promise<void> {
    await this._options.reporter?.dispose();
  }


  /**
   * Indicates if the specified level will be logged.
   * @param {LogLevel} level The log level.
   */
  public isEnabled(level: LogLevel): boolean {
    return level !== LogLevel.None && level >= this._options.minimumLevel;
  }
  /**
   * Log trace.
   * @param msg The message to log.
   */
  public trace(msg: string): void {
    const message = new LogMessage();
    message.level = LogLevel.Trace;
    message.message = msg;
    this.logMessage(message);
  }
  /**
   * Log debug.
   * @param msg The message to log.
   */
  public debug(msg: string): void {
    const message = new LogMessage();
    message.level = LogLevel.Debug;
    message.message = msg;
    this.logMessage(message);
  }
  /**
   * Log information.
   * @param msg The message to log.
   */
  public info(msg: string): void {
    const message = new LogMessage();
    message.level = LogLevel.Information;
    message.message = msg;
    this.logMessage(message);
  }
  /**
   * Log warning.
   * @param msg The message to log.
   */
  public warn(msg: string): void {
    const message = new LogMessage();
    message.level = LogLevel.Warning;
    message.message = msg;
    this.logMessage(message);
  }
  /**
   * Log error.
   * @param msg The message to log.
   */
  public error(msg: string): void {
    const message = new LogMessage();
    message.level = LogLevel.Error;
    message.message = msg;
    this.logMessage(message);
  }
  /**
   * Log error.
   * @param msg The message to log.
   */
  public crit(msg: string): void {
    const message = new LogMessage();
    message.level = LogLevel.Critical;
    message.message = msg;
    this.logMessage(message);
  }

  /**
   * Log an event.
   * @param {LogLevel} level The level to log the event.
   * @param {String} message Custom message.
   * @param {Error} e The error associated with the event.
   * @param {{ [id: string]: ILogParameterValue }} params Extra parameters.
   */
  public log(level: LogLevel, message: string, e?: Error, params?: { [id: string]: ILogParameterValue }): void {
    const msg = new LogMessage();
    msg.level = level;
    msg.message = message;
    msg.errorMessage = e?.message;
    msg.stackTrace = e?.stack;
    msg.extraParams = params;

    this.logMessage(msg);
  }

  /**
   * Log a message.
   * @param {LogMessage} message The message to log.
   */
  public logMessage(message: LogMessage): void {
    if (!this.isEnabled(message.level))
      return;

    setTimeout(() => {
      this.logMessageCore(message);
    }, 1);
  }
}
