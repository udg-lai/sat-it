# create-svelte

Everything you need to build a Svelte library, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

Read more about creating a library [in the docs](https://svelte.dev/docs/kit/packaging).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Everything inside `src/lib` is part of your library, everything inside `src/routes` can be used as a showcase or preview app.

## Building

To build your library:

```bash
npm run package
```

To create a production version of your showcase app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Deployment

The app deployment depends on the `adapter`.
If you are using the 'node' adapter you might run the app by:

```bash
node build
```

If you use the `static` adapter, you need a software to serve static files.

```bash
npx serve build
```

We have a mechanism to upload the aplication using GitHub pages,
so we chosed to use the `static` adapter.

To do so, the following workflow is triggered when a new Git tag is added:

- project is build
- tested
- if tests passed, the app is published

## Automatically lint and run tests at commit

We use `Husky`, get started [here](https://typicode.github.io/husky/get-started.html)
