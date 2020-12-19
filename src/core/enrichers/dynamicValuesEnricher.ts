import { ILogMessageEnricher } from '../iLogMessageEnricher';
import { ILogParameterValue, LogMessage } from '../logMessage';

export class DynamicValuesEnricher implements ILogMessageEnricher {
  private _valuesFn: () => { [id: string]: ILogParameterValue };
  private _overrideExisting: boolean;

  /**
   * Constructor.
   * @param {() =>{ [id: string]: ILogParameterValue }} valuesFunction The values to add to the log.
   * @param {boolean} overrideExisting Override a value if it already exists.
   */
  constructor(valuesFunction: () => { [id: string]: ILogParameterValue }, overrideExisting: boolean) {
    this._valuesFn = valuesFunction;
    this._overrideExisting = overrideExisting;
  }

  /**
   * @inheritdoc
   */
  enrich(message: LogMessage): void {
    const values = typeof this._valuesFn === 'function' ? this._valuesFn() : undefined;
    if (!values) {
      return;
    }
    message.extraParams = message.extraParams || {};

    const existingKeys = Object.keys(message.extraParams);
    for (const name in values) {
      if (existingKeys.indexOf(name) !== -1 && !this._overrideExisting) {
        continue;
      }

      message.extraParams[name] = values[name];
    }
  }
}
