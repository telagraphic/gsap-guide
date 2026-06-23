# Sample playground project

Reference layout for v3: **one `script.js`** with runner, `define()`, `discover()`, and `attach()`.

Demonstrates all three workflows on one page:

| Instance id | Workflow | How config is created |
|-------------|----------|------------------------|
| `cold-start-lines` | **1 — Cold start** | `discover()` scaffold only (not in `define()`) |
| `imported-paragraph` | **2 — Import** | `define()` entry simulates post–Import Apply state |
| `config-header` | **3 — Config** | `define()` with hand-written config |

Also shows **coexistence**: footer copy has no `data-playground` (production spaghetti would target it separately).

## Run

From `split-text/`:

```bash
./serve.sh
```

Open: `playground-v2/examples/sample-playground/index.html`

Press **⌘K** to open the panel. Switch instances via dropdown (v3) or URL:

`?playground=imported-paragraph`

## Files

```
sample-playground/
├── index.html    # markup + data-playground only
├── styles.css    # layout / typography vars
└── script.js     # runner + define + discover + attach (all-in-one)
```

## Note on v2 vs v3

The plugin will expose `SplitTextPlaygroundV2.define`, `.discover`, and registry `attach()`.  
This sample implements those APIs **locally in `script.js`** until v3 lands; then move the bootstrap block into the plugin and keep only `define()` configs + `attach()` call in `script.js`.
