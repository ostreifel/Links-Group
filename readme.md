## vsts-extension-ts-seed-simple ##

Very simple seed project for developing VSTS extensions using Typescript. Utilizes Typescript, grunt, and tsd. Detailed explanation how to get started can be found at https://cschleiden.wordpress.com/2016/02/24/extending-vsts-setup/.

### Structure ###

```
/scripts            - Typescript code for extension
/img                - Image assets for extension and description
/typings            - Typescript typings

details.md          - Description to be shown in marketplace   
index.html          - Main entry point
vss-extension.json  - Extension manifest
```

### Version History ###

```
0.7.0 - Updated VSS SDK, moved from `typings` to `@types`
0.6.0 - Updated VSS SDK to M104
0.1.1 - Automatically increase extension's minor version when packaging.
```

### Usage ###

1. Clone the repository
1. `npm install` to install required local dependencies
2. `npm install -g gulp tfx-cli typescript tslint`
2. `gulp` to build and package the application

#### gulp ####

Three basic `gulp` tasks are defined:

* `build` - Compiles TS files in `scripts` folder
* `package` - Creates a developement vsix
* `package --release` - Creates a release vsix

#### Including framework modules ####

The VSTS framework is setup to initalize the requirejs AMD loader, so just use `import Foo = require("foo")` to include framework modules.

#### VS Code ####

The included `.vscode` config allows you to open and build the project using [VS Code](https://code.visualstudio.com/).

#### Unit Testing ####

The project is setup for unit testing using `mocha`, `chai`, and the `karma` test runner. A simple example unit test is included in `scripts/logic/messageHelper.tests.ts`. To run tests just execute:

```
grunt test
```
