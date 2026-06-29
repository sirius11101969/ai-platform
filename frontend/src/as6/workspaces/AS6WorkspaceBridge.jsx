import {useEffect,useState} from "react";
import {
createWorkspaceFromCurrentWidgets,
getAS6WorkspaceState
} from "./AS6WorkspaceRuntime";

export function useAS6WorkspaceRuntime(){

const[state,setState]=useState(getAS6WorkspaceState());

useEffect(()=>{

createWorkspaceFromCurrentWidgets(
"default-workspace",
"Default Workspace"
);

setState(getAS6WorkspaceState());

},[]);

return state;

}
