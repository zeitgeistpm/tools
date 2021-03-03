# tools

![CI](https://github.com/zeitgeistpm/tools/workflows/CI/badge.svg)

Zeitgeist JavaScript libraries and tools.

## @zeitgeistpm/cli

The commandline interface that is built on top of `@zeitgeistpm/sdk`.

## @zeigeistpm/sdk

The main JavaScript library for interacting with the Zeitgeist network.

## Development

We develop the JavaScript libraries inside of this monorepo and use [Lerna](https://github.com/lerna/lerna) as a tool to help us manage it. This repository uses TypeScript and we do not commit the built JavaScript files. Instead, the files will be generated when we publish the NPM packages, or if called manually by the developer.

### Installing Dependencies

After cloning this monorepo to your local machine, you can use `yarn` to install the dependencies.

### Compiling TypeScript

You can use the `yarn compile` script to compile the TypeScript packages. Inside of each package directory (ex. `packages/cli`) there will be a `dist` folder containing the built files. These files are used when publishing the packages to NPM, but are ignored when committing code. So any changes made to the compiled files will be ignored, and instead you should always do development in the TypeScript source.

### Publishing to NPM

You will need access credentials to the `zeitgeistpm` organization on NPM. Once you have this, you are able to run the Lerna script `lerna publish` which will give you prompts for bumping up the version number and help you to publish a new version of the packages that have changed. By default, Lerna will only publish a new version for the packages that have been changed by checking the diff between the current files and the previous version.

### Testing

Running the tests can be done in two ways:

 - Using `lerna run test` will run the `test` script in each package. This is useful if you want to make sure all packages are passing the tests (for example, we run this script in the CI to make sure we don't introduce any regressions).
 - Using `yarn test` while located in the package you want to test. For example, if you want to test only the `sdk` package, you would first navigate to the package in cli (`cd packages/sdk`) and then run `yarn test`.
 