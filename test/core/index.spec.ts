import 'mocha';
import { test_logger } from './logger.spec';
import { test_loggerOptions } from './loggerOptions.spec';
import { test_logMessage } from './logMessage.spec';
import { test_reporters } from './reporters/index.spec';

export function test_core() {
  describe('CORE', () => {
    test_reporters();
    test_logMessage();
    test_loggerOptions();
    test_logger();
  });
}
