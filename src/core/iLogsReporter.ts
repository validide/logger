import { LogMessage } from './logMessage';

/**
 * Contract for the component responsible for reporting the logs.
 */
export interface ILogsReporter {
  /**
   * Register a message to be reported immediately or queue for reporting at a latter point.
   * @param {LogMessage} message The message to register.
   */
  register(message: LogMessage): void;

  /**
   * Report the messages in the queue.
   */
  report(): Promise<void>;
}
