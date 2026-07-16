---- MODULE ActionLifecycle ----
EXTENDS Naturals, TLC

CONSTANT Actions
VARIABLES status, effectCount, verifiedObservation

Statuses == {"planned", "authorized", "reserved", "executing", "acknowledged",
             "verified", "uncertain", "reconciling", "failed", "compensating",
             "compensated", "compensation_failed", "denied", "expired", "superseded"}
Terminal == {"verified", "failed", "compensated", "compensation_failed", "denied", "expired", "superseded"}

Init == /\ status = [a \in Actions |-> "planned"]
        /\ effectCount = [a \in Actions |-> 0]
        /\ verifiedObservation = [a \in Actions |-> FALSE]

Authorize(a) == /\ status[a] = "planned"
                /\ status' = [status EXCEPT ![a] = "authorized"]
                /\ UNCHANGED <<effectCount, verifiedObservation>>
Reserve(a) == /\ status[a] = "authorized"
              /\ status' = [status EXCEPT ![a] = "reserved"]
              /\ UNCHANGED <<effectCount, verifiedObservation>>
Execute(a) == /\ status[a] = "reserved"
              /\ status' = [status EXCEPT ![a] = "executing"]
              /\ effectCount' = [effectCount EXCEPT ![a] = @ + 1]
              /\ UNCHANGED verifiedObservation
Acknowledge(a) == /\ status[a] = "executing"
                  /\ status' = [status EXCEPT ![a] = "acknowledged"]
                  /\ UNCHANGED <<effectCount, verifiedObservation>>
Observe(a) == /\ status[a] \in {"acknowledged", "reconciling"}
              /\ verifiedObservation' = [verifiedObservation EXCEPT ![a] = TRUE]
              /\ UNCHANGED <<status, effectCount>>
Verify(a) == /\ status[a] \in {"acknowledged", "reconciling"}
             /\ verifiedObservation[a]
             /\ status' = [status EXCEPT ![a] = "verified"]
             /\ UNCHANGED <<effectCount, verifiedObservation>>
Uncertain(a) == /\ status[a] \in {"executing", "acknowledged", "reconciling"}
                /\ status' = [status EXCEPT ![a] = "uncertain"]
                /\ UNCHANGED <<effectCount, verifiedObservation>>
Reconcile(a) == /\ status[a] = "uncertain"
                /\ status' = [status EXCEPT ![a] = "reconciling"]
                /\ UNCHANGED <<effectCount, verifiedObservation>>

Next == \E a \in Actions : Authorize(a) \/ Reserve(a) \/ Execute(a) \/ Acknowledge(a) \/
                              Observe(a) \/ Verify(a) \/ Uncertain(a) \/ Reconcile(a)

TypeOK == /\ status \in [Actions -> Statuses]
          /\ effectCount \in [Actions -> Nat]
          /\ verifiedObservation \in [Actions -> BOOLEAN]
AtMostOneEffect == \A a \in Actions : effectCount[a] <= 1
NoFalseVerification == \A a \in Actions : status[a] = "verified" => verifiedObservation[a]

Spec == Init /\ [][Next]_<<status, effectCount, verifiedObservation>>
====
