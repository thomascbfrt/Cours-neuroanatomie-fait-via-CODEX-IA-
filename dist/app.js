import * as THREE from 'three';
import { OrbitControls } from './assets/vendor/OrbitControls.js';
import { GLTFLoader } from './assets/vendor/GLTFLoader.js';
import { SelectionOutline } from './selection-outline.js';
import {ALL,STRUCTURES,METHODS,BY_ID,CIRCUITS,COLORS,DISPLAY_REFERENCES,lobeFor,displayMatches as selectedMatches} from './data.js';

const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={selected:'cortex',view:'brain',color:'lobes',opacity:100,spread:false,angle:'left',circuit:null,step:0,playing:false,mri:[64,57,64]};
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let atlas,model,scene,camera,renderer,controls,selectionOutline,meshes=[],labelItems=[],mri,loadMRIPromise,playTimer,ready=false;
const selectionColor='#ff4558';
const wrap=$('canvasWrap'),raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
const groupNames=[...new Set([...STRUCTURES,...METHODS].map(s=>s.group))];
const normalize=s=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();

function renderStructures(query=''){
 const q=normalize(query);
 const rows=[...STRUCTURES,...METHODS].filter(s=>normalize(s.label+' '+s.group+' '+s.role).includes(q));
 $('structureList').innerHTML=rows.length?groupNames.map(group=>{
   const entries=rows.filter(s=>s.group===group);if(!entries.length)return '';
   return `<div class="group-heading">${esc(group)}<small>${entries.length}</small></div>`+entries.map(s=>`<button class="structure-button ${s.id===state.selected?'active':''}" data-id="${s.id}" aria-pressed="${s.id===state.selected}" style="--dot:${s.color}" title="${esc(s.label)}"><i></i><span>${esc(s.label)}</span>${s.hidden?'<svg class="deep-marker" viewBox="0 0 20 20" aria-label="Structure cachée"><path d="M3 10 10 5l7 5-7 5-7-5Zm0 4 7 4 7-4"/></svg>':''}</button>`).join('');
 }).join(''):'<p class="empty-search">Aucun repère trouvé. Essaie « thalamus », « temporal » ou « axone ».</p>';
 $('structureList').querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',()=>selectStructure(b.dataset.id)));
}
function renderDetails(){
 const s=BY_ID[state.selected],reference=DISPLAY_REFERENCES[s.id];
 const notice=reference?'Illustration : '+reference.label+'. La couleur montre un exemple, pas tout le réseau ou une mesure d’activité.':s.type==='unmapped'?(s.scale==='cell'?'Cette notion se situe à l’échelle cellulaire. Son schéma 2D accompagne le cours 3.':'Cette structure n’est pas segmentée dans le modèle 3D. Retrouve son schéma dans l’atlas 2D.'):s.type==='external'?'Ce repère n’est pas représenté en 3D. Sa fiche décrit sa place dans le circuit.':s.functional?'La couleur montre des repères anatomiques. Le contour ne délimite pas exactement cette aire fonctionnelle.':'';
 $('detail').style.setProperty('--color',s.color);
 $('detail').innerHTML=`<div class="detail-header"><p class="detail-eyebrow">${esc(s.group)}</p><h1>${esc(s.label)}</h1><div class="color-bar"></div></div>
 ${notice?`<div class="external-note">${esc(notice)}</div>`:''}
 <section class="detail-section"><h2>Où ?</h2><p>${esc(s.where)}</p></section>
 <section class="detail-section"><h2>À quoi ça sert ?</h2><p>${esc(s.role)}</p></section>
 <div class="remember"><strong><span aria-hidden="true">◇</span> À retenir</strong><p>${esc(s.remember)}</p></div>
 ${s.question?`<section class="question"><h2>${esc(s.question)}</h2><p>${esc(s.answer)}</p></section>`:''}
 ${s.type==='unmapped'?`<a class="text-button" href="#atlas/${s.figure}/${s.id}">Voir le schéma 2D →</a>`:''}
 ${s.seg?'<button data-show-mri>Voir ce repère dans les coupes IRM</button>':''}
 ${s.note?`<p class="accuracy-note">${esc(s.note)}</p>`:''}
 ${s.related?.length?`<section class="related"><h2>Relier ces repères</h2><div class="related-buttons">${s.related.map(id=>`<button data-related="${id}">${esc(BY_ID[id]?.label||id)}</button>`).join('')}</div></section>`:''}
 <p class="chapter">${s.course?'Cours '+s.course:s.complement?'Complément au cours 1':'Cours 1'} · section${String(s.chapter).includes('–')||String(s.chapter).includes(',')?'s':''} ${esc(s.chapter)}</p>`;
 $('detail').querySelectorAll('[data-related]').forEach(b=>b.addEventListener('click',()=>selectStructure(b.dataset.related)));
 $('detail').querySelector('[data-show-mri]')?.addEventListener('click',()=>setView('mri'));
 document.querySelectorAll('[data-neuron]').forEach(b=>{b.classList.toggle('active',b.dataset.neuron===s.id);b.setAttribute('aria-pressed',String(b.dataset.neuron===s.id));});
 document.querySelectorAll('[data-neuron-part]').forEach(g=>g.classList.toggle('active',g.dataset.neuronPart===s.id||s.id==='neuron'));
}
function selectStructure(id,{circuit=false,keepView=false}={}){
 const s=BY_ID[id];if(!s)throw new Error('Structure inconnue : '+id);
 const previous=BY_ID[state.selected];
 if(!circuit&&state.circuit)endCircuit();
 state.selected=id;
 if(s.type==='micro')setView('neuron',false);
 else if(id==='irm')setView('mri',false);
 else if(!keepView&&state.view==='neuron')setView('brain',false);
 if(s.hidden)state.opacity=13;
 else if(previous.hidden&&state.opacity<=20)state.opacity=100;
 if(s.medial&&s.type!=='deep')setAngle('medial',false);
 else if(s.inferior)setAngle('inferior',false);
 else if(s.hidden)setAngle('left',false);
 else if(state.angle==='medial'||state.angle==='inferior')setAngle('left',false);
 renderStructures($('search').value);renderDetails();syncControls();applyAppearance();createLabels();
 if(state.view==='mri')void ensureMRI().then(()=>{centerMRI();drawMRI();}).catch(showMRIError);
 if(!circuit)$('detail').scrollTop=0;
 return {selected:id,view:state.view};
}
function setView(view,update=true){
 if(!['brain','mri','neuron'].includes(view))throw new Error('Vue inconnue');
 state.view=view;
 for(const v of ['brain','mri','neuron'])$(v+'View').hidden=v!==view;
 document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-selected',String(b.dataset.view===view));});
 if(view==='mri')void ensureMRI().then(()=>{centerMRI();drawMRI();}).catch(showMRIError);
 if(view==='brain'){void ensureModel();if(renderer)requestAnimationFrame(resize);}
 if(view==='neuron'&&update&&BY_ID[state.selected].type!=='micro')selectStructure('neuron',{keepView:true});
}
function nav(mode){
 const structures=mode==='structures';$('structuresPanel').hidden=!structures;$('circuitsPanel').hidden=structures;
 $('structuresTab').classList.toggle('active',structures);$('circuitsTab').classList.toggle('active',!structures);
 $('structuresTab').setAttribute('aria-selected',String(structures));$('circuitsTab').setAttribute('aria-selected',String(!structures));
}
function syncControls(){
 $('opacity').value=state.opacity;$('opacityValue').textContent=state.opacity+' %';
 $('openBrain').setAttribute('aria-pressed',String(state.spread));
 $('openBrain').querySelector('span').textContent=state.spread?'Rapprocher les hémisphères':'Écarter les hémisphères';
 $('viewLabel').textContent={left:'Vue latérale gauche',right:'Vue latérale droite',front:'Vue de face',top:'Vue du dessus',medial:'Face médiale · hémisphère gauche',inferior:'Vue de la face inférieure',free:'Vue libre'}[state.angle];
 document.querySelectorAll('[data-angle]').forEach(b=>{b.classList.toggle('active',b.dataset.angle===state.angle);b.setAttribute('aria-pressed',String(b.dataset.angle===state.angle));});
 document.querySelectorAll('[data-color]').forEach(b=>{b.classList.toggle('active',b.dataset.color===state.color);b.setAttribute('aria-pressed',String(b.dataset.color===state.color));});
 const s=BY_ID[state.selected],reference=DISPLAY_REFERENCES[s.id],focused=isFocusedSelection(s);
 $('legend').hidden=state.color==='natural'&&!focused;
 $('legend').classList.toggle('has-selection',focused);
 $('selectionKeyText').textContent=reference?'Exemple anatomique · contour clair':s.functional?'Repère anatomique indicatif · contour clair':'Zone sélectionnée · contour clair';
 $('modelStatus').hidden=!['external','unmapped'].includes(s.type)||Boolean(reference);
 $('modelStatus').textContent='Pas de représentation 3D pour ce repère : '+s.label+'.';
 $('modelNote').textContent=s.functional?'Repères anatomiques indicatifs':state.color==='lobes'?'Couleurs de repérage':'Teinte neutre de présentation';
 const o=document.querySelector('.orientation');o.style.visibility=['left','right'].includes(state.angle)?'visible':'hidden';
 $('orientFront').style.order=state.angle==='right'?2:0;$('orientBack').style.order=state.angle==='right'?0:2;
}
const angles={left:[-280,65,48],right:[280,65,48],front:[0,38,-300],top:[0,300,1],medial:[270,32,37],inferior:[-50,-280,-30]};
function setAngle(angle,update=true){
 if(!angles[angle])throw new Error('Orientation inconnue');state.angle=angle;
 if(camera){camera.up.set(0,1,0);if(angle==='top')camera.up.set(0,0,-1);camera.position.set(...angles[angle]);controls.target.set(angle==='medial'?-25:0,0,0);controls.update();}
 if(update){syncControls();applyAppearance();createLabels();}
}
function isFocusedSelection(s){
 return !['allCortex','grey','micro'].includes(s.type)&&meshes.some(mesh=>selectedMatches(s,mesh.userData.atlas));
}
function applyAppearance(){
 if(!ready)return;
 const s=BY_ID[state.selected],focused=isFocusedSelection(s),highlighted=[];
 for(const mesh of meshes){
  const m=mesh.userData.atlas,selected=selectedMatches(s,m),marked=focused&&selected,material=mesh.material;
  const context=/cerebellum|brainstem/.test(m.name);const emotional=/hippocampus|amygdala/.test(m.name);
  let visible=true,opacity=1,color;
  if(m.kind==='cortex'){
   visible=!(state.angle==='medial'&&m.hemi==='rh');
   opacity=marked?1:state.opacity/100;
   color=state.color==='lobes'?(COLORS[lobeFor(m.label)]||'#9ca9bd'):'#bcafb0';
   if(focused&&!selected)color='#778496';
  }else{
   visible=context||selected||(m.kind!=='white'&&!emotional&&state.opacity<65);
   if(m.kind==='white')visible=selected;
   if(emotional)visible=selected;
   if(state.angle==='medial'&&m.hemi==='rh'&&context)visible=false;
   color=selected?s.color:context?'#8b8d9b':m.name.includes('ventricle')?'#638cba':m.name==='corpus_callosum'?'#c1baad':'#9286a8';
   if(!context&&!selected)opacity=.52;
  }
  if(marked){color=selectionColor;opacity=1;}
  else if(s.type==='grey'&&selected)color=s.color;
  else if(focused)color='#778496';
  mesh.visible=visible&&opacity>0.005;
  mesh.position.x=state.spread?(m.hemi==='lh'?-42:m.hemi==='rh'?42:0):0;
  material.color.set(color);material.opacity=opacity;material.transparent=opacity<.98;material.depthWrite=opacity>=.98;
  material.emissive.set(marked?selectionColor:'#000000');material.emissiveIntensity=marked?.32:0;material.needsUpdate=true;
  if(marked&&mesh.visible)highlighted.push(mesh);
 }
 selectionOutline.setSelection(highlighted);
}
function createLabels(){
 if(!ready)return;$('labels').innerHTML='';labelItems=[];
 if(state.opacity>=50&&state.angle!=='medial'){
  for(const id of ['frontal','parietal','temporal','occipital'])addLabel(id,id===state.selected);
 }
 if(!['cortex','hemispheres','neuron','gyri','sulci'].includes(state.selected)&&!labelItems.some(x=>x.id===state.selected))addLabel(state.selected,true);
}
function anchorFor(id){
 const s=BY_ID[id];if(!s)return null;
 const hemi=state.angle==='right'?'rh':'lh';
 let list=meshes.filter(mesh=>selectedMatches(s,mesh.userData.atlas)&&mesh.visible);
 const side=list.filter(mesh=>mesh.userData.atlas.hemi===hemi||mesh.userData.atlas.hemi==='both');if(side.length)list=side;
 if(!list.length)return null;
 let total=0,v=new THREE.Vector3();
 for(const mesh of list){const a=mesh.userData.atlas;const weight=a.faces;v.add(new THREE.Vector3(...a.center).add(mesh.position).multiplyScalar(weight));total+=weight;}
 v.divideScalar(total);
 if(s.type==='lobe'){v.x=(hemi==='lh'?-69:69)+(state.spread?(hemi==='lh'?-42:42):0);v.y+=10;}
 return v;
}
function addLabel(id,selected=false){
 const a=anchorFor(id);if(!a)return;
 const s=BY_ID[id],b=document.createElement('button');b.className='model-label'+(selected?' selected':'');b.style.setProperty('--color',selected?selectionColor:s.color);b.setAttribute('aria-pressed',String(selected));b.innerHTML='<i></i>'+esc((DISPLAY_REFERENCES[id]?.label||s.modelLabel||s.label).replace(/^Lobe /,''));b.addEventListener('click',()=>selectStructure(id));$('labels').append(b);labelItems.push({id,button:b,anchor:a,selected});
}
const projected=new THREE.Vector3();
function updateLabels(){
 if(!camera||state.view!=='brain')return;
 const w=wrap.clientWidth,h=wrap.clientHeight;
 for(const l of labelItems){projected.copy(l.anchor).project(camera);let x=(projected.x*.5+.5)*w,y=(-projected.y*.5+.5)*h+(l.selected?-25:0);const margin=Math.min(w/2,l.button.offsetWidth/2+12);l.button.style.left=Math.max(margin,Math.min(w-margin,x))+'px';l.button.style.top=Math.max(72,Math.min(h-25,y))+'px';l.button.hidden=projected.z>1||projected.z< -1;}
}
function resize(){if(!renderer)return;const w=wrap.clientWidth,h=wrap.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.fov=Math.max(38,Math.min(58,38/camera.aspect));camera.updateProjectionMatrix();renderer.setSize(w,h,false);selectionOutline?.resize(w,h,renderer.getPixelRatio());updateLabels();}

function pickStructure(mesh){
 const m=mesh.userData.atlas;
 if(m.kind==='cortex'){
  const exact=STRUCTURES.find(s=>s.type==='parcel'&&!s.functional&&s.parcels.includes(m.label));
  if(exact)return exact;
  return BY_ID[lobeFor(m.label)]||BY_ID.cortex;
 }
 return STRUCTURES.find(s=>s.type==='deep'&&s.names.includes(m.name))||STRUCTURES.find(s=>s.type==='white'&&s.names.includes(m.name));
}
function hit(e){
 if(!ready)return;
 const rect=renderer.domElement.getBoundingClientRect();pointer.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(pointer,camera);
 const selectable=meshes.filter(m=>m.visible&&(m.material.opacity>.3||selectedMatches(BY_ID[state.selected],m.userData.atlas))&&pickStructure(m));
 return raycaster.intersectObjects(selectable,false).find(i=>pickStructure(i.object));
}
async function initModel(){
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.setClearColor(0x000000,0);wrap.prepend(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Cerveau tridimensionnel. Les structures sont aussi accessibles dans la liste et avec les boutons d’orientation.');renderer.domElement.tabIndex=0;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(38,1,1,1500);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=!reducedMotion;controls.dampingFactor=.08;controls.minDistance=130;controls.maxDistance=650;controls.enablePan=false;
  scene.add(new THREE.HemisphereLight('#e5efff','#46576c',1.4));
  const key=new THREE.DirectionalLight('#fff3e6',2.5);key.position.set(-200,180,-170);scene.add(key);
  const fill=new THREE.DirectionalLight('#afcaff',.9);fill.position.set(160,80,150);scene.add(fill);
  const rim=new THREE.DirectionalLight('#9eb7d2',1);rim.position.set(-60,-60,240);scene.add(rim);
  const [a,gltf]=await Promise.all([fetch('./assets/atlas.json').then(r=>{if(!r.ok)throw new Error('Atlas indisponible');return r.json();}),new GLTFLoader().loadAsync('./assets/brain.glb')]);
  atlas=a;model=gltf.scene;scene.add(model);
  model.traverse(m=>{if(!m.isMesh)return;const data=atlas.meshes[m.name];if(!data)return;m.userData.atlas={...data,name:m.name};if(!m.geometry.getAttribute('normal'))m.geometry.computeVertexNormals();m.material=new THREE.MeshStandardMaterial({roughness:.84,metalness:0,vertexColors:!!m.geometry.getAttribute('color'),side:THREE.DoubleSide});meshes.push(m);});
  if(meshes.length!==Object.keys(atlas.meshes).length)throw new Error('Des surfaces anatomiques manquent');
  selectionOutline=new SelectionOutline(meshes);
  ready=true;$('loading').hidden=true;setAngle(state.angle);applyAppearance();createLabels();resize();
  new ResizeObserver(resize).observe(wrap);
  let down;
  renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
  renderer.domElement.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<5){const h=hit(e);if(h)selectStructure(pickStructure(h.object).id);}down=null;});
  renderer.domElement.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch'){ $('hoverTip').hidden=true;return;}const h=hit(e);renderer.domElement.style.cursor=h?'pointer':'grab';if(h){const rect=wrap.getBoundingClientRect();$('hoverTip').textContent=pickStructure(h.object).label;$('hoverTip').style.left=Math.min(rect.width-200,e.clientX-rect.left+15)+'px';$('hoverTip').style.top=Math.max(20,e.clientY-rect.top-35)+'px';$('hoverTip').hidden=false;}else $('hoverTip').hidden=true;});
  renderer.domElement.addEventListener('pointerleave',()=>{$('hoverTip').hidden=true;});
  controls.addEventListener('start',()=>{$('hoverTip').hidden=true;state.angle='free';syncControls();});
  controls.addEventListener('end',()=>{createLabels();});
  renderer.domElement.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();const offset=camera.position.clone().sub(controls.target);const spherical=new THREE.Spherical().setFromVector3(offset);if(e.key==='ArrowLeft')spherical.theta-=.12;if(e.key==='ArrowRight')spherical.theta+=.12;if(e.key==='ArrowUp')spherical.phi=Math.max(.1,spherical.phi-.12);if(e.key==='ArrowDown')spherical.phi=Math.min(Math.PI-.1,spherical.phi+.12);camera.position.copy(new THREE.Vector3().setFromSpherical(spherical).add(controls.target));controls.update();state.angle='free';syncControls();createLabels();});
  function animate(){requestAnimationFrame(animate);if(state.view==='brain'&&wrap.clientWidth>0&&document.visibilityState==='visible'){controls.update();renderer.render(scene,camera);selectionOutline.render(renderer,camera);updateLabels();}}animate();
 }catch(error){console.error(error);$('loading').hidden=false;$('loading').innerHTML='<strong>La vue 3D n’a pas pu s’afficher.</strong><small class="error-text">Tu peux continuer avec les coupes IRM et les fiches. Recharge la page pour réessayer la 3D.</small><button class="retry-button" id="fallbackMRI">Ouvrir les coupes IRM</button>';$('fallbackMRI').addEventListener('click',()=>setView('mri'));}
}

async function ensureMRI(){
 if(mri)return mri;if(loadMRIPromise)return loadMRIPromise;
 $('mriLoading').hidden=false;
 loadMRIPromise=(async()=>{
  const r=await fetch('./assets/mri.bin');if(!r.ok)throw new Error('IRM indisponible');const b=await r.arrayBuffer();const size=new DataView(b).getUint32(0,true);const header=JSON.parse(new TextDecoder().decode(new Uint8Array(b,4,size)));const offset=4+size;
  const intensity=new Uint8Array(b,offset,header.intensityBytes);const segBytes=b.slice(offset+header.intensityBytes);const segmentation=new Uint16Array(segBytes);
  mri={...header,intensity,segmentation};$('mriLoading').hidden=true;return mri;
 })();
 try{return await loadMRIPromise;}catch(e){loadMRIPromise=null;throw e;}
}
function showMRIError(error){console.error(error);$('mriLoading').hidden=false;$('mriLoading').innerHTML='Les coupes n’ont pas pu se charger. <button class="retry-button" id="retryMRI">Réessayer</button>';$('retryMRI').addEventListener('click',()=>ensureMRI().then(drawMRI).catch(showMRIError));}
function centerMRI(){
 if(!mri)return;const anchor=anchorFor(state.selected);
 if(anchor){const ras=[anchor.x,-anchor.z-18,anchor.y+10];for(let axis=0;axis<3;axis++)state.mri[axis]=Math.max(0,Math.min(127,Math.round((ras[axis]-mri.affine[axis][3])/mri.affine[axis][axis])));}
 else state.mri=[64,57,64];
 document.querySelectorAll('[data-slice]').forEach(i=>i.value=state.mri[Number(i.dataset.slice)]);
}
function drawMRI(){
 if(!mri)return;
 const s=BY_ID[state.selected],values=new Set(s.seg||[]),show=$('mriOverlay').checked;
 const rgb=[1,3,5].map(i=>parseInt(s.color.slice(i,i+2),16));
 const n=mri.shape[0];
 for(let axis=0;axis<3;axis++){
  const canvas=$('slice'+axis),ctx=canvas.getContext('2d'),image=ctx.createImageData(n,n);
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){
   let x,y,z;if(axis===0){x=state.mri[0];y=n-1-i;z=n-1-j;}else if(axis===1){x=n-1-i;y=state.mri[1];z=n-1-j;}else{x=n-1-i;y=n-1-j;z=state.mri[2];}
   const index=x*n*n+y*n+z;const raw=mri.intensity[index],v=Math.min(255,Math.round(raw*1.22));const k=(j*n+i)*4;
   const hit=show&&values.has(mri.segmentation[index]);
   image.data[k]=hit?Math.round(v*.42+rgb[0]*.58):v;image.data[k+1]=hit?Math.round(v*.42+rgb[1]*.58):v;image.data[k+2]=hit?Math.round(v*.42+rgb[2]*.58):v;image.data[k+3]=255;
  }
  ctx.putImageData(image,0,0);$('slicePosition'+axis).textContent=Math.round(mri.affine[axis][3]+state.mri[axis]*mri.affine[axis][axis])+' mm';
 }
 $('mriNote').textContent=values.size?'La couleur repère '+s.label.toLowerCase()+'. D/G : droite/gauche de la personne ; A/P : avant/arrière ; H/B : haut/bas.':'IRM T1 de référence. La segmentation de cette région n’est pas disponible dans ces coupes : utilise son repère 3D. D/G : droite/gauche, A/P : avant/arrière, H/B : haut/bas.';
 if(['cortex','hemispheres','irm'].includes(s.id))$('mriNote').textContent='IRM T1 réelle de référence, échantillonnée à 2 mm. D/G : droite/gauche de la personne ; A/P : avant/arrière ; H/B : haut/bas.';
}

const icons={vision:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',audition:'<path d="M7 15c-3-8 0-13 6-13 5 0 8 6 4 10-3 3-4 3-4 7-1 3-5 3-6 0m4-9c0-5 6-5 6-1"/>',touch:'<path d="M9 12V6c0-2 3-2 3 0v6-9c0-2 3-2 3 0v9-6c0-2 3-2 3 0v8-4c0-2 3-2 3 0v7c0 6-10 8-14 4l-5-5c-2-3 1-4 3-2l4 3"/>',taste:'<path d="M5 8c0 10 14 10 14 0m-7 2v8m-6-3c0 9 12 9 12 0"/>',smell:'<path d="M12 2v11c-7 2-6 7 0 7s7-5 2-7m-7-8 2 3m8-3-2 3"/>',movement:'<circle cx="15" cy="4" r="2"/><path d="m7 9 5-2 4 5 5-1m-9-4-2 7-5 6m5-6 6 4v4"/>'};
function renderCircuits(){
 $('circuitList').innerHTML=CIRCUITS.map(c=>`<button class="circuit-button ${state.circuit===c.id?'active':''}" data-circuit="${c.id}" aria-pressed="${state.circuit===c.id}"><span class="circuit-icon" style="--color:${c.color}"><svg viewBox="0 0 24 24" aria-hidden="true">${icons[c.id]}</svg></span><span><strong>${esc(c.label)}</strong><small>${c.steps.length} étapes</small></span></button>`).join('');
 $('circuitList').querySelectorAll('[data-circuit]').forEach(b=>b.addEventListener('click',()=>startCircuit(b.dataset.circuit)));
}
function startCircuit(id,step=0){
 const c=CIRCUITS.find(c=>c.id===id);if(!c)throw new Error('Circuit inconnu');if(!Number.isInteger(step)||step<0||step>=c.steps.length)throw new Error('Étape invalide');
 stopPlay();state.circuit=id;state.step=step;nav('circuits');setView('brain',false);$('pathway').hidden=false;renderCircuits();goStep(step);
}
function goStep(index){
 const c=CIRCUITS.find(c=>c.id===state.circuit);if(!c||index<0||index>=c.steps.length)return;
 state.step=index;const step=c.steps[index];selectStructure(step[0],{circuit:true,keepView:true});
 $('pathway').style.setProperty('--color',c.color);$('pathwayName').textContent=c.label;$('pathwayProgress').textContent=`Étape ${index+1} / ${c.steps.length}`;
 $('pathwayDescription').textContent=step[2];$('pathwaySteps').innerHTML=c.steps.map((s,i)=>`<button data-step="${i}" class="${i===index?'active':''}" aria-current="${i===index?'step':'false'}"><span>${i+1}</span>${esc(s[1])}</button>`).join('');
 $('pathwaySteps').querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{stopPlay();goStep(Number(b.dataset.step));}));
 const active=$('pathwaySteps').querySelector('.active');if(active){const parent=$('pathwaySteps');parent.scrollLeft=Math.max(0,active.offsetLeft-parent.offsetLeft-parent.clientWidth/2+active.clientWidth/2);}
 $('prevStep').disabled=index===0;$('nextStep').disabled=index===c.steps.length-1;requestAnimationFrame(resize);
}
function stopPlay(){clearInterval(playTimer);state.playing=false;$('playPath').textContent='▶ Parcourir';$('playPath').setAttribute('aria-pressed','false');}
function endCircuit(){stopPlay();state.circuit=null;$('pathway').hidden=true;renderCircuits();requestAnimationFrame(resize);}
function play(){if(state.playing){stopPlay();return;}const c=CIRCUITS.find(c=>c.id===state.circuit);if(!c)return;if(state.step===c.steps.length-1)goStep(0);state.playing=true;$('playPath').textContent='Ⅱ Pause';$('playPath').setAttribute('aria-pressed','true');playTimer=setInterval(()=>{if(state.step<c.steps.length-1)goStep(state.step+1);else stopPlay();},4500);}

$('search').addEventListener('input',e=>renderStructures(e.target.value));$('structuresTab').addEventListener('click',()=>nav('structures'));$('circuitsTab').addEventListener('click',()=>nav('circuits'));
document.querySelectorAll('[role="tablist"]').forEach(list=>list.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const buttons=[...list.querySelectorAll('[role="tab"]')];const current=buttons.indexOf(document.activeElement);if(current<0)return;e.preventDefault();const index=e.key==='Home'?0:e.key==='End'?buttons.length-1:(current+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[index].focus();buttons[index].click();}));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.querySelectorAll('[data-angle]').forEach(b=>b.addEventListener('click',()=>setAngle(b.dataset.angle)));
document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{state.color=b.dataset.color;syncControls();applyAppearance();}));
document.querySelectorAll('[data-neuron]').forEach(b=>b.addEventListener('click',()=>selectStructure(b.dataset.neuron,{keepView:true})));
$('opacity').addEventListener('input',e=>{state.opacity=Number(e.target.value);syncControls();applyAppearance();createLabels();});
$('openBrain').addEventListener('click',()=>{state.spread=!state.spread;syncControls();applyAppearance();createLabels();});
$('resetView').addEventListener('click',()=>{endCircuit();state.spread=false;state.opacity=100;state.selected='cortex';setAngle('left');renderDetails();renderStructures($('search').value);syncControls();});
document.querySelectorAll('[data-slice]').forEach(i=>i.addEventListener('input',()=>{state.mri[Number(i.dataset.slice)]=Number(i.value);drawMRI();}));
$('mriOverlay').addEventListener('change',drawMRI);$('centerMRI').addEventListener('click',()=>{centerMRI();drawMRI();});
$('playPath').addEventListener('click',play);$('prevStep').addEventListener('click',()=>{stopPlay();goStep(state.step-1);});$('nextStep').addEventListener('click',()=>{stopPlay();goStep(state.step+1);});$('closePath').addEventListener('click',endCircuit);
const dialog=$('sourcesDialog');$('sourceButton').addEventListener('click',()=>dialog.showModal());$('closeSources').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
renderStructures();renderCircuits();renderDetails();syncControls();let modelReady;
function ensureModel(){return modelReady ||= initModel();}
export function openAtlas({id,view='brain',circuit}={}){
 document.dispatchEvent(new CustomEvent('atlas-request',{detail:{circuit,id,view}}));
 if(circuit)startCircuit(circuit);else{endCircuit();nav('structures');setView(view);if(id)selectStructure(id,{keepView:true});}
 if(view==='brain'||circuit)void ensureModel();
 requestAnimationFrame(resize);
}
export {selectStructure,setView,startCircuit,endCircuit};

// Optional imperative WebMCP interface. Actions reuse the visible application's state.
const context=document.modelContext;
if(context?.registerTool){
 const lifecycle=new AbortController();
 const tools=[
  {name:'get_atlas_state',title:'Lire la sélection du cerveau',description:'Retourne le repère, la vue et le circuit actuellement affichés.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(){return {selected:state.selected,label:BY_ID[state.selected].label,view:state.view,circuit:state.circuit,step:state.step};}},
  {name:'select_brain_structure',title:'Afficher une structure cérébrale',description:'Sélectionne un repère du cours et affiche sa fiche et son modèle. Les structures profondes rendent le cortex transparent.',inputSchema:{type:'object',properties:{id:{type:'string',enum:ALL.map(s=>s.id)}},required:['id'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){if(!input||typeof input.id!=='string'||!BY_ID[input.id])throw new Error('Identifiant de structure invalide');openAtlas({id:input.id,view:BY_ID[input.id].type==='micro'?'neuron':input.id==='irm'?'mri':'brain'});const result={selected:state.selected,view:state.view};await ensureModel();if(state.view==='mri')await ensureMRI();return {...result,label:BY_ID[input.id].label};}},
  {name:'explore_brain_circuit',title:'Explorer un circuit sensoriel ou moteur',description:'Ouvre un circuit à une étape choisie et sélectionne le repère correspondant dans la même interface.',inputSchema:{type:'object',properties:{circuit:{type:'string',enum:CIRCUITS.map(c=>c.id)},step:{type:'integer',minimum:0}},required:['circuit'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){const c=CIRCUITS.find(c=>c.id===input?.circuit);const step=input?.step??0;if(!c||!Number.isInteger(step)||step<0||step>=c.steps.length)throw new Error('Circuit ou étape invalide');openAtlas({circuit:c.id});if(step)goStep(step);await ensureModel();return {circuit:c.id,step:state.step,selected:state.selected};}},
  {name:'set_atlas_view',title:'Changer de vue anatomique',description:'Affiche le cerveau 3D, les coupes IRM ou le schéma du neurone.',inputSchema:{type:'object',properties:{view:{type:'string',enum:['brain','mri','neuron']}},required:['view'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){if(!['brain','mri','neuron'].includes(input?.view))throw new Error('Vue invalide');document.dispatchEvent(new CustomEvent('atlas-request',{detail:{circuit:state.circuit}}));setView(input.view);if(input.view==='mri'){await ensureMRI();centerMRI();drawMRI();}else await ensureModel();return {view:state.view,selected:state.selected};}}
 ];
 for(const tool of tools){try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(e=>console.warn('WebMCP unavailable',e));}catch(e){console.warn('WebMCP unavailable',e);}}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
