export const AS6_EXPERIENCE_SYSTEM_VERSION = "EPIC001_PR1";

export const as6ExperienceTokens = {
  color: {
    bg: "#05070d",
    surface: "rgba(12,16,28,.82)",
    surfaceStrong: "rgba(18,24,42,.94)",
    border: "rgba(132,245,255,.16)",
    text: "#f6fbff",
    muted: "#8ea3b7",
    cyan: "#5ee7ff",
    violet: "#9b7cff",
    green: "#78f2b3",
    amber: "#ffd166",
    red: "#ff6b8a",
  },
  radius: {
    sm: "10px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  space: {
    xs: "6px",
    sm: "10px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  shadow: {
    soft: "0 18px 60px rgba(0,0,0,.28)",
    glow: "0 0 36px rgba(94,231,255,.14)",
  },
  motion: {
    fast: "140ms ease",
    normal: "220ms ease",
  },
};

export function getAS6ExperienceTokens() {
  return {
    version: AS6_EXPERIENCE_SYSTEM_VERSION,
    tokens: as6ExperienceTokens,
  };
}
