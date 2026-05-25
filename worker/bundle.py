#!/usr/bin/env python3
"""
Manual bundler for the Cloudflare Worker.
Reads all TS source files, strips type annotations, resolves local imports,
inlines Hono from its pre-built ESM dist, and writes a single worker.js.
"""

import re, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(BASE, "src")
HONO = os.path.join(BASE, "node_modules", "hono", "dist")
OUT  = os.path.join(BASE, "worker-bundle.js")

# ── helpers ──────────────────────────────────────────────────────────────────

def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()

def strip_types(src):
    """Very lightweight TS→JS: remove type imports/exports and type annotations."""
    # Remove `import type ...` lines
    src = re.sub(r'^import\s+type\s+.*?;\s*$', '', src, flags=re.MULTILINE)
    # Remove `export type ...` lines
    src = re.sub(r'^export\s+type\s+\{[^}]*\}\s*;?\s*$', '', src, flags=re.MULTILINE)
    src = re.sub(r'^export\s+type\s+\w+\s*=.*?;\s*$', '', src, flags=re.MULTILINE | re.DOTALL)
    # Remove type parameters <T extends ...> from function signatures (simple cases)
    src = re.sub(r'<[A-Z][A-Za-z0-9,\s\[\]{}|&?:=.]*>', lambda m: '' if len(m.group()) < 80 else m.group(), src)
    # Remove `: TypeName` parameter/variable annotations (simple)
    src = re.sub(r':\s*(?:string|number|boolean|void|never|unknown|any|null|undefined)\b', '', src)
    # Remove `as string`, `as number` etc casts
    src = re.sub(r'\s+as\s+(?:string|number|boolean|unknown|any)\b', '', src)
    return src

# ── load hono modules ─────────────────────────────────────────────────────────

def load_hono_module(subpath):
    """Load a hono dist ESM file, stripping its own exports for inlining."""
    p = os.path.join(HONO, subpath)
    if not os.path.exists(p):
        # try index.js
        p = os.path.join(HONO, subpath.replace('.js',''), 'index.js')
    return read(p)

# ── resolve local imports ─────────────────────────────────────────────────────

visited = set()
chunks  = []

def process_file(filepath):
    if filepath in visited:
        return
    visited.add(filepath)

    src = read(filepath)
    dir_ = os.path.dirname(filepath)

    # Find local imports and process them first (depth-first)
    local_imports = re.findall(r'''from\s+['"](\./[^'"]+|\.\.\/[^'"]+)['"]''', src)
    for imp in local_imports:
        # resolve path
        candidate = os.path.normpath(os.path.join(dir_, imp))
        for ext in ['', '.ts', '/index.ts']:
            full = candidate + ext
            if os.path.exists(full) and full not in visited:
                process_file(full)
                break

    chunks.append(f"\n// ── {os.path.relpath(filepath, BASE)} ──\n")
    chunks.append(src)

# ── main ──────────────────────────────────────────────────────────────────────

print("Bundling worker source files...")

# Process entry point (will recursively pull in deps)
process_file(os.path.join(SRC, "index.ts"))

combined = "\n".join(chunks)

# Remove all local import/export statements (they're now inlined)
combined = re.sub(r'^import\s+.*?from\s+[\'"]\.\.?\/[^\'"]+[\'"].*?;\s*$', '', combined, flags=re.MULTILINE)
combined = re.sub(r'^export\s+\{[^}]*\}\s*;?\s*$', '', combined, flags=re.MULTILINE)

# Strip TypeScript types
combined = strip_types(combined)

# Now handle hono imports - replace with actual hono ESM content
# We'll load hono's pre-built bundle
hono_index = read(os.path.join(HONO, "index.js"))
hono_cors  = read(os.path.join(HONO, "middleware", "cors", "index.js"))

# Replace hono imports with inline versions
combined = re.sub(r'^import\s+\{([^}]+)\}\s+from\s+[\'"]hono[\'"].*?;\s*$', '', combined, flags=re.MULTILINE)
combined = re.sub(r'^import\s+\{([^}]+)\}\s+from\s+[\'"]hono\/cors[\'"].*?;\s*$', '', combined, flags=re.MULTILINE)
combined = re.sub(r'^import\s+\{([^}]+)\}\s+from\s+[\'"]hono\/[^\'"]+[\'"].*?;\s*$', '', combined, flags=re.MULTILINE)

# Write final bundle
with open(OUT, "w", encoding="utf-8") as f:
    f.write("// AUTO-GENERATED BUNDLE - DO NOT EDIT\n")
    f.write("// Hono ESM\n")
    f.write(hono_index)
    f.write("\n// Hono CORS middleware\n")
    f.write(hono_cors)
    f.write("\n// Worker source\n")
    f.write(combined)

print(f"Written to {OUT} ({os.path.getsize(OUT)} bytes)")
