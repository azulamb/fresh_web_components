import { BASE_NAME, SOURCE_DIR, STATIC_DIR } from './libs/constants.ts';
import {
  Plugin,
  PluginMiddleware,
  ResolvedFreshConfig,
} from '$fresh/server.ts';
import * as path from '$std/path/mod.ts';
import { build } from './libs/build.ts';
import { parseWebComponentsConfig } from './libs/config.ts';
import { template } from './libs/template.ts';
import { watcher } from './libs/watcher.ts';
import type {
  BundleConfig,
  GenerateWebComponentsTypesCallback,
  WebComponentsFullConfig,
  WebComponentsPluginConfig,
} from './types.d.ts';

async function prepareBuild(configJSONPath: string) {
  const config = await parseWebComponentsConfig(configJSONPath).catch(
    (error) => {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
      const config: WebComponentsFullConfig = {
        bundle: [],
        typesFile: BASE_NAME + '.d.ts',
        staticDir: STATIC_DIR,
        sourceDir: SOURCE_DIR,
        components: [],
        destinationDir: '',
        emitOptions: {},
      };

      // Generate empty config file.
      return Deno.writeTextFile(
        configJSONPath,
        JSON.stringify(config, null, 2),
      ).then(() => {
        return config;
      });
    },
  );

  const generatedCode = template(config);
  await Deno.writeTextFile(config.typesFile, generatedCode);

  return config;
}

function buildFileFunc(
  config: WebComponentsFullConfig | undefined,
  path: string,
) {
  if (config) {
    for (const bundle of config.bundle) {
      if (bundle.destination === path) {
        return () => {
          return build(config.sourceDir, config.staticDir, bundle);
        };
      }
    }
  }
  return undefined;
}

async function buildAllFiles(config: WebComponentsFullConfig) {
  for (const bundle of config.bundle) {
    await build(config.sourceDir, config.staticDir, bundle);
  }
  if (config.destinationDir) {
    try {
      await Deno.mkdir(config.destinationDir);
    } catch (error) {
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        throw error;
      }
    }
  }
  for (const component of config.components) {
    if (component.ignore) {
      continue;
    }
    await build(
      config.sourceDir,
      config.destinationDir,
      {
        entrypoint: component.file,
        destination: component.file.replace(/.ts$/, '.js'),
        components: [component.file],
        options: config.emitOptions,
      },
    );
  }
}

function sourceSearch(
  sourceDir: string,
  bundle: BundleConfig,
  files: string[],
) {
  const targets = [
    path.join(sourceDir, bundle.entrypoint),
  ];
  bundle.components.forEach((component) => {
    targets.push(path.join(sourceDir, component));
  });
  for (const file of files) {
    if (targets.includes(file)) {
      return true;
    }
  }
  return false;
}

function buildFromChangeFiles(
  config: WebComponentsFullConfig,
  files: string[],
  cache: Map<string, { content: string }>,
) {
  files = files.filter((file, index) => {
    return files.indexOf(file) === index &&
      (file.endsWith('.ts') || file.endsWith('.json'));
  });
  for (const bundle of config.bundle) {
    if (sourceSearch(config.sourceDir, bundle, files)) {
      build(config.sourceDir, config.staticDir, bundle).then((code) => {
        cache.set(bundle.destination, { content: code });
      });
    }
  }
}

interface WebComponentsPluginFullConfig {
  configPath: string;
  generateTypesCode: GenerateWebComponentsTypesCallback;
}

export function freshWebComponents(
  pluginConfig?: WebComponentsPluginConfig,
): Plugin {
  const baseConfig: WebComponentsPluginFullConfig = {
    configPath: pluginConfig?.configPath ||
      path.join(SOURCE_DIR, BASE_NAME + '.config.json'),
    generateTypesCode: pluginConfig?.generateTypesCode || template,
  };

  const cache = new Map<string, { content: string }>();
  let config: WebComponentsFullConfig | undefined = undefined;
  prepareBuild(baseConfig.configPath).then(
    (getConfig) => {
      config = getConfig;
    },
  );

  const middleware: PluginMiddleware = {
    path: '/',
    middleware: {
      handler: async (_request, context) => {
        const pathname = context.url.pathname;

        const build = buildFileFunc(config, pathname);

        if (!build) {
          return context.next();
        }

        let cached = cache.get(pathname);
        if (!cached) {
          try {
            if (!config) {
              config = await prepareBuild(baseConfig.configPath);
            }
            const code = await build();
            cached = { content: code };
            cache.set(pathname, cached);
          } catch (error) {
            console.error(error);
            return context.next();
          }
        }

        return new Response(cached!.content, {
          status: 200,
          headers: {
            'Content-Type': 'text/javascript',
            'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
          },
        });
      },
    },
  };

  const middlewares: Plugin['middlewares'] = [];

  return {
    name: 'fresh_web_components',
    configResolved: (freshConfig: ResolvedFreshConfig) => {
      // console.log('fresh_web_components: configResolved');
      if (freshConfig.dev) {
        middlewares.push(middleware);

        setTimeout(() => {
          prepareBuild(baseConfig.configPath).then((config) => {
            watcher(config.sourceDir, (files) => {
              buildFromChangeFiles(config, files, cache);
              return Promise.resolve();
            });
          });
        });
      }
    },
    middlewares,
    buildStart: async (freshConfig: ResolvedFreshConfig) => {
      // console.log('fresh_web_components: buildStart');
      const config = await prepareBuild(baseConfig.configPath);
      await buildAllFiles(config);
    },
  };
}
