# E2E tests

These are E2E tests that are async. Currently, they are not run in CI. They are used to test builds locally, and make sure 
the Ragged module can be npm installed and used in a project.

## Running the tests

To run the tests, run the following command:

```bash
pnpm run start
```

To run the tests in watch mode, run the following command:

```bash
pnpm run tdd
```

### Testing a specific version

If you would like to test the latest version of the Ragged module, you can do so by setting `RAGGED_SOURCE=npm`.
```bash
RAGGED_SOURCE=npm pnpm run start
```

If you would like to test a locally `pnpm link`ed version of the Ragged module, you can do so by setting `RAGGED_SOURCE=globally-linked`. 

```bash
# make sure you link ragged
cd ../ragged/ragged;
pnpm link --global;
cd ../e2e;
RAGGED_SOURCE=globally-linked pnpm run start
```

## Testing the tests

You didn't think we'd forget to test the tests, did you? To test the tests, run the following command:

```bash
pnpm run test
```

If you want to tdd the tests, run the following command:

```bash
pnpm run tdd
```