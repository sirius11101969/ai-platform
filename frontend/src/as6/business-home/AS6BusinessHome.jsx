import {
  AS6ExperienceButton,
  AS6ExperienceCard,
  AS6ExperienceMetric,
  AS6ExperiencePanel,
  AS6ExperienceShell,
} from "../experience-system";
import { getAS6BusinessWorkspaceState } from "../business-workspace";
import { getAS6BusinessNavigationState } from "../business-navigation";
import "./AS6BusinessHome.css";

export const AS6_BUSINESS_HOME_VERSION = "EPIC001_PR1";

export function getAS6BusinessHomeState() {
  return {
    version: AS6_BUSINESS_HOME_VERSION,
    workspace: getAS6BusinessWorkspaceState(),
    navigation: getAS6BusinessNavigationState(),
    brief: {
      title: "Сегодня AI рекомендует начать с 3 действий",
      summary: "Проверьте сделки с риском, денежный поток и задачи, которые блокируют продажи.",
      actions: ["Проверить риски", "Открыть CRM", "Запустить Command Center"],
    },
    metrics: [
      { label: "Revenue", value: "1.24M", trend: "+18%" },
      { label: "Cash Flow", value: "742K", trend: "+9%" },
      { label: "Deals", value: "87", trend: "8 требуют внимания" },
      { label: "Tasks", value: "24", trend: "5 срочно" },
    ],
  };
}

export function AS6BusinessHome() {
  const state = getAS6BusinessHomeState();

  return (
    <AS6ExperienceShell>
      <section className="as6-business-home">
        <header className="as6-business-home__hero">
          <div>
            <p className="as6x-eyebrow">AS6 Business OS</p>
            <h1>Доброе утро, Владимир</h1>
            <p>Состояние бизнеса, рекомендации AI и быстрый запуск рабочих сценариев.</p>
          </div>
          <AS6ExperienceButton>Что вы хотите сделать?</AS6ExperienceButton>
        </header>

        <AS6ExperiencePanel className="as6-business-home__brief">
          <div>
            <p className="as6x-eyebrow">AI Brief</p>
            <h2>{state.brief.title}</h2>
            <p>{state.brief.summary}</p>
          </div>
          <div className="as6-business-home__brief-actions">
            {state.brief.actions.map((action) => <AS6ExperienceButton key={action} variant="ghost">{action}</AS6ExperienceButton>)}
          </div>
        </AS6ExperiencePanel>

        <section className="as6-business-home__metrics">
          {state.metrics.map((metric) => <AS6ExperienceCard key={metric.label}><AS6ExperienceMetric {...metric} /></AS6ExperienceCard>)}
        </section>

        <section className="as6-business-home__grid">
          <AS6ExperienceCard eyebrow="Workspaces" title="Быстрый переход">
            <div className="as6-business-home__chips">
              {["CRM", "Documents", "Finance", "Communication", "Automation", "Marketplace"].map((item) => <span key={item}>{item}</span>)}
            </div>
          </AS6ExperienceCard>

          <AS6ExperienceCard eyebrow="Recommendations" title="Следующие действия">
            <ul className="as6-business-home__list">
              <li>Связаться с клиентами без активности более 7 дней.</li>
              <li>Обновить прогноз выручки по сделкам в высокой стадии.</li>
              <li>Проверить просроченные задачи менеджеров.</li>
            </ul>
          </AS6ExperienceCard>

          <AS6ExperienceCard eyebrow="Activity" title="Последние события">
            <ul className="as6-business-home__list">
              <li>Marketplace 1.0 GA активен.</li>
              <li>Business Workspace и Universal Navigation подключены.</li>
              <li>Business Home Foundation создан.</li>
            </ul>
          </AS6ExperienceCard>
        </section>
      </section>
    </AS6ExperienceShell>
  );
}
