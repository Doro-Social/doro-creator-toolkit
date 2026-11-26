import React, {useEffect, useState} from 'react';
import type {BrandAsset} from '../../../packages/media/src/brand-assets';

export type UseBrandAsset = (asset: BrandAsset, target: 'photo' | 'logo') => Promise<void>;

async function json(response: Response) {
  const body = await response.json();
  if (!response.ok) throw new Error(body.message);
  return body;
}

export function BrandAssetLibrary({kitId, kitName, canApply, onUse}: {
  kitId: string; kitName: string; canApply: boolean; onUse: UseBrandAsset;
}) {
  const [items, setItems] = useState<BrandAsset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<BrandAsset['kind']>('photo');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [version, setVersion] = useState(0);
  const route = '/api/brands/' + kitId + '/assets';

  useEffect(() => {
    const controller = new AbortController();
    fetch(route, {signal:controller.signal}).then(json).then(list => {
      setItems(list); setLoaded(true);
    }).catch(error => {if (!controller.signal.aborted) setStatus(error.message);});
    return () => controller.abort();
  }, [route, version]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !label.trim()) return;
    const form = event.currentTarget;
    setBusy(true);
    try {
      if (file.size > 10485760) throw new Error('Choose an image up to 10 MB.');
      const base64 = await new Promise<string>((resolve,reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(new Error('Could not read this file.'));
        reader.readAsDataURL(file);
      });
      await json(await fetch(route, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({label,kind,base64})}));
      form.reset(); setFile(null); setLabel(''); setKind('photo');
      setStatus('Saved to ' + kitName + '.'); setVersion(v => v + 1);
    } catch (error) { setStatus((error as Error).message); }
    finally { setBusy(false); }
  }

  return <section aria-label={'Assets for ' + kitName}>
    <h3>Assets for {kitName}</h3>
    <p>Keep logos, icons and images here for your next project.</p>
    <form onSubmit={save}>
      <label>Choose an image<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" disabled={busy}
        onChange={e => {const next = e.target.files?.[0] || null; setFile(next); setLabel(next?.name.replace(/\.[^.]+$/, '').slice(0,100) || ''); if(next?.name.toLowerCase().endsWith('.svg'))setKind('logo');}}/></label>
      {file && <>
        <label>Asset name<input required value={label} maxLength={100} disabled={busy} onChange={e=>setLabel(e.target.value)}/></label>
        <label>Asset type<select value={kind} disabled={busy} onChange={e=>setKind(e.target.value as BrandAsset['kind'])}>
          <option value="photo">Photo</option><option value="logo">Logo</option><option value="icon">Icon</option><option value="screenshot">Screenshot</option>
        </select></label>
        <button disabled={busy || !label.trim()} type="submit">Save to brand</button>
      </>}
    </form>
    {loaded && !items.length && <p>No saved assets yet.</p>}
    {items.length > 0 && !canApply && <p>Apply this kit to the draft and save your changes to use its assets.</p>}
    {items.map(asset => <div className="brand-asset" key={asset.id}>
      <img src={route+'/'+asset.id+'/preview'} alt="" loading="lazy" width="50" height="50" style={{objectFit:'contain'}}/>
      <div><strong>{asset.label}</strong><small>{asset.kind}</small></div>
      <div><button disabled={!canApply || busy} onClick={()=>void onUse(asset,'photo')}>Use on slide</button>
        {asset.kind==='logo' && <button disabled={!canApply || busy} onClick={()=>void onUse(asset,'logo')}>Use as project logo</button>}</div>
    </div>)}
    <button type="button" disabled={busy} onClick={()=>setVersion(v=>v+1)}>Refresh assets</button>
    {status && <p role="status">{status}</p>}
  </section>;
}
