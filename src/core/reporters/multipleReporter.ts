import { ILogsReporter } from '../iLogsReporter';
import { LogMessage } from '../logMessage';

/**
 * An implementations that can report to multiple implementations of `ILogsReporter`.
 */
export class MultipleReporter implements ILogsReporter {
  private _reporters: ILogsReporter[];

  constructor(reporters: ILogsReporter[]) {
    this._reporters = reporters;
  }

  /**
   * @inheritdoc
   */
  register(message: LogMessage): void {
    for (const reporter of this._reporters) {
      reporter.register(message);
    }
  }

  /**
   * @inheritdoc
   */
  async report(): Promise<void> {
    const proms = new Array<Promise<void>>();

    for (const reporter of this._reporters) {
      proms.push(reporter.report());
    }

    if (proms.length) {
      await Promise.all(proms);
    }
  }
}
