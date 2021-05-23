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
import { LogLevel, LogMessage } from '../../src/index';

export function test_logMessage() {
  describe('LogMessage', () => {

    it('should have the timestamp', () => {
      const t0 = new Date().getTime();
      const lm = new LogMessage();
      const t1 = new Date().getTime();

      expect(lm.timestamp >= t0).to.equal(true);
      expect(lm.timestamp <= t1).to.equal(true);
    });

    it('should have default values', () => {
      const lm = new LogMessage();

      expect(lm.level).to.equal(LogLevel.None);
      expect(lm.name).to.equal('');
      expect(lm.message).to.equal('');
      expect(lm.errorMessage).to.equal(undefined);
      expect(lm.stackTrace).to.equal(undefined);
      expect(lm.extraParams).to.equal(undefined);
    });

    it('should have properties', () => {
      const lm = new LogMessage();

      const date = new Date();
      lm.level = LogLevel.Trace;
      lm.name = 'name';
      lm.message = 'message';
      lm.errorMessage = 'errorMessage';
      lm.stackTrace = 'stacktrace';
      lm.extraParams = {
        'p0': undefined,
        'p1': null,
        'p2': 0,
        'p3': '0',
        'p4': date
      };

      expect(lm.level).to.equal(LogLevel.Trace);
      expect(lm.name).to.equal('name');
      expect(lm.message).to.equal('message');
      expect(lm.errorMessage).to.equal('errorMessage');
      expect(lm.stackTrace).to.equal('stacktrace');
      expect(lm.extraParams).to.not.equal(undefined);
      expect(lm.extraParams.p0).to.equal(undefined);
      expect(lm.extraParams.p1).to.equal(null);
      expect(lm.extraParams.p2).to.equal(0);
      expect(lm.extraParams.p3).to.equal('0');
      expect(lm.extraParams.p4).to.equal(date);
    });

  });
}
