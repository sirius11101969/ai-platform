function generate({departments=[]}){return departments.map((d,i)=>({initiativeKey:`initiative_${d.department}`,ownerDepartment:d.department,dependencyPressure:Math.min(100,40+i*10),routePath:['intake','review','approval','handoff'],coordinationPriority:d.coordinationPriority}))}
module.exports={generate}
