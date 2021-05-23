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
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import 'mocha';
import { expect } from 'chai';
import { LogLevel, LoggerOptions } from '../../src/index';

export function test_loggerOptions() {
  describe('LoggerOptions', () => {

    it('should have default values', () => {
      const lo = new LoggerOptions();

      expect(lo.name).to.equal('');
      expect(lo.minimumLevel).to.equal(LogLevel.Warning);
      expect(lo.reporter).to.equal(null);
      expect(lo.enrichers).to.eql([]);
    });

    it('should parse values', () => {
      expect(LoggerOptions.getLevel('')).to.equal(LogLevel.None);
      expect(LoggerOptions.getLevel(null as unknown as string)).to.equal(LogLevel.None);
      expect(LoggerOptions.getLevel(undefined as unknown as string)).to.equal(LogLevel.None);
      expect(LoggerOptions.getLevel('trAce')).to.equal(LogLevel.Trace);
      expect(LoggerOptions.getLevel('deBug')).to.equal(LogLevel.Debug);
      expect(LoggerOptions.getLevel('InforMation')).to.equal(LogLevel.Information);
      expect(LoggerOptions.getLevel('wArning')).to.equal(LogLevel.Warning);
      expect(LoggerOptions.getLevel('ERROR')).to.equal(LogLevel.Error);
      expect(LoggerOptions.getLevel('critical')).to.equal(LogLevel.Critical);
      expect(LoggerOptions.getLevel('NoNe')).to.equal(LogLevel.None);
    });

  });
}
