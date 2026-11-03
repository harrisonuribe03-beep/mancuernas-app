import numpy as np,json,base64,io
from PIL import Image,ImageDraw,ImageFilter
from scipy import ndimage
from regions import F,B
def sil(a):
    g=a.mean(2);m=g<238
    m=ndimage.binary_closing(m,iterations=2);m=ndimage.binary_fill_holes(m)
    lab,n=ndimage.label(m);sizes=ndimage.sum(m,lab,range(1,n+1));
    keep=lab==(int(np.argmax(sizes))+1);return keep
def axis(m):
    rows=range(120,140);xs=[]
    for y in rows:
        c=np.where(m[y])[0]
        if len(c):xs.append((c.min()+c.max())/2)
    return float(np.median(xs))
COL={'traps':(0,200,0),'chest':(255,0,0),'delt':(0,0,255),'bi':(255,0,255),'fore':(0,255,255),'abs':(255,128,0),'obl':(128,0,255),'quad':(255,255,0),'add':(0,128,128),'calf':(128,64,0),'rdelt':(0,0,255),'infra':(200,0,100),'lats':(0,150,255),'tri':(255,0,255),'lower':(90,90,0),'glute':(255,90,90),'ham':(150,255,90)}
out={}
for side,R,fn in [('f',F,'front.png'),('b',B,'back.png')]:
    im=Image.open(fn).convert('RGB');a=np.asarray(im)
    m=sil(a);ax=axis(m);print(side,'axis',ax)
    ys,xs=np.where(m);bb=(xs.min()-2,ys.min()-2,xs.max()+3,ys.max()+3);print('bbox',bb)
    dbg=im.copy();d=ImageDraw.Draw(dbg,'RGBA')
    masks={}
    dx=ax-(300 if side=='f' else 292.5)
    for k,p in R.items():
        p=[(x+dx,y) for x,y in p]
        mk=Image.new('L',im.size,0);dm=ImageDraw.Draw(mk)
        dm.polygon(p,fill=255);dm.polygon([(2*ax-x,y) for x,y in p],fill=255)
        mm=(np.asarray(mk)>0)&m;masks[k]=mm
        for poly in (p,[(2*ax-x,y) for x,y in p]):d.polygon(poly,fill=COL[k]+(110,))
    dbg.save(side+'_dbg.png')
    np.save(side+'_sil.npy',m);np.save(side+'_ax.npy',np.array([ax]))
    import pickle;pickle.dump((masks,bb),open(side+'_masks.pkl','wb'))

# ---------- assets ----------
def b64(img,q=80):
    bio=io.BytesIO();img.save(bio,'WEBP',quality=q,method=6);return 'data:image/webp;base64,'+base64.b64encode(bio.getvalue()).decode(),len(bio.getvalue())
import pickle
res={};tot=0
for side,fn in [('f','front.png'),('b','back.png')]:
    im=Image.open(fn).convert('RGB');a=np.asarray(im).astype(float)
    masks,bb=pickle.load(open(side+'_masks.pkl','rb'));m=np.load(side+'_sil.npy')
    if 'infra' in masks:masks['traps']=masks['traps']|masks.pop('infra')
    x0,y0,x1,y1=[int(v) for v in bb];W,H=x1-x0,y1-y0
    L=a.mean(2)
    alpha=Image.fromarray((m*255).astype('uint8')).filter(ImageFilter.GaussianBlur(.8))
    base=Image.fromarray(np.stack([L,L,L],2).astype('uint8')).convert('RGBA');base.putalpha(alpha)
    base=base.crop(bb);u,n=b64(base,82);tot+=n
    red=np.stack([np.clip(70+L*.72,0,255),L*.28,L*.25],2).astype('uint8')
    regs={}
    for k,mm in masks.items():
        al=Image.fromarray((mm*255).astype('uint8')).filter(ImageFilter.GaussianBlur(.9))
        al=Image.fromarray(np.minimum(np.asarray(al),np.asarray(alpha)))
        ys,xs=np.where(np.asarray(al)>8)
        if not len(xs):continue
        bx=(xs.min(),ys.min(),xs.max()+1,ys.max()+1)
        ri=Image.fromarray(red).convert('RGBA');ri.putalpha(al);ri=ri.crop(bx)
        uu,nn=b64(ri,80);tot+=nn
        regs[k]=[int(bx[0]-x0),int(bx[1]-y0),int(bx[2]-bx[0]),int(bx[3]-bx[1]),uu]
    res[side]={'w':W,'h':H,'base':u,'r':regs}
    # preview: all red
    pv=base.copy()
    for k,(x,y,w,h,uu) in regs.items():
        ri=Image.open(io.BytesIO(base64.b64decode(uu.split(',')[1])));pv.alpha_composite(ri,(x,y))
    bg=Image.new('RGBA',pv.size,(244,239,230,255));bg.alpha_composite(pv);bg.save(side+'_preview.png')
print('bytes',tot)
json.dump(res,open('anat.json','w'))
