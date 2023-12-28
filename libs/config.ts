import { BASE_NAME, SOURCE_DIR, STATIC_DIR } from './constants.ts';
import * as path from '$std/path/mod.ts';
import type {
  BundleConfig,
  ComponentConfig,
  WebComponentsConfig,
  WebComponentsFullConfig,
} from '../types.d.ts';

function parseComponents(config: WebComponentsConfig) {
  if (!Array.isArray(config.components)) {
    throw new Error('Invalid components: Not array.');
  }

  const components: ComponentConfig[] = [];
  config.components.forEach((component) => {
    if (typeof component !== 'object') {
      return;
    }
    if (typeof component.file !== 'string') {
      return;
    }
    const data: ComponentConfig = {
      file: component.file,
      list: [],
    };
    const list = Array.isArray(component.list)
      ? component.list
      : [component.list];
    for (const item of list) {
      if (typeof item !== 'object' || typeof item.name !== 'string') {
        continue;
      }
      data.list.push({
        name: item.name,
        type: (typeof item.type === 'string' ? item.type : '') || 'HTMLElement',
      });
    }
    components.push(data);
  });

  return components;
}

function createPath(entryPoint?: string): string {
  entryPoint = entryPoint || BASE_NAME + '.gen.ts';
  if (entryPoint.match(/^\//)) {
    return entryPoint;
  }
  return '/' + entryPoint;
}

function parseBundle(config: WebComponentsConfig): BundleConfig[] {
  const bundles: BundleConfig[] = [];

  if (typeof config.bundle === 'string') {
    const entrypoint = createPath(config.bundle);
    bundles.push({
      entrypoint: entrypoint,
      destination: entrypoint.replace(/(\.gen)\.ts$/, '.js'),
      components: ['*'],
    });
  } else if (Array.isArray(config.bundle)) {
    for (const bundle of config.bundle) {
      if (typeof bundle !== 'object') {
        continue;
      }
      if (typeof bundle.entrypoint !== 'string') {
        continue;
      }
      const entrypoint = createPath(bundle.entrypoint);
      const destination = bundle.destination
        ? createPath(bundle.destination)
        : entrypoint.replace(/(\.gen)\.ts$/, '.js');
      if (typeof bundle.components === 'string') {
        bundles.push({
          entrypoint: entrypoint,
          destination: destination,
          components: [bundle.components],
        });
      } else if (Array.isArray(bundle.components)) {
        bundles.push({
          entrypoint: entrypoint,
          destination: destination,
          components: bundle.components,
        });
      }
    }
  }

  if (bundles.length <= 0) {
    const entrypoint = createPath(BASE_NAME + '.gen.ts');
    bundles.push({
      entrypoint: entrypoint,
      destination: entrypoint.replace(/(\.gen)\.ts$/, '.js'),
      components: ['*'],
    });
  }

  return bundles;
}

function componentsToPosition(config: WebComponentsFullConfig) {
  const components: Record<string, number> = {};
  for (let i = 0; i < config.components.length; ++i) {
    const component = config.components[i];
    for (const item of component.list) {
      components[item.name] = i;
    }
  }

  return components;
}

function convertBundleComponentsToFileList(
  bundle: BundleConfig,
  config: WebComponentsFullConfig,
): BundleConfig {
  const componentsPosition = componentsToPosition(config);

  const files: string[] = [];
  for (const component of bundle.components) {
    if (component === '*') {
      for (const component of config.components) {
        const file = component.file;
        if (!files.includes(file)) {
          files.push(file);
        }
      }
    } else if (typeof componentsPosition[component] === 'number') {
      const file = config.components[componentsPosition[component]].file;
      if (!files.includes(file)) {
        files.push(file);
      } else {
        console.warn(`Duplicate component: ${component}`);
      }
    } else {
      console.warn(`Unknown component: ${component}`);
    }
  }

  bundle.components = files;
  return bundle;
}

function createFilePath(file: string): string {
  return path.join(Deno.cwd(), file);
}

export async function parseWebComponentsConfig(
  configJSONPath: string,
): Promise<WebComponentsFullConfig> {
  const config = JSON.parse(
    await Deno.readTextFile(configJSONPath),
  ) as WebComponentsConfig;
  const fullConfig: WebComponentsFullConfig = {
    bundle: [],
    typesFile: BASE_NAME + '.d.ts',
    staticDir: STATIC_DIR,
    sourceDir: SOURCE_DIR,
    components: [],
    destinationDir: '',
  };

  try {
    fullConfig.components = parseComponents(config);
  } catch (error) {
    throw new Error(`${error.message} found in ${configJSONPath}`);
  }

  if (typeof config.staticDir === 'string') {
    fullConfig.staticDir = config.staticDir;
  }
  fullConfig.staticDir = createFilePath(fullConfig.staticDir);

  if (typeof config.sourceDir === 'string') {
    fullConfig.sourceDir = config.sourceDir;
  }
  fullConfig.sourceDir = createFilePath(fullConfig.sourceDir);

  if (typeof config.destinationDir === 'string') {
    fullConfig.destinationDir = createFilePath(fullConfig.destinationDir);
  }

  if (typeof config.typesFile === 'string' && config.typesFile) {
    fullConfig.typesFile = config.typesFile;
  }

  fullConfig.bundle = parseBundle(config).map((bundle) => {
    return convertBundleComponentsToFileList(bundle, fullConfig);
  });

  return fullConfig;
}
