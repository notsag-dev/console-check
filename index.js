#!/usr/bin/env node
const puppeteer = require('puppeteer');
const split = require('split');
const util = require('util');
const fs = require('fs');

const sleep = util.promisify(setTimeout);

const urls = [];
const maxConcurrentDownloads = 20;

process.stdin.setEncoding('utf-8');
process.stdin.resume();
process.stdin.pipe(split()).on('data', (line) => {
  urls.push(line);
});

function logHelp() {
  console.log(`
    NAME
      console-check -- Get console logs and errors for a list of urls.

    EXAMPLES
      cat urls.txt | console-check
      echo 'https://example.com' | console-check
  `);
};

function printMessage(url, message) {
  console.log(`${url}:${message.type().toUpperCase()}:${message.text()}\n`);
}

async function getPage(browser, url) {
  const page = await browser.newPage();
  page
    .on('console', (message) => (printMessage(url, message)))
    .on('pageerror', (message) => (printMessage(url, message)))
  await page.goto(url);
  page.close();
}

async function main() {
  const [, , ...args] = process.argv;
  if (args.some(p => p === '--help' || p === '-h')) {
    logHelp();
    process.exit(0);
  }

  const browser = await puppeteer.launch({
    timeout: 5000,
    ignoreHTTPSErrors: true,
    headless: true
  });
  
  let url = urls.shift();
  while (url) {
    const promises = [];
    for (let i = 0; i < maxConcurrentDownloads; i++) {
      promises.push(getPage(browser, url));
      url = urls.shift();
      if (!url) {
        break;
      }
    }
    try {
      await Promise.all(promises);
    } catch (err) {
      console.error(err);
    }
  }

  browser.close();
}

main();
