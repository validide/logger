import { ILogsReporter } from '../iLogsReporter';
import { LogMessage } from '../logMessage';

/**
 * An implementations that keeps the messages in memory in a collection.
 * DO NOT user this in production. This is meant for unit tests.
 */
export class InMemoryReporter implements ILogsReporter {
  private _messages: LogMessage[] = [];

  public get messages(): LogMessage[] {
    return this._messages.slice();
  }


  /**
   * @inheritdoc
   */
  register(message: LogMessage): void {
    this._messages.push(message);
  }

  /**
   * @inheritdoc
   */
  report(): Promise<void> {
    return Promise.resolve();
  }

}
