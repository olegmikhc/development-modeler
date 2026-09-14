import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:3100/');await page.getByRole('button',{name:'Edit developer name'}).waitFor();
 await page.getByRole('button',{name:'Edit developer name'}).click();await page.getByRole('textbox',{name:'Developer name',exact:true}).fill('Sharing test');await page.getByRole('textbox',{name:'Developer name',exact:true}).press('Enter');
 const original=await page.evaluate(()=>JSON.parse(localStorage.getItem('development-modeler-v1')).state.models[0]);
 await page.route('**/rest/v1/rpc/read_shared_model',route=>route.fulfill({json:original}));
 await page.goto('http://127.0.0.1:3100/shared/test-only-token');await page.getByRole('button',{name:'Make an editable copy'}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Edit original',exact:true}).count(),0);
 await page.getByRole('button',{name:'Request editing access',exact:true}).click();await page.getByText('Sign in, then return to this page to request editing access.').waitFor();
 await page.getByRole('button',{name:'Make an editable copy'}).click();await page.getByRole('button',{name:'Edit developer name'}).waitFor();
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('development-modeler-v1')).state);
 assert.equal(state.models.length,2);assert.notEqual(state.activeId,original.id);assert.deepEqual(state.models.find(m=>m.id===original.id),original);assert.ok(state.models.find(m=>m.id===state.activeId).name.endsWith(' · Copy'));
 console.log('Shared view remains read-only; anonymous request requires login; copy preserves original.');
}finally{await browser.close()}
