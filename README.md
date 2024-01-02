# fresh_web_components

## How to use.

- Add imports in `deno.json`.
  - `"$emit/": "https://deno.land/x/emit@0.32.0/"`
- Import this plugin in `fresh.config.ts`.
- Create `web-components/` directory.
- Exec `deno task build`.
  - Generate `web-components/web-components.config.json`.
- Edit `web-components.config.json`.
- Add your WebComponents in `web-components/`.
- Edit `routes/_app.tsx`.

### Add imports in `deno.json`.

```json
{
  "lock": false,
  "tasks": {
    "check": "deno fmt --check && deno lint && deno check **/*.ts && deno check **/*.tsx",
    "cli": "echo \"import '\\$fresh/src/dev/cli.ts'\" | deno run --unstable -A -",
    "manifest": "deno task cli manifest $(pwd)",
    "start": "deno run -A --watch=static/,routes/ dev.ts",
    "build": "deno run -A dev.ts build",
    "preview": "deno run -A main.ts",
    "update": "deno run -A -r https://fresh.deno.dev/update ."
  },
  "lint": {
    "rules": {
      "tags": [
        "fresh",
        "recommended"
      ]
    }
  },
  "exclude": [
    "**/_fresh/*"
  ],
  "imports": {
    "$fresh/": "https://deno.land/x/fresh@1.6.1/",
    "preact": "https://esm.sh/preact@10.19.2",
    "preact/": "https://esm.sh/preact@10.19.2/",
    "@preact/signals": "https://esm.sh/*@preact/signals@1.2.1",
    "@preact/signals-core": "https://esm.sh/*@preact/signals-core@1.5.0",
    "$std/": "https://deno.land/std@0.208.0/",
    "$emit/": "https://deno.land/x/emit@0.32.0/" // Add this imports.
  },
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}
```

### Import this plugin in `fresh.config.ts`.

```ts
import { defineConfig } from '$fresh/server.ts';
import { freshWebComponents } from 'https://raw.githubusercontent.com/azulamb/fresh_web_components/main/plugin.ts'; // Add

export default defineConfig({
  plugins: [
    freshWebComponents(), // Add
  ],
});
```

### Edit `web-components.config.json`.

### Edit `routes/_app.tsx`.

```ts
import { type PageProps } from '$fresh/server.ts';
export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>sample</title>
        <link rel='stylesheet' href='/styles.css' />
        <script src='/components.js'></script>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
```

## Custom

### Base config. (Code.)

```ts
export default defineConfig({
  plugins: [
    freshWebComponents({
      configPath: 'web-components/web-components.config.json', // Default load config path.
      generateTypesCode: (config: WebComponentsFullConfig) => {
        return ''; // Generate types contents.
      },
    }),
  ],
});
```

### Plugin config. (JSON file.)

```ts
{
  bundle?: string | {
    entrypoint: string; // Entrypoint file path. ex. "components", "components.gen.ts".
    destination?: string; // Destination file path. ex. "components.js". Default is [entrypoint].gen.ts -> [entrypoint].js
    components: string[]; // Component names. Default is "*". ex. ["my-component"].
    options?: BundleOptions; // Emit option. (Overwrite base emit options.)
  }[]; // Default is "components.js".
  typesFile?: string; // Default is "web-components.d.ts".
  staticDir?: string; // Default is "static/".
  sourceDir?: string; // Default is "web-components/".
  components: {
    file: string;
    list: { name: string; type: string }[];
    ignore?: boolean; // Ignore when all build.
  }[];
  destinationDir?: string; // Build all components if set directory.
  emitOptions?: BundleOptions; // Base emit options.
}
```

## Sample build

```
deno run -A -r https://fresh.deno.dev sample
```
