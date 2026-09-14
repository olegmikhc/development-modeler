'use client';
import {Cost,Project,Adjustments} from '@/types/model';
import {calculateProjectRevenue,costAmount} from '@/lib/financial-engine';
import {money,number} from '@/lib/format';
import {tr,useLanguage} from '@/lib/i18n';
export function CostCalculation({cost,project,adjustments}:{cost:Cost;project:Project;adjustments:Adjustments}){
 useLanguage();
 if(cost.driver!=='% Revenue')return null;
 const adjustment=cost.name==='Marketing'?adjustments.marketing:cost.name==='Sales Commission'?adjustments.commission:cost.name==='Contingency'?adjustments.contingency:0;
 return <div className="notice"><strong>{tr('Calculation for this project')} · {project.name}</strong><p>{tr('Contracted revenue')} {money(calculateProjectRevenue(project,adjustments),false,project.currency)} × {number(cost.amount)}%{adjustment!==0&&<> × {number(1+adjustment/100)} ({tr('Scenario adjustment')}: {number(adjustment)}%)</>} = <strong className="amount-negative">{money(costAmount(cost,project,adjustments),false,project.currency)}</strong></p><small>{tr('Uses the same sales plan as P&L. Portfolio percentages combine the amounts and revenues of all projects.')}</small></div>;
}
