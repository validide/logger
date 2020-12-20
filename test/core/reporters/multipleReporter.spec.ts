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
