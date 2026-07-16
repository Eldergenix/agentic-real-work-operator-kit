import { DurableObject } from "cloudflare:workers";

export type LeaseClaim = {
  nonceHash: string;
  actionId: string;
  attemptId: string;
  fencingToken: string;
  expiresAt: string;
};

export class OperatorLeaseCoordinator extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        create table if not exists claimed_nonces (
          nonce_hash text primary key,
          action_id text not null,
          attempt_id text not null,
          fencing_token integer not null,
          expires_at integer not null
        );
        create table if not exists action_fences (
          action_id text primary key,
          fencing_token integer not null,
          updated_at integer not null
        );
      `);
    });
  }

  async claim(input: LeaseClaim): Promise<{ claimed: boolean; reason?: string }> {
    const now = Date.now();
    const expiresAt = new Date(input.expiresAt).getTime();
    const fencingToken = Number.parseInt(input.fencingToken, 10);
    if (!Number.isSafeInteger(fencingToken) || fencingToken <= 0) return { claimed: false, reason: "invalid_fence" };
    if (!Number.isFinite(expiresAt) || expiresAt <= now) return { claimed: false, reason: "expired" };

    this.ctx.storage.sql.exec("delete from claimed_nonces where expires_at <= ?", now);
    const existingNonce = this.ctx.storage.sql
      .exec<{ nonce_hash: string }>("select nonce_hash from claimed_nonces where nonce_hash = ?", input.nonceHash)
      .toArray()[0];
    if (existingNonce !== undefined) return { claimed: false, reason: "nonce_replay" };

    const currentFence = this.ctx.storage.sql
      .exec<{ fencing_token: number }>("select fencing_token from action_fences where action_id = ?", input.actionId)
      .toArray()[0];
    if (currentFence !== undefined && fencingToken <= currentFence.fencing_token) {
      return { claimed: false, reason: "stale_fence" };
    }

    this.ctx.storage.sql.exec(
      "insert into claimed_nonces(nonce_hash, action_id, attempt_id, fencing_token, expires_at) values (?, ?, ?, ?, ?)",
      input.nonceHash,
      input.actionId,
      input.attemptId,
      fencingToken,
      expiresAt,
    );
    this.ctx.storage.sql.exec(
      `insert into action_fences(action_id, fencing_token, updated_at) values (?, ?, ?)
       on conflict(action_id) do update set fencing_token = excluded.fencing_token, updated_at = excluded.updated_at`,
      input.actionId,
      fencingToken,
      now,
    );
    return { claimed: true };
  }
}
