# screeps-typescript

This is a typescript template for [screeps](https://screeps.com).

---

# Requirements

- [NodeJS](https://nodejs.org/)
- a node package manager (`npm`, `pnpm`, `yarn`, etc.)

# Setup

1. Clone this repository

2. Install the requirements
```shell
# npm
npm install

# pnpm
pnpm install

# yarn
yarn
```

---

# Building

To build the project run the `build` script with your preferred runner (like `npm`, `pnpm`, etc.).
A `watch` script is available as well

The compiled output will be available in [`dist/main.js`](./dist/main.js)

Additionally there are two push scripts: `push-main` and `push-local`.
To use them you need to rename the [`example.screeps.json`](./example.screeps.json) to `screeps.json` and add the required tokens.

- `push-main` will compile and then push your code to the main screeps server
- `push-local` will do the same for localhost

You can add more configurations to the `screeps.json` file.
To push to other configurations either add `--environment DEST:{key}` after the `build` script
where `{key}` is the object key in the configuration file or add another script to the `package.json` file.
(`main` for main screeps server, `localhost` for local server, etc.)


---

# Main loop

The main loop is found in [`src/index.ts`](./src/index.ts)

All imports from local files need to use the `.ts` extension in the path.

# Prototypes

Put prototypes into `src/prototypes/...` and add an import to [`src/prototypes/_all.ts`](./src/prototypes/_all.ts)

Put prototype type definitions either into [`src/types.d.ts`](./src/types.d.ts) or into the respective prototype file

You can see an exmaple in [`src/prototypes/Creep.ts`](./src/prototypes/Creep.ts)

# Util

There are utilities available in [`src/util`](./src/util) if you need any.
You can import them directly or from the [`src/util/_all.ts`](./src/util/_all.ts) as they are re-exported there as well.

- error code mapping

---

This template was inspired by [`screepers/screeps-typescript-starter`](https://github.com/screepers/screeps-typescript-starter)
