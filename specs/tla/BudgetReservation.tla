---- MODULE BudgetReservation ----
EXTENDS Naturals, TLC
CONSTANT Limit, Amount
VARIABLES reserved, committed, reservationState
States == {"none", "reserved", "reconciling", "committed", "refunded"}
Init == /\ reserved = 0 /\ committed = 0 /\ reservationState = "none"
Reserve == /\ reservationState = "none" /\ reserved + committed + Amount <= Limit
           /\ reserved' = reserved + Amount /\ reservationState' = "reserved"
           /\ UNCHANGED committed
RedeliverReserve == /\ reservationState \in {"reserved", "reconciling", "committed", "refunded"}
                    /\ UNCHANGED <<reserved, committed, reservationState>>
MarkReconciling == /\ reservationState = "reserved"
                   /\ reservationState' = "reconciling" /\ UNCHANGED <<reserved, committed>>
Commit == /\ reservationState \in {"reserved", "reconciling"}
          /\ reserved' = reserved - Amount /\ committed' = committed + Amount
          /\ reservationState' = "committed"
Refund == /\ reservationState \in {"reserved", "reconciling", "committed"}
          /\ reserved' = IF reservationState \in {"reserved", "reconciling"} THEN reserved - Amount ELSE reserved
          /\ committed' = IF reservationState = "committed" THEN committed - Amount ELSE committed
          /\ reservationState' = "refunded"
Next == Reserve \/ RedeliverReserve \/ MarkReconciling \/ Commit \/ Refund
Invariant == /\ reserved >= 0 /\ committed >= 0 /\ reserved + committed <= Limit
Spec == Init /\ [][Next]_<<reserved, committed, reservationState>>
====
