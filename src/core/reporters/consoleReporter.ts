import { ILogsReporter } from '../iLogsReporter';
import { LogLevel } from '../logLevel';
import { LogMessage } from '../logMessage';

/**
 * An implementations that outputs the messages to the console.
 * DO NOT user this in production. This is meant for development.
 */
export class ConsoleReporter implements ILogsReporter {
  private _console: Console;

  /**
   * Constructor.
   * @param {Console} console The current console reference.
   */
  constructor(console: Console) {
    this._console = console;
  }


  /**
   * @inheritdoc
   */
  register(message: LogMessage): void {
    switch (message.level) {
      case LogLevel.Trace:
        this._console.trace(message);
        break;
      case LogLevel.Debug:
        this._console.debug(message);
        break;
      case LogLevel.Information:
        this._console.info(message);
        break;
      case LogLevel.Warning:
        this._console.warn(message);
        break;
      case LogLevel.Error:
        this._console.error(message);
        break;
      case LogLevel.Critical:
        this._console.error(message);
        break;
      case LogLevel.None:
        break;
      default:
        throw new Error(`The '${message.level}' level is unknown.`);
    }
  }

  /**
   * @inheritdoc
   */
  report(): Promise<void> {
    return Promise.resolve();
  }

}
