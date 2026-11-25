import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {gallery} from '../motion/src/gallery.ts';
const b=await chromium.launch();try{
 const p=await b.newPage();await p.goto('http://127.0.0.1:4310/?tab=animations');
 const cards=p.locator('.motion-card');await cards.first().waitFor();
 assert.equal(await cards.count(),gallery.length);assert.equal(await p.getByRole('slider').count(),0);
 await p.getByRole('button',{name:/^Pending/}).click();assert.equal(await p.locator('video').count(),0);
 assert.equal(await cards.count(),gallery.filter(x=>x.status==='pending').length);
 await p.getByRole('button',{name:/^Rill Coffee/}).click();assert.equal(await cards.count(),gallery.filter(x=>x.status==='coffee-preview').length);
 for(const card of await cards.all()){await card.scrollIntoViewIfNeeded();await card.hover();
 await card.getByRole('button',{name:/^Pause/}).click();await card.getByRole('button',{name:/^Play/}).click();
 await card.locator('summary').click();await card.locator('.motion-info-body').waitFor();}
 await p.emulateMedia({reducedMotion:'reduce'});await p.locator('.film-still').first().waitFor();
 assert.equal(await p.locator('.motion-toggle').count(),0);console.log('Catalog count, pending and coffee filters, disclosures, controls and reduced motion passed.');
}finally{await b.close();}
