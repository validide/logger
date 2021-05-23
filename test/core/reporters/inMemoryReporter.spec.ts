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
import { expect } from 'chai';
import { InMemoryReporter, LogMessage } from '../../../src/index';

export function test_inMemoryReporter() {
  describe('InMemoryReporter', () => {
    it('should store the message even before calling report', async () => {
      const item = new LogMessage();

      const reporter = new InMemoryReporter();

      expect(reporter.messages.length).to.equal(0);
      reporter.register(item);
      expect(reporter.messages.length).to.equal(1);
      expect(reporter.messages[0]).to.eql(item);

      await reporter.dispose();
      expect(reporter.messages.length).to.equal(1);
    });
  });
}
