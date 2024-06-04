> **ARCHIVE NOTICE**  
> This project has been archived in favour of https://github.com/adaptive-architecture/common-utilities 




# logger
A simple JavaScript logger

## Status
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7316d5f357674080891ecd20d4890e55)](https://www.codacy.com/gh/validide/logger/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=validide/logger&amp;utm_campaign=Badge_Grade)
[![Coverage Status](https://coveralls.io/repos/github/validide/logger/badge.svg?branch=main)](https://coveralls.io/github/validide/logger?branch=main)
[![npm version](https://img.shields.io/npm/v/@validide/logger)](https://www.npmjs.com/package/@validide/logger)

## Why another JavaScript library?
Before starting the project I looked fo a simple logger library that would allow me to:
* Log to `console` in development mode.
* Log to a remote endpoint in production.
* Easily extend the location to store/report the logs via a custom `ILogReporter`.
* The logger should not be directly dependent on the environment so depending on the configuration you could us it on client side on server side

## Why this package name?
1. I am not sure of the project's success so I did not want to spend that much time thinking of the name.
2. This is my opinionated take on logging, someone might have a better/different view on how it should work.

## Documentation and demo
[Documentation](https://validide.github.io/logger/)

[Demo](https://validide.github.io/logger/demo/)
