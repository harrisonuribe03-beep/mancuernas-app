import glob,numpy as np
from PIL import Image
for f in sorted(glob.glob('out-*.png')):
    im=Image.open(f).convert('RGBA');a=np.asarray(im)[:,:,3];ys,xs=np.where(a>10)
    x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max();w,h=x1-x0,y1-y0;s=540/max(w,h)
    c=im.crop((x0,y0,x1+1,y1+1)).resize((int(w*s),int(h*s)),Image.LANCZOS)
    out=Image.new('RGBA',(600,600),(0,0,0,0));out.alpha_composite(c,((600-c.width)//2,600-30-c.height if h<w else (600-c.height)//2))
    out.save(f.replace('out-','fit-'))
