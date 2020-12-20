# logger
A simple JavaScript logger

## Status
[![Coverage Status](https://coveralls.io/repos/github/validide/logger/badge.svg?branch=main)](https://coveralls.io/github/validide/logger?branch=main)
[![npm version](https://img.shields.io/npm/v/@validide/logger)](https://www.npmjs.com/package/@validide/logger)

## Installation
You can use the framework by:
- installing it from NPM and importing it in your files

``` javascript
import * as loggerNs from '@validide/logger';

// Rest of code below

```


- importing directly in the browser the bundle and using it similar to:

``` javascript
(function (window, loggerNs, undefined) {
  'use strict';

// Rest of code below


})(window, window.validide_logger, void 0);
```

## Initializing and using the library

``` javascript
var developmentMode = true; // You know how to set this up ;)

// Configure the HTTP reporter.
var httpReporterOptions = new loggerNs.HttpReporterOptions();
httpReporterOptions.endpoint = '/some-logs-endpoint'; // You should use a working endpoint.
httpReporterOptions.verb = 'POST'; // You should use POST or PUT.
httpReporterOptions.minimumBatchSize = 20; // Depending on the amount of data and latency chose an appropriate value.
httpReporterOptions.interval = 2000; // The log endpoint for the demo does not work so we delay re-trying.


// If we are in development mode we can use the `MultipleReporter` to wrap the HTTP reporter and the console reporter.
var logsReporter = developmentMode
  ? new loggerNs.MultipleReporter([ // In development mode we want to log to the windows console also.
      new loggerNs.ConsoleReporter(window.console),
      new loggerNs.HttpReporter(httpReporterOptions)
    ])
  : new loggerNs.HttpReporter(httpReporterOptions);

// We want to add the user agent string to each of the log items.
var valuesEnricher = new loggerNs.ValuesEnricher(
  {
    'ua': window.navigator.userAgent
  },
  false
);


// Configure the logger options.
var loggerOptions = new loggerNs.LoggerOptions();
loggerOptions.name = 'MyDemoAppLogger'; // In case we have multiple instances of loggers we can give each a different name.
loggerOptions.reporter = logsReporter;
loggerOptions.minimumLevel = loggerNs.LogLevel.Trace; // The minimum level we should log.
loggerOptions.enrichers.push(valuesEnricher);
var logger = new loggerNs.Logger(loggerOptions);

// Log some messages using the shorthand version.
logger.trace('Logger initialized.');
logger.debug('Debug message here.');
logger.info('This is an information.')
logger.warn('This might not be a good idea.');
logger.error('Something bad happened');
logger.crit('It is critical that you get this message');

var err = new Error('A super critical error.');

// Log using the 'log' method.
logger.log(
  loggerNs.LogLevel.Critical,
  'Something went seriously wrong.',
  err,
  {
    'user': 'Awesome User',
    'user_level': 12345
  }
)
```

## Demo and documentation
[Demo - Work in progress](https://validide.github.io/logger/demo/)
