#!/usr/bin/env node
const puppeteer = require('puppeteer');
const split = require('split');
const util = require('util');
const fs = require('fs');

const sleep = util.promisify(setTimeout);

const urls = [];
let timeToKeepPageOpen = 1000;
let concurrency = 10;

process.stdin.setEncoding('utf-8');
process.stdin.resume();
process.stdin.pipe(split()).on('data', (line) => {
  urls.push(line);
});

function logHelp() {
  console.log(`
    NAME
      console-check -- Get console messages for a list of urls.

    OPTIONS
      -k, --keep-open {ms} (default 1000) Milliseconds to wait until closing each page
      -c, --concurrency {n} (default 10)  Concurrency level

    EXAMPLES
      cat urls.txt | console-check
      echo 'https://example.com' | console-check
  `);
};

function printMessage(url, message) {
  console.log(`${url}:${message.type().toUpperCase()}:${message.text()}`);
}

async function getPage(browser, url) {
  const page = await browser.newPage();
  page
    .on('console', (message) => (printMessage(url, message)))
    .on('pageerror', (message) => (printMessage(url, message)))
  await page.goto(url);
  await sleep(timeToKeepPageOpen);
  page.close();
}

function getArgValue(args, shortFlag, longFlag) {
  const ind = Math.max(args.indexOf(shortFlag), args.indexOf(longFlag));
  if (ind >= 0) {
    if (ind + 1 === args.length) {
      return { found: true, value: undefined };
    }
    return { found: true, value: args[ind + 1] };
  }
  return { found: false };
}

function getNumericArgValue(args, shortFlag, longFlag) {
  const result = getArgValue(args, shortFlag, longFlag);
  if (result.found && result.value === undefined) {
    logHelp();
    process.exit(0);
  }
  if (result.found) {
    try {
      return parseInt(result.value);
    } catch (err) {
      logHelp();
      process.exit(0);
    }
  }
}

async function main() {
  const [, , ...args] = process.argv;
  if (args.some(p => p === '--help' || p === '-h')) {
    logHelp();
    process.exit(0);
  }
  const keepOpenArg = getNumericArgValue(args, '-k', '--keep-open');
  if (keepOpenArg !== undefined) {
    timeToKeepPageOpen = keepOpenArg;
  }

  const concurrencyArg = getNumericArgValue(args, '-c', '--concurrency');
  if (concurrencyArg !== undefined) {
    concurrency = concurrencyArg;
  }

  const browser = await puppeteer.launch({
    timeout: 5000,
    ignoreHTTPSErrors: true,
    headless: true
  });
  
  for (let i = 0; i < concurrency; i++) {
    worker(browser);
  }
}

let closedWorkers = 0;
function closeWorker() {
  closedWorkers++;
  if (closedWorkers === concurrency) {
    process.exit(0);
  }
}

async function worker(browser) {
  while (true) {
    let url = urls.shift();
    if (!url) {
      break;
    }
    try {
      await getPage(browser, url);
    } catch (err) {
      console.error(err);
    }
  }
  closeWorker();
}

main();
