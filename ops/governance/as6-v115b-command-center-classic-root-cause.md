# AS6 V115B Root Cause

V115 broke App.jsx with invalid JSX.
Root cause: component injection modified return syntax incorrectly.
Repair: restore App.jsx from HEAD, use plain side-effect JS imported from main.jsx, hide only top status overlay and Autonomous Cockpit on /command-center.
