# Related GitHub Repository Index

## Use policy

No third-party repository is bundled. Review its current license, security advisories, maintenance, dependencies, and API compatibility before adoption. “Research/reference” means study or benchmark, not production dependency.

## Production/platform candidates

| Repository | URL | Proposed use | Adoption status |
|---|---|---|---|
| Cloudflare Workers SDK | https://github.com/cloudflare/workers-sdk | Wrangler, Workers runtime tooling, local tests | platform dependency/current docs control |
| Supabase | https://github.com/supabase/supabase | Postgres, Auth/RLS, Realtime ecosystem reference | existing platform candidate |
| Langfuse | https://github.com/langfuse/langfuse | LLM traces, datasets, evaluations, prompt/model review | existing observability candidate; not action authority |
| Composio | https://github.com/ComposioHQ/composio | connected-app authentication/tool access owner | adapter input only; broker policy remains operator-owned |
| Google APIs Node.js Client | https://github.com/googleapis/google-api-nodejs-client | official Google Calendar/OAuth API client | provider adapter candidate |
| Open Policy Agent | https://github.com/open-policy-agent/opa | optional policy engine/evaluation reference | evaluate; do not create second authority owner |
| TLA+ tools | https://github.com/tlaplus/tlaplus | model checking lifecycle, budget, revocation, interruption | formal verification tooling |

## Security and evaluation references

| Repository | URL | Proposed use | Adoption status |
|---|---|---|---|
| AgentDojo | https://github.com/ethz-spylab/agentdojo | prompt-injection attack/defense benchmark | evaluation/reference |
| CaMeL | https://github.com/google-research/camel-prompt-injection | control/data-flow and capability design | research artifact; do not copy as production framework without independent hardening |
| AgentDyn | https://github.com/SaFo-Lab/AgentDyn | dynamic agent/tool evaluation | evaluation/reference |
| OSWorld | https://github.com/xlang-ai/OSWorld | computer-use benchmark and task environment | evaluation/reference |
| OSWorld 2.0 code | https://github.com/yuanmengqi/osworld2.0 | long-horizon workflow benchmark | evaluation/reference |
| InterruptBench | https://github.com/HenryPengZou/InterruptBench | interruptible-agent scenarios | evaluation/reference |

## World-model and sequence-model research

| Repository | URL | Proposed use | Adoption status |
|---|---|---|---|
| Mamba | https://github.com/state-spaces/mamba | long-history recurrent challenger | research/challenger |
| Gated DeltaNet-2 | https://github.com/NVlabs/GatedDeltaNet-2 | recurrent/linear-attention challenger | research/challenger |
| Kimi Linear | https://github.com/MoonshotAI/Kimi-Linear | hybrid linear-attention challenger | research/challenger |
| DreamerV3 | https://github.com/danijar/dreamerv3 | implementation reference for imagination-based RL | late research challenger; not direct Operator Kit integration |
| ProPlay | https://github.com/antman9914/proplay | procedure-graph and preplay research | research/reference |
| torchcde | https://github.com/patrick-kidger/torchcde | Neural CDE research implementation | research prototype; repository itself points new work toward Diffrax |
| Diffrax | https://github.com/patrick-kidger/diffrax | differential-equation solver candidate for JAX experiments | research/ML tooling candidate |

## Additional useful infrastructure references

| Repository | URL | Proposed use | Adoption status |
|---|---|---|---|
| Model Context Protocol servers | https://github.com/modelcontextprotocol/servers | tool-server examples and protocol interoperability | examples only; Operator Kit broker remains authority owner |
| OpenTelemetry JS | https://github.com/open-telemetry/opentelemetry-js | structured traces/metrics integration | observability candidate |
| Zod | https://github.com/colinhacks/zod | TypeScript runtime schemas | reference-kernel dependency |
| Vitest | https://github.com/vitest-dev/vitest | reference-kernel and Worker-compatible tests | test dependency candidate |

## Repository adoption checklist

Before importing code or adding a dependency:

1. inspect current default branch and release cadence;
2. review license and notices;
3. inspect security policy/advisories;
4. pin version/commit and generate SBOM;
5. review transitive dependencies and runtime privileges;
6. determine whether code is a research artifact;
7. write operator-specific threat and failure tests;
8. prevent the dependency from becoming an independent authorization owner;
9. validate Worker/mobile/runtime compatibility;
10. record an architecture decision and rollback path.
