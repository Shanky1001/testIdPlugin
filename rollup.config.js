import babel from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";
export default {
  input: "index.ts", // The entry point of your package
  output: [
    {
      file: "dist/index.js", // Output file
      format: "cjs", // CommonJS module format for npm
      sourcemap: true, // Source maps for debugging
    },
    {
      file: "dist/index.esm.js", // Optional: Output as ESM
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    typescript(),
    babel({
      babelHelpers: "bundled",
      presets: ["@babel/preset-react", "@babel/preset-typescript"],
    }),
  ],
  external: ["react", "@babel/core"], // Ensure peer dependencies are not bundled
};
