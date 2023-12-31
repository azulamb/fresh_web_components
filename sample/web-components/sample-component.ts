export interface SampleComponent extends HTMLElement {
}

Promise.all([
  new Promise<string>((resolve, reject) => {
    const name = 'sample-component';
    if (customElements.get(name)) {
      return reject(new Error(`Defined: ${name}`));
    }
    if (document.readyState !== 'loading') {
      return resolve(name);
    }
    document.addEventListener('DOMContentLoaded', () => {
      resolve(name);
    });
  }),
  Promise.resolve(<HTMLScriptElement> document.currentScript),
]).then((results) => {
  const [name] = results;
  customElements.define(
    name,
    class extends HTMLElement implements SampleComponent {
      constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.innerHTML = [
          ':host { background: lightgray; }',
        ].join('');

        const contents = document.createElement('div');
        contents.appendChild(document.createElement('slot'));

        shadow.appendChild(style);
        shadow.appendChild(contents);
      }
    },
  );
});
