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
import { test_consoleReporter } from './consoleReporter.spec';
import { test_httpReporter } from './httpReporter.spec';
import { test_inMemoryReporter } from './inMemoryReporter.spec';
import { test_multipleReporter } from './multipleReporter.spec';

export function test_reporters() {
  describe('REPORTERS', () => {
    test_inMemoryReporter();
    test_multipleReporter();
    test_consoleReporter();
    test_httpReporter();
  });
}
