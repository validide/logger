/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { expect } from 'chai';
import { ConsoleReporter, LogLevel, LogMessage } from '../../../src/index';

class DummyConsole  /* implements IReporterConsole */ {
  public messages: any[] = [];

  private _pushData(...data: any[]): void {
    this.messages.push(data);
  }

  debug(...data: any[]): void {
    this._pushData(...data);
  }
  error(...data: any[]): void {
    this._pushData(...data);
  }
  info(...data: any[]): void {
    this._pushData(...data);
  }
  log(...data: any[]): void {
    this._pushData(...data);
  }
  trace(...data: any[]): void {
    this._pushData(...data);
  }
  warn(...data: any[]): void {
    this._pushData(...data);
  }

}

export function test_consoleReporter() {
  describe('ConsoleReporter', () => {

    Object.keys(LogLevel)
      .map(m => Number(m))
      .filter(f => !isNaN(f))
      .forEach(level => {
        const logLevel = LogLevel[level];
        it(`should not fail when reporting a "${logLevel}" message even if the "console" is missing`, async () => {
          try {
            const reporter = new ConsoleReporter(null as any);
            const item = new LogMessage();
            item.level = level as LogLevel;

            reporter.register(item);
            await reporter.dispose();
            expect(true).to.equal(true);
          } catch (error) {
            expect(false).to.equal(true, error as unknown as string);
          }
        });
      });



    it(`should not "report" the "${LogLevel[LogLevel.None]}" message even after calling report`, async () => {
      const item = new LogMessage();
      const dummy = new DummyConsole();

      const reporter = new ConsoleReporter(dummy);

      expect(dummy.messages.length).to.equal(0);
      reporter.register(item);
      expect(dummy.messages.length).to.equal(0);

      await reporter.dispose();
      expect(dummy.messages.length).to.equal(0);
    });

    Object.keys(LogLevel)
      .map(m => Number(m))
      .filter(f => !isNaN(f))
      .forEach(level => {
        if (level === LogLevel.None) {
          return;
        }

        const logLevel = LogLevel[level];
        it(`should "report" the "${logLevel}" message even before calling report`, async () => {
          const dummy = new DummyConsole();
          const reporter = new ConsoleReporter(dummy);
          const item = new LogMessage();
          item.level = level as LogLevel;

          expect(dummy.messages.length).to.equal(0);
          reporter.register(item);
          expect(dummy.messages.length).to.equal(1);
          expect(dummy.messages[0][0]).to.eql(item.message);
          expect(dummy.messages[0][1]).to.eql(item);

          await reporter.dispose();
          expect(dummy.messages.length).to.equal(1);
        });
      });

    Object.keys(LogLevel)
      .map(m => Number(m))
      .filter(f => !isNaN(f))
      .forEach(level => {
        if (level === LogLevel.None) {
          return;
        }

        const logLevel = LogLevel[level];
        it(`should "report" the "${logLevel}" message even if instance has only the "log" method`, async () => {
          const dummy = new DummyConsole();
          (dummy as any).debug = null;
          (dummy as any).trace = null;
          (dummy as any).info = null;
          (dummy as any).warn = null;
          (dummy as any).error = null;
          const reporter = new ConsoleReporter(dummy);
          const item = new LogMessage();
          item.level = level as LogLevel;

          expect(dummy.messages.length).to.equal(0);
          reporter.register(item);
          expect(dummy.messages.length).to.equal(1);
          expect(dummy.messages[0][0]).to.eql(item.message);
          expect(dummy.messages[0][1]).to.eql(item);

          await reporter.dispose();
          expect(dummy.messages.length).to.equal(1);
        });
      });

  });
}
