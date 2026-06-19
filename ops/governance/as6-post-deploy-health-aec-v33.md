# AS6 Post Deploy Health AEC V33
- Block deploy closure if health fails after readiness retry window.
- Do not classify one immediate 502 as backend failure until backend logs, container state and retry health are checked.
- Register nginx upstream startup race into diagnostics, coverage, governance and state.
