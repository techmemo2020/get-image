#!/usr/bin/env node

/* eslint no-process-exit: 0 */

const puppeteer = require("puppeteer");
const path = require("path");
const pkg = require("./package.json");

const Default = {
  outputFile: "out.png"
};

let Verbose = 0;
const Prog = path.basename(__filename);

const log = (msg) => {
  process.stdout.write(`${msg}\n`);
};

const verbose = (msg) => {
  if (Verbose) { log(msg); }
};

const error = (msg) => {
  process.stderr.write(`${msg}\n`);
};

const showVersion = (exit=true) => {
  error(`${Prog} version ${pkg.version}`);
  if(exit) {
    process.exit(2);
  }
};

const usage = () => {
  showVersion(false);
  error(`
Usage: ${Prog} [Options] <URL>
Options:
  -o <output file> (default=${Default.outputFile})
  --no-headless
      No headless mode (use chrome)
  -v  Increase verbosity
  -V  Ouput version info and exit
  -h  Print this message and exit
`);
  process.exit(2);
};

const parseArgs = () => {
  const setting = {
    headless: true
    , outputFile: Default.outputFile
  };

  let i = 2;
  for ( const _len = process.argv.length; i<_len; i++ ) {
    if (process.argv[i] === "-V") {
      showVersion();
    } else if (process.argv[i] === "-v") {
      Verbose += 1;
    } else if (process.argv[i] === "-h") {
      usage();
    } else if (process.argv[i] === "-o") {
      i += 1;
      if (i>=_len) { usage(); }
      setting.outputFile = process.argv[i];
    } else if (process.argv[i] === "--no-headless") {
      setting.headless = false;
    } else if (process.argv[i][0] === "-" ) {
      usage();
    } else {
      break;
    }
  }
  if ( process.argv.length - i < 1 ) { usage(); }
  setting.url = process.argv[i];
  return setting;
};


const main = async () => {
  const args = parseArgs();
  verbose(`args: ${JSON.stringify(args)}`);
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"]
    , ignoreHTTPSErrors: true
    , headless: args.headless
  });
  const page = await browser.newPage();
  verbose(`Going to ${args.url}`);
  await page.goto(args.url);
  verbose("Taking screenshot");
  await page.screenshot({
    path: args.outputFile
    , fullPage: true
  });
  verbose("closing browser");
  await browser.close();
};

main();
