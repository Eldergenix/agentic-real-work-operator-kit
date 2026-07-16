---- MODULE IntentInterruption ----
EXTENDS Naturals, TLC
VARIABLES currentIntentEpoch, nodeEpoch, nodeState
NodeStates == {"planned", "certified", "executing", "verified", "superseded"}
Init == /\ currentIntentEpoch = 0 /\ nodeEpoch = 0 /\ nodeState = "planned"
Certify == /\ nodeEpoch = currentIntentEpoch /\ nodeState = "planned"
           /\ nodeState' = "certified" /\ UNCHANGED <<currentIntentEpoch, nodeEpoch>>
Interrupt == /\ currentIntentEpoch' = currentIntentEpoch + 1
             /\ nodeState' = IF nodeState \in {"planned", "certified"} THEN "superseded" ELSE nodeState
             /\ UNCHANGED nodeEpoch
Recompile == /\ nodeState = "superseded" /\ nodeEpoch' = currentIntentEpoch
             /\ nodeState' = "planned" /\ UNCHANGED currentIntentEpoch
Execute == /\ nodeState = "certified" /\ nodeEpoch = currentIntentEpoch
           /\ nodeState' = "executing" /\ UNCHANGED <<currentIntentEpoch, nodeEpoch>>
Next == Certify \/ Interrupt \/ Recompile \/ Execute
NoStaleStart == nodeState = "executing" => nodeEpoch = currentIntentEpoch
Spec == Init /\ [][Next]_<<currentIntentEpoch, nodeEpoch, nodeState>>
====
