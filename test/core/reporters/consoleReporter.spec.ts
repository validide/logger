import { expect } from 'chai';
import { ConsoleReporter, LogMessage, IReporterConsole, LogLevel } from '../../../src/index';

class DummyConsole  /* implements IReporterConsole */ {
  public messages: any[] = [];

  private _pushData(...data: any[]): void {
    data?.forEach(f => {
      this.messages.push(f);
    });
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
          expect(false).to.equal(true, error);
        }
      });
    });



    it(`should not "report" the "${LogLevel[LogLevel.None]}" message even after calling report`, async () => {
      const item = new LogMessage();
      var dummy = new DummyConsole();

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
          expect(dummy.messages[0]).to.eql(item);

          await reporter.dispose();
          expect(dummy.messages.length).to.equal(1);
        });
      });

  });
}
