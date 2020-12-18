import 'mocha';
import { expect } from 'chai';
import { LogLevel, LoggerOptions } from '../../src/index';
// tslint:disable: no-unused-expression

export function test_loggerOptions() {
  describe('LoggerOptions', () => {

    it('should have default values', () => {
      const lo = new LoggerOptions();

      expect(lo.name).to.eq('');
      expect(lo.minimumLevel).to.eq(LogLevel.Warning);
      expect(lo.reporter).to.eq(null);
      expect(lo.enriches).to.eql([]);
    });

    it('should parse values', () => {
      expect(LoggerOptions.getLevel('')).to.eq(LogLevel.None);
      expect(LoggerOptions.getLevel(null as unknown as string)).to.eq(LogLevel.None);
      expect(LoggerOptions.getLevel(undefined as unknown as string)).to.eq(LogLevel.None);
      expect(LoggerOptions.getLevel('trAce')).to.eq(LogLevel.Trace);
      expect(LoggerOptions.getLevel('deBug')).to.eq(LogLevel.Debug);
      expect(LoggerOptions.getLevel('InforMation')).to.eq(LogLevel.Information);
      expect(LoggerOptions.getLevel('wArning')).to.eq(LogLevel.Warning);
      expect(LoggerOptions.getLevel('ERROR')).to.eq(LogLevel.Error);
      expect(LoggerOptions.getLevel('critical')).to.eq(LogLevel.Critical);
      expect(LoggerOptions.getLevel('NoNe')).to.eq(LogLevel.None);
    });

  });
}
