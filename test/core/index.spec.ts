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
import { test_enrichers } from './enrichers/index.spec';
import { test_logger } from './logger.spec';
import { test_loggerOptions } from './loggerOptions.spec';
import { test_logMessage } from './logMessage.spec';
import { test_reporters } from './reporters/index.spec';

export function test_core() {
  describe('CORE', () => {
    test_enrichers();
    test_reporters();
    test_logMessage();
    test_loggerOptions();
    test_logger();
  });
}
