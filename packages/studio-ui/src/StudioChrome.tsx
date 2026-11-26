import React from 'react';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/material-symbols-outlined/400.css';
export function StudioIcon({name}:{name:string}){return <span className="studio-icon" aria-hidden="true">{name}</span>}
export function StudioChrome({page,connection,navigate,children}:{page:string;connection:string;navigate:(page:string)=>void;children:React.ReactNode}){
 return <div className="workspace-app"><header className="studio-header"><button className="studio-wordmark" onClick={()=>navigate('projects')} aria-label="All projects"><span className="studio-logo"><StudioIcon name="layers"/></span><strong>Doro</strong><small>CREATOR TOOLKIT</small><span className="studio-byline">by DoroSocial</span></button><span className="studio-breadcrumb">Workspace <span>/</span> {{projects:'Projects',templates:'Templates',animations:'Animation library',settings:'Your agent'}[page]||'Projects'}</span><div className="studio-header-actions"><span className="local-badge" data-offline={connection==='offline'}><i/>{connection==='offline'?'Local app offline':'Local workspace'}</span><button onClick={()=>navigate('settings')}><StudioIcon name="smart_toy"/>Your agent</button></div></header><div className="studio-shell"><aside className="studio-sidebar"><span className="sidebar-label">CREATE & EXPLORE</span><nav aria-label="Main navigation">{[['projects','Projects','folder_open'],['templates','Templates','dashboard_customize'],['animations','Animations','motion_photos_on'],['settings','Settings','tune']].map(([id,label,icon])=><button key={id} className={page===id?'active':''} aria-current={page===id?'page':undefined} onClick={()=>navigate(id)}><StudioIcon name={icon}/>{label}{page===id&&<i/>}</button>)}</nav><div className="studio-local-note"><StudioIcon name="hard_drive"/><strong>Made on your computer</strong><p>Your projects and exports stay local.</p><small>by DoroSocial</small></div></aside><main className="studio-main">{children}</main></div></div>
}
