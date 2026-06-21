# AS6 V115D Root Cause

V115C improved Command Center but remaining visual drift is still visible: top empty space, floating diagnostic widgets and thin overlay lines.
Root cause: some overlay widgets are mounted as direct body children with AS6 ids/classes and some global CSS leaves spacing/lines after hiding.
Repair: hide all AS6 overlay root siblings outside #root only on /command-center and reset top/bottom overlay spacing without touching Command Center content.
