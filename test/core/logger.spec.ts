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
import 'mocha';
import { InMemoryReporter, Logger, LoggerOptions, LogLevel, LogMessage, ValuesEnricher } from '../../src/index';
import { getDelayPromise } from '../utils';

export function test_logger() {
  describe('Logger', () => {

    let opt: LoggerOptions;
    let logger: Logger;

    afterEach(async () => {
      await logger.dispose();
    });

    beforeEach(() => {
      opt = new LoggerOptions();
      opt.name = 'Test logger';
      opt.minimumLevel = LogLevel.Warning;
      logger = new Logger(opt);
    });

    it('should be enabled for error', () => {
      expect(logger.isEnabled(LogLevel.Error)).to.equal(true);
    });

    it('should be disabled for info', () => {
      expect(logger.isEnabled(LogLevel.Information)).to.equal(false);
    });

    it('should not fail if no reporter is configured', () => {
      expect(() => {
        const msg = new LogMessage();
        msg.level = LogLevel.Critical;
        logger.logMessage(msg);
      }).not.to.throw();
    });

    it('should log', async () => {
      const rep = new InMemoryReporter();
      opt.reporter = rep;
      opt.enrichers.push(new ValuesEnricher(
        {
          'extra': 'value'
        },
        false
      ));

      const message = new LogMessage();
      message.level = LogLevel.Critical;
      message.message = 'critical message';

      logger.logMessage(message);
      logger.logMessage(new LogMessage());

      await getDelayPromise(1);

      expect(rep.messages.length).to.equal(1);
      expect(rep.messages[0].level).to.equal(LogLevel.Critical);
      expect(rep.messages[0].message).to.equal('critical message');
      expect(rep.messages[0].name).to.equal(opt.name);
      expect(rep.messages[0].extraParams).not.to.equal(undefined);
      expect(rep.messages[0].extraParams!.extra).to.equal('value');
    });

    describe('log method', () => {

      let rep: InMemoryReporter;
      beforeEach(() => {
        rep = new InMemoryReporter();
        opt.reporter = rep;
      });

      it('should require only a level and a message', async () =>{
        expect(rep.messages.length).to.equal(0);
        logger.log(LogLevel.Error, 'some message');

        await getDelayPromise(1);

        expect(rep.messages.length).to.equal(1);
        expect(rep.messages[0].level).to.equal(LogLevel.Error);
        expect(rep.messages[0].message).to.equal('some message');
      });

      it('should copy the error message and stack trace', async () =>{
        expect(rep.messages.length).to.equal(0);
        const err = new Error('error message');
        logger.log(LogLevel.Error, 'some message', err);

        await getDelayPromise(1);

        expect(rep.messages.length).to.equal(1);
        expect(rep.messages[0].level).to.equal(LogLevel.Error);
        expect(rep.messages[0].message).to.equal('some message');
        expect(rep.messages[0].errorMessage).to.equal(err.message);
        expect(rep.messages[0].stackTrace).to.equal(err.stack);
      });
    });

    describe('log shorthand methods', () => {

      let rep: InMemoryReporter;
      beforeEach(() => {
        rep = new InMemoryReporter();
        opt.reporter = rep;
        opt.minimumLevel = LogLevel.Trace;
      });

      it('should have a shorthand method for "trace"', async () => {

        expect(rep.messages.length).to.equal(0);
        logger.trace('some message');

        await getDelayPromise(1);

        expect(rep.messages.length).to.equal(1);
        expect(rep.messages[0].level).to.equal(LogLevel.Trace);
        expect(rep.messages[0].message).to.equal('some message');

      });

      it('should have a shorthand method for "debug"', async () => {

        expect(rep.messages.length).to.equal(0);
        logger.debug('some message');

        await getDelayPromise(1);

        expect(rep.messages.length).to.equal(1);
        expect(rep.messages[0].level).to.equal(LogLevel.Debug);
        expect(rep.messages[0].message).to.equal('some message');

      });

      it('should have a shorthand method for "info"', async () => {

        expect(rep.messages.length).to.equal(0);
        logger.info('some message');

        await getDelayPromise(1);

        expect(rep.messages.length).to.equal(1);
        expect(rep.messages[0].level).to.equal(LogLevel.Information);
        expect(rep.messages[0].message).to.equal('some message');

      });

      it('should have a shorthand method for "warn"', async () => {

        expect(rep.messages.length).to.equal(0);
        logger.warn('some message');

        await getDelayPromise(1);

        expect(rep.messages.length).to.equal(1);
        expect(rep.messages[0].level).to.equal(LogLevel.Warning);
        expect(rep.messages[0].message).to.equal('some message');

      });

      it('should have a shorthand method for "error"', async () => {

        expect(rep.messages.length).to.equal(0);
        logger.error('some message');

        await getDelayPromise(1);

        expect(rep.messages.length).to.equal(1);
        expect(rep.messages[0].level).to.equal(LogLevel.Error);
        expect(rep.messages[0].message).to.equal('some message');

      });

      it('should have a shorthand method for "crit"', async () => {

        expect(rep.messages.length).to.equal(0);
        logger.crit('some message');

        await getDelayPromise(1);

        expect(rep.messages.length).to.equal(1);
        expect(rep.messages[0].level).to.equal(LogLevel.Critical);
        expect(rep.messages[0].message).to.equal('some message');

      });

    });

  });
}
