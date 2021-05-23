import { LogLevel } from './logLevel';

/**
 * The type of the extra parameters a log item can have.
 */
export type ILogParameterValue = string | number | Date | null | undefined;

/**
 * Base logging message
 */
export class LogMessage {
  public timestamp: number = new Date().getTime();
  public level: LogLevel = LogLevel.None;
  public name = '';
  public message = '';
  public errorMessage?: string;
  public stackTrace?: string;
  public extraParams?: { [id: string]: ILogParameterValue };
}
