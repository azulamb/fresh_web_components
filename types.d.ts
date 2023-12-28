import type { BundleOptions } from '$emit/mod.ts';

interface WebComponentsPluginConfig {
  configPath?: string; // Config JSON file path. Default is "web-components/web-components.config.json".
  generateTypesCode?: GenerateWebComponentsTypesCallback; // Generate types contents callback.
}

interface WebComponentInfo {
  name: string; // Component name.
  type?: string; // Component type. Default is "HTMLElement".
  ignore?: boolean; // Ignore when all build.
}

interface WebComponentsConfig {
  bundle?: string | {
    entrypoint: string; // Entrypoint file path. ex. "components.gen.ts".
    destination?: string; // Destination file path. ex. "components.js". Default is entrypoint.gen.ts -> entrypoint.js
    components: string[]; // Component names. ex. ["my-component"].
  }[]; // Default is "components.js".
  typesFile?: string; // Default is "web-components.d.ts".
  staticDir?: string; // Default is "static/".
  sourceDir?: string; // Default is "web-components/".
  components: {
    file: string;
    list: WebComponentInfo | WebComponentInfo[];
  }[];
  destinationDir?: string; // Build all components if set directory.
}

interface BundleConfig {
  entrypoint: string;
  destination: string;
  components: string[];
  options?: BundleOptions;
}

interface ComponentConfig {
  file: string;
  list: { name: string; type: string }[];
}

// Convert from WebComponentsConfig to WebComponentsFullConfig.
interface WebComponentsFullConfig {
  bundle: BundleConfig[];
  typesFile: string;
  staticDir: string;
  sourceDir: string;
  components: ComponentConfig[];
  destinationDir: string;
}

type GenerateWebComponentsTypesCallback = (
  config: WebComponentsFullConfig,
) => string;