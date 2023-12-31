import type { BundleOptions } from '$emit/mod.ts';

// JSON config file format.
interface WebComponentsConfig {
  bundle?: string | {
    entrypoint: string; // Entrypoint file path. ex. "components", "components.gen.ts".
    destination?: string; // Destination file path. ex. "components.js". Default is [entrypoint].gen.ts -> [entrypoint].js
    components: string[]; // Component names. ex. ["my-component"].
    options?: BundleOptions; // Emit option. (Overwrite base emit options.)
  }[]; // Default is "components.js".
  typesFile?: string; // Default is "web-components.d.ts".
  staticDir?: string; // Default is "static/".
  sourceDir?: string; // Default is "web-components/".
  components: ComponentConfig[];
  destinationDir?: string; // Build all components if set directory.
  emitOptions?: BundleOptions; // Base emit options.
}

// Convert from WebComponentsConfig to WebComponentsFullConfig.
interface WebComponentsFullConfig {
  bundle: BundleConfig[];
  typesFile: string;
  staticDir: string;
  sourceDir: string;
  components: ComponentConfig[];
  destinationDir: string;
  emitOptions: BundleOptions;
}

// Plugin config.
interface WebComponentsPluginConfig {
  configPath?: string; // Config JSON file path. Default is "web-components/web-components.config.json".
  generateTypesCode?: GenerateWebComponentsTypesCallback; // Generate types contents callback.
}

// Sub type.

interface WebComponentInfo {
  name: string; // Component name.
  type?: string; // Component type. Default is "HTMLElement".
}

interface ComponentConfig {
  file: string;
  list: { name: string; type: string }[];
  ignore?: boolean; // Ignore when all build.
}

interface BundleConfig {
  entrypoint: string;
  destination: string;
  components: string[];
  options: BundleOptions;
}

type GenerateWebComponentsTypesCallback = (
  config: WebComponentsFullConfig,
) => string;
