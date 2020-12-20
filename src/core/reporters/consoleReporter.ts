import { ILogsReporter } from '../iLogsReporter';
import { LogLevel } from '../logLevel';
import { LogMessage } from '../logMessage';

/**
 * Abstraction over the `Console` API.
 */
export interface IReporterConsole {
  debug(...data: any[]): void;
  error(...data: any[]): void;
  info(...data: any[]): void;
  log(...data: any[]): void;
  trace(...data: any[]): void;
  warn(...data: any[]): void;
}

/**
 * An implementations that outputs the messages to the console.
 * DO NOT user this in production. This is meant for development only.
 * Depending on the browser settings some messages might noy be output to the console.
 */
export class ConsoleReporter implements ILogsReporter {
  private _console: IReporterConsole;

  /**
   * Constructor.
   * @param {Console} console The current console reference.
   */
  constructor(console: IReporterConsole) {
    this._console = console;
  }


  /**
   * @inheritdoc
   */
  register(message: LogMessage): void {
    let fn: any = null;
    if (this._console) {
      switch (message.level) {
        case LogLevel.Trace:
          fn = this._console.trace || this._console.log;
          break;
        case LogLevel.Debug:
          fn = this._console.debug || this._console.log;
          break;
        case LogLevel.Information:
          fn = this._console.info || this._console.log;
          break;
        case LogLevel.Warning:
          fn = this._console.warn || this._console.log;
          break;
        case LogLevel.Error:
          fn = this._console.error || this._console.log;
          break;
        case LogLevel.Critical:
          fn = this._console.error || this._console.log;
          break;
        // case LogLevel.None: // Do not log.
        default:
          fn = null;
          break;
      }
    }

    if (typeof fn === 'function') {
      fn.call(this._console, message.message, message);
    }
  }

  /**
   * @inheritdoc
   */
  dispose(): Promise<void> {
    return Promise.resolve();
  }

}
