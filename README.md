# screeps-typescript

This is a typescript template for [screeps](https://screeps.com) and [bun](https://bun.sh/)

---

# Requirements

- [bun](https://bun.sh/)

# Setup

1. Clone this repository

2. Install the requirements
```shell
$ bun install
```

---

# Building

To build the project run the `build` script
```shell
$ bun run build
```
A `watch` script is available as well

The compiled output will be available in [`dist/main.js`](./dist/main.js)

---

# Main loop

The main loop is found in [`src/index.ts`](./src/index.ts)

# Prototypes

Put prototypes into `src/prototypes/...` and add an import to [`src/prototypes/index.ts`](./src/prototypes/index.ts)

Put prototype type definitions either into [`src/types.d.ts`](./src/types.d.ts) or into the respective prototype file

You can see an exmaple in [`src/prototypes/Creep.ts`](./src/prototypes/Creep.ts)

# Util

There are utilities available in [`src/util`](./src/util) if you need any.
You can import them directly or from the [`src/util/index.ts`](./src/util/index.ts) as they are re-exported there as well.

---

# Planned
- Error Sourcemaps

---

This template was inspired by [`screepers/screeps-typescript-starter`](https://github.com/screepers/screeps-typescript-starter)
