# AS6 Autonomous Evidence Correlation Controller

Purpose:

Correlate runtime evidence artifacts across rollback, deployment, incidents, change approval, governance, and knowledge-base controllers.

Controller:

- ops/bin/as6-autonomous-evidence-correlation-controller

Result contract:

- AS6_EVIDENCE_CORRELATION=PASS
- AS6_EVIDENCE_CORRELATION=FAIL
- AS6_EVIDENCE_CORRELATION_RESULT=OK
- AS6_EVIDENCE_CORRELATION_RESULT=FAIL

Evidence:

- runtime/evidence-correlation/latest.out
- runtime/evidence-correlation/evidence-correlation-matrix.tsv
- runtime/evidence-correlation/evidence-summary.env
