import { LogMessage } from './logMessage';

/**
 * Enrich the log message with extra information.
 */
export interface ILogMessageEnricher {
  /**
   * Enrich the log message with extra information.
   *
   * @param message The log message.
   */
  enrich(message: LogMessage): void;
}
