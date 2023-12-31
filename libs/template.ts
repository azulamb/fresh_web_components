import type { WebComponentsFullConfig } from '../types.d.ts';

export function template(config: WebComponentsFullConfig) {
  const components = config.components;
  // prettier-ignore
  return `import type { JSXInternal } from 'preact/src/jsx.d.ts';
${
    components.map((item) => {
      return `import type { ${
        item.list.map((item) => {
          return item.type;
        }).join(', ')
      } } from '${item.file}';`;
    }).join('\n')
  }

declare global {
  namespace preact.createElement.JSX {
    interface IntrinsicElements {
${
    components.map((item) => {
      return item.list.map((item) => {
        return `      ['${item.name}']: JSXInternal.HTMLAttributes<${item.type}>;`;
      }).join('\n');
    }).join('\n')
  }
    }
  }
}
`;
}
