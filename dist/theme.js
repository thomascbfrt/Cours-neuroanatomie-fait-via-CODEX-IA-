// Appliqué dans <head> pour éviter un écran clair avant le chargement.
(() => {
 const key='cerveau-theme-v1';
 const root=document.documentElement;
 let theme='dark';
 try{const saved=localStorage.getItem(key);if(saved==='light'||saved==='dark')theme=saved;}catch{/* Le choix reste utilisable sans stockage. */}
 function apply(next,persist=false){
  theme=next;root.dataset.theme=theme;
  const dark=theme==='dark',button=document.getElementById('themeToggle');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#0d151e':'#f6f7f8');
  if(button){
   button.setAttribute('aria-pressed',String(dark));
   button.setAttribute('aria-label',dark?'Activer le mode clair':'Activer le mode sombre');
   button.title=dark?'Passer au mode clair':'Passer au mode sombre';
   button.querySelector('.theme-toggle-text').textContent=dark?'Mode clair':'Mode sombre';
  }
  if(persist)try{localStorage.setItem(key,theme);}catch{/* La navigation ne dépend pas du stockage. */}
 }
 apply(theme);
 document.addEventListener('DOMContentLoaded',()=>{
  apply(theme);
  document.getElementById('themeToggle')?.addEventListener('click',()=>apply(theme==='dark'?'light':'dark',true));
 });
 window.addEventListener('storage',event=>{
  if(event.key===key)apply(event.newValue==='light'?'light':'dark');
 });
})();
