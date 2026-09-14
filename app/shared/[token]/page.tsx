'use client';
import {use,useEffect,useState} from 'react';
import {supabase} from '@/lib/supabase';
import {Report} from '@/features/reports/report';
import {FinancialModel} from '@/types/model';
import {modelEnvelope} from '@/lib/validation/model';
import {copyModel} from '@/lib/copy-model';
import {useModels} from '@/store/model-store';
import {tr,useLanguage} from '@/lib/i18n';
import {LanguageSwitch} from '@/components/ui/language-switch';
export default function Shared({params}:{params:Promise<{token:string}>}){
 useLanguage();const {token}=use(params);const [model,setModel]=useState<FinancialModel|null>(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[canEdit,setCanEdit]=useState(false);
 const check=async(mid:string)=>{const sb=supabase();if(!sb)return;const {data:{user}}=await sb.auth.getUser();if(user){const {data}=await sb.rpc('edits_model',{mid});setCanEdit(data===true)}};
 useEffect(()=>{let cancelled=false;const sb=supabase();if(!sb){setError('Cloud workspace is not configured.');return}sb.rpc('read_shared_model',{share_token:token}).then(({data,error})=>{if(cancelled)return;const parsed=modelEnvelope.safeParse(data);if(error||!parsed.success)setError('This link has expired or is unavailable.');else {setModel(parsed.data as FinancialModel);void check(parsed.data.id)}});return()=>{cancelled=true}},[token]);
 const request=async()=>{setBusy(true);const sb=supabase()!;const {data:{user}}=await sb.auth.getUser();if(!user){setMessage(tr('Sign in, then return to this page to request editing access.'));setBusy(false);return}const {data,error}=await sb.rpc('request_model_edit',{share_token:token});setMessage(error?error.message:tr(data==='approved'?'Access granted.':'Request sent. The model owner can approve it in Share.'));if(data==='approved')setCanEdit(true);setBusy(false)};
 const openCopy=()=>{if(!model)return;useModels.getState().importModel(copyModel(model));location.assign('/')};
 const openOriginal=async()=>{if(!model)return;setBusy(true);const {data,error}=await supabase()!.from('financial_models').select('data').eq('id',model.id).single();const parsed=modelEnvelope.safeParse(data?.data);if(error||!parsed.success){setMessage(tr('Access is unavailable.'));setBusy(false);return}const store=useModels.getState(),existing=store.models.find(m=>m.id===model.id);if(existing)store.mergeVersions([{id:crypto.randomUUID(),name:'Before opening shared model',date:new Date().toISOString(),model:structuredClone(existing)}]);store.importModel(parsed.data as FinancialModel);location.assign('/')};
 return model?<><div className="shared-toolbar"><div><strong>{model.name}</strong><small>{tr('View only · original model is protected')}</small></div><div className="row" style={{flexWrap:'wrap'}}><LanguageSwitch/><button className="btn" onClick={openCopy}>{tr('Make an editable copy')}</button>{canEdit?<button className="btn dark" disabled={busy} onClick={openOriginal}>{tr('Edit original')}</button>:<button className="btn" disabled={busy} onClick={request}>{tr('Request editing access')}</button>}<button className="btn" onClick={()=>check(model.id)}>{tr('Check access')}</button><a className="btn" href="/login" target="_blank" rel="noreferrer">{tr('Sign in')}</a></div>{message&&<p role="status">{message}</p>}<small>{tr('A copy is saved on this device. Sign in and save it to cloud to use it on other devices.')}</small></div><Report model={model}/></>:<div className="boot">{error||'Loading shared model…'}</div>;
}
