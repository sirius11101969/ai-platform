import React, { useMemo } from 'react';
import './AS6RecommendationEnginePanel.css';
import { useAS6WorkspaceContext } from './AS6WorkspaceContext.jsx';
import {
  createAS6RecommendationEngineSnapshot,
  validateAS6RecommendationEngine,
} from './AS6RecommendationEngine.js';

export const AS6_RECOMMENDATION_ENGINE_PANEL_VERSION = 'EPIC008_PR2';

export default function AS6RecommendationEnginePanel() {
  const { state, publishWorkspaceEvent, registerWorkspaceAction } = useAS6WorkspaceContext();
  const snapshot = useMemo(() => createAS6RecommendationEngineSnapshot(state), [state]);
  const validation = useMemo(() => validateAS6RecommendationEngine(snapshot), [snapshot]);

  function traceRecommendation(recommendation) {
    publishWorkspaceEvent({
      source: 'recommendation-engine',
      type: 'recommendation.traced',
      recommendationId: recommendation.id,
      actionId: recommendation.actionId,
      confidence: recommendation.confidence,
      score: recommendation.score,
    });

    registerWorkspaceAction({
      id: recommendation.actionId,
      label: recommendation.title,
      source: 'recommendation-engine',
    });
  }

  return (
    <section className="as6-recommendation-engine" data-as6-component="recommendation-engine">
      <div className="as6-recommendation-engine__header">
        <span>Executive Intelligence</span>
        <h2>Recommendation Engine</h2>
        <p>AS6 ранжирует следующий лучший шаг на основе Context Intelligence Snapshot, Governance, Execution Engine и Audit Trail.</p>
      </div>

      {snapshot.topRecommendation && (
        <div className="as6-recommendation-engine__top" data-confidence={snapshot.topRecommendation.confidence}>
          <div>
            <span>Top Recommendation</span>
            <h3>{snapshot.topRecommendation.title}</h3>
            <p>{snapshot.topRecommendation.reason}</p>
          </div>
          <button type="button" onClick={() => traceRecommendation(snapshot.topRecommendation)}>
            Trace Recommendation
          </button>
        </div>
      )}

      <div className="as6-recommendation-engine__grid">
        {snapshot.recommendations.map((item) => (
          <article key={item.id}>
            <div className="as6-recommendation-engine__score">
              <span>{item.confidence}</span>
              <strong>{item.score}</strong>
            </div>
            <h3>{item.title}</h3>
            <p>{item.reason}</p>
            <dl>
              <dt>Context</dt>
              <dd>{item.contextSource}</dd>
              <dt>Governance</dt>
              <dd>{item.governanceStatus}</dd>
              <dt>Execution</dt>
              <dd>{item.executionStatus}</dd>
              <dt>Alternative</dt>
              <dd>{item.safeAlternative}</dd>
            </dl>
          </article>
        ))}
      </div>

      <div className="as6-recommendation-engine__validation">
        <strong>{validation.valid ? 'QGT-008 PASS' : 'QGT-008 FAIL'}</strong>
        <small>
          recommendations: {snapshot.recommendations.length}; missing sources: {validation.missingSources.length}; invalid: {validation.invalidRecommendations.length}
        </small>
      </div>
    </section>
  );
}
