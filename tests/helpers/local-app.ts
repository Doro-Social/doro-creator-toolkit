import {spawn,type ChildProcess} from 'node:child_process';
import {once} from 'node:events';
import net from 'node:net';
export async function freePort(){const s=net.createServer();s.listen(0,'127.0.0.1');await once(s,'listening');const port=(s.address() as net.AddressInfo).port;await new Promise<void>((resolve,reject)=>s.close(e=>e?reject(e):resolve()));return port;}
export async function startLocalApp(workspace:string,port:number,production=true){
 let log='';const child=spawn(process.execPath,['--import','tsx','packages/local-server/src/index.ts',...(production?['--production']:[])],{env:{...process.env,ACC_WORKSPACE:workspace,PORT:String(port)},stdio:['ignore','pipe','pipe']});
 child.stdout?.on('data',b=>{log=(log+b).slice(-6000)});child.stderr?.on('data',b=>{log=(log+b).slice(-6000)});
 const url='http://127.0.0.1:'+port;
 for(let i=0;i<150;i++){if(child.exitCode!==null)throw new Error('Local app startup failed: '+log);try{const r=await fetch(url+'/api/capabilities');if(r.ok)return {child,url,stop:()=>stopLocalApp(child)};}catch{}await new Promise(r=>setTimeout(r,100));}
 await stopLocalApp(child);throw new Error('Local app startup timed out: '+log);
}
export async function stopLocalApp(child:ChildProcess){if(child.exitCode!==null)return;const ended=once(child,'exit');child.kill('SIGTERM');let timer:ReturnType<typeof setTimeout>|undefined;try{await Promise.race([ended,new Promise<void>(resolve=>{timer=setTimeout(()=>{child.kill('SIGKILL');resolve();},10000);})]);}finally{if(timer)clearTimeout(timer);}}
