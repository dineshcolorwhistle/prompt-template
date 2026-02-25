#!/usr/bin/env node
/**
 * One-time script to fix permissions on existing uploads so the web server can read them.
 * Run on the VPS from the project root: node server/fix-upload-permissions.js
 *
 * Sets: files to 0644 (readable by all), directories to 0755 (traversable by all).
 */

const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');
const FILE_MODE = 0o644;
const DIR_MODE = 0o755;

function fixPermissions(dir) {
    if (!fs.existsSync(dir)) {
        console.log('Uploads directory not found:', dir);
        return;
    }
    let fileCount = 0;
    let dirCount = 0;
    function walk(d) {
        const entries = fs.readdirSync(d, { withFileTypes: true });
        for (const ent of entries) {
            const full = path.join(d, ent.name);
            if (ent.isDirectory()) {
                try {
                    fs.chmodSync(full, DIR_MODE);
                    dirCount++;
                } catch (e) {
                    console.warn('chmod dir failed:', full, e.message);
                }
                walk(full);
            } else {
                try {
                    fs.chmodSync(full, FILE_MODE);
                    fileCount++;
                } catch (e) {
                    console.warn('chmod file failed:', full, e.message);
                }
            }
        }
    }
    try {
        fs.chmodSync(dir, DIR_MODE);
        dirCount++;
    } catch (e) {
        console.warn('chmod uploads dir failed:', e.message);
    }
    walk(uploadsDir);
    console.log('Done. Directories set to 0755:', dirCount, '| Files set to 0644:', fileCount);
}

fixPermissions(uploadsDir);
