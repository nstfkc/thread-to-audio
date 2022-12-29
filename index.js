#!/usr/bin/env node

const sade = require("sade");
const path = require("path");

require("dotenv").config();

const { writeThread, writeAudio } = require("./dist");
const { existsSync, mkdirSync } = require("fs");

const prog = sade("mt-cli");

prog.version("1.0.0@beta");

prog
  .command("write-thread <threadId>")
  .option("-o", "--outdir", "Change output directory")
  .action(async (threadId, opts) => {
    const { o = path.join(__dirname, "output") } = opts;
    const OUTPUT_DIR = path.resolve(o);
    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR);
    }

    await writeThread(threadId, OUTPUT_DIR);
  });

prog
  .command("write-audio <threadId>")
  .option("-o, --outdir", "Change output directory")
  .option("-w, --overwrite", "Overwrite")
  .action(async (threadId, opts) => {
    const { o = path.join(__dirname, "output"), w = false } = opts;
    const OUTPUT_DIR = path.resolve(o);
    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR);
    }

    await writeAudio(threadId, OUTPUT_DIR, w);
  });

prog.parse(process.argv);
