export type SupportDeficit =
  | "stale_authoritative_state"
  | "provider_propagation_pending"
  | "insufficient_verification_grade"
  | "missing_authoritative_fact"
  | "missing_non_authority_information"
  | "authentication_required"
  | "new_authority_required"
  | "unsafe_or_impossible";

export type SupportAction =
  | "refresh_provider_state"
  | "wait_for_propagation"
  | "invoke_stronger_verifier"
  | "retrieve_authoritative_fact"
  | "ask_precise_question"
  | "request_authentication"
  | "request_new_authority"
  | "abort_or_recover";

export type SupportPreferences = {
  allowBackgroundWait: boolean;
  allowAutomaticStateRefresh: boolean;
  allowAuthenticationHandoff: boolean;
  allowAuthorityPrompt: boolean;
};

const mapping: Record<SupportDeficit, SupportAction> = {
  stale_authoritative_state: "refresh_provider_state",
  provider_propagation_pending: "wait_for_propagation",
  insufficient_verification_grade: "invoke_stronger_verifier",
  missing_authoritative_fact: "retrieve_authoritative_fact",
  missing_non_authority_information: "ask_precise_question",
  authentication_required: "request_authentication",
  new_authority_required: "request_new_authority",
  unsafe_or_impossible: "abort_or_recover",
};

export function chooseMinimumBurdenSupport(
  deficits: SupportDeficit[],
  preferences: SupportPreferences,
): SupportAction {
  const ordered: SupportDeficit[] = [
    "stale_authoritative_state",
    "provider_propagation_pending",
    "insufficient_verification_grade",
    "missing_authoritative_fact",
    "missing_non_authority_information",
    "authentication_required",
    "new_authority_required",
    "unsafe_or_impossible",
  ];

  for (const deficit of ordered) {
    if (!deficits.includes(deficit)) continue;
    const action = mapping[deficit];
    if (action === "refresh_provider_state" && !preferences.allowAutomaticStateRefresh) continue;
    if (action === "wait_for_propagation" && !preferences.allowBackgroundWait) continue;
    if (action === "request_authentication" && !preferences.allowAuthenticationHandoff) continue;
    if (action === "request_new_authority" && !preferences.allowAuthorityPrompt) continue;
    return action;
  }
  return "abort_or_recover";
}
