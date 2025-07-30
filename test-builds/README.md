# Build tests tests

These are build tests that are async. Currently, they are not run in CI. They are used to test builds locally, and make sure the Ragged module can be npm installed and used in a variety of projects.

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

By default, the tests will use the latest version of the Ragged module from npm. If you would like to test a locally `pnpm link`ed version of the Ragged module, you can do so by setting `RAGGED_SOURCE=globally-linked`. 

```bash
# make sure you link ragged
cd ../ragged/ragged;
pnpm link --global;
cd ../test-builds;
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