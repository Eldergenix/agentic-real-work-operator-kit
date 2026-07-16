---- MODULE RevocationEpoch ----
EXTENDS Naturals, TLC
VARIABLES currentEpoch, capabilityEpoch, startedEffects
Init == /\ currentEpoch = 0 /\ capabilityEpoch = 0 /\ startedEffects = 0
Mint == /\ capabilityEpoch' = currentEpoch /\ UNCHANGED <<currentEpoch, startedEffects>>
Revoke == /\ currentEpoch' = currentEpoch + 1 /\ UNCHANGED <<capabilityEpoch, startedEffects>>
Start == /\ capabilityEpoch = currentEpoch
         /\ startedEffects' = startedEffects + 1
         /\ UNCHANGED <<currentEpoch, capabilityEpoch>>
Next == Mint \/ Revoke \/ Start
NoStartWithStaleCapability == capabilityEpoch # currentEpoch => UNCHANGED startedEffects
Spec == Init /\ [][Next]_<<currentEpoch, capabilityEpoch, startedEffects>>
====
