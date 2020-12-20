import { expect } from 'chai';
import * as sinon from 'sinon';
import { HttpReporter, HttpReporterOptions, LogMessage } from '../../../src/index';
import { getDelayPromise } from '../../utils';

export function test_httpReporter() {
  describe('HttpReporterOptions', () => {
    it('have default values', () => {
      const opt = new HttpReporterOptions();

      expect(opt.endpoint).to.equal('');
      expect(opt.verb).to.equal('POST');
      expect(opt.minimumBatchSize).to.equal(20);
      expect(opt.interval).to.equal(2000);
    });
  });

  describe('HttpReporter', () => {
    let originalXMLHttpRequest: any;
    let fakeXMLHttpRequest: sinon.SinonFakeXMLHttpRequestStatic;
    let httpReporterOptions: HttpReporterOptions;
    let httpReporter: HttpReporter;
    let httpRequests: sinon.SinonFakeXMLHttpRequest[];

    afterEach(async () => {
      httpRequests = [];
      await httpReporter.dispose();
      fakeXMLHttpRequest.restore();
      globalThis.XMLHttpRequest = originalXMLHttpRequest;
    });

    beforeEach(() => {
      originalXMLHttpRequest = globalThis.XMLHttpRequest;
      fakeXMLHttpRequest = sinon.useFakeXMLHttpRequest();
      globalThis.XMLHttpRequest = fakeXMLHttpRequest as any;
      httpRequests = [];

      fakeXMLHttpRequest.onCreate = xhr => {
        httpRequests.push(xhr);
      };

      httpReporterOptions = new HttpReporterOptions();
      httpReporterOptions.endpoint = '/logs';
      httpReporterOptions.verb = 'POST';
      httpReporterOptions.minimumBatchSize = 3;
      httpReporterOptions.interval = 5;

      httpReporter = new HttpReporter(httpReporterOptions);
    });

    it('should throw an exception if options are not provided', () => {
      expect(() => { const a = new HttpReporter(null as any); }).to.throw();
    });

    it('should not fail if calling dispose multiple times', async () => {
      try {
        await httpReporter.dispose();
        await getDelayPromise(1);
        await httpReporter.dispose();
        await getDelayPromise(1);

        expect(true).to.eq(true);
      } catch (error) {
        expect(true).to.eq(false, error);
      }
    });

    it('should not fail when calling register after dispose', async () => {
      try {
        httpReporterOptions.minimumBatchSize = 1;
        expect(httpRequests.length).to.equal(0);

        await httpReporter.dispose();
        await getDelayPromise(1);
        httpReporter.register(new LogMessage());
        httpReporter.register(new LogMessage());
        httpReporter.register(new LogMessage());
        await getDelayPromise(httpReporterOptions.interval + 5);
        expect(httpRequests.length).to.equal(0);

        expect(true).to.eq(true);
      } catch (error) {
        expect(true).to.eq(false, error);
      }
    });

    [200, 201, 204, 299].forEach(f => {
      it(`should consider HTTP ${f} a valid response from the reporting endpoint`, async () => {
        try {
          httpReporterOptions.minimumBatchSize = 1;
          expect(httpRequests.length).to.equal(0);

          let count = 0;
          while (count < httpReporterOptions.minimumBatchSize) {
            count++;
            const lm = new LogMessage();
            lm.message = 'UNIT TEST ' + count;
            httpReporter.register(lm);
          }

          await getDelayPromise(1);

          expect(httpRequests.length).to.equal(1);

          expect(httpRequests[0].method).to.be.equal(httpReporterOptions.verb);
          expect(httpRequests[0].url).to.be.equal(httpReporterOptions.endpoint);
          expect(httpRequests[0].requestBody.length).to.be.greaterThan(0);
          const requestBody: LogMessage[] = JSON.parse(httpRequests[0].requestBody);
          expect(requestBody.length).to.equal(httpReporterOptions.minimumBatchSize);
          requestBody.forEach(element => {
            expect(element.message.indexOf('UNIT TEST')).to.equal(0, 'Test message content.');
          });

          await getDelayPromise(1);

          httpRequests[0].respond(
            f,
            { 'Content-Type': 'application/json' },
            '[]'
          );

          await getDelayPromise(1.5 * httpReporterOptions.interval);

          await httpReporter.dispose();

          expect(httpRequests.length).to.equal(1, 'First calls should have been successful so no call should be done after.');
        } catch (error) {
          expect(true).to.eq(false, error);
        }
      });
    });

    it('should not consider HTTP != 2XX  a valid response and retry the messages next time', async () => {
      try {
        httpReporterOptions.minimumBatchSize = 1;
        expect(httpRequests.length).to.equal(0);

        let count = 0;
        while (count < httpReporterOptions.minimumBatchSize) {
          count++;
          const lm = new LogMessage();
          lm.message = 'UNIT TEST ' + count;
          httpReporter.register(lm);
        }

        await getDelayPromise(1);

        expect(httpRequests.length).to.equal(1);

        expect(httpRequests[0].method).to.be.equal(httpReporterOptions.verb);
        expect(httpRequests[0].url).to.be.equal(httpReporterOptions.endpoint);
        expect(httpRequests[0].requestBody.length).to.be.greaterThan(0);
        const firstRequestBody: LogMessage[] = JSON.parse(httpRequests[0].requestBody);
        expect(firstRequestBody.length).to.equal(httpReporterOptions.minimumBatchSize);
        firstRequestBody.forEach(element => {
          expect(element.message.indexOf('UNIT TEST')).to.equal(0, 'Test message content.');
        });

        await getDelayPromise(1);

        httpRequests[0].respond(
          400,
          { 'Content-Type': 'application/json' },
          '[]'
        );

        await getDelayPromise(1.5 * httpReporterOptions.interval);

        expect(httpRequests.length).to.equal(2);

        expect(httpRequests[1].method).to.be.equal(httpReporterOptions.verb);
        expect(httpRequests[1].url).to.be.equal(httpReporterOptions.endpoint);
        expect(httpRequests[1].requestBody.length).to.be.greaterThan(0);
        const secondRequestBody: LogMessage[] = JSON.parse(httpRequests[1].requestBody);
        expect(secondRequestBody.length).to.equal(httpReporterOptions.minimumBatchSize);
        secondRequestBody.forEach(element => {
          expect(element.message.indexOf('UNIT TEST')).to.equal(0, 'Test message content.');
        });

        await getDelayPromise(1);

        httpRequests[1].respond(
          200,
          { 'Content-Type': 'application/json' },
          '[]'
        );
            } catch (error) {
        expect(true).to.eq(false, error);
      }
    });

    it('should not consider an error a valid response and retry the messages next time', async () => {
      try {
        httpReporterOptions.minimumBatchSize = 1;
        expect(httpRequests.length).to.equal(0);

        let count = 0;
        while (count < httpReporterOptions.minimumBatchSize) {
          count++;
          const lm = new LogMessage();
          lm.message = 'UNIT TEST ' + count;
          httpReporter.register(lm);
        }

        await getDelayPromise(1);

        expect(httpRequests.length).to.equal(1);

        expect(httpRequests[0].method).to.be.equal(httpReporterOptions.verb);
        expect(httpRequests[0].url).to.be.equal(httpReporterOptions.endpoint);
        expect(httpRequests[0].requestBody.length).to.be.greaterThan(0);
        const firstRequestBody: LogMessage[] = JSON.parse(httpRequests[0].requestBody);
        expect(firstRequestBody.length).to.equal(httpReporterOptions.minimumBatchSize);
        firstRequestBody.forEach(element => {
          expect(element.message.indexOf('UNIT TEST')).to.equal(0, 'Test message content.');
        });

        await getDelayPromise(1);

        httpRequests[0].error();

        await getDelayPromise(1.5 * httpReporterOptions.interval);

        expect(httpRequests.length).to.equal(2);

        expect(httpRequests[1].method).to.be.equal(httpReporterOptions.verb);
        expect(httpRequests[1].url).to.be.equal(httpReporterOptions.endpoint);
        expect(httpRequests[1].requestBody.length).to.be.greaterThan(0);
        const secondRequestBody: LogMessage[] = JSON.parse(httpRequests[1].requestBody);
        expect(secondRequestBody.length).to.equal(httpReporterOptions.minimumBatchSize);
        secondRequestBody.forEach(element => {
          expect(element.message.indexOf('UNIT TEST')).to.equal(0, 'Test message content.');
        });

        await getDelayPromise(1);

        httpRequests[1].respond(
          200,
          { 'Content-Type': 'application/json' },
          '[]'
        );
            } catch (error) {
        expect(true).to.eq(false, error);
      }
    });

    it('should not consider an abort a valid response and retry the messages next time', async () => {
      try {
        httpReporterOptions.minimumBatchSize = 1;
        expect(httpRequests.length).to.equal(0);

        let count = 0;
        while (count < httpReporterOptions.minimumBatchSize) {
          count++;
          const lm = new LogMessage();
          lm.message = 'UNIT TEST ' + count;
          httpReporter.register(lm);
        }

        await getDelayPromise(1);

        expect(httpRequests.length).to.equal(1);

        expect(httpRequests[0].method).to.be.equal(httpReporterOptions.verb);
        expect(httpRequests[0].url).to.be.equal(httpReporterOptions.endpoint);
        expect(httpRequests[0].requestBody.length).to.be.greaterThan(0);
        const firstRequestBody: LogMessage[] = JSON.parse(httpRequests[0].requestBody);
        expect(firstRequestBody.length).to.equal(httpReporterOptions.minimumBatchSize);
        firstRequestBody.forEach(element => {
          expect(element.message.indexOf('UNIT TEST')).to.equal(0, 'Test message content.');
        });

        await getDelayPromise(1);

        (httpRequests[0]  as any).abort();

        await getDelayPromise(1.5 * httpReporterOptions.interval);

        expect(httpRequests.length).to.equal(2);

        expect(httpRequests[1].method).to.be.equal(httpReporterOptions.verb);
        expect(httpRequests[1].url).to.be.equal(httpReporterOptions.endpoint);
        expect(httpRequests[1].requestBody.length).to.be.greaterThan(0);
        const secondRequestBody: LogMessage[] = JSON.parse(httpRequests[1].requestBody);
        expect(secondRequestBody.length).to.equal(httpReporterOptions.minimumBatchSize);
        secondRequestBody.forEach(element => {
          expect(element.message.indexOf('UNIT TEST')).to.equal(0, 'Test message content.');
        });

        await getDelayPromise(1);

        httpRequests[1].respond(
          200,
          { 'Content-Type': 'application/json' },
          '[]'
        );
            } catch (error) {
        expect(true).to.eq(false, error);
      }
    });

    it('should wait if the necessary batch size has not been met', async () => {
      try {
        httpReporterOptions.minimumBatchSize = 3;
        httpReporterOptions.interval = 10;
        expect(httpRequests.length).to.equal(0);

        let count = 0;
        while (count < httpReporterOptions.minimumBatchSize - 1) {
          count++;
          const lm = new LogMessage();
          lm.message = 'UNIT TEST ' + count;
          httpReporter.register(lm);
        }

        await getDelayPromise(1);

        expect(httpRequests.length).to.equal(0);


        await getDelayPromise(httpReporterOptions.interval + 5);

        expect(httpRequests.length).to.equal(1);
        expect(httpRequests[0].method).to.be.equal(httpReporterOptions.verb);
        expect(httpRequests[0].url).to.be.equal(httpReporterOptions.endpoint);
        expect(httpRequests[0].requestBody.length).to.be.greaterThan(0);
        const requestBody: LogMessage[] = JSON.parse(httpRequests[0].requestBody);
        expect(requestBody.length).to.equal(httpReporterOptions.minimumBatchSize - 1, 'We sent 1 less message.');
        requestBody.forEach(element => {
          expect(element.message.indexOf('UNIT TEST')).to.equal(0, 'Test message content.');
        });

        await getDelayPromise(1);

        httpRequests[0].respond(
          200,
          { 'Content-Type': 'application/json' },
          '[]'
        );

        expect(true).to.eq(true);
      } catch (error) {
        expect(true).to.eq(false, error);
      }
    });

    it('should schedule the next delivery after the current wait interval if not full batch', async () => {
      try {
        httpReporterOptions.minimumBatchSize = 3;
        httpReporterOptions.interval = 10;
        expect(httpRequests.length).to.equal(0);

        let count = 0;
        while (count < httpReporterOptions.minimumBatchSize) {
          count++;
          const lm = new LogMessage();
          lm.message = 'UNIT TEST ' + count;
          httpReporter.register(lm);
        }

        await getDelayPromise(1);

        expect(httpRequests.length).to.equal(1);
        expect(httpRequests[0].method).to.be.equal(httpReporterOptions.verb);
        expect(httpRequests[0].url).to.be.equal(httpReporterOptions.endpoint);
        expect(httpRequests[0].requestBody.length).to.be.greaterThan(0);
        const requestBody: LogMessage[] = JSON.parse(httpRequests[0].requestBody);
        expect(requestBody.length).to.equal(httpReporterOptions.minimumBatchSize);
        requestBody.forEach(element => {
          expect(element.message.indexOf('UNIT TEST')).to.equal(0, 'Test message content.');
        });

        // Add more messaged while waiting response from server
        count = 0;
        while (count < httpReporterOptions.minimumBatchSize - 1) {
          count++;
          const lm = new LogMessage();
          lm.message = 'UNIT TEST B2 ' + count;
          httpReporter.register(lm);
        }

        httpRequests[0].respond(
          200,
          { 'Content-Type': 'application/json' },
          '[]'
        );

        await getDelayPromise(1);
        expect(httpRequests.length).to.equal(1, 'Request should not have been sent');
        await getDelayPromise(1);


        await getDelayPromise(httpReporterOptions.interval);

        expect(httpRequests.length).to.equal(2, 'Request should have been sent');
        expect(httpRequests[1].method).to.be.equal(httpReporterOptions.verb);
        expect(httpRequests[1].url).to.be.equal(httpReporterOptions.endpoint);
        expect(httpRequests[1].requestBody.length).to.be.greaterThan(0);
        const secondRequestBody: LogMessage[] = JSON.parse(httpRequests[1].requestBody);
        expect(secondRequestBody.length).to.equal(httpReporterOptions.minimumBatchSize - 1);
        secondRequestBody.forEach(element => {
          expect(element.message.indexOf('UNIT TEST B2')).to.equal(0, 'Test message content.');
        });

        httpRequests[1].respond(
          200,
          { 'Content-Type': 'application/json' },
          '[]'
        );

        await getDelayPromise(1);

        expect(true).to.eq(true);
      } catch (error) {
        expect(true).to.eq(false, error);
      }
    });

    it('should schedule the next delivery immediately after if full batch', async () => {
      try {
        httpReporterOptions.minimumBatchSize = 3;
        httpReporterOptions.interval = 10;
        expect(httpRequests.length).to.equal(0);

        let count = 0;
        while (count < httpReporterOptions.minimumBatchSize) {
          count++;
          const lm = new LogMessage();
          lm.message = 'UNIT TEST ' + count;
          httpReporter.register(lm);
        }

        await getDelayPromise(1);

        expect(httpRequests.length).to.equal(1);
        expect(httpRequests[0].method).to.be.equal(httpReporterOptions.verb);
        expect(httpRequests[0].url).to.be.equal(httpReporterOptions.endpoint);
        expect(httpRequests[0].requestBody.length).to.be.greaterThan(0);
        const requestBody: LogMessage[] = JSON.parse(httpRequests[0].requestBody);
        expect(requestBody.length).to.equal(httpReporterOptions.minimumBatchSize);
        requestBody.forEach(element => {
          expect(element.message.indexOf('UNIT TEST')).to.equal(0, 'Test message content.');
        });

        // Add more messaged while waiting response from server
        count = 0;
        while (count < httpReporterOptions.minimumBatchSize) {
          count++;
          const lm = new LogMessage();
          lm.message = 'UNIT TEST B2 ' + count;
          httpReporter.register(lm);
        }

        httpRequests[0].respond(
          200,
          { 'Content-Type': 'application/json' },
          '[]'
        );

        await getDelayPromise(1);

        expect(httpRequests.length).to.equal(2, 'Request should have been sent');
        expect(httpRequests[1].method).to.be.equal(httpReporterOptions.verb);
        expect(httpRequests[1].url).to.be.equal(httpReporterOptions.endpoint);
        expect(httpRequests[1].requestBody.length).to.be.greaterThan(0);
        const secondRequestBody: LogMessage[] = JSON.parse(httpRequests[1].requestBody);
        expect(secondRequestBody.length).to.equal(httpReporterOptions.minimumBatchSize);
        secondRequestBody.forEach(element => {
          expect(element.message.indexOf('UNIT TEST B2')).to.equal(0, 'Test message content.');
        });

        httpRequests[1].respond(
          200,
          { 'Content-Type': 'application/json' },
          '[]'
        );

        await getDelayPromise(1);

        expect(true).to.eq(true);
      } catch (error) {
        expect(true).to.eq(false, error);
      }
    });

    it('should wait for reporting to finish before disposing', async () => {
      try {
        httpReporterOptions.minimumBatchSize = 3;
        httpReporterOptions.interval = 10;
        expect(httpRequests.length).to.equal(0);

        const lm = new LogMessage();
        lm.message = 'UNIT TEST ';
        httpReporter.register(lm);

        await getDelayPromise(1);

        expect(httpRequests.length).to.equal(0);

        const disposeProm = httpReporter.dispose();
        await getDelayPromise(1);

        expect(httpRequests.length).to.equal(1);
        expect(httpRequests[0].method).to.be.equal(httpReporterOptions.verb);
        expect(httpRequests[0].url).to.be.equal(httpReporterOptions.endpoint);
        expect(httpRequests[0].requestBody.length).to.be.greaterThan(0);
        const requestBody: LogMessage[] = JSON.parse(httpRequests[0].requestBody);
        expect(requestBody.length).to.equal(1);
        requestBody.forEach(element => {
          expect(element.message.indexOf('UNIT TEST')).to.equal(0, 'Test message content.');
        });

        httpRequests[0].respond(
          200,
          { 'Content-Type': 'application/json' },
          '[]'
        );

        await getDelayPromise(1);

        await disposeProm;
        expect(httpRequests.length).to.equal(1, 'No more requests should have been sent');
        await getDelayPromise(1);

        expect(true).to.eq(true);
      } catch (error) {
        expect(true).to.eq(false, error);
      }
    });

  });
}
