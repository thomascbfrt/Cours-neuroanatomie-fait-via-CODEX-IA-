// Repères pédagogiques du cours, pas des mesures d’un neurone individuel.
export const IONS={K:{label:'Potassium K⁺',symbol:'K⁺',equilibrium:-90,charge:1},Na:{label:'Sodium Na⁺',symbol:'Na⁺',equilibrium:60,charge:1},Cl:{label:'Chlorure Cl⁻',symbol:'Cl⁻',equilibrium:-80,charge:-1},Ca:{label:'Calcium Ca²⁺',symbol:'Ca²⁺',equilibrium:100,charge:2}};
export function ionState(key,voltage){
 const ion=IONS[key];if(!ion||!Number.isFinite(voltage)||voltage< -110||voltage>100)throw new Error('Paramètres ioniques invalides');
 const force=voltage-ion.equilibrium;
 const movement=force===0?'équilibre':force*ion.charge>0?'sortie':'entrée';
 return {...ion,voltage,force,movement};
}
export const SIGNAL_POINTS=[[0,-70],[1.8,-70],[2,-50],[2.25,0],[2.4,30],[2.5,20],[2.7,-25],[2.85,-45],[3,-70],[3.25,-80],[4,-70],[5,-70]];
export const PLOT={left:.12,right:.97,bottom:.16,top:.94,timeMax:5,voltageMin:-95,voltageMax:45};
export function plotPoint(t,v){return {x:100*(PLOT.left+t/PLOT.timeMax*(PLOT.right-PLOT.left)),y:100*(1-(PLOT.bottom+(v-PLOT.voltageMin)/(PLOT.voltageMax-PLOT.voltageMin)*(PLOT.top-PLOT.bottom)))};}
export const PHASES=[
{label:'Repos',t:.8,v:-70,na:'Fermés, réactivables',k:'Canaux KV du PA principalement fermés',flow:'Les conductances de repos influencent Vm.',explain:'La cellule est polarisée. Les canaux de fuite et les gradients sont déjà présents : repos ne signifie pas absence d’échanges.'},
{label:'Dépolarisation',t:2.25,v:0,na:'Ouverture rapide',k:'Ouverture retardée',flow:'Entrée nette de Na⁺ dans cet exemple.',explain:'L’entrée de Na⁺ dépolarise ; la dépolarisation ouvre davantage de canaux NaV. Vers le pic, leur inactivation commence.'},
{label:'Repolarisation',t:2.85,v:-45,na:'Inactivés, puis récupération',k:'Ouverts',flow:'Sortie nette de K⁺ dans cet exemple.',explain:'L’inactivation de NaV et l’augmentation des courants K⁺ font redescendre Vm. La pompe n’est pas le mécanisme rapide de cette descente.'},
{label:'Après-hyperpolarisation',t:3.25,v:-80,na:'Récupération vers l’état réactivable',k:'Conductances encore élevées, puis diminution',flow:'Vm se rapproche temporairement de EK.',explain:'La conductance K⁺ peut persister. Vm passe sous son repos avant le retour aux conductances de base.'}
];
export const formatVoltage=n=>(n>0?'+':'')+n;
const number=formatVoltage;
export function renderIonResult(state){
 const s=ionState(state.ion||'K',state.voltage??-70),balanced=s.movement==='équilibre';
 return `<div class="ion-voltages"><span>Vm <strong>${number(s.voltage)} mV</strong></span><span>Eion <strong>${number(s.equilibrium)} mV</strong></span></div><strong>${balanced?'Flux net nul':s.symbol+' : '+s.movement+' nette'}</strong><p>${balanced?'Les flux dans les deux sens se compensent. Les ions ne sont pas immobiles.':'Dans ces conditions, le mouvement net de cet ion tend à rapprocher Vm de Eion. Le sens dépend à la fois du voltage et de la charge de l’ion.'}</p>`;
}
export function renderLab(kind,state={}){
 if(kind==='ions'){
  const s=ionState(state.ion||'K',state.voltage??-70),balanced=s.movement==='équilibre';
  return `<div class="lab-heading"><p class="eyebrow">MANIPULER POUR COMPRENDRE</p><h2>Dans quel sens l’ion se déplace-t-il ?</h2><p>On suppose un canal sélectif ouvert et des concentrations maintenues.</p></div><label class="lab-label">Choisir un ion<select id="labIon">${Object.entries(IONS).map(([id,i])=>`<option value="${id}" ${id===(state.ion||'K')?'selected':''}>${i.label}</option>`).join('')}</select></label><label class="lab-label" for="labVoltage">Potentiel de membrane Vm <output id="labVoltageValue">${number(s.voltage)} mV</output><input id="labVoltage" type="range" min="-110" max="100" step="1" value="${s.voltage}"></label><div class="ion-result" aria-live="polite">${renderIonResult(state)}</div><button class="secondary-button" data-lab-equilibrium="true">Placer Vm à Eion</button><p class="figure-note">Valeurs d’équilibre approximatives du cours. Cet atelier montre le sens du flux, sans calculer sa vitesse ni un nouveau potentiel de repos.</p>`;
 }
 if(kind!=='ap')throw new Error('Atelier inconnu');
 const index=Number.isInteger(state.phase)&&state.phase>=0&&state.phase<PHASES.length?state.phase:0,p=PHASES[index],dot=plotPoint(p.t,p.v);
 return `<div class="lab-heading"><p class="eyebrow">LE PA, PAS À PAS</p><h2>Relier la courbe aux canaux</h2><p>Choisis une phase pour suivre les courants.</p></div><div class="lab-plot"><img src="./assets/diagrams/actionPotential-practice.svg" alt="Courbe schématique d’un potentiel d’action, du repos à l’après-hyperpolarisation"><span class="lab-phase-dot" style="left:${dot.x}%;top:${dot.y}%" aria-hidden="true"></span></div><div class="lab-phase-buttons">${PHASES.map((phase,i)=>`<button data-lab-phase="${i}" aria-pressed="${i===index}" class="${i===index?'active':''}"><span>${i+1}</span>${phase.label}</button>`).join('')}</div><div class="lab-phase-info" aria-live="polite"><h3>${p.label}</h3><dl><div><dt>Canaux NaV</dt><dd>${p.na}</dd></div><div><dt>Canaux KV</dt><dd>${p.k}</dd></div></dl><strong>${p.flow}</strong><p>${p.explain}</p></div><p class="figure-note">Courbe pédagogique : repos −70 mV, seuil illustratif −50 mV. Les valeurs et la durée varient selon le neurone.</p><a href="#atlas/actionPotential" class="text-button">Agrandir le schéma ↗</a><button class="text-button" data-quiz-figure="actionPotential">Identifier les phases →</button>`;
}
