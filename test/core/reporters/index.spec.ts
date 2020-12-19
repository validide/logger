import 'mocha';
import { test_inMemoryReporter } from './inMemoryReporter.spec';
import { test_multipleReporter } from './multipleReporter.spec';

export function test_reporters() {
  describe('REPORTERS', () => {
    test_inMemoryReporter();
    test_multipleReporter();
  });
}
