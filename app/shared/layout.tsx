import type {Metadata} from 'next';
const title='Финансовая модель · Только просмотр';
const description='Девелоперский портфель: план продаж, денежный поток, прибыль и маржа. Просмотр одной модели без редактирования.';
const site=(process.env.NEXT_PUBLIC_SITE_URL||'https://olegmikhc.github.io/development-modeler').replace(/\/$/,'');
const image={url:`${site}/images/bali-villa-cover.png`,width:1536,height:1024,alt:'Вилла на Бали — финансовая модель девелоперского проекта'};
// Static metadata for chat crawlers; no private model data or access token in preview tags.
export const metadata:Metadata={title,description,robots:{index:false,follow:false},openGraph:{type:'website',title,description,siteName:'Development Modeler',locale:'ru_RU',images:[image]},twitter:{card:'summary_large_image',title,description,images:[image.url]}};
export default function SharedLayout({children}:{children:React.ReactNode}){return children;}
