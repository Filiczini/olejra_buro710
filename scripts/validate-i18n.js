import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns
const TERNARY_PATTERN = /language\s*===\s*['"]uk['"]\s*\?\s*['"][^'"]+['"]\s*:\s*['"][^'"]+['"]/g;
const UKRAINIAN_PATTERN = /[\u0400-\u04FF]+/g;

// Directories to exclude
const EXCLUDED_DIRS = [
  'node_modules',
  '.tmp',
  'dist',
  'build',
  '.git',
  'i18n'
];

// Extensions to check
const CHECKED_EXTENSIONS = ['.ts', '.tsx'];

/**
 * Remove comments from a line
 */
function stripComments(line, inMultiLineComment) {
  // Handle closing multi-line comment on this line
  if (inMultiLineComment) {
    const endCommentIndex = line.indexOf('*/');
    if (endCommentIndex !== -1) {
      // Found closing comment, return rest of line
      return line.substring(endCommentIndex + 2);
    } else {
      // Still in multi-line comment
      return '';
    }
  }

  // Handle opening multi-line comment on this line
  const startCommentIndex = line.indexOf('/*');
  if (startCommentIndex !== -1) {
    const endCommentIndex = line.indexOf('*/', startCommentIndex);
    if (endCommentIndex !== -1) {
      // Multi-line comment closed on same line
      return line.substring(0, startCommentIndex) + line.substring(endCommentIndex + 2);
    } else {
      // Multi-line comment starts here, continues to next lines
      return line.substring(0, startCommentIndex);
    }
  }

  // Handle single-line comments
  const singleCommentIndex = line.indexOf('//');
  if (singleCommentIndex !== -1) {
    return line.substring(0, singleCommentIndex);
  }

  return line;
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip excluded directories
      if (!EXCLUDED_DIRS.includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      // Only check TypeScript/TSX files
      if (CHECKED_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Check if line is a JSX comment
 */
function isJSXComment(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('{/*') || trimmed.startsWith('*/}') || trimmed.startsWith('<');
}

/**
 * Check file for violations
 */
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations = [];
  let inMultiLineComment = false;

  lines.forEach((line, lineNum) => {
    // Check for JSX comments
    if (isJSXComment(line)) {
      return;
    }

    // Strip comments from the line
    const lineWithoutComments = stripComments(line, inMultiLineComment);

    // Update multi-line comment state
    if (lineWithoutComments === '' && !inMultiLineComment) {
      return;
    }

    // Check if we entered a multi-line comment
    if (line.indexOf('/*') !== -1 && line.indexOf('*/', line.indexOf('/*')) === -1) {
      inMultiLineComment = true;
    }

    // Check if we exited a multi-line comment
    if (line.indexOf('*/') !== -1 && line.indexOf('/*') > line.indexOf('*/')) {
      inMultiLineComment = false;
    }

    // Skip empty lines after comment removal
    if (!lineWithoutComments.trim()) {
      return;
    }

    // Check for ternary operators
    const ternaryMatch = lineWithoutComments.match(TERNARY_PATTERN);
    if (ternaryMatch) {
      ternaryMatch.forEach(match => {
        violations.push({
          type: 'ternary',
          line: lineNum + 1,
          content: match.trim(),
          fullLine: line.trim()
        });
      });
    }

    // Check for Ukrainian text in strings (report full string, not individual words)
    const stringPattern = /(["'])(?:(?=(\\?))\2.)*?\1/g;
    const stringMatches = lineWithoutComments.match(stringPattern);

    if (stringMatches) {
      stringMatches.forEach(strMatch => {
        // Check if string contains Ukrainian text
        const hasUkrainian = UKRAINIAN_PATTERN.test(strMatch);

        if (hasUkrainian) {
          // Exclude certain patterns that are not user-facing:
          // - type attributes: type="something"
          // - aria-label attributes
          const isTypeAttr = /type\s*=\s*["'][\u0400-\u04FF]+["']/.test(lineWithoutComments);
          const isAriaLabel = /aria-[\w-]*\s*=\s*["'][\u0400-\u04FF]+["']/.test(lineWithoutComments);
          const isAltAttr = /alt\s*=\s*["'][\u0400-\u04FF]+["']/.test(lineWithoutComments);

          if (!isTypeAttr && !isAriaLabel && !isAltAttr) {
            violations.push({
              type: 'ukrainian',
              line: lineNum + 1,
              content: strMatch,
              fullLine: line.trim()
            });
          }
        }
      });
    }
  });

  return violations;
}

/**
 * Format violation message
 */
function formatViolation(filePath, violation) {
  const relativePath = path.relative(process.cwd(), filePath);

  if (violation.type === 'ternary') {
    return `${relativePath}:${violation.line}\n   ❌ Ternary operator: ${violation.content}`;
  } else {
    return `${relativePath}:${violation.line}\n   ❌ Hardcoded Ukrainian text: "${violation.content}"`;
  }
}

/**
 * Main validation function
 */
function validate() {
  console.log('🔍 Checking for hardcoded text and language ternary operators...\n');

  const srcDir = path.join(process.cwd(), 'src');

  // Check if src directory exists
  if (!fs.existsSync(srcDir)) {
    console.error('❌ Error: src directory not found');
    process.exit(1);
  }

  // Get all files to check
  const files = getAllFiles(srcDir);

  if (files.length === 0) {
    console.log('⚠️  No TypeScript/TSX files found in src directory');
    process.exit(0);
  }

  console.log(`📂 Checking ${files.length} files...\n`);

  let allViolations = [];

  // Check each file
  files.forEach(file => {
    const violations = checkFile(file);
    if (violations.length > 0) {
      violations.forEach(violation => {
        allViolations.push({
          file,
          violation
        });
      });
    }
  });

  // Report results
  if (allViolations.length === 0) {
    console.log('✅ i18n validation passed');
    console.log('No hardcoded text or language ternary operators found.\n');
    process.exit(0);
  } else {
    console.log(`❌ i18n validation failed\n`);
    console.log(`Found ${allViolations.length} violation${allViolations.length > 1 ? 's' : ''}:\n`);

    allViolations.forEach((item, index) => {
      console.log(`${index + 1}. ${formatViolation(item.file, item.violation)}\n`);
    });

    console.log('Run: npm run validate:i18n');
    console.log('Fix violations before committing.\n');
    process.exit(1);
  }
}

// Run validation
validate();
