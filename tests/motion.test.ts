import {it,expect} from 'vitest';
import {motions,motionIds,motionReadingTime} from '../packages/motion/src/catalog.ts';
it('every advertised motion has a stable unique ID and a readable hold after its last reveal',()=>{expect(motions.map(m=>m.id)).toEqual([...motionIds]);expect(new Set(motions.map(m=>m.id)).size).toBe(6);for(const m of motions){expect(m.hold).toBeGreaterThanOrEqual(3);expect(motionReadingTime(m.id,5)-(.1+m.duration+4*m.stagger)).toBeCloseTo(m.hold);}});
