import { IDisposable } from './idisposable';
import { LogMessage } from './logMessage';

/**
 * Contract for the component responsible for reporting the logs.
 */
export interface ILogsReporter extends IDisposable {
  /**
   * Register a message to be reported immediately or queue for reporting at a latter point.
   * @param {LogMessage} message The message to register.
   */
  register(message: LogMessage): void;
}
