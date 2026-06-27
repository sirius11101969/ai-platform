import React from "react";
import AS6OSShell from "../components/as6-os/AS6OSShell";
import AS6OSToday from "../components/as6-os/AS6OSToday";
import AS6OSActionCenter from "../components/as6-os/AS6OSActionCenter";
import AS6OSRevenueBrain from "../components/as6-os/AS6OSRevenueBrain";
import AS6OSModuleHost from "../components/as6-os/AS6OSModuleHost";

export default function AS6OSPage() {
  return (
    <AS6OSShell>
      <AS6OSToday />
      <AS6OSActionCenter />
      <AS6OSRevenueBrain />
      <AS6OSModuleHost />
    </AS6OSShell>
  );
}
