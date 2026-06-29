import { getAS6Plugins } from "../plugins/as6PluginRegistry";
import { loadAS6Plugin } from "../plugins/as6PluginLoader";

export const AS6_CAPABILITY_RESOLVER_VERSION="V112";

export function getPluginsByCapability(capability){
  return getAS6Plugins().filter(
    p=>Array.isArray(p.capabilities)&&p.capabilities.includes(capability)
  );
}

export function resolveCapability(capability){
  const matches=getPluginsByCapability(capability);

  if(matches.length===0){
    return{
      ok:false,
      error:"AS6_CAPABILITY_NOT_FOUND",
      capability
    };
  }

  return{
    ok:true,
    capability,
    plugin:matches[0],
    candidates:matches
  };
}

export function activateCapability(capability,context={}){
  const resolved=resolveCapability(capability);

  if(!resolved.ok){
    return resolved;
  }

  return loadAS6Plugin(
    resolved.plugin.id,
    {
      capability,
      ...context
    }
  );
}

export function validateCapabilityResolverPolicy(){
  return{
    ok:true,
    version:AS6_CAPABILITY_RESOLVER_VERSION
  };
}
