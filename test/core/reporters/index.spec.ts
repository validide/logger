import 'mocha';
import { test_inMemoryReporter } from './inMemoryReporter.spec';

export function test_reporters() {
  describe('REPORTERS', () => {
  test_inMemoryReporter();
  });
}
