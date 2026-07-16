# Related GitHub repositories

**Verification date:** 2026-07-16  
No third-party repository is vendored in this package. A link is a review or experiment input, not an instruction to copy code. Verify repository identity, commit, license, security posture, maintenance, transitive dependencies and data terms before adoption.

| ID | Repository | Category | URL | Relevance | Adoption rule |
|---|---|---|---|---|---|
| G01 | ProPlay | research implementation | https://github.com/antman9914/proplay | Procedural world model and preplay research. | Reference/evaluation only; review license and reproduce results. |
| G03 | DreamerV3 | research implementation | https://github.com/danijar/dreamerv3 | Open latent world-model control implementation. | DreamerV3 reference, not an official Dreamer 4 implementation. |
| G04 | Mamba | research implementation | https://github.com/state-spaces/mamba | State-space sequence-model code family. | Architecture challenger only. |
| G05 | Gated DeltaNet-2 | official research implementation | https://github.com/NVlabs/GatedDeltaNet-2 | Gated DeltaNet-2 code and kernels. | Architecture challenger only. |
| G06 | Kimi Linear | official research implementation | https://github.com/MoonshotAI/Kimi-Linear | KDA kernels, inference code and checkpoints. | Architecture challenger; inspect model and code licenses. |
| G07 | torchcde | research library | https://github.com/patrick-kidger/torchcde | Neural CDE reference implementation. | Repository recommends Diffrax for new projects; evaluate both. |
| G08 | Diffrax | research library | https://github.com/patrick-kidger/diffrax | Differential-equation solvers for JAX. | Optional training stack; not a runtime authority component. |
| G09 | GluonTS | forecasting library | https://github.com/awslabs/gluonts | Probabilistic temporal baselines and evaluation patterns. | Champion/baseline candidate. |
| G10 | sktime | time-series library | https://github.com/sktime/sktime | Classical and ML time-series baselines. | Champion/baseline candidate. |
| G11 | NeuralForecast | time-series library | https://github.com/Nixtla/neuralforecast | Neural forecasting models and evaluation. | Model tournament candidate. |
| G12 | MEM-INV-Bench | security benchmark and TLA+ artifact | https://github.com/yedidel/mem-inv-bench | Origin-bound memory-authority benchmark and machine-checked models. | Independently review paper assumptions and reproduce operator-specific cases. |
| G13 | AgentDojo | security benchmark | https://github.com/ethz-spylab/agentdojo | Indirect prompt-injection and task-utility environment. | Adapt to Operator Kit tools and policies; do not use benchmark pass as deployment proof. |
| G14 | CaMeL prompt-injection artifact | research artifact | https://github.com/google-research/camel-prompt-injection | Trusted control-flow/untrusted data-flow research implementation. | Research artifact; review before production adoption. |
| G15 | InterruptBench | benchmark | https://github.com/HenryPengZou/InterruptBench | Long-horizon user interruption benchmark. | Use for intent-epoch and semantic-diff testing. |
| G16 | OSWorld | benchmark | https://github.com/xlang-ai/OSWorld | Computer-use environment and OSWorld benchmark family. | Use isolated test environments; never production credentials. |
| G17 | AgentDyn | security benchmark | https://github.com/leolee99/AgentDyn | Dynamic open-ended prompt-injection benchmark. | Complement AgentDojo with operator-specific tests. |
| G18 | TLA+ | formal methods | https://github.com/tlaplus/tlaplus | TLC/TLA+ tooling for lifecycle, budget, revocation and saga invariants. | Canonical formal-spec tool candidate. |
| G19 | Open Policy Agent | policy engine reference | https://github.com/open-policy-agent/opa | Declarative policy evaluation reference. | Do not introduce a second authority owner; evaluate only as an implementation option. |
| G20 | Cloudflare Workers SDK | platform source/tooling | https://github.com/cloudflare/workers-sdk | Wrangler, Miniflare and Workers tooling. | Use current official docs and generated bindings. |
| G21 | Supabase | platform source | https://github.com/supabase/supabase | Postgres/Auth/Realtime/RLS platform source. | Review current migration/RLS guidance. |
| G22 | Google APIs Node.js Client | provider client | https://github.com/googleapis/google-api-nodejs-client | Google API client/reference implementation. | Adapter remains typed and credential-isolated. |
| G23 | Composio | connector platform | https://github.com/ComposioHQ/composio | Connected-app integration reference. | Compile every committing tool into Operator Kit action contracts; connector slug never grants authority. |
| G24 | Langfuse | observability/evaluation | https://github.com/langfuse/langfuse | Trace, dataset and evaluation tooling. | Telemetry only; never action authority or canonical lifecycle truth. |
| G25 | Model Context Protocol TypeScript SDK | protocol SDK | https://github.com/modelcontextprotocol/typescript-sdk | Typed MCP transport/tool integration. | All committing MCP tools must pass the same registry/gate/broker. |
| G26 | OpenTelemetry JavaScript | observability | https://github.com/open-telemetry/opentelemetry-js | Metrics and trace instrumentation. | Redacted telemetry only. |
| G27 | Zod | runtime schema library | https://github.com/colinhacks/zod | Runtime validation used by the reference kernel. | Pinned dependency; review upgrades. |
| G28 | Vitest | test runner | https://github.com/vitest-dev/vitest | Unit/contract test runner used by the package. | Development dependency. |
| G29 | fast-check | property-based testing | https://github.com/dubzzz/fast-check | Recommended canonicalization and state-machine fuzzing. | Add during target-repository integration. |
| G30 | Testcontainers for Node.js | integration testing | https://github.com/testcontainers/testcontainers-node | Real Postgres/provider-simulator integration tests. | Recommended for migration/RPC/race qualification. |

## Architectural selection rule

Adopt the smallest component that passes operator-local gates. Do not add a framework merely because it appears here. In particular, do not create a second policy authority, second action lifecycle, second credential broker, second memory-authority system, or second provider commit path.
