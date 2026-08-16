#!/usr/bin/env node
/*
  scripts/hex-cleanup.js
  Simple node script to scan src/** for hex color literals and replace
  them according to a conservative mapping to brand tokens.

  Usage:
    node scripts/hex-cleanup.js --simulate --report reports/dryrun.json
    node scripts/hex-cleanup.js --apply --report reports/run-2026-08-12.json

  Notes:
  - By default runs in simulate mode (no files are written).
  - Backups (.bak) are created when --apply is used.
  - Mapping is conservative and maps known hexes to CSS variables/classes.
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const SIMULATE = !APPLY;
const REPORT_INDEX = args.indexOf('--report');
const REPORT_PATH = REPORT_INDEX !== -1 ? args[REPORT_INDEX + 1] : path.join(ROOT, 'reports', `hex-cleanup-report-${Date.now()}.json`);

const mapping = {
  // panel / background
  '#FDF8F3': 'var(--color-art-panel)',
  '#FAF2EB': 'var(--color-art-panel)',

  // main text
  '#1A0F0A': 'var(--color-art-text)',

  // accent (rosado fluorescente)
  '#E91E8C': 'var(--color-art-accent)',
  '#D1177D': 'var(--color-art-accent-hover)',

  // border / caramelo dorado
  '#E5A84B': 'var(--color-art-border)',
  '#A67C52': 'var(--color-art-border)',

  // muted / chocolate
  '#2D1F15': 'var(--color-art-muted)',
  '#523A2A': 'var(--color-art-muted)'
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function walk(dir, exts, files = []) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist') continue;
      await walk(full, exts, files);
    } else if (exts.includes(path.extname(ent.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true });
}

async function run() {
  const exts = ['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.svg'];
  const files = await walk(SRC, exts);
  const report = { startedAt: new Date().toISOString(), filesScanned: files.length, changes: [] };

  for (const file of files) {
    let content;
    try {
      content = await fs.promises.readFile(file, 'utf8');
    } catch (err) {
      console.error('read error', file, err.message);
      continue;
    }

    const fileReport = { file: path.relative(ROOT, file), replacements: [] };
    let newContent = content;

    for (const [hex, replacement] of Object.entries(mapping)) {
      const re = new RegExp(escapeRegExp(hex), 'gi');
      const matches = (newContent.match(re) || []).length;
      if (matches > 0) {
        fileReport.replacements.push({ from: hex, to: replacement, count: matches });
        newContent = newContent.replace(re, replacement);
      }
    }

    if (fileReport.replacements.length > 0) {
      report.changes.push(fileReport);
      if (APPLY) {
        try {
          // backup
          await fs.promises.copyFile(file, file + '.bak');
          await fs.promises.writeFile(file, newContent, 'utf8');
        } catch (err) {
          console.error('write error', file, err.message);
        }
      }
    }
  }

  report.endedAt = new Date().toISOString();
  report.totalFilesChanged = report.changes.length;

  await ensureDir(REPORT_PATH);
  await fs.promises.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log('Hex cleanup', SIMULATE ? '(simulate)' : '(apply)', 'report:', REPORT_PATH);
  console.log(`Scanned ${report.filesScanned} files, changed ${report.totalFilesChanged} files.`);
}

run().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
