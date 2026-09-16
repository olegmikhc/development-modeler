import {expect,it} from 'vitest';
import {salesMilestone} from './sales-milestone';
const m=(month:number,units:number)=>({month,units,label:`M${month}`,cumulative:-100});
it('marks the first month crossing 60% of inventory, including a jump past it',()=>{expect(salesMilestone([m(1,2),m(2,3),m(3,2),m(4,3)],10)).toMatchObject({month:3,sold:7,target:6});});
it('rounds up indivisible units and counts contracts regardless of negative cash',()=>{expect(salesMilestone([m(1,1),m(2,1)],3)).toMatchObject({month:2,target:2,cumulative:-100});});
it('does not invent a milestone for empty or undersold inventory',()=>{expect(salesMilestone([m(1,5)],10)).toBeNull();expect(salesMilestone([m(1,1)],0)).toBeNull();});
