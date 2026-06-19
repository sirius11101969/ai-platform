import copilotAsset from "../../assets/as6-copilot-asset.png"
export default function CopilotAsset({ compact = false }) {
  return <img className={compact ? 'as6-copilot-asset compact' : 'as6-copilot-asset'} src={copilotAsset} alt="AI Copilot" loading="eager" />
}
