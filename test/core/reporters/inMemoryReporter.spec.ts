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
