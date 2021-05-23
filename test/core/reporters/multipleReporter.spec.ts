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
import { InMemoryReporter, LogMessage, MultipleReporter } from '../../../src/index';

export function test_multipleReporter() {
  describe('MultipleReporter', () => {
    it('should report the messages to child reporters', async () => {
      const item = new LogMessage();

      const childReporter_A = new InMemoryReporter();
      const childReporter_B = new InMemoryReporter();
      const reporter = new MultipleReporter([childReporter_A, childReporter_B]);

      expect(childReporter_A.messages.length).to.equal(0);
      expect(childReporter_B.messages.length).to.equal(0);
      reporter.register(item);

      await reporter.dispose();
      expect(childReporter_A.messages.length).to.equal(1);
      expect(childReporter_A.messages[0]).to.eql(item);
      expect(childReporter_B.messages.length).to.equal(1);
      expect(childReporter_B.messages[0]).to.eql(item);
    });

    it('should not fail if not child reporters', async () => {

      try {
        const item = new LogMessage();
        const reporter = new MultipleReporter([]);
        reporter.register(item);
        await reporter.dispose();
        expect(true).to.equal(true);
      } catch (error) {
        expect(false).to.equal(true);
      }

    });

    it('should not fail if not child reporters', async () => {

      try {
        const item = new LogMessage();
        const reporter = new MultipleReporter(null as any);
        reporter.register(item);
        await reporter.dispose();
        expect(true).to.equal(true);
      } catch (error) {
        expect(false).to.equal(true);
      }

    });
  });
}
