// Regression: shared links expose a standalone viewer, never a copy/edit workspace.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3100';
const model=JSON.parse(readFileSync('artifacts/demo-model.json','utf8'));
model.name='Single shared model';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 const writes=[];
 page.on('request',req=>{if(req.url().includes('/rest/v1/')&&!req.url().includes('read_shared_model'))writes.push(req.url())});
 await page.route('**/rest/v1/rpc/read_shared_model',route=>route.fulfill({json:model}));
 for(const path of ['/shared/?token=test-only-token','/shared/test-only-token']){
  await page.goto(base+path);await page.locator('.shared-toolbar strong').getByText(model.name,{exact:true}).waitFor();
  assert.equal(await page.locator('.shared-viewer a, .shared-viewer input, .shared-viewer select').count(),0);
  const buttons=await page.locator('.shared-viewer button').allTextContents();assert.deepEqual(buttons.sort(),['EN','RU']);
  assert.equal(await page.getByRole('button',{name:'Make an editable copy'}).count(),0);
  assert.equal(await page.getByRole('button',{name:'Request editing access'}).count(),0);
 }
 assert.deepEqual(writes,[]);
 await page.route('**/rest/v1/rpc/read_shared_model',route=>route.fulfill({json:null}));
 await page.goto(base+'/shared/?token=expired');await page.getByText('This link has expired or is unavailable.',{exact:true}).waitFor();assert.equal(await page.locator('.report').count(),0);
 console.log('Both link routes show only one model, no navigation or mutation controls; expired links hide the report.');
}finally{await browser.close()}
