# @zeitgeistpm/sdk

The SDK for interacting with the Zeitgeist chain.

## Development Guide

- Always use camelCase for variable names.
- Type names use PascalCase.

### Naming Conventions

- All naming of functions which call an underlying extrinsic should be name according to the extrinsic's
name in Rust. For example, if the function is `create_new_categorical_market` in Rust, it should be
`createCategoricalMarket`.
- Any function that makes a remote call from client to chain to get some data should use `fetch` as a prefix
in order to communicate that a remote call is being made.
