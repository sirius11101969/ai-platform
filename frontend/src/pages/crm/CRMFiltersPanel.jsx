import React from 'react'
import CRMFiltersLegacyPanel from './CRMFiltersLegacyPanel.jsx'
import {
  AS6Badge,
  AS6Card,
  AS6Panel,
  AS6Toolbar,
} from '../../design-system/index.js'

const AS6_DESIGN_SYSTEM_FILTERS_ADOPTION_MARKER = {
  stage: 'AS6_EPIC021_FILTERS_ADOPTION_VISUAL_MIGRATION_REPAIR',
  mode: 'real-visual-wrapper',
  policy: 'visual-adoption-only-no-business-logic-change',
  legacyPanelPreserved: true,
}

export default function CRMFiltersPanel(props) {
  return (
    <AS6Panel
      title="CRM Filters"
      subtitle="Единая визуальная оболочка фильтров CRM на базе AS6 Design System."
      className="as6-crm-filters-ds-panel"
    >
      <AS6Toolbar
        title="Фильтры CRM"
        description="Визуальный слой переведён на Design System. Бизнес-логика сохранена в legacy-панели."
        actions={<AS6Badge tone="success">Design System</AS6Badge>}
      />

      <AS6Card
        title="Рабочая область фильтров"
        subtitle="Legacy-содержимое сохранено как внутренняя функциональная часть."
        className="as6-crm-filters-ds-card"
      >
        <CRMFiltersLegacyPanel {...props} />
      </AS6Card>
    </AS6Panel>
  )
}

export { AS6_DESIGN_SYSTEM_FILTERS_ADOPTION_MARKER }
