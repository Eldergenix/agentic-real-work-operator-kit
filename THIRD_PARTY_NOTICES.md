# Third-party notices and adoption boundary

This archive does not vendor source code, model weights, datasets or benchmark data from the repositories and publications indexed under `references/`.

The runnable TypeScript kernel declares these package dependencies:

- `zod` for runtime schemas;
- TypeScript, Vitest, TSX, Node types and Cloudflare Worker types for development and validation.

The Swift reference module uses only the Swift standard library, Foundation and Swift Testing provided by the toolchain.

Before adopting any linked repository, model, dataset or benchmark:

1. pin an exact commit or artifact digest;
2. review its license, patent, acceptable-use, privacy and attribution terms;
3. scan dependencies and supply-chain provenance;
4. reproduce the relevant result on operator-local data and workloads;
5. verify that it does not create a second policy authority, credential path, lifecycle owner or persistent-memory authority;
6. pass Operator Kit's privacy, security, calibration, runtime, energy, cost and rollback gates.

A publication result, open-source repository or public checkpoint creates no action authority and contributes no live Real Work Completion exposure.
