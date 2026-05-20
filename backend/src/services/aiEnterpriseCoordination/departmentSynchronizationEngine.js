function generate(){return ['sales','marketing','operations','finance','product'].map((department,i)=>({department,coordinationPriority:['critical','high','high','medium','medium'][i],synchronizationHealth:80-(i*6),orchestrationStatus:'aligned',workforceSynchronization:'human_approved_only'}))}
module.exports={generate}
