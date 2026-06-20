import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
            if (id.includes("/src/pages/DashboardPage")) return "dashboard-page";
            if (id.includes("/src/pages/RevenueDashboardPage")) return "revenue-dashboard-page";
            if (id.includes("/src/pages/PipelineCopilotPage")) return "pipeline-copilot-page";
            if (id.includes("/src/pages/AiManagerDashboardPage")) return "ai-manager-dashboard-page";
            if (id.includes("/src/pages/AiLiveRealtimeVoicePage")) return "ai-live-realtime-page";
            if (id.includes("/src/pages/AIEnterpriseCommandCenter")) return "ai-enterprise-command-center";
            if (id.includes("/src/pages/CRMPage")) return "crm-page";
            if (id.includes("/src/pages/AiWorkersPage")) return "ai-workers-page";
            if (id.includes("/src/pages/CommandCenterPage")) return "command-center";
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react'
            return 'vendor'
          }
          if (id.includes('/src/services/')) return 'services'
          if (id.includes('/src/assets/')) return 'assets'
        },
      },
    },
  },
})
