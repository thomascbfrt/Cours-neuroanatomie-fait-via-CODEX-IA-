"""Build a small browser atlas from real, co-registered FreeSurfer anatomy.

Sources: fsaverage5 distributed by Nilearn; Destrieux 2009 annotations
distributed by NITRC/Nilearn; fsaverage aseg and T1 from MNE testing data.
Run after materializing the source files in ATLAS_SOURCE.
"""
from pathlib import Path
import json, shutil, struct, os
import numpy as np
import nibabel as nib
from nilearn.datasets import fetch_surf_fsaverage
from scipy.ndimage import gaussian_filter
from skimage.measure import marching_cubes
import trimesh

ATLAS_SOURCE = Path(os.environ.get('ATLAS_SOURCE', str(Path(__file__).resolve().parents[1] / '.atlas-source')))
OUT = Path(__file__).resolve().parents[1] / 'dist' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)
surfaces = fetch_surf_fsaverage('fsaverage5')
scene = trimesh.Scene()
info = {'source': 'FreeSurfer fsaverage5 / Destrieux 2009', 'meshes': {}}
# All source data use the same tkregister RAS system. Three.js uses Y up.
def convert(v):
    return np.column_stack((v[:, 0], v[:, 2] - 10, -v[:, 1] - 18))

def add(name, v, f, shade=None, normals=None, kind='cortex', hemi='both', label=''):
    v = convert(v)
    n = None if normals is None else np.column_stack((normals[:,0], normals[:,2], -normals[:,1]))
    mesh = trimesh.Trimesh(v, f, vertex_normals=n, process=False)
    if shade is not None:
        rgba = np.ones((len(v),4), dtype=np.uint8)*255
        rgba[:,:3] = (np.clip(shade,0,1)[:,None]*255).astype(np.uint8)
        mesh.visual.vertex_colors = rgba
    scene.add_geometry(mesh, node_name=name, geom_name=name)
    info['meshes'][name] = {'kind':kind, 'hemi':hemi, 'label':label, 'center':np.round(v.mean(axis=0),2).tolist(), 'vertices':len(v), 'faces':len(f)}

for hemi, side in [('lh','left'),('rh','right')]:
    gii = nib.load(surfaces['pial_'+side]); v,f = [x.data for x in gii.darrays]
    labels,_,names = nib.freesurfer.read_annot(ATLAS_SOURCE/f'{hemi}.aparc.a2009s.annot')
    sulc = nib.load(surfaces['sulc_'+side]).darrays[0].data
    shade = np.clip(.83 - sulc*.115, .48,.96)
    full = trimesh.Trimesh(v,f,process=False)
    normals = full.vertex_normals
    # Every source triangle appears once; majority label preserves parcel borders.
    tri = labels[f]
    face_labels = np.where(tri[:,0]==tri[:,1],tri[:,0],np.where(tri[:,1]==tri[:,2],tri[:,1],tri[:,0]))
    for j, name in enumerate(names):
        faces = f[face_labels==j]
        if not len(faces):continue
        used,inverse = np.unique(faces,return_inverse=True)
        name = name.decode()
        add(f'{hemi}_{name}',v[used],inverse.reshape(-1,3),shade[used],normals[used],hemi=hemi,label=name)

img = nib.load(ATLAS_SOURCE/'aseg.mgz')
seg = np.asarray(img.dataobj).astype(np.uint16)
transform = img.header.get_vox2ras_tkr()
parts = {
    'lh_thalamus':[10], 'rh_thalamus':[49],
    'lh_ventricle':[4,5], 'rh_ventricle':[43,44],
    'third_ventricle':[14], 'fourth_ventricle':[15],
    'corpus_callosum':[251,252,253,254,255],
    'lh_choroid':[31], 'rh_choroid':[63],
    'optic_chiasm':[85],
    'lh_white':[2], 'rh_white':[41],
    'brainstem':[16], 'lh_cerebellum':[7,8], 'rh_cerebellum':[46,47],
    'lh_hippocampus':[17], 'rh_hippocampus':[53],
    'lh_amygdala':[18], 'rh_amygdala':[54],
}
for name,values in parts.items():
    mask = np.isin(seg,values)
    if not mask.any():continue
    coords = np.argwhere(mask)
    lo = np.maximum(coords.min(axis=0)-3,0);hi = np.minimum(coords.max(axis=0)+4,seg.shape)
    field = gaussian_filter(mask[lo[0]:hi[0],lo[1]:hi[1],lo[2]:hi[2]].astype(np.float32),.7)
    v,f,_,_ = marching_cubes(field,.42,step_size=1)
    v += lo
    v = nib.affines.apply_affine(transform,v)
    mesh = trimesh.Trimesh(v,f,process=False)
    if len(f)>12000:
        mesh = mesh.simplify_quadric_decimation(face_count=10000)
    trimesh.smoothing.filter_taubin(mesh,iterations=5)
    add(name,mesh.vertices,mesh.faces,kind='white' if 'white' in name else 'deep',hemi=name[:2] if name.startswith(('lh_','rh_')) else 'both',label=name)

blob = scene.export(file_type='glb', include_normals=True)
(OUT/'brain.glb').write_bytes(blob)
(OUT/'atlas.json').write_text(json.dumps(info,ensure_ascii=False,separators=(',',':')))

# Actual T1 and aseg, downsampled to 2 mm in canonical RAS orientation.
t1 = nib.as_closest_canonical(nib.load(ATLAS_SOURCE/'T1.mgz'))
sg = nib.as_closest_canonical(img)
assert t1.shape == sg.shape and np.allclose(t1.affine,sg.affine)
vol = np.clip(np.asarray(t1.dataobj)[::2,::2,::2],0,255).astype(np.uint8)
labels = np.asarray(sg.dataobj)[::2,::2,::2].astype('<u2')
header = json.dumps({'shape':list(vol.shape),'affine':(t1.affine@np.diag([2,2,2,1])).tolist(),'intensityBytes':vol.size}).encode()
data = struct.pack('<I',len(header))+header+vol.tobytes()+labels.tobytes()
(OUT/'mri.bin').write_bytes(data)

vendor = OUT/'vendor';(vendor/'utils').mkdir(parents=True,exist_ok=True)
for name in ['three.module.js','OrbitControls.js','GLTFLoader.js','THREE-LICENSE.txt']:
    shutil.copyfile(ATLAS_SOURCE/name,vendor/name)
shutil.copyfile(ATLAS_SOURCE/'BufferGeometryUtils.js',vendor/'utils'/'BufferGeometryUtils.js')
# Loader normally lives in loaders/: this project keeps it next to the module.
p=vendor/'GLTFLoader.js'
p.write_text(p.read_text().replace("'../utils/BufferGeometryUtils.js'","'./utils/BufferGeometryUtils.js'"))
print(json.dumps({'meshCount':len(info['meshes']),'glbBytes':len(blob),'mriBytes':len(data),'totalCorticalFaces':sum(v['faces'] for v in info['meshes'].values() if v['kind']=='cortex')}))
