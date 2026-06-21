import React from "react";
import { AS6UnifiedPageShell, AS6UnifiedGlassCard, AS6UnifiedState } from "./AS6UnifiedPageShell.jsx";
import "../styles/as6-direct-page-rewrite-framework.css";

export function AS6DirectPageRewriteFramework({ title, subtitle, metrics = [], children }) {
  return (
    <AS6UnifiedPageShell eyebrow="AS6 Direct Rewrite" title={title} subtitle={subtitle} metrics={metrics}>
      <AS6UnifiedGlassCard title="Mission Control Page">
        {children || <AS6UnifiedState type="empty" title="Ready for direct page migration" detail="This page is governed by AS6 Unified Page Shell." />}
      </AS6UnifiedGlassCard>
    </AS6UnifiedPageShell>
  );
}

export const AS6_DIRECT_PAGE_REWRITE_V100 = {
  status: "ENABLED",
  shell: "AS6UnifiedPageShell",
  card: "AS6UnifiedGlassCard",
  state: "AS6UnifiedState",
  coverage: ["CRM", "Dashboard", "Revenue", "AI Workers"]
};

export default AS6DirectPageRewriteFramework;
