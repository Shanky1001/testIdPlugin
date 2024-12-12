# testIdPlugin

A Babel plugin to automatically inject `data-testid` attributes into JSX elements for testing purposes. This plugin works with React and TypeScript projects, ensuring that all relevant elements have unique and consistent `data-testid` attributes, making it easier to write tests with libraries like Jest, Testing Library, or Cypress.

## Features

- Automatically adds `data-testid` attributes to JSX elements.
- Supports `prefix` to customize the generated test IDs.
- Propagates parent `data-testid` values for nested elements.
- Skips elements that already have a `data-testid` attribute.
- Handles Material-UI component names, converting them to HTML elements when necessary.
- Supports JSX and TSX files.

## Installation

To install this plugin, use npm or yarn:

```bash
npm install testIdPlugin --save-dev
```

or

```bash
yarn add testIdPlugin --dev
```

## Configuration

You can configure the plugin by adding it to your Babel configuration (`babel.config.js` or `.babelrc`).

### Example Configuration

```js
// babel.config.js
module.exports = {
  presets: [
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'testIdPlugin',
      {
        prefix: 'my-prefix-',    // Optional: Set a custom prefix for test IDs
        include: ['src/**/*'],    // Optional: Glob pattern to include files for transformation
        exclude: ['node_modules/**'], // Optional: Glob pattern to exclude files from transformation
      },
    ],
  ],
};
```

### Plugin Options

- **`prefix`** (optional): A string to prefix all `data-testid` values. Default is an empty string.
- **`include`** (optional): An array of file paths or glob patterns to specify which files to include for transformation. Default is all files.
- **`exclude`** (optional): An array of file paths or glob patterns to specify which files to exclude from transformation. Default is no exclusion.

## How It Works

- The plugin works by traversing the JSX elements in your code and checking if they already have a `data-testid` attribute.
- If not, it generates a unique `data-testid` for each element by combining its parent element's `data-testid`, its own tag name, and a sibling index to ensure uniqueness.
- The plugin also handles Material-UI components, such as `Box`, `Typography`, and others, mapping them to their corresponding native HTML elements (e.g., `div`, `span`).
  
### Example:

Given the following JSX:

```tsx
function MyComponent() {
  return (
    <div>
      <Typography>
        <FormControlLabel />
      </Typography>
    </div>
  );
}
```

The plugin would transform it to:

```tsx
function MyComponent() {
  return (
    <div data-testid="div">
      <span data-testid="div-typography">
        <label data-testid="div-typography-label" />
      </span>
    </div>
  );
}
```

### Customizing the Generated Test IDs

- The generated test ID combines the `data-testid` of the parent element, the element's tag name, and a sibling index to ensure uniqueness.
- Example format: `"parentTestId-elementName-siblingIndex"`.

If a parent `data-testid` is present, the plugin will propagate it to child elements.

## Example Project Setup

1. Create a `babel.config.js` file in your project root.

```bash
touch babel.config.js
```

2. Add the following configuration to the `babel.config.js` file:

```js
module.exports = {
  presets: [
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'testIdPlugin',
      {
        prefix: 'test-',    // Optional: Custom prefix for test IDs
      },
    ],
  ],
};
```

3. Run Babel to transform your JSX/TSX files:

```bash
npx babel src --out-dir dist
```

4. Your JSX files will now include `data-testid` attributes.

## Development

To contribute to this plugin, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/your-username/testIdPlugin.git
cd testIdPlugin
```

2. Install dependencies:

```bash
npm install
```

3. Make changes and test the plugin.

4. To publish a new version, run:

```bash
npm version patch # or minor/major
npm publish
```

## License

This plugin is open-source software, licensed under the [MIT License](LICENSE).

### Explanation:

- **Installation**: Provides the necessary commands to install the plugin using npm or yarn.
- **Configuration**: Describes how to configure Babel to use the plugin with the proper options (`prefix`, `include`, `exclude`).
- **How It Works**: Describes the main functionality of the plugin—injecting `data-testid` attributes.
- **Example**: Provides an example of JSX code before and after transformation.
- **Development**: Guides for developers who want to contribute to the plugin or build it locally.

Let me know if you need further refinements!