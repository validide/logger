import { expect } from 'chai';
import 'mocha';
import { InMemoryReporter, Logger, LoggerOptions, LogLevel, LogMessage, ValuesEnricher } from '../../src/index';
// tslint:disable: no-unused-expression

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
      expect(logger.isEnabled(LogLevel.Error)).to.eq(true);
    });

    it('should be disabled for info', () => {
      expect(logger.isEnabled(LogLevel.Information)).to.eq(false);
    });

    it('should not fail if no reporter is configured', () => {
      expect(() => {
        const msg = new LogMessage();
        msg.level = LogLevel.Critical;
        logger.logItem(msg);
      }).not.to.throw();
    });

    it('should log', () => {
      const rep = new InMemoryReporter();
      opt.reporter = rep;
      opt.enriches.push(new ValuesEnricher(
        {
          'extra': 'value'
        },
        false
      ));

      const message = new LogMessage();
      message.level = LogLevel.Critical;
      message.message = 'critical message';

      logger.logItem(message);
      logger.logItem(new LogMessage());


      expect(rep.messages.length).to.eq(1);
      expect(rep.messages[0].level).to.eq(LogLevel.Critical);
      expect(rep.messages[0].message).to.eq('critical message');
      expect(rep.messages[0].name).to.eq(opt.name);
      expect(rep.messages[0].extraParams).not.to.eq(undefined);
      expect(rep.messages[0].extraParams!.extra).to.eq('value');
    });

  });
}
