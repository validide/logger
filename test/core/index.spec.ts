import 'mocha';
import { test_loggerOptions } from './loggerOptions.spec';
import { test_logMessage } from './logMessage.spec';

export function test_core() {
  describe('CORE', () => {
    test_logMessage();
    test_loggerOptions();
  });
}
