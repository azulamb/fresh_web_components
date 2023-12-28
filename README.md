# fresh_web_components

## How to use.

- Import this plugin.
- Add your WebComponents in `web-components/` .

### fresh.config.ts

```ts
import { defineConfig } from '$fresh/server.ts';
import { freshWebComponents } from 'https://raw.githubusercontent.com/azulamb/fresh_web_components/main/plugin.ts'; // Add

import.meta.url;
export default defineConfig({
  plugins: [
    freshWebComponents(), // Add
  ],
});
```

## Custom

### Base config. (Code.)

### Plugin config. (JSON file.)

## Sample build

```
deno run -A -r https://fresh.deno.dev sample
```
