import 'mocha';
import { test_dynamicValuesEnricher } from './dynamicValuesEnricher.spec';
import { test_valuesEnricher } from './valuesEnricher.spec';

export function test_enrichers() {
  describe('ENRICHERS', () => {
    test_valuesEnricher()
    test_dynamicValuesEnricher()
  });
}
