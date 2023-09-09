# template js
A template for *dependency* JS modules -- modules intended to be a dependency of application code.

## use
1. Use the *template* button in github. Or clone this then `rm -rf .git && git init`. Then `npm i && npm init`.

2. Edit the source code in `src/index.js`.

## featuring
* compile the source to both ESM and CJS format, and put compiled files in `dist`.
* ignore `dist` in git, but don't ignore it in npm. That way we don't commit any compiled code to git, but it is available to consumers.
* use npm's `prepublishOnly` hook to compile the code before publishing to npm.
* use `exports` field in `package.json` to make sure the right format is used by consumers.
* `preversion` npm hook -- use `@nichoth/check-max-deps` to validate the number of dependencies, and lint via `standardx`.
* eslint via [standardx](https://www.npmjs.com/package/standardx) -- `npm run lint`
