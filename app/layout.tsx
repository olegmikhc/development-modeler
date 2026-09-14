import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Development Modeler — Portfolio intelligence',description:'Time-driven development financial models, cash flow and scenario analysis.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
