import 'mocha';
import { expect } from 'chai';
import { LogLevel, LogMessage } from '../../src/index';
// tslint:disable: no-unused-expression

export function test_logMessage() {
  describe('LogMessage', () => {

    it('should have the timestamp', () => {
      const t0 = new Date().getTime();
      const lm = new LogMessage();
      const t1 = new Date().getTime();

      expect(lm.timestamp >= t0).to.eq(true);
      expect(lm.timestamp <= t1).to.eq(true);
    });

    it('should have default values', () => {
      const lm = new LogMessage();

      expect(lm.level).to.eq(LogLevel.None);
      expect(lm.name).to.eq('');
      expect(lm.message).to.eq('');
      expect(lm.stackTrace).to.eq(undefined);
      expect(lm.extraParams).to.eq(undefined);
    });

    it('should have properties', () => {
      const lm = new LogMessage();

      const date = new Date();
      lm.level = LogLevel.Trace;
      lm.name = 'name';
      lm.message = 'message';
      lm.stackTrace = 'stacktrace';
      lm.extraParams = {
        'p0': undefined,
        'p1': null,
        'p2': 0,
        'p3': '0',
        'p4': date
      };

      expect(lm.level).to.eq(LogLevel.Trace);
      expect(lm.name).to.eq('name');
      expect(lm.message).to.eq('message');
      expect(lm.stackTrace).to.eq('stacktrace');
      expect(lm.extraParams).to.not.eq(undefined);
      expect(lm.extraParams.p0).to.eq(undefined);
      expect(lm.extraParams.p1).to.eq(null);
      expect(lm.extraParams.p2).to.eq(0);
      expect(lm.extraParams.p3).to.eq('0');
      expect(lm.extraParams.p4).to.eq(date);
    });

  });
}
