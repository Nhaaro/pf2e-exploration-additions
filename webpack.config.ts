/* eslint-disable */
import * as fs from "fs-extra";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import globImporter from "node-sass-glob-importer";
import path, { join, resolve } from "path";
import { sync } from "glob";

/// <reference path="node_modules/webpack-dev-server/types/lib/Server.d.ts"/>
import type { Configuration } from "webpack";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";

const allTemplates = () => {
  return sync("**/*.hbs", { cwd: join(__dirname, "static/templates") })
    .map((file) => `"modules/template/templates/${file}"`)
    .join(", ");
};

const [outDir, foundryUri] = ((): [string, string] => {
  const configPath = resolve(process.cwd(), "foundryconfig.json");
  const config = fs.readJSONSync(configPath, { throws: false });
  const outDir =
    config instanceof Object
      ? path.join(
          config.dataPath,
          "Data",
          "modules",
          config.systemName ?? "pf2e-exploration-additions"
        )
      : path.join(__dirname, "dist/");
  const foundryUri =
    (config instanceof Object ? String(config.foundryUri ?? "") : null) ||
    "http://localhost:30000";
  return [outDir, foundryUri];
})();

export default (env: Configuration) => {
  const defaults: Configuration = {
    watch: false,
    mode: "development",
  };

  const environment = { ...defaults, ...env };
  const isDevelopment = environment.mode === "development";

  const devServer: DevServerConfiguration = {
    hot: true,
    proxy: [
      {
        context: (pathname) => {
          return !pathname.match("^/sockjs");
        },
        target: "http://localhost:30000",
        ws: true,
      },
    ],
    devMiddleware: {
      writeToDisk: true,
    },
  };
  const config: Configuration = {
    entry: "./src/scripts/module.ts",
    watch: environment.watch,
    devtool: "inline-source-map",
    stats: "minimal",
    mode: environment.mode,
    resolve: {
      alias: {
        "@actor": path.resolve(__dirname, "types/src/module/actor"),
        "@item": path.resolve(__dirname, "types/src/module/item"),
        "@module": path.resolve(__dirname, "types/src/module"),
        "@scene": path.resolve(__dirname, "types/src/module/scene"),
        "@scripts": path.resolve(__dirname, "types/src/scripts"),
        "@system": path.resolve(__dirname, "types/src/module/system"),
        "@util": path.resolve(__dirname, "types/src/util"),
      },
      extensions: [".wasm", ".mjs", ".ts", ".js", ".json"],
    },
    output: {
      filename: "./scripts/module.js",
      path: outDir,
      publicPath: "",
      clean: true,
    },
    devServer,
    module: {
      rules: [
        isDevelopment
          ? {
              test: /\.hbs/,
              loader: "raw-loader",
            }
          : {
              test: /\.hbs/,
              loader: "null-loader",
            },
        {
          test: /\.ts$/,
          use: [
            "ts-loader",
            "webpack-import-glob-loader",
            "source-map-loader",
            {
              loader: "string-replace-loader",
              options: {
                search: '"__ALL_TEMPLATES__"',
                replace: allTemplates,
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                sourceMap: isDevelopment,
                url: false,
              },
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: isDevelopment,
                sassOptions: {
                  importer: globImporter(),
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new ESLintPlugin({
        extensions: ["ts"],
      }),
      new CopyPlugin({
        patterns: [
          {
            from: "UNLICENSE",
            noErrorOnMissing: true,
          },
          {
            from: "README.md",
            noErrorOnMissing: true,
          },
          {
            from: "static",
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
  };

  if (!isDevelopment) {
    delete config.devtool;
  }

  return config;
};
