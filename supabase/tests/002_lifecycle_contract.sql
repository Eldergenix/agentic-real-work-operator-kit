\set ON_ERROR_STOP on
begin;

do $$
begin
  if not operator.lifecycle_transition_allowed('planned', 'authorized', 'action_authorized') then
    raise exception 'planned -> authorized must be allowed';
  end if;
  if operator.lifecycle_transition_allowed('planned', 'verified', 'action_verified') then
    raise exception 'planned -> verified must be denied';
  end if;
  if not operator.lifecycle_transition_allowed('provider_acknowledged', 'verified', 'action_verified') then
    raise exception 'provider_acknowledged -> verified must be allowed';
  end if;
  if operator.lifecycle_transition_allowed('verified', 'executing', 'attempt_started') then
    raise exception 'verified -> executing replay must be denied';
  end if;
  if operator.verification_grade_rank('V4') <= operator.verification_grade_rank('V2') then
    raise exception 'verification grade ordering is invalid';
  end if;
end;
$$;

rollback;
