import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";

export type MissionWorkflowParams = {
  missionId: string;
  runId: string;
  actionId: string;
};

export default class UserGoalWorkflow extends WorkflowEntrypoint<Env, MissionWorkflowParams> {
  async run(event: WorkflowEvent<MissionWorkflowParams>, step: WorkflowStep): Promise<void> {
    const certified = await step.do("certify-current-action", async () => {
      // Load authoritative state, re-evaluate current epochs, reserve, and mint capability.
      // This operation must be idempotent under the action ID.
      throw new Error("not_implemented: certify-current-action");
    });

    const result = await step.do(
      "execute-provider-effect",
      { retries: { limit: 3, delay: "5 seconds", backoff: "exponential" }, timeout: "2 minutes" },
      async () => {
        // The broker/adapter must be effectively-once because Workflow steps may retry.
        return await this.env.OPERATOR_BROKER.execute(certified);
      },
    );

    await step.do("evaluate-and-schedule-next-state", async () => {
      // Read current authoritative action/verification/mission state.
      // Schedule reconciliation/maturity or the next certified plan node.
      void result;
    });
  }
}
