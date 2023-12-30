Promise.all([
  new Promise((resolve, reject) => {
    const name = 'sample-header';
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
  Promise.resolve(document.currentScript),
]).then((results) => {
  const [name] = results;
  customElements.define(
    name,
    class extends HTMLElement {
      constructor() {
        super();
        const shadow = this.attachShadow({
          mode: 'open',
        });
        const style = document.createElement('style');
        style.innerHTML = [
          ':host { background: lightgray; }',
        ].join('');
        const contents = document.createElement('div');
        contents.innerHTML = '<header>Sample Header</header>';
        shadow.appendChild(style);
        shadow.appendChild(contents);
      }
    },
  );
});
Promise.all([
  new Promise((resolve, reject) => {
    const name = 'sample-footer';
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
  Promise.resolve(document.currentScript),
]).then((results) => {
  const [name] = results;
  customElements.define(
    name,
    class extends HTMLElement {
      constructor() {
        super();
        const shadow = this.attachShadow({
          mode: 'open',
        });
        const style = document.createElement('style');
        style.innerHTML = [
          ':host { background: lightgray; }',
        ].join('');
        const contents = document.createElement('div');
        contents.innerHTML = '<footer>Sample Footer</footer>';
        shadow.appendChild(style);
        shadow.appendChild(contents);
      }
    },
  );
});
