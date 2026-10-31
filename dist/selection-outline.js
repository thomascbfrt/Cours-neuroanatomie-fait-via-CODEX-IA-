import * as THREE from 'three';

// Outline the visible union of the selected anatomical surfaces. A screen-space
// mask avoids drawing artificial borders between parcels of the same region.
export class SelectionOutline {
 constructor(meshes){
  this.selected=new Set();
  this.maskScene=new THREE.Scene();
  this.target=new THREE.WebGLRenderTarget(1,1,{samples:4});
  this.white=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,toneMapped:false});
  this.black=new THREE.MeshBasicMaterial({color:0x000000,side:THREE.DoubleSide,toneMapped:false});
  this.proxies=meshes.map(source=>{
   const proxy=new THREE.Mesh(source.geometry,this.black);
   proxy.matrixAutoUpdate=false;
   this.maskScene.add(proxy);
   return {source,proxy};
  });
  this.material=new THREE.ShaderMaterial({
   uniforms:{mask:{value:this.target.texture},texel:{value:new THREE.Vector2(1,1)},width:{value:3},color:{value:new THREE.Color('#ffe3e5')}},
   vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }',
   fragmentShader:`
    uniform sampler2D mask;
    uniform vec2 texel;
    uniform float width;
    uniform vec3 color;
    varying vec2 vUv;
    void main(){
     float center=texture2D(mask,vUv).r;
     float low=center;
     float high=center;
     for(int x=-1;x<=1;x++){
      for(int y=-1;y<=1;y++){
       float sampleValue=texture2D(mask,vUv+vec2(float(x),float(y))*texel*width).r;
       low=min(low,sampleValue);
       high=max(high,sampleValue);
      }
     }
     float edge=high-low;
     if(edge<0.01)discard;
     gl_FragColor=vec4(color,edge*0.95);
     #include <colorspace_fragment>
    }`,
   transparent:true,depthTest:false,depthWrite:false,toneMapped:false
  });
  this.overlayScene=new THREE.Scene();
  this.overlayScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.material));
  this.overlayCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  this.clearColor=new THREE.Color();
 }
 setSelection(meshes){this.selected=new Set(meshes);}
 resize(width,height,pixelRatio){
  const w=Math.max(1,Math.round(width*pixelRatio)),h=Math.max(1,Math.round(height*pixelRatio));
  this.target.setSize(w,h);
  this.material.uniforms.texel.value.set(1/w,1/h);
  this.material.uniforms.width.value=2.5*pixelRatio;
 }
 render(renderer,camera){
  if(!this.selected.size)return;
  for(const {source,proxy} of this.proxies){
   const selected=this.selected.has(source);
   // Transparent cortex must not conceal a selected deep structure. Opaque
   // anatomy still occludes the far side, so the outline stays anatomical.
   proxy.visible=source.visible&&(selected||source.material.opacity>=.98);
   proxy.material=selected?this.white:this.black;
   proxy.renderOrder=selected?1:0;
   proxy.matrix.copy(source.matrixWorld);
  }
  const previousTarget=renderer.getRenderTarget(),previousAutoClear=renderer.autoClear;
  const previousAlpha=renderer.getClearAlpha();
  renderer.getClearColor(this.clearColor);
  renderer.setRenderTarget(this.target);
  renderer.setClearColor(0x000000,1);
  renderer.autoClear=true;
  renderer.render(this.maskScene,camera);
  renderer.setRenderTarget(previousTarget);
  renderer.setClearColor(this.clearColor,previousAlpha);
  renderer.autoClear=false;
  renderer.render(this.overlayScene,this.overlayCamera);
  renderer.autoClear=previousAutoClear;
 }
}
