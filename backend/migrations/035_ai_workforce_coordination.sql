CREATE TABLE IF NOT EXISTS ai_workforce_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  workload INTEGER NOT NULL DEFAULT 0,
  collaboration_state TEXT NOT NULL DEFAULT 'solo',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_workforce_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  task_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  execution_dependencies JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_workforce_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES ai_workforce_tasks(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES ai_workforce_agents(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'assigned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_workforce_collaboration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES ai_workforce_tasks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_workforce_execution_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES ai_workforce_tasks(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES ai_workforce_assignments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'waiting_approval',
  plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
