'use client';
import {useEffect,useState} from 'react';
import {supabase} from '@/lib/supabase';
import {Report} from '@/features/reports/report';
import {FinancialModel} from '@/types/model';
import {modelEnvelope} from '@/lib/validation/model';
import {tr,useLanguage} from '@/lib/i18n';
import {LanguageSwitch} from '@/components/ui/language-switch';

/** Standalone viewer: never imports a shared model into the editable workspace. */
export function SharedModel({token}:{token:string}){
 useLanguage();
 const [model,setModel]=useState<FinancialModel|null>(null),[error,setError]=useState('');
 useEffect(()=>{
  let cancelled=false;setModel(null);setError('');
  const sb=supabase();
  if(!sb){setError('Cloud workspace is not configured.');return}
  if(!token){setError('This link has expired or is unavailable.');return}
  Promise.resolve(sb.rpc('read_shared_model',{share_token:token})).then(({data,error})=>{
   if(cancelled)return;
   const parsed=modelEnvelope.safeParse(data);
   if(error||!parsed.success)setError('This link has expired or is unavailable.');
   else setModel(parsed.data as FinancialModel);
  }).catch(()=>{if(!cancelled)setError('This link has expired or is unavailable.')});
  return()=>{cancelled=true};
 },[token]);
 return model?<main className="shared-viewer"><div className="shared-toolbar"><div><strong>{model.name}</strong><small>{tr('View only · this financial model only')}</small></div><LanguageSwitch/></div><Report model={model}/></main>:<div className="boot" role="status">{tr(error||'Loading shared model…')}</div>;
}
