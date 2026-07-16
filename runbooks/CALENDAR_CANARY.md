# Calendar canary runbook

- Provision dedicated non-production Workspace user/calendar.
- Configure least-privilege OAuth and independent read scope.
- Verify current mandate/capability/adapter refs.
- Create private event from authenticated chat.
- Create a separate event from scheduled Mission.
- Replay both requests and confirm no duplicate object.
- Inject timeout after provider commit and reconcile via GET.
- Attempt changed calendar/time/attendee and confirm denial.
- Revoke between plan and execution and confirm no attempt.
- Cancel event, read back absence/cancelled state, display residual notification warning.
- Confirm effect and mission states in installed client.
- Confirm all Worker and client refs.
- Teardown test objects and retain redacted evidence.
