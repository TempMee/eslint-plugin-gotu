/* eslint-disable  */
const fs = require('fs');
const path = require('path');

/**
 * ESLint plugin to detect missing default exports in JS/JSX files
 * Shows errors directly in your text editor
 */

// Helper functions
function hasDefaultExport(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    return (
      /export\s+default\s+/.test(content) ||
      /export\s*{\s*\w+\s+as\s+default\s*}/.test(content)
    );
  } catch {
    return false;
  }
}

function getNamedExports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const exports = new Set();

    // Match: export { name1, name2 }
    const namedExportRegex = /export\s*\{\s*([^}]+)\s*\}/g;
    let match;
    while ((match = namedExportRegex.exec(content)) !== null) {
      match[1].split(',').forEach((name) => {
        const cleanName = name
          .trim()
          .split(/\s+as\s+/)[0]
          .trim();
        if (cleanName) exports.add(cleanName);
      });
    }

    // Match: export const/function/class/enum name
    const declRegex = /export\s+(?:const|let|var|function|class|enum)\s+(\w+)/g;
    while ((match = declRegex.exec(content)) !== null) {
      exports.add(match[1]);
    }

    return Array.from(exports);
  } catch {
    return [];
  }
}

function resolveImport(importPath, fromFile) {
  if (!importPath.startsWith('.')) return null;

  const fromDir = path.dirname(fromFile);
  const resolved = path.resolve(fromDir, importPath);

  for (const ext of ['', '.js', '.jsx', '.ts', '.tsx']) {
    const fullPath = resolved + ext;
    if (fs.existsSync(fullPath)) return fullPath;
  }

  return null;
}

function isAssetImport(importPath) {
  return (
    /\.(png|jpg|jpeg|gif|svg|ico|webp)$/i.test(importPath) ||
    importPath.includes('/assets/') ||
    importPath.includes('/images/') ||
    importPath.includes('/icons/')
  );
}

// ESLint rule
const noMissingDefaultExport = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Detect default imports when target file has no default export',
      category: 'Possible Errors',
      recommended: false,
    },
    fixable: null,
    schema: [],
    messages: {
      noDefaultExport:
        "Default import '{{importName}}' not found. Available named exports: {{namedExports}}",
      noDefaultExportSimple: "Default import '{{importName}}' not found",
    },
  },

  create(context) {
    return {
      ImportDefaultSpecifier(node) {
        const importDeclaration = node.parent;
        const importPath = importDeclaration.source.value;
        const importName = node.local.name;

        // Skip asset imports
        if (isAssetImport(importPath)) return;

        const currentFile = context.getFilename();
        const resolvedPath = resolveImport(importPath, currentFile);

        if (!resolvedPath) return;

        // Only check JS/JSX/TS/TSX files for exports
        if (!/\.(js|jsx|ts|tsx)$/.test(resolvedPath)) return;

        if (!hasDefaultExport(resolvedPath)) {
          const namedExports = getNamedExports(resolvedPath);

          if (namedExports.length > 0) {
            context.report({
              node,
              messageId: 'noDefaultExport',
              data: {
                importName,
                namedExports: namedExports.join(', '),
              },
            });
          } else {
            context.report({
              node,
              messageId: 'noDefaultExportSimple',
              data: {
                importName,
              },
            });
          }
        }
      },
    };
  },
};

module.exports = noMissingDefaultExport;