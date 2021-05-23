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
import { LogMessage, DynamicValuesEnricher } from '../../../src/index';

export function test_dynamicValuesEnricher() {
  describe('DynamicValuesEnricher', () => {

    it('should enrich the message', () => {
      const item = new LogMessage();

      const enricher = new DynamicValuesEnricher(
        () => { return { 'foo': 'bar' }; },
        false
      );

      expect(item.extraParams).to.equal(undefined);
      enricher.enrich(item);
      expect(item.extraParams).not.to.equal(undefined);
      expect(item.extraParams!.foo).to.equal('bar');
    });

    it('should not touch the message if values are missing', () => {
      const item = new LogMessage();

      const undefinedEnricher = new DynamicValuesEnricher(undefined as any, false);
      expect(item.extraParams).to.equal(undefined);
      undefinedEnricher.enrich(item);
      expect(item.extraParams).to.equal(undefined);

      const nullEnricher = new DynamicValuesEnricher(null as any, false);
      expect(item.extraParams).to.equal(undefined);
      nullEnricher.enrich(item);
      expect(item.extraParams).to.equal(undefined);

    });

    it('should enrich the message but not override', () => {
      const item = new LogMessage();

      const enricher = new DynamicValuesEnricher(
        () => { return { 'foo': 'bar' }; },
        false
      );

      item.extraParams = {
        'foo': 'buzz'
      };

      enricher.enrich(item);
      expect(item.extraParams).not.to.equal(undefined);
      expect(item.extraParams!.foo).to.equal('buzz');
    });

    it('should enrich the message but not override', () => {
      const item = new LogMessage();

      const enricher = new DynamicValuesEnricher(
        () => { return { 'foo': 'bar' }; },
        true
      );

      item.extraParams = {
        'foo': 'buzz'
      };

      enricher.enrich(item);
      expect(item.extraParams).not.to.equal(undefined);
      expect(item.extraParams!.foo).to.equal('bar');
    });

  });
}
