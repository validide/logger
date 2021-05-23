import { ILogMessageEnricher } from '../iLogMessageEnricher';
import { ILogParameterValue, LogMessage } from '../logMessage';

export class ValuesEnricher implements ILogMessageEnricher {
  private _values: { [id: string]: ILogParameterValue };
  private _overrideExisting: boolean;

  /**
   * Constructor.
   *
   * @param {{ [id: string]: ILogParameterValue }} values The values to add to the log.
   * @param {boolean} overrideExisting Override a value if it already exists.
   */
  constructor(values: { [id: string]: ILogParameterValue }, overrideExisting: boolean) {
    this._values = values;
    this._overrideExisting = overrideExisting;
  }

  /**
   * @inheritdoc
   */
  enrich(message: LogMessage): void {
    if (!this._values) {
      return;
    }
    message.extraParams = message.extraParams || {};

    const existingKeys = Object.keys(message.extraParams);
    for (const name in this._values) {
      if (existingKeys.indexOf(name) !== -1 && !this._overrideExisting) {
        continue;
      }

      message.extraParams[name] = this._values[name];
    }
  }
}
