'use client';
import {appPath} from '@/lib/app-path';
import {AccessRequests} from './access-requests';
import {tr,useLanguage} from '@/lib/i18n';
import {useState} from 'react';
import {Link2,Copy,LockKeyhole} from 'lucide-react';
import {supabase} from '@/lib/supabase';
import {FinancialModel} from '@/types/model';
export function ShareModel({model}:{model:FinancialModel}){useLanguage();const [link,setLink]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);const sb=supabase();return <div className="stack"><div className="notice row"><LockKeyhole size={18}/><span>{tr("A read-only link shows the last cloud-saved model. Anyone with the link can view it for 7 days.")}</span></div>{!sb?<p>{tr("Connect Supabase in Settings and save this model to cloud to create a sharing link.")}</p>:<button className="btn dark" disabled={busy} onClick={async()=>{setBusy(true);try{const {data,error}=await sb.rpc('create_model_share',{model_uuid:model.id});if(error)throw error;setLink(`${location.origin}${appPath('/shared/')}?token=${encodeURIComponent(data)}`);setMessage('Link created. It expires in 7 days.')}catch(e){setMessage(e instanceof Error?e.message:'Save this model to cloud and sign in before sharing.')}finally{setBusy(false)}}}><Link2 size={16}/>{tr(" Create read-only link")}</button>}{link&&<><input aria-label={tr("Read-only model link")} value={link} readOnly/><button className="btn" onClick={()=>navigator.clipboard.writeText(link).then(()=>setMessage('Link copied.')).catch(()=>setMessage('Select and copy the link manually.'))}><Copy size={15}/>{tr(" Copy link")}</button></>}{message&&<p role="status">{message}</p>}<AccessRequests modelId={model.id}/></div>}
