import {COURSES,CHAPTERS,CHAPTER_BY_ID,SOURCE_LINKS} from './courses.js';
import {FIGURES,FIGURE_BY_ID} from './figures.js';
import {QUESTIONS,selectQuestions,gradeAnswer,matchesScope} from './quiz.js';
import {renderLab,renderIonResult,formatVoltage,IONS} from './signals.js';
import {BY_ID,CIRCUITS} from './data.js';
import {openAtlas,endCircuit} from './app.js';
import {ANATOMY_EXERCISES,ANATOMY_QUESTIONS} from './anatomy-data.js';
import {createAnatomySession,anatomyReady,gradeAnatomySession,retryAnatomySession,renderAnatomyHome,renderAnatomyExercise} from './anatomy.js';
import {createSynapticState,renderSynapticLab,renderIntegrationResult,renderNmdaResult} from './synaptic-labs.js';
import {integrate,RELEASE_STEPS} from './synaptic-model.js';

const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storageKey='cerveau-learning-v1';
function readProgress(){try{const p=JSON.parse(localStorage.getItem(storageKey)||'{}');return {done:Array.isArray(p.done)?p.done.filter(id=>CHAPTER_BY_ID[id]):[],answers:p.answers&&typeof p.answers==='object'&&!Array.isArray(p.answers)?p.answers:{},last:CHAPTER_BY_ID[p.last]?p.last:null};}catch{return {done:[],answers:{},last:null};}}
const progress=readProgress();
function saveProgress(){try{localStorage.setItem(storageKey,JSON.stringify(progress));}catch{/* La lecture et les exercices restent utilisables sans stockage. */}}
const ui={screen:'courses',chapter:null,figure:'lobes',part:0,labels:true,atlasMode:'2d',quiz:null,scope:'all',kind:'mix',quizFigure:'all',anatomy:null};
const labState={ion:'K',voltage:-70,phase:0};
let synapticState=createSynapticState();
const scopeLabel=scope=>scope==='td'?'TD · CELLULES':scope==='anatomy'?'TD · ANATOMIE':'COURS '+(COURSES.find(c=>c.id===scope)?.number||'');
const markerPositions={neuron:[[18,15],[15,38],[35,47],[67,41],[75,52],[53,78],[90,70]],basal:[[53,46],[25,60],[24,84],[62,48],[64,69]]};
function figureCredit(f){return `<div class="figure-credit">${f.source?`<a href="${esc(f.source)}" target="_blank" rel="noopener">${esc(f.credit)}</a>`:esc(f.credit)}${f.license?` · <a href="${esc(f.licenseUrl)}" target="_blank" rel="noopener">${esc(f.license)}</a>`:''}<span>${esc(f.changes)}</span></div>`;}
function diagram(f,{active=0,quiz=false,interactive=true,showLabels=true,exercise=false}={}){
 const fixed=f.markerPositions||markerPositions[f.id];
 const positions=f.parts.map((p,i)=>fixed?.[i]||[p.x,p.y]);
 const leaders=fixed?`<svg class="diagram-leaders ${f.scope==='anatomy'?'anatomy-leaders':f.showTarget?'synaptic-leaders':''}" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${f.parts.map((p,i)=>`<line class="${i===active?'active':''}" x1="${p.x}" y1="${p.y}" x2="${positions[i][0]}" y2="${positions[i][1]}"/><circle cx="${p.x}" cy="${p.y}" r=".55"/>`).join('')}</svg>`:'';
 const target=f.scope==='anatomy'||f.showTarget?`<span class="diagram-target" style="left:${f.parts[active].x}%;top:${f.parts[active].y}%" aria-hidden="true"></span>`:'';
 return `<div class="diagram-canvas"><img src="${esc(!quiz&&showLabels&&f.learnImage?f.learnImage:f.image)}" alt="${esc(f.alt)}" loading="lazy">${leaders}${target}${f.parts.map((p,i)=>`<button type="button" class="diagram-marker ${i===active?'active':''}" style="left:${positions[i][0]}%;top:${positions[i][1]}%" ${interactive&&!quiz?(exercise?`data-anatomy-part="${i}"`:`data-part="${i}" data-part-figure="${f.id}"`):''} aria-label="Repère ${i+1}${quiz||!showLabels?'':': '+esc(p.label)}" aria-pressed="${i===active}" ${quiz?'tabindex="-1"':''}>${i+1}</button>`).join('')}</div>`;
}
function partInfo(f,index,{links=true}={}){const p=f.parts[index];if(!p)return '';return `<div class="part-info"><p class="eyebrow">REPÈRE ${index+1}</p><h3>${esc(p.label)}</h3><p>${esc(p.explain)}</p>${links&&p.structure&&BY_ID[p.structure]&&BY_ID[p.structure].type!=='unmapped'?`<button class="text-button" data-structure="${p.structure}">Observer dans l’atlas 3D <span aria-hidden="true">↗</span></button>`:''}</div>`;}
function legend(f,active,visible=true){return `<div class="diagram-legend">${f.parts.map((p,i)=>`<button type="button" data-part="${i}" data-part-figure="${f.id}" class="${i===active?'active':''}" aria-pressed="${i===active}"><span>${i+1}</span>${visible?esc(p.label):'Repère '+(i+1)}</button>`).join('')}</div>`;}
function mastery(){return QUESTIONS.filter(q=>progress.answers[q.id]===true).length;}
function renderHome(){
 const latest=COURSES.at(-1);
 $('courseCountTitle').textContent=COURSES.length+' cours, un fil conducteur.';
 $('latestCourse').href='#cours/'+latest.id+'/'+latest.chapters[0].id;
 $('latestCourse').textContent='Découvrir le cours '+Number(latest.number)+' ↗';
 $('courseProgress').textContent=progress.done.length+' / '+CHAPTERS.length+' chapitres marqués compris';
 $('courseGrid').dataset.courseCount=String(COURSES.length);
 $('courseGrid').innerHTML=COURSES.map(c=>{
  const done=c.chapters.filter(ch=>progress.done.includes(ch.id)).length;
  const first=c.chapters.find(ch=>!progress.done.includes(ch.id))||c.chapters[0];
  return `<article class="course-card"><div class="course-card-top"><span class="course-number">${c.number}</span><span class="course-tag">COURS ${c.number}</span><small>${c.chapters.length} chapitres</small></div><h3>${esc(c.title)}</h3><p>${esc(c.subtitle)}</p><div class="course-topics">${c.chapters.slice(0,3).map(ch=>`<span>${esc(ch.kicker)}</span>`).join('')}</div><div class="course-card-bottom"><a href="#cours/${c.id}/${first.id}" class="primary-button">${done?'Continuer':'Commencer'} <span aria-hidden="true">→</span></a><span>${done} / ${c.chapters.length} compris</span></div><div class="course-meter"><i style="width:${done/c.chapters.length*100}%"></i></div></article>`;
 }).join('');
}
function readMinutes(ch){return Math.max(2,Math.ceil(ch.sections.map(s=>s.text+' '+(s.precision||'')).join(' ').split(/\s+/).length/150));}
function renderChapterNav(ch){
 const course=COURSES.find(c=>c.id===ch.course);
 $('chapterNav').innerHTML=`<a class="back-link" href="#cours">← Tous les cours</a><p class="eyebrow">COURS ${course.number}</p><h2>${esc(course.title)}</h2><label class="course-select-label">Changer de cours<select id="courseSelect">${COURSES.map(c=>`<option value="${c.id}" ${c.id===course.id?'selected':''}>${c.number} · ${esc(c.title)}</option>`).join('')}</select></label><ol>${course.chapters.map((c,i)=>`<li><a href="#cours/${course.id}/${c.id}" class="${c.id===ch.id?'active':''}" ${c.id===ch.id?'aria-current="page"':''}><span class="chapter-number ${progress.done.includes(c.id)?'done':''}">${progress.done.includes(c.id)?'✓':String(i+1).padStart(2,'0')}</span><span>${esc(c.title)}<small>${readMinutes(c)} min de lecture</small></span></a></li>`).join('')}</ol><div class="nav-learning-note">Lire → observer → se tester.<br>Tu peux avancer dans l’ordre ou revenir sur une notion.</div>`;
}
function lessonFigure(ch){const f=FIGURE_BY_ID[ch.figure];if(!f)return '';if(['release','nmda'].includes(ch.lab))return `<div class="learn-lab synaptic-lab" id="synapticLab" data-synaptic-lab="${ch.lab}">${renderSynapticLab(ch.lab,synapticState)}</div><div class="visual-actions"><a href="#atlas/${f.id}" class="text-button">Agrandir le schéma ↗</a><button class="text-button" data-quiz-figure="${f.id}">Se tester sur ce schéma →</button></div>${figureCredit(f)}`;if(ch.lab==='ap')return `<div class="learn-lab" id="signalLab" data-lab="ap">${renderLab('ap',labState)}</div>${figureCredit(f)}`;return `<div class="lesson-visual" id="lessonFigure"><div class="visual-head"><p class="eyebrow">OBSERVER EN 2D</p><h2>${esc(f.title)}</h2><small>${esc(f.orientation)}</small></div>${diagram(f)}${legend(f,0)}${partInfo(f,0)}<p class="figure-note">${esc(f.note)}</p><div class="visual-actions"><a href="#atlas/${f.id}" class="text-button">Agrandir le schéma ↗</a><button class="text-button" data-quiz-figure="${f.id}">Se tester sur ce schéma →</button></div>${figureCredit(f)}</div>`;}
function updateLab(){const host=$('signalLab');if(host)host.innerHTML=renderLab(host.dataset.lab,labState);}
function updateSynapticLab(){const host=$('synapticLab');if(host)host.innerHTML=renderSynapticLab(host.dataset.synapticLab,synapticState);}
function updateIntegration(key,value){
 if(!['nE','nI','aE','aI'].includes(key))return;
 const next={...synapticState,[key]:Number(value)};try{integrate(next);}catch{return;}
 synapticState=next;$('integrationResult').innerHTML=renderIntegrationResult(synapticState);
 $('integrationExcitationValue').textContent=synapticState.nE;$('integrationInhibitionValue').textContent=synapticState.nI;
}
function renderLesson(ch){
 labState.ion=ch.labIon||'K';labState.voltage=-70;labState.phase=0;synapticState=createSynapticState();
 ui.chapter=ch.id;progress.last=ch.id;saveProgress();renderChapterNav(ch);
 const course=COURSES.find(c=>c.id===ch.course),index=course.chapters.findIndex(x=>x.id===ch.id),next=course.chapters[index+1];
 const done=progress.done.includes(ch.id);
 const table=ch.table?`<div class="lesson-table"><table><thead><tr>${ch.table.headers.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${ch.table.rows.map(row=>`<tr>${row.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
 $('lessonContent').innerHTML=`<div class="lesson-heading"><p class="eyebrow">COURS ${course.number} <span> / </span> CHAPITRE ${String(index+1).padStart(2,'0')} <span> / </span> ${readMinutes(ch)} MIN</p><h1 tabindex="-1">${esc(ch.title)}</h1><p>${esc(ch.summary)}</p></div><div class="lesson-columns ${ch.figure?'has-figure':''}"><article class="lesson-text">${ch.sections.map((s,i)=>`<section><h2><span>${String(i+1).padStart(2,'0')}</span>${esc(s.title)}</h2><p>${esc(s.text)}</p>${s.precision?`<div class="science-note"><strong>Précision scientifique</strong><p>${esc(s.precision)}</p></div>`:''}</section>`).join('')}${table}${(ch.formulas||[]).map(f=>`<div class="lesson-formula"><code>${esc(f.text)}</code><p>${esc(f.caption)}</p></div>`).join('')}${(ch.worked||[]).map(w=>`<div class="worked-example"><h2>${esc(w.title)}</h2><ol>${w.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol><strong>${esc(w.result)}</strong></div>`).join('')}${ch.example?`<div class="lesson-example"><strong>Dans la vie quotidienne</strong><p>${esc(ch.example)}</p></div>`:''}<div class="lesson-takeaway"><p class="eyebrow">L’ESSENTIEL</p><p>${esc(ch.takeaway)}</p></div><div class="lesson-practice"><h2>Vérifier que tu as compris</h2><button class="primary-button" data-quiz-chapter="${ch.id}">Réviser ce chapitre →</button>${ch.circuits?.map(id=>`<a href="#circuit/${id}" class="secondary-button">Suivre le circuit : ${esc(CIRCUITS.find(c=>c.id===id).label)}</a>`).join('')||''}${ch.exercise?'<a href="#revision/td" class="secondary-button">Exercices du TD →</a>':''}</div>${ch.relatedChapters?.length?`<div class="chapter-connections"><p class="eyebrow">FAIRE LE LIEN ENTRE LES COURS</p>${ch.relatedChapters.map(id=>{const other=CHAPTER_BY_ID[id];return `<a href="#cours/${other.course}/${id}">${esc(other.title)} →</a>`;}).join('')}</div>`:''}<details class="lesson-sources"><summary>Cours d’origine et références</summary><a href="${course.source}" target="_blank" rel="noopener">Texte du cours ${course.number} fourni</a>${(ch.sources||[]).map(id=>`<a href="${SOURCE_LINKS[id].url}" target="_blank" rel="noopener">${esc(SOURCE_LINKS[id].label)}</a>`).join('')}<p>Le chapitre reformule et organise le cours. Les précisions sont signalées dans le texte.</p></details></article><aside class="lesson-companion">${ch.lab==='integration'?`<div class="learn-lab synaptic-lab" id="synapticLab" data-synaptic-lab="integration">${renderSynapticLab('integration',synapticState)}</div>`:''}${ch.lab==='ions'?`<div class="learn-lab" id="signalLab" data-lab="ions">${renderLab('ions',labState)}</div>`:''}${lessonFigure(ch)}<div class="lesson-structures"><p class="eyebrow">LES REPÈRES DU CHAPITRE</p><h2>${['c3','c4'].includes(ch.course)?'Retrouver les notions':'Faire le lien avec l’atlas'}</h2>${ch.structures.map(id=>`<button data-structure="${id}"><span>${esc(BY_ID[id].label)}</span><small>${BY_ID[id].type==='unmapped'?'2D':BY_ID[id].type==='micro'?'Cellule':'↗'}</small></button>`).join('')}<p>${ch.course==='c3'?'Ces notions sont représentées à l’échelle cellulaire. Les schémas sont pédagogiques.':ch.course==='c4'?'Les synapses sont à l’échelle cellulaire. Les fiches corticales et EEG font le lien avec les réseaux.':'La 3D montre des repères anatomiques. Les limites fonctionnelles restent indicatives.'}</p></div></aside></div><div class="lesson-footer"><button class="secondary-button ${done?'completed':''}" data-complete="${ch.id}" aria-pressed="${done}">${done?'✓ Chapitre compris':'Marquer comme compris'}</button>${next?`<a href="#cours/${course.id}/${next.id}" class="primary-button">Chapitre suivant →</a>`:`<a href="#revision/${course.id}" class="primary-button">Réviser le cours →</a>`}</div>`;
}
function renderCircuits(){
 $('circuitGrid').innerHTML=CIRCUITS.map((c,i)=>`<a href="#circuit/${c.id}" class="circuit-card" style="--circuit-color:${c.color}"><span class="circuit-number">0${i+1}</span><h2>${esc(c.label)}</h2><p>${esc(c.summary)}</p><div><span>${c.steps.length} étapes</span><strong>Suivre le circuit →</strong></div></a>`).join('');
}
function renderFlat(){
 const f=FIGURE_BY_ID[ui.figure]||FIGURES[0];if(ui.part>=f.parts.length)ui.part=0;
 $('atlas2D').innerHTML=`<aside class="flat-nav"><p class="eyebrow">CHOISIR UN SCHÉMA</p>${FIGURES.map(x=>`<button data-figure="${x.id}" class="${x.id===f.id?'active':''}" aria-pressed="${x.id===f.id}"><span>${esc(x.title)}</span><small>${x.scope==='td'?'TD · cellules · lié au cours 3':x.scope==='anatomy'?'TD · anatomie · cours 1 et 2':'Cours '+Number(COURSES.find(c=>c.id===x.scope)?.number)}</small></button>`).join('')}<div class="nav-learning-note">La 2D stabilise le point de vue.<br>La 3D permet de comprendre les volumes et les positions.</div></aside><div class="flat-main"><div class="flat-head"><div><h2>${esc(f.title)}</h2><p>${esc(f.orientation)}${ui.labels&&f.plane?" · "+esc(f.plane):""}</p></div><button class="secondary-button" id="toggleLabels" aria-pressed="${ui.labels}">${ui.labels?'Masquer':'Afficher'} les noms</button></div>${diagram(f,{active:ui.part,showLabels:ui.labels})}<p class="figure-note">${esc(f.note)}</p>${figureCredit(f)}</div><aside class="flat-detail"><p class="eyebrow">${ui.labels?'LÉGENDE INTERACTIVE':'TESTE TON REPÉRAGE'}</p>${legend(f,ui.part,ui.labels)}${ui.labels?partInfo(f,ui.part):'<p class="hidden-label-note">Noms masqués. Observe les numéros, puis affiche la légende pour vérifier.</p>'}<button class="primary-button" data-quiz-figure="${f.id}">Légender ce schéma →</button>${f.original?`<details class="original-figure"><summary>Voir l’illustration source</summary><a href="${f.original}" target="_blank" rel="noopener">${esc(f.originalLabel||'Ouvrir l’image d’origine (anglais) ↗')}</a></details>`:''}</aside>`;
}
function showScreen(screen){
 ui.screen=screen;
 $('courseScreen').hidden=screen!=='courses';$('circuitScreen').hidden=screen!=='circuits';$('revisionScreen').hidden=screen!=='revision';$('atlasScreen').hidden=!['atlas','circuit'].includes(screen);
 document.querySelectorAll('[data-screen]').forEach(a=>{const current=a.dataset.screen===(screen==='circuit'?'circuits':screen);a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 if(!['circuit','atlas'].includes(screen))endCircuit();
}
function setAtlasMode(mode){
 ui.atlasMode=mode;$('atlas2D').hidden=mode!=='2d';$('atlasWorkspace').hidden=mode!=='3d';
 document.querySelectorAll('[data-atlas-mode]').forEach(b=>{const active=b.dataset.atlasMode===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 if(mode==='2d')renderFlat();
}
function renderSetup(){
 ui.quiz=null;$('quizSetup').hidden=false;$('quizSession').hidden=true;
 if(ui.scope==='anatomy'){$('quizSetup').innerHTML=renderAnatomyHome(progress);return;}
 const scopes=[['all','Tous les cours + les TD'],...COURSES.map(c=>[c.id,`Cours ${c.number} · ${c.title}`]),['td','TD · neurones et glie'],['anatomy','TD · anatomie du cerveau']];
 const figures=FIGURES.filter(f=>matchesScope(f,ui.scope));
 if(!figures.some(f=>f.id===ui.quizFigure))ui.quizFigure='all';
 const count=QUESTIONS.filter(q=>matchesScope(q,ui.scope)&&(ui.kind==='mix'||q.kind===ui.kind)&&(ui.quizFigure==='all'||q.figure===ui.quizFigure)).length;
 $('quizSetup').innerHTML=`<div class="revision-td-links"><a href="#revision/anatomy"><strong>TD d’anatomie</strong><span>4 exercices · lobes, coupes, aires, IRM →</span></a><a href="#revision/td"><strong>TD · neurones et glie</strong><span>Schémas cellulaires et QCM →</span></a></div><p class="eyebrow">APPRENDRE EN SE TESTANT</p><h1>Ce que tu sais. Ce qu’il reste à revoir.</h1><p class="page-lead">Une réponse à choisir, une explication après validation. Les images gardent leurs numéros et leurs réponses restent cachées pendant la question.</p><div class="quiz-setup-grid"><div class="quiz-settings"><label>1. Choisir un contenu<select id="quizScope">${scopes.map(([id,label])=>`<option value="${id}" ${id===ui.scope?'selected':''}>${esc(label)}</option>`).join('')}</select></label><fieldset class="quiz-kind"><legend>2. Choisir une façon de réviser</legend>${[['mix','Mélanger','Notions + schémas'],['concepts','QCM de cours','Comprendre et distinguer'],['diagrams','Schémas 2D','Identifier les numéros']].map(([id,label,desc])=>`<label><input type="radio" name="quizKind" value="${id}" ${id===ui.kind?'checked':''}><span><strong>${label}</strong><small>${desc}</small></span></label>`).join('')}</fieldset>${ui.kind==='diagrams'?`<label>3. Choisir un schéma<select id="quizFigure"><option value="all">Tous les schémas de ce contenu</option>${figures.map(f=>`<option value="${f.id}" ${f.id===ui.quizFigure?'selected':''}>${esc(f.title)}</option>`).join('')}</select></label>`:''}<div class="quiz-start-row"><button class="primary-button" id="startQuiz" ${count?'':'disabled'}>Commencer la séance →</button><span>${Math.min(count,10)} questions · sans chronomètre</span></div></div><aside class="quiz-intro-card"><img src="./assets/diagrams/td-neuron.webp" alt="Image sans correction d’un neurone du TD"><p class="eyebrow">TA PROGRESSION SUR CET APPAREIL</p><strong>${mastery()} / ${QUESTIONS.length}</strong><p>questions réussies à la dernière tentative.</p><p class="local-note">Les chapitres compris et les réponses sont enregistrés dans ce navigateur.</p></aside></div>`;
}
function startQuiz(options={}){
 const settings={scope:ui.scope,kind:ui.kind,figure:ui.kind==='diagrams'&&ui.quizFigure!=='all'?ui.quizFigure:undefined,...options};
 if(settings.chapter)delete settings.figure;
 if(settings.ids){delete settings.figure;delete settings.chapter;}
 const questions=selectQuestions(settings);
 if(!questions.length)return;
 ui.quiz={questions,index:0,answer:null,revealed:false,records:[]};showScreen('revision');$('quizSetup').hidden=true;$('quizSession').hidden=false;renderQuestion();
}
function renderAnatomy(){
 ui.quiz=null;$('quizSetup').hidden=true;$('quizSession').hidden=false;
 $('quizSession').innerHTML=renderAnatomyExercise(ui.anatomy,diagram,figureCredit);
}
function selectAnatomyPart(index){
 const s=ui.anatomy;if(!s||!FIGURE_BY_ID[s.figure].parts[index])return;
 s.active=index;$('quizSession').querySelectorAll?.('[data-anatomy-row]')?.forEach(row=>row.classList.toggle('active',Number(row.dataset.anatomyRow)===index));$('anatomyDiagram').innerHTML=diagram(FIGURE_BY_ID[s.figure],{active:index,showLabels:false,exercise:true});
}
function updateAnatomyAnswers(){
 const s=ui.anatomy;
 $('validateAnatomy').disabled=!anatomyReady(s);
 const done=s.indices.filter(i=>s.answers[i]).length+(s.requirePlane&&s.plane?1:0);
 $('anatomyFilled').textContent=`${done} / ${s.indices.length+(s.requirePlane?1:0)} réponses choisies`;
}
function renderQuestion(){
 const s=ui.quiz,q=s.questions[s.index],f=FIGURE_BY_ID[q.figure];
 const revealed=s.revealed,correct=revealed&&gradeAnswer(q,s.answer);
 $('quizSession').innerHTML=`<div class="quiz-top"><button class="back-link" id="leaveQuiz">← Choisir une autre séance</button><span>Question ${s.index+1} / ${s.questions.length}</span></div><div class="quiz-meter"><i style="width:${(s.index+1)/s.questions.length*100}%"></i></div><div class="quiz-question-layout ${f?'with-diagram':''}">${f?`<div class="quiz-figure"><h2>${esc(f.title)}</h2><p>${esc(f.orientation)}</p>${diagram(f,{active:q.part,quiz:true,interactive:false})}<p class="figure-note">${esc(f.note)}</p>${figureCredit(f)}</div>`:''}<div class="quiz-question"><p class="eyebrow">${scopeLabel(q.scope)}${f?' · IDENTIFICATION':' · COMPRÉHENSION'}</p><h1 tabindex="-1">${esc(q.prompt)}</h1><form id="answerForm"><fieldset><legend class="visually-hidden">Choisis une réponse</legend>${q.options.map((o,i)=>`<label class="answer-option ${revealed?(o===q.correct?'correct':o===s.answer?'incorrect':'muted'):''}"><input type="radio" name="answer" value="${i}" ${s.answer===o?'checked':''} ${revealed?'disabled':''}><span class="answer-letter">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span>${revealed&&o===q.correct?'<span class="answer-result">✓</span>':revealed&&o===s.answer?'<span class="answer-result">×</span>':''}</label>`).join('')}</fieldset>${revealed?'':`<button type="submit" class="primary-button" id="validateAnswer" ${s.answer===null?'disabled':''}>Valider ma réponse</button>`}</form>${revealed?`<div class="quiz-feedback ${correct?'is-correct':'is-incorrect'}" tabindex="-1"><strong>${correct?'Oui, c’est ça.':'À revoir : '+esc(q.correct)}</strong><p>${esc(q.explanation)}</p></div><button class="primary-button" id="nextQuestion">${s.index===s.questions.length-1?'Voir mon bilan':'Question suivante'} →</button>`:''}</div></div>`;
}
function renderResult(){
 const s=ui.quiz,correct=s.records.filter(r=>r.correct).length,missed=s.records.filter(r=>!r.correct);
 $('quizSession').innerHTML=`<div class="quiz-result"><p class="eyebrow">BILAN DE LA SÉANCE</p><h1>Chaque réponse devient un repère.</h1><div class="result-score"><strong>${correct}<span> / ${s.questions.length}</span></strong><p>${missed.length?missed.length+' notion'+(missed.length>1?'s':'')+' à revoir.':'Toutes les réponses de cette séance sont correctes.'}</p></div>${missed.length?`<div class="review-list"><h2>Prends le temps de revoir ces points</h2>${missed.map(r=>`<details><summary>${r.question.figure?esc(FIGURE_BY_ID[r.question.figure].title)+' · repère '+(r.question.part+1):esc(r.question.prompt)}</summary><strong>${esc(r.question.correct)}</strong><p>${esc(r.question.explanation)}</p>${r.question.chapter?`<a href="#cours/${r.question.scope}/${r.question.chapter}">Relire le chapitre →</a>`:''}</details>`).join('')}</div>`:''}<div class="result-actions">${missed.length?'<button class="primary-button" id="retryMissed">Reprendre mes erreurs →</button>':''}<button class="secondary-button" id="newQuiz">Nouvelle séance</button><a href="#cours" class="text-button">Revenir aux cours</a></div></div>`;
}
function navigateToStructure(id){const s=BY_ID[id];if(!s)return;if(s.type==='unmapped')location.hash='atlas/'+s.figure+'/'+id;else location.hash='atlas/3d/'+id;}
function launchQuiz(options){history.pushState(null,'','#revision');showScreen('revision');startQuiz(options);window.scrollTo({top:0});}
function route(){
 let parts;try{parts=decodeURIComponent(location.hash.slice(1)).split('/');}catch{parts=[];}
 const [base,p1,p2,p3]=parts;
 if(base==='atlas'){
  showScreen('atlas');$('atlasHeading').textContent='L’atlas du cerveau';$('atlasEyebrow').textContent='REPÉRER ET COMPARER';$('backCircuits').hidden=true;
  if(p1==='3d'){setAtlasMode('3d');const id=BY_ID[p2]?p2:undefined;openAtlas({id,view:id&&BY_ID[id].type==='micro'?'neuron':id==='irm'?'mri':'brain'});}
  else{endCircuit();ui.figure=FIGURE_BY_ID[p1]?p1:ui.figure;ui.part=p2?Math.max(0,FIGURE_BY_ID[ui.figure].parts.findIndex(p=>p.structure===p2)):0;if(p2&&BY_ID[p2])ui.labels=true;setAtlasMode('2d');}
 }else if(base==='circuit'&&CIRCUITS.some(c=>c.id===p1)){
  showScreen('circuit');$('atlasHeading').textContent=CIRCUITS.find(c=>c.id===p1).label;$('atlasEyebrow').textContent='SUIVRE LE CIRCUIT';$('backCircuits').hidden=false;setAtlasMode('3d');openAtlas({circuit:p1});
 }else if(base==='circuits'){showScreen('circuits');renderCircuits();}
 else if(base==='revision'){
  showScreen('revision');ui.scope=['all','td','anatomy',...COURSES.map(c=>c.id)].includes(p1)?p1:'all';ui.quizFigure='all';
  const exercise=p1==='anatomy'&&ANATOMY_EXERCISES.find(e=>e.id===p2);
  if(exercise){ui.anatomy=createAnatomySession(exercise.figures.includes(p3)?p3:exercise.figures[0]);renderAnatomy();}else{ui.anatomy=null;renderSetup();}
 }
 else{
  showScreen('courses');const course=COURSES.find(c=>c.id===p1),chapter=course&&(course.chapters.find(c=>c.id===p2)||course.chapters.find(c=>!progress.done.includes(c.id))||course.chapters[0]);
  $('courseLanding').hidden=Boolean(chapter);$('lessonLayout').hidden=!chapter;
  if(chapter)renderLesson(CHAPTER_BY_ID[chapter.id]);else{ui.chapter=null;renderHome();}
 }
 window.scrollTo({top:0,behavior:'instant'});
}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.structure)navigateToStructure(b.dataset.structure);
 else if(b.dataset.synapseStep!==undefined){const step=Number(b.dataset.synapseStep);if(Number.isInteger(step)&&RELEASE_STEPS[step]){synapticState.releaseStep=step;updateSynapticLab();}}
 else if(b.dataset.integrationPreset){const preset=Number(b.dataset.integrationPreset);synapticState={...synapticState,nE:preset,nI:preset===26?3:0,aE:1,aI:2};updateSynapticLab();}
 else if(b.dataset.anatomyPart!==undefined){const index=Number(b.dataset.anatomyPart);selectAnatomyPart(index);const field=$('anatomyAnswer'+index);if(field&&!field.disabled)field.focus();}
 else if(b.dataset.anatomyTheory){const e=ANATOMY_EXERCISES.find(x=>x.id===b.dataset.anatomyTheory);launchQuiz({scope:'anatomy',kind:'concepts',ids:e?.questions||ANATOMY_QUESTIONS.map(q=>q.id)});}
 else if(b.id==='resetAnatomy'){ui.anatomy=createAnatomySession(ui.anatomy.figure);renderAnatomy();}
 else if(b.id==='retryAnatomy'){ui.anatomy=retryAnatomySession(ui.anatomy);renderAnatomy();}
 else if(b.dataset.labPhase!==undefined){labState.phase=Number(b.dataset.labPhase);updateLab();}
 else if(b.dataset.labEquilibrium){labState.voltage=IONS[labState.ion].equilibrium;updateLab();}
 else if(b.dataset.complete){const id=b.dataset.complete;progress.done=progress.done.includes(id)?progress.done.filter(x=>x!==id):[...progress.done,id];saveProgress();renderLesson(CHAPTER_BY_ID[id]);$('lessonContent').querySelector('[data-complete]').focus();}
 else if(b.dataset.figure){ui.figure=b.dataset.figure;ui.part=0;ui.labels=true;history.replaceState(null,'','#atlas/'+ui.figure);renderFlat();}
 else if(b.dataset.part!==undefined){const f=FIGURE_BY_ID[b.dataset.partFigure],i=Number(b.dataset.part);if(ui.screen==='atlas'){ui.part=i;renderFlat();}else if(ui.chapter){const host=$('lessonFigure');host.innerHTML=`<div class="visual-head"><p class="eyebrow">OBSERVER EN 2D</p><h2>${esc(f.title)}</h2><small>${esc(f.orientation)}</small></div>${diagram(f,{active:i})}${legend(f,i)}${partInfo(f,i)}<p class="figure-note">${esc(f.note)}</p><div class="visual-actions"><a href="#atlas/${f.id}" class="text-button">Agrandir le schéma ↗</a><button class="text-button" data-quiz-figure="${f.id}">Se tester sur ce schéma →</button></div>${figureCredit(f)}`;}}
 else if(b.dataset.atlasMode){if(b.dataset.atlasMode==='2d'){endCircuit();showScreen('atlas');$('atlasHeading').textContent='L’atlas du cerveau';$('backCircuits').hidden=true;history.replaceState(null,'','#atlas/'+ui.figure);setAtlasMode('2d');}else{setAtlasMode('3d');openAtlas();}}
 else if(b.dataset.quizChapter){const ch=CHAPTER_BY_ID[b.dataset.quizChapter];launchQuiz({scope:ch.course,chapter:ch.id,kind:'concepts'});}
 else if(b.dataset.quizFigure){const f=FIGURE_BY_ID[b.dataset.quizFigure];if(f.scope==='anatomy'){const exercise=ANATOMY_EXERCISES.find(e=>e.figures.includes(f.id));location.hash='revision/anatomy/'+exercise.id+'/'+f.id;}else launchQuiz({scope:f.scope,figure:f.id,kind:'diagrams',limit:f.parts.length});}
 else if(b.id==='toggleLabels'){ui.labels=!ui.labels;renderFlat();}
 else if(b.id==='startQuiz')startQuiz();
 else if(['leaveQuiz','newQuiz'].includes(b.id))renderSetup();
 else if(b.id==='nextQuestion'){const s=ui.quiz;if(s.index===s.questions.length-1)renderResult();else{s.index++;s.answer=null;s.revealed=false;renderQuestion();}$('quizSession').querySelector('h1')?.focus();}
 else if(b.id==='retryMissed'){const ids=ui.quiz.records.filter(r=>!r.correct).map(r=>r.question.id);startQuiz({ids,scope:'all',kind:'mix'});}
});
document.addEventListener('change',e=>{
 if(e.target.dataset?.integration)updateIntegration(e.target.dataset.integration,e.target.value);
 else if(e.target.dataset?.nmdaCondition){const key=e.target.dataset.nmdaCondition;if(['glutamate','coagonist','depolarized'].includes(key)){synapticState[key]=Boolean(e.target.checked);$('nmdaResult').innerHTML=renderNmdaResult(synapticState);}}
 else if(e.target.dataset?.anatomyAnswer!==undefined&&ui.anatomy&&!ui.anatomy.revealed){const i=Number(e.target.dataset.anatomyAnswer);if(ui.anatomy.indices.includes(i)&&ui.anatomy.choices.includes(e.target.value)){ui.anatomy.answers[i]=e.target.value;selectAnatomyPart(i);updateAnatomyAnswers();}else if(e.target.value===''){ui.anatomy.answers[i]='';updateAnatomyAnswers();}}
 else if(e.target.id==='anatomyPlane'&&ui.anatomy&&!ui.anatomy.revealed){ui.anatomy.plane=e.target.value;updateAnatomyAnswers();}
 else if(e.target.id==='labIon'){labState.ion=e.target.value;updateLab();}
 else if(e.target.id==='courseSelect')location.hash='cours/'+e.target.value;
 else if(e.target.id==='quizScope'){ui.scope=e.target.value;ui.quizFigure='all';if(ui.scope==='anatomy')location.hash='revision/anatomy';else renderSetup();}
 else if(e.target.name==='quizKind'){ui.kind=e.target.value;ui.quizFigure='all';renderSetup();}
 else if(e.target.id==='quizFigure'){ui.quizFigure=e.target.value;renderSetup();}
 else if(e.target.name==='answer'&&ui.quiz&&!ui.quiz.revealed){ui.quiz.answer=ui.quiz.questions[ui.quiz.index].options[Number(e.target.value)];$('validateAnswer').disabled=false;}
});
document.addEventListener('focusin',e=>{if(e.target.dataset?.anatomyAnswer!==undefined&&ui.anatomy)selectAnatomyPart(Number(e.target.dataset.anatomyAnswer));});
document.addEventListener('input',e=>{
 if(e.target.dataset?.integration){updateIntegration(e.target.dataset.integration,e.target.value);return;}
 if(e.target.id!=='labVoltage')return;labState.voltage=Number(e.target.value);
 // Garder le curseur en place pendant le glissement ; seule la sortie change.
 const host=$('signalLab');$('labVoltageValue').textContent=formatVoltage(labState.voltage)+' mV';
 host.querySelector('.ion-result').innerHTML=renderIonResult(labState);
});
document.addEventListener('submit',e=>{
 if(e.target.id==='anatomyForm'){
  e.preventDefault();const s=ui.anatomy;if(!s||s.revealed||!anatomyReady(s))return;
  s.result=gradeAnatomySession(s);s.revealed=true;const f=FIGURE_BY_ID[s.figure];
  s.result.parts.forEach((correct,i)=>{progress.answers[`figure-${f.id}-${i}`]=correct;});
  if(f.planeQuestion)progress.answers[f.planeQuestion]=s.result.plane;
  saveProgress();renderAnatomy();$('quizSession').querySelector('.anatomy-result').focus();return;
 }
 if(e.target.id!=='answerForm')return;e.preventDefault();const s=ui.quiz;if(!s||s.revealed||s.answer===null)return;
 const q=s.questions[s.index],correct=gradeAnswer(q,s.answer);s.records.push({question:q,answer:s.answer,correct});s.revealed=true;progress.answers[q.id]=correct;saveProgress();renderQuestion();$('quizSession').querySelector('.quiz-feedback').focus();
});
document.addEventListener('atlas-request',e=>{
 const c=CIRCUITS.find(c=>c.id===e.detail?.circuit);showScreen(c?'circuit':'atlas');setAtlasMode('3d');
 $('atlasHeading').textContent=c?c.label:'L’atlas du cerveau';$('atlasEyebrow').textContent=c?'SUIVRE LE CIRCUIT':'REPÉRER ET COMPARER';$('backCircuits').hidden=!c;
});
window.addEventListener('hashchange',route);window.addEventListener('popstate',route);
route();
