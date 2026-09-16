import {Month} from '@/types/model';
/** First month reaching 60% of inventory, based on contracts, not cash collections. */
export function salesMilestone(months:Pick<Month,'month'|'label'|'units'|'cumulative'>[],inventory:number){
 if(inventory<=0)return null;
 const target=Math.ceil(inventory*60/100);
 let sold=0;
 for(const month of [...months].sort((a,b)=>a.month-b.month)){
  sold+=month.units;
  if(sold>=target)return {...month,sold,target,share:sold/inventory};
 }
 return null;
}
