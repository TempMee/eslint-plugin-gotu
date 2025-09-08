# gotu/no-missing-default-export

Detects when you try to import something as a default export, but the target file only has named exports.

## Rule Details

This rule helps catch import/export mismatches that are particularly common in JavaScript/JSX files where TypeScript's strict checking isn't available. It prevents runtime errors by catching these issues at lint time.

### Why This Rule Exists

**The Problem:**
```jsx
// File: PermanentPreview.tsx
export const PermanentPreview = ({ offer }) => {
  // Component implementation
};

// File: RenderPP.jsx
import Card from './PermanentPreview'; // ❌ Runtime error!
// Error: PermanentPreview has no default export
```

**The Solution:**
```jsx
// File: RenderPP.jsx  
import { PermanentPreview as Card } from './PermanentPreview'; // ✅ Works!
```

Standard ESLint and TypeScript can't catch this in `.jsx` files because they lack strict type checking for cross-file imports.

## Examples

### ❌ Incorrect

```jsx
// Target file has only named exports
export const MyComponent = () => <div>Hello</div>;
export const utils = { helper: () => {} };

// Trying to import as default (WRONG)
import MyComponent from './MyComponent';     // ❌ Error
import utils from './MyComponent';           // ❌ Error
```

### ✅ Correct

```jsx
// Target file has only named exports
export const MyComponent = () => <div>Hello</div>;
export const utils = { helper: () => {} };

// Use named imports (CORRECT)
import { MyComponent } from './MyComponent';           // ✅ Good
import { utils } from './MyComponent';                 // ✅ Good
import { MyComponent as Card } from './MyComponent';   // ✅ Good with alias
```

### ✅ When Default Export Exists

```jsx
// Target file has default export
const MyComponent = () => <div>Hello</div>;
export default MyComponent;

// Default import works fine (CORRECT)
import MyComponent from './MyComponent';     // ✅ Good
import Card from './MyComponent';            // ✅ Good with different name
```

## Configuration

### Default Configuration
```js
{
  "rules": {
    "gotu/no-missing-default-export": "error"
  }
}
```

### Rule Options

This rule has no additional options. It either detects the issue or it doesn't.

### Severity Levels

```js
{
  "rules": {
    "gotu/no-missing-default-export": "error"  // Fail build (recommended)
    "gotu/no-missing-default-export": "warn"   // Show warning only  
    "gotu/no-missing-default-export": "off"    // Disable rule
  }
}
```

## When This Rule Triggers

The rule triggers when **all** of these conditions are met:

1. ✅ You're using a **default import** syntax (`import Name from '...'`)
2. ✅ The import path is a **relative path** (starts with `./` or `../`)
3. ✅ The target file is a **code file** (`.js`, `.jsx`, `.ts`, `.tsx`)
4. ✅ The target file has **no default export**
5. ✅ The target file **does have named exports**

## When This Rule Does NOT Trigger

The rule ignores these cases:

- ❌ **Asset imports**: `import logo from './logo.png'`
- ❌ **Node modules**: `import react from 'react'`
- ❌ **Files with default exports**: Already working correctly
- ❌ **Non-existent files**: Let other tools handle this
- ❌ **Files with no exports**: Different issue

## Error Messages

### When Named Exports Are Available
```
Default import 'Card' not found. Available named exports: PermanentPreview, utils, helper
```

### When No Exports Are Available  
```
Default import 'Card' not found
```

## How to Fix

### Option 1: Use Named Import (Recommended)
```jsx
// Before
import Card from './PermanentPreview';

// After  
import { PermanentPreview } from './PermanentPreview';
```

### Option 2: Use Named Import with Alias
```jsx
// Before
import Card from './PermanentPreview';

// After
import { PermanentPreview as Card } from './PermanentPreview';
```

### Option 3: Add Default Export to Target File
```jsx
// In PermanentPreview.tsx
export const PermanentPreview = ({ offer }) => {
  // Component implementation
};

// Add this line
export default PermanentPreview;
```

**Note:** Option 1 or 2 is usually preferred to maintain explicit imports.

## Technical Details

### File Types Checked
- **Source files**: `.js`, `.jsx` (where you write the import)
- **Target files**: `.js`, `.jsx`, `.ts`, `.tsx` (where exports are checked)

### Export Detection
The rule detects these export patterns:

```js
// Default exports (what we're looking for)
export default MyComponent;
export default { key: 'value' };
export { MyComponent as default };

// Named exports (what triggers the error)
export const MyComponent = ...;
export function helper() { ... }
export class MyClass { ... }
export enum MyEnum { ... }
export { MyComponent, helper };
```

### Import Detection
The rule detects this import pattern:

```js
// Default import syntax (what triggers the check)
import MyComponent from './path';
import { named } from './path';  // ← This is ignored, only default imports checked
```

## Performance

- ✅ **Fast**: Only reads files when necessary
- ✅ **Smart**: Caches file reads and skips irrelevant files
- ✅ **Efficient**: Uses simple regex patterns for export detection

## Compatibility

- **ESLint**: `>=6.0.0`
- **File types**: `.js`, `.jsx`, `.ts`, `.tsx`
- **Editors**: VS Code, WebStorm, Sublime Text, Vim, Emacs (any ESLint-compatible editor)

## Related Rules

- **ESLint**: `import/no-unresolved` - Catches missing files
- **ESLint**: `import/named` - Catches missing named imports  
- **TypeScript**: Type checking - Catches similar issues in `.ts`/`.tsx` files

This rule fills the gap for `.jsx` files where TypeScript checking isn't available.

---

**Need help?** Check the main [plugin documentation](../README.md) or open an issue.
