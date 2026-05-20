function generate({routes=[],dependencies=[]}){return {executionPriorityAlignment:routes.map((r)=>({initiativeKey:r.initiativeKey,priority:r.coordinationPriority})),bottlenecks:dependencies.filter((d)=>d.status==='blocked').length,strategicSynchronizationScore:Math.max(50,100-dependencies.filter((d)=>d.status==='blocked').length*10)}}
module.exports={generate}
