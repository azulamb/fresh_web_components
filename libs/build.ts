import { bundle } from '$emit/mod.ts';
import * as path from '$std/path/mod.ts';
import type { BundleConfig } from '../types.d.ts';

export const build = (() => {
  let building: null | Promise<string> = null;

  async function build(
    sourceDir: string,
    destinationDir: string,
    config: BundleConfig,
  ): Promise<string> {
    // console.log(`fresh_web_components: build(${new Date()})`);

    const entrypoint = path.join(sourceDir, config.entrypoint);

    if (entrypoint.match(/\.gen\.ts$/)) {
      await Deno.writeTextFile(
        entrypoint,
        config.components.map((file) => {
          return `import {} from '${file}';`;
        }).join('\n') + '\n',
      );
    }
    const { code } = await bundle(entrypoint);

    if (config.destination) {
      await Deno.writeTextFile(
        path.join(destinationDir, config.destination),
        code,
      );
    }

    building = null;
    return code;
  }

  return (
    sourceDir: string,
    destinationDir: string,
    config: BundleConfig,
  ): Promise<string> => {
    if (building) {
      return building;
    }

    building = build(sourceDir, destinationDir, config).catch((error) => {
      building = null;
      throw error;
    });
    return building;
  };
})();
