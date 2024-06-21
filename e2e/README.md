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

## Testing the tests

You didn't think we'd forget to test the tests, did you? To test the tests, run the following command:

```bash
pnpm run test
```

If you want to tdd the tests, run the following command:

```bash
pnpm run tdd
```