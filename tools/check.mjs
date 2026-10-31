import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {STRUCTURES,ALL,BY_ID,CIRCUITS,DISPLAY_REFERENCES,matches,displayMatches} from '../dist/data.js';
import {COURSES,CHAPTERS,CHAPTER_BY_ID,SOURCE_LINKS} from '../dist/courses.js';
import {FIGURES,FIGURE_BY_ID} from '../dist/figures.js';
import {QUESTIONS,selectQuestions,gradeAnswer,matchesScope} from '../dist/quiz.js';
import {IONS,PHASES,ionState,plotPoint,renderLab} from '../dist/signals.js';
import {ANATOMY_FIGURES,ANATOMY_EXERCISES,ANATOMY_QUESTIONS} from '../dist/anatomy-data.js';
import {createAnatomySession,anatomyReady,gradeAnatomySession,retryAnatomySession,PLANES,renderAnatomyExercise} from '../dist/anatomy.js';
import {integrate,nmdaState,RELEASE_STEPS,postsynapticPoint} from '../dist/synaptic-model.js';
import {createSynapticState,renderSynapticLab,renderIntegrationResult,renderNmdaResult} from '../dist/synaptic-labs.js';
const root=path.resolve(import.meta.dirname,'..');
const atlas=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/atlas.json')));
const meshes=Object.entries(atlas.meshes).map(([name,m])=>({name,...m}));
assert.equal(new Set(ALL.map(s=>s.id)).size,ALL.length);
for(const s of ALL){assert.ok(s.label&&s.where&&s.role&&s.remember,s.id);for(const id of s.related||[])assert.ok(BY_ID[id],`${s.id}: missing related ${id}`);}
for(const s of STRUCTURES){if(['micro','external','method'].includes(s.type))continue;if(s.type==='unmapped'){assert.ok(!meshes.some(m=>displayMatches(s,m)));assert.ok(FIGURE_BY_ID[s.figure],`${s.id}: missing 2D reference`);continue;}assert.ok(meshes.some(m=>matches(s,m)),`${s.id}: no anatomical match`);}
for(const s of STRUCTURES.filter(s=>s.parcels))for(const parcel of s.parcels)assert.ok(meshes.some(m=>m.kind==='cortex'&&m.label===parcel),`${s.id}: missing parcel ${parcel}`);
for(const id of ['opticNerve','auditoryNerve','spinal'])assert.ok(!meshes.some(m=>displayMatches(BY_ID[id],m)),`${id}: must not highlight a different anatomical structure`);
for(const [id,reference] of Object.entries(DISPLAY_REFERENCES)){if(reference.id)assert.ok(BY_ID[reference.id]);assert.ok(reference.label&&meshes.some(m=>displayMatches(BY_ID[id],m)),`${id}: missing illustrated reference`);}
assert.ok(BY_ID.m2&&BY_ID.sma&&BY_ID.sma.medial);
assert.ok(!matches(BY_ID.broca,meshes.find(m=>m.name==='rh_G_front_inf-Opercular')),'Left language landmark must not color both hemispheres');
assert.ok(!matches(BY_ID.premotor,meshes.find(m=>m.name==='lh_G_front_middle')),'Whole middle frontal gyrus is not a premotor boundary');
for(const c of CIRCUITS)for(const [id,label,description] of c.steps){assert.ok(BY_ID[id]);assert.ok(label&&description);}
const glb=fs.readFileSync(path.join(root,'dist/assets/brain.glb'));
assert.equal(glb.subarray(0,4).toString(),'glTF');assert.equal(glb.readUInt32LE(8),glb.length);
const json=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)).toString());
const names=json.nodes.filter(n=>n.mesh!==undefined).map(n=>n.name);
assert.equal(names.length,meshes.length);for(const n of names)assert.ok(atlas.meshes[n],n);
const bin=fs.readFileSync(path.join(root,'dist/assets/mri.bin'));
const length=bin.readUInt32LE(0),header=JSON.parse(bin.subarray(4,4+length));
assert.deepEqual(header.shape,[128,128,128]);assert.equal(bin.length,4+length+header.intensityBytes*3);
const segmentation=bin.subarray(4+length+header.intensityBytes);
const counts=new Map();for(let i=0;i<segmentation.length;i+=2){const value=segmentation.readUInt16LE(i);counts.set(value,(counts.get(value)||0)+1);}
for(const s of STRUCTURES.filter(s=>s.seg))assert.ok(s.seg.some(n=>counts.get(n)>0),`${s.id}: no segmented voxels`);
const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate HTML IDs');
for(const local of [...html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)].map(x=>x[1]))assert.ok(fs.existsSync(path.join(root,'dist',local)),local);
assert.ok(fs.existsSync(path.join(root,'dist/assets/dm-sans-latin.ttf')));
assert.ok(!html.includes('http://terminal.local')&&!html.includes('localhost'));
assert.equal(new Set(COURSES.map(c=>c.id)).size,COURSES.length);
assert.equal(new Set(CHAPTERS.map(c=>c.id)).size,CHAPTERS.length);
for(const c of COURSES){assert.ok(c.chapters.length&&fs.existsSync(path.join(root,'dist',c.source)));}
for(const ch of CHAPTERS){assert.ok(ch.title&&ch.summary&&ch.sections.length&&ch.takeaway,ch.id);for(const id of ch.structures)assert.ok(BY_ID[id],`${ch.id}: ${id}`);if(ch.figure)assert.ok(FIGURE_BY_ID[ch.figure]);for(const id of ch.sources||[])assert.ok(SOURCE_LINKS[id]);for(const id of ch.circuits||[])assert.ok(CIRCUITS.some(c=>c.id===id));assert.ok(QUESTIONS.some(q=>q.chapter===ch.id),`${ch.id}: no chapter exercise`);}
for(const ch of CHAPTERS){for(const id of ch.relatedChapters||[])assert.ok(CHAPTER_BY_ID[id],`${ch.id}: missing chapter link ${id}`);if(ch.lab)assert.ok(['ions','ap','release','integration','nmda'].includes(ch.lab),`${ch.id}: unknown lab`);}
for(const f of FIGURES){assert.ok(f.credit&&f.note&&f.parts.length>=3,f.id);for(const asset of [f.image,f.original,f.learnImage].filter(Boolean))assert.ok(fs.existsSync(path.join(root,'dist',asset)),asset);for(const p of f.parts){assert.ok(p.label&&p.explain);assert.ok(p.x>=0&&p.x<=100&&p.y>=0&&p.y<=100);if(p.structure)assert.ok(BY_ID[p.structure]);}}
assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,QUESTIONS.length);
for(const q of QUESTIONS){assert.ok(q.prompt&&q.explanation);assert.ok(q.options.includes(q.correct));assert.equal(q.options.length,new Set(q.options).size,q.id);assert.ok(q.options.length>=3&&q.options.length<=4,q.id);if(q.chapter)assert.ok(CHAPTER_BY_ID[q.chapter]);if(q.figure)assert.ok(FIGURE_BY_ID[q.figure].parts[q.part]);}
const deterministic=()=>.31;
for(const scope of ['all',...COURSES.map(c=>c.id),'td','anatomy'])for(const kind of ['mix','concepts','diagrams']){const session=selectQuestions({scope,kind},deterministic);assert.ok(session.length);assert.ok(session.every(q=>matchesScope(q,scope)&&(kind==='mix'||q.kind===kind)));assert.equal(session.length,new Set(session.map(q=>q.id)).size);for(const q of session){assert.ok(gradeAnswer(q,q.correct));assert.ok(!gradeAnswer(q,q.options.find(o=>o!==q.correct)));}}
assert.ok(selectQuestions({scope:'c3',kind:'diagrams',limit:200},deterministic).some(q=>q.figure==='glia'),'Shared TD glia questions must be available in course 3');
assert.ok(selectQuestions({scope:'c3',kind:'diagrams',limit:200},deterministic).some(q=>q.figure==='neuron'),'Shared TD neuron questions must be available in course 3');
for(const [ion,vm,direction] of [['K',-70,'sortie'],['K',-100,'entrée'],['Na',-70,'entrée'],['Na',80,'sortie'],['Cl',-70,'entrée'],['Cl',-90,'sortie'],['Ca',-70,'entrée']])assert.equal(ionState(ion,vm).movement,direction,`${ion} at ${vm} mV`);
for(const [ion,data] of Object.entries(IONS))assert.equal(ionState(ion,data.equilibrium).movement,'équilibre');
assert.throws(()=>ionState('invalid',-70));assert.throws(()=>ionState('K',NaN));
for(let phase=0;phase<PHASES.length;phase++){const p=PHASES[phase],point=plotPoint(p.t,p.v);assert.ok(point.x>0&&point.x<100&&point.y>0&&point.y<100);assert.ok(renderLab('ap',{phase}).includes(p.explain));}
assert.ok(renderLab('ions',{ion:'K',voltage:-90}).includes('Flux net nul'));
assert.ok(!renderLab('ions',{ion:'K',voltage:-70}).includes('Flux net nul'));
const retryIds=QUESTIONS.slice(0,4).map(q=>q.id);assert.deepEqual(new Set(selectQuestions({ids:retryIds},deterministic).map(q=>q.id)),new Set(retryIds));
for(const f of FIGURES)assert.equal(selectQuestions({kind:'diagrams',figure:f.id,limit:100},deterministic).length,f.parts.length);
// Le TD couvre les quatre consignes et toutes ses illustrations, sans tronquer
// une fiche à dix questions. Vérifier aussi le passage d'une copie incomplète
// à une correction, puis la reprise ciblée des erreurs de nom et de plan.
assert.equal(ANATOMY_EXERCISES.length,4);
assert.deepEqual(ANATOMY_EXERCISES.flatMap(e=>e.figures),ANATOMY_FIGURES.map(f=>f.id));
assert.equal(ANATOMY_FIGURES.reduce((n,f)=>n+f.parts.length,0),47);
for(const f of ANATOMY_FIGURES){
 assert.equal(f.markerPositions.length,f.parts.length);
 for(const [x,y] of f.markerPositions)assert.ok(x>0&&x<100&&y>0&&y<100);
 const asset=fs.readFileSync(path.join(root,'dist',f.image));
 assert.ok(asset.length>1000,`${f.id}: empty image`);
 assert.equal(asset.subarray(0,4).toString(),'RIFF');assert.equal(asset.subarray(8,12).toString(),'WEBP');
 const s=createAnatomySession(f.id);
 assert.ok(!anatomyReady(s));assert.throws(()=>gradeAnatomySession(s));
 const before=renderAnatomyExercise(s,()=>'',()=> '');
 assert.ok(!before.includes('anatomy-correction'));assert.ok(!before.includes('anatomy-result'));
 s.answers=f.parts.map(p=>p.label);
 if(f.plane){assert.ok(!anatomyReady(s));s.plane=f.plane;}
 assert.ok(anatomyReady(s));assert.equal(gradeAnatomySession(s).correct,f.parts.length+(f.plane?1:0));
 s.answers[0]=f.parts[1].label;if(f.plane)s.plane=PLANES.find(p=>p!==f.plane);
 s.result=gradeAnatomySession(s);s.revealed=true;
 assert.equal(s.result.correct,s.result.total-(f.plane?2:1));
 const retry=retryAnatomySession(s);assert.deepEqual(retry.indices,[0]);assert.equal(retry.requirePlane,Boolean(f.plane));
 assert.ok(!anatomyReady(retry));assert.equal(retry.answers[1],f.parts[1].label);
 retry.answers[0]=f.parts[0].label;retry.plane=f.plane||'';
 assert.equal(gradeAnatomySession(retry).correct,s.result.total);
}
assert.ok(fs.readFileSync(path.join(root,'dist/assets/td-anatomie.pdf')).subarray(0,5).equals(Buffer.from('%PDF-')));
assert.ok(ANATOMY_QUESTIONS.every(q=>QUESTIONS.some(x=>x.id===q.id)));
// Ordre des flèches du PDF : les noyaux ne doivent pas être confondus avec
// une cavité de LCR ou un faisceau de substance blanche.
assert.deepEqual(FIGURE_BY_ID['td-coronal'].parts.map(p=>p.label),['Ventricule latéral','Noyau caudé','Capsule interne','Putamen','Hippocampe']);
assert.deepEqual(FIGURE_BY_ID['td-axial'].parts.map(p=>p.label),['Corps calleux','Ventricule latéral','Noyau caudé','Putamen','Capsule interne','Thalamus','Troisième ventricule','Hippocampe','Insula']);
assert.equal(FIGURE_BY_ID['td-axial'].parts[6].structure,'ventricles');
// Cas numériques indépendants tirés des exercices, avec égalité au seuil et
// arrondi supérieur. La reprise des modèles ne doit pas changer ces réponses.
for(const [settings,voltage,reached,minimum] of [
 [{nE:19},-51,false,20],[{nE:20},-50,true,20],
 [{nE:26,nI:3},-50,true,26],[{nE:25,nI:3},-51,false,26],
 [{nE:13,nI:3,aE:2},-50,true,13],[{nE:17,nI:3,aE:1.5},-50.5,false,18],
 [{nE:18,nI:3,aE:1.5},-49,true,18],[{nE:22,nI:2},-52,false,24]
]){const r=integrate(settings);assert.equal(r.voltage,voltage);assert.equal(r.reached,reached);assert.equal(r.minimum,minimum);}
for(const settings of [{nE:-1},{nE:81},{nE:1.5},{nI:11},{aE:0},{aI:NaN}])assert.throws(()=>integrate(settings));
for(const [qid,state] of [['c4-twenty',{}],['c4-twentysix',{nI:3}],['c4-thirteen',{nI:3,aE:2}],['c4-rounding',{nI:3,aE:1.5}]])assert.equal(Number(QUESTIONS.find(q=>q.id===qid).correct),integrate(state).minimum);
for(let mask=0;mask<8;mask++){
 const state={glutamate:Boolean(mask&1),coagonist:Boolean(mask&2),depolarized:Boolean(mask&4)};
 assert.equal(nmdaState(state).conducts,mask===7);
 const html=renderNmdaResult(state);assert.ok(html.includes(mask===7?'Courant NMDA possible':'Conditions insuffisantes'));
}
assert.ok(renderIntegrationResult(createSynapticState()).includes('= −50 mV'));
for(const kind of ['release','integration','nmda'])assert.ok(renderSynapticLab(kind,createSynapticState()).length>500);
for(const step of RELEASE_STEPS)assert.ok(step.x>0&&step.x<100&&step.y>=0&&step.y<100&&step.explain);
assert.equal(RELEASE_STEPS.length,7);
assert.equal(CHAPTER_BY_ID['c1-mouvement'].figure,'motorCortices');
assert.ok(fs.readFileSync(path.join(root,'dist/assets/diagrams/motor-cortices-source.png')).subarray(1,4).equals(Buffer.from('PNG')));
for(const s of STRUCTURES.filter(s=>s.course===4))assert.ok(FIGURE_BY_ID[s.figure].parts.some(p=>p.structure===s.id),`${s.id}: missing 2D target`);
const ppse=postsynapticPoint('pps',10,-69),pa=postsynapticPoint('ap',2.4,30);
assert.ok(Math.abs(ppse.x-27.833333333)<.001&&Math.abs(ppse.y-61.325581395)<.001);
assert.ok(Math.abs(pa.x-51.96)<.001&&Math.abs(pa.y-14.428571429)<.001);
assert.equal(FIGURE_BY_ID.postsynaptic.parts[1].x,ppse.x);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'.openai/hosting.json')));assert.ok(manifest.project_id);assert.equal(manifest.static.directory,'dist');
console.log(`PASS: ${COURSES.length} cours, ${CHAPTERS.length} chapitres, ${FIGURES.length} schémas, ${QUESTIONS.length} questions, ${ALL.length} fiches, ${CIRCUITS.length} circuits, ${meshes.length} surfaces et 3 plans IRM. Filtres, corrections et reprise des questions vérifiés.`);
