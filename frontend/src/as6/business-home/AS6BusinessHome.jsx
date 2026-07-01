import {
  AS6ExperienceButton,
  AS6ExperienceCard,
  AS6ExperienceMetric,
  AS6ExperiencePanel,
  AS6ExperienceShell,
} from "../experience-system";
import { createAS6BusinessHomeLiveData } from "./AS6BusinessHomeLiveData";
import "./AS6BusinessHome.css";

export const AS6_BUSINESS_HOME_VERSION = "EPIC001_PR3";

export function getAS6BusinessHomeState() {
  return {
    version: AS6_BUSINESS_HOME_VERSION,
    ...createAS6BusinessHomeLiveData(),
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
              {state.recommendations.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </AS6ExperienceCard>

          <AS6ExperienceCard eyebrow="Activity" title="Последние события">
            <ul className="as6-business-home__list">
              {state.activity.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </AS6ExperienceCard>
        </section>
      </section>
    </AS6ExperienceShell>
  );
}
