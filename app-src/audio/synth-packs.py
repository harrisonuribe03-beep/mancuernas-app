import numpy as np, os
from scipy.signal import butter, lfilter, sosfilt
from scipy.io import wavfile
SR=44100
rng=np.random.default_rng(7)
def t(d):return np.arange(int(SR*d))/SR
def env(n,a=0.005,d=0.1,s=0.0,r=0.05,hold=0.0):
    N=n;A=int(a*SR);H=int(hold*SR);D=int(d*SR);R=int(r*SR)
    e=np.zeros(N);i=0
    seg=lambda k,v0,v1:np.linspace(v0,v1,max(k,1),endpoint=False)
    parts=[seg(A,0,1),np.ones(H),seg(D,1,s)]
    x=np.concatenate(parts)[:N];e[:len(x)]=x
    if len(x)<N:e[len(x):]=s
    if R>0 and N>R:e[-R:]*=np.linspace(1,0,R)
    return e
def expdec(n,tau):return np.exp(-np.arange(n)/SR/tau)
def sine(f,d,ph=0):tt=t(d);return np.sin(2*np.pi*f*tt+ph) if np.isscalar(f) else np.sin(2*np.pi*np.cumsum(f)/SR)
def square(f,d,duty=.5):
    tt=t(d);ph=(np.cumsum(np.full(len(tt),f) if np.isscalar(f) else f)/SR)%1
    return np.where(ph<duty,1.0,-1.0)*.6
def tri(f,d):
    tt=t(d);ph=(f*tt)%1;return (4*np.abs(ph-.5)-1)
def fm(f,d,ratio=3.5,idx=2.5,tau=.4):
    tt=t(d);I=idx*np.exp(-tt/tau*1.5);return np.sin(2*np.pi*f*tt+I*np.sin(2*np.pi*f*ratio*tt))
def noise(d):return rng.standard_normal(int(SR*d))
def lp(x,fc,o=2):sos=butter(o,min(fc,SR/2-100)/(SR/2),'low',output='sos');return sosfilt(sos,x)
def hp(x,fc,o=2):sos=butter(o,fc/(SR/2),'high',output='sos');return sosfilt(sos,x)
def bp(x,lo,hi,o=2):sos=butter(o,[lo/(SR/2),min(hi,SR/2-200)/(SR/2)],'band',output='sos');return sosfilt(sos,x)
def sweep_noise(d,f0,f1,q=.35):
    x=noise(d);n=len(x);out=np.zeros(n);B=512
    for i in range(0,n,B):
        k=i/n;fc=f0*(f1/f0)**k;lo=max(60,fc*(1-q));hi=fc*(1+q)
        sos=butter(2,[lo/(SR/2),min(hi,SR/2-200)/(SR/2)],'band',output='sos')
        seg=x[max(0,i-2048):i+B];y=sosfilt(sos,seg);out[i:i+B]=y[-len(out[i:i+B]):]
    return out
def verb(x,dec=.6,mix=.25,bright=6000):
    n=int(SR*dec*1.5);ir=lp(noise(n/SR),bright)*expdec(n,dec/4)
    ir/=np.sqrt(np.sum(ir**2))+1e-9
    w=np.convolve(x,ir)
    y=np.concatenate([x,np.zeros(len(w)-len(x))])
    return y*(1-mix)+w*mix*.6
def mixat(parts,total=None):
    L=max(int(st*SR)+len(x) for st,x in parts) if total is None else int(total*SR)
    y=np.zeros(L)
    for st,x in parts:
        i=int(st*SR);y[i:i+len(x)]+=x[:max(0,L-i)]
    return y
def note(m):return 440*2**((m-69)/12)
def save(pack,name,x,peak=.89):
    x=np.asarray(x,float);x=x-np.mean(x[:50]) if len(x)>50 else x
    m=np.max(np.abs(x))+1e-9;x=x/m
    act=x[np.abs(x)>.01];r=np.sqrt(np.mean(act**2)) if len(act) else .2
    x=x*(.3/r);x=np.tanh(x*1.2)/np.tanh(1.2);x=x/max(1,np.max(np.abs(x)))*peak
    f=int(.004*SR);x[:f]*=np.linspace(0,1,f);x[-f*3:]*=np.linspace(1,0,f*3)
    # recorte de silencio final
    idx=np.where(np.abs(x)>1e-3)[0];x=x[:idx[-1]+int(.02*SR)] if len(idx) else x
    os.makedirs('out/'+pack,exist_ok=True)
    wavfile.write(f'out/{pack}/{name}.wav',SR,(x*32767).astype(np.int16))

# ---------------- CLÁSICO: limpio, tipo cronómetro deportivo ----------------
def c_beep(f,d,dec=.08):x=sine(f,d)+.25*sine(2*f,d)+.08*sine(3*f,d);return x*env(len(x),.003,d*.6,.35,.03)
P='clasico'
save(P,'tick',c_beep(880,.12))
save(P,'go',mixat([(0,c_beep(1046.5,.38)),(0,.5*c_beep(1568,.38))]))
save(P,'set',mixat([(0,c_beep(660,.09)),(.08,c_beep(990,.14))]))
save(P,'half',c_beep(740,.18))
save(P,'work',mixat([(0,c_beep(988,.16)),(.17,c_beep(988,.28))]))
save(P,'rest',mixat([(0,c_beep(659,.2)),(.2,c_beep(523,.3))]))
save(P,'pr',verb(mixat([(i*.09,c_beep(note(m),.3)) for i,m in enumerate([72,76,79,84])]),.5,.2))
save(P,'lvl',verb(mixat([(i*.11,c_beep(note(m),.45)) for i,m in enumerate([67,72,76,79,84])]+[(.6,.7*c_beep(note(88),.6))]),.7,.25))
save(P,'done',verb(mixat([(0,c_beep(note(72),.5)),(0,c_beep(note(76),.5)),(0,c_beep(note(79),.5)),(.32,c_beep(note(84),.8))]),.8,.25))

# ---------------- ARCADE: 8 bits ----------------
def a_blip(f,d,duty=.5,slide=0):
    n=int(SR*d);ff=f*np.ones(n) if not slide else np.geomspace(f,f*slide,n)
    x=square(ff,d,duty);return x*env(n,.002,d*.9,.6,.01)
P='arcade'
save(P,'tick',a_blip(note(81),.07,.25))
save(P,'go',mixat([(0,a_blip(note(72),.07)),(.07,a_blip(note(76),.07)),(.14,a_blip(note(79),.07)),(.21,a_blip(note(84),.22,.25))]))
save(P,'set',a_blip(note(76),.12,.25,slide=2.0))
save(P,'half',mixat([(0,a_blip(note(79),.06)),(.08,a_blip(note(79),.06))]))
save(P,'work',mixat([(0,a_blip(note(84),.08,.125)),(.1,a_blip(note(91),.18,.125))]))
save(P,'rest',a_blip(note(79),.35,.5,slide=.5))
coin=mixat([(0,a_blip(note(83),.07,.5)),(.07,a_blip(note(88),.35,.5))])
save(P,'pr',mixat([(0,coin),(.25,coin*.7)]))
up=mixat([(i*.05,a_blip(note(60+i*2),.06,.25)) for i in range(14)])
save(P,'lvl',mixat([(0,up),(.72,a_blip(note(88),.4,.5)),(.72,.6*a_blip(note(84),.4,.25))]))
save(P,'done',mixat([(i*.13,a_blip(note(m),.12 if i<5 else .5,.5)) for i,m in enumerate([67,72,76,79,76,84])]))

# ---------------- ANIME: energía, aura, impacto ----------------
def impact(d=.6,f=55):
    n=int(SR*d);tt=t(d);body=np.sin(2*np.pi*(f+90*np.exp(-tt*30))*tt)*expdec(n,.18)
    crack=hp(noise(d),1500)*expdec(n,.03)*.8
    return body+crack
def sparkle(d=.5,base=2600):
    y=np.zeros(int(SR*d))
    for i in range(7):
        st=i*d/9;f=base*(1+.18*i)*rng.uniform(.95,1.05);x=fm(f,.25,ratio=2.01,idx=1.2,tau=.1)*expdec(int(.25*SR),.07)
        a=int(st*SR);y[a:a+len(x)]+=x[:len(y)-a]*(1-i/9)
    return y
def whoosh(d,f0,f1):x=sweep_noise(d,f0,f1);return x*np.sin(np.linspace(0,np.pi,len(x)))**1.5
def powerup(d=.9):
    n=int(SR*d);tt=t(d);f=np.geomspace(110,880,n)
    x=sum((.6/k)*np.sin(2*np.pi*np.cumsum(f*k)/SR) for k in (1,2,3))
    trem=1+.5*np.sin(2*np.pi*(8+20*tt/d)*tt)
    return x*trem*np.linspace(.2,1,n)**2+.5*whoosh(d,300,6000)
P='anime'
save(P,'tick',fm(1320,.12,ratio=1.5,idx=1.5,tau=.04)*expdec(int(.12*SR),.03))
save(P,'go',verb(mixat([(0,whoosh(.28,400,5000)*.8),(.22,impact(.7)),(.24,.35*sparkle(.5))]),.9,.25))
save(P,'set',verb(mixat([(0,.6*whoosh(.12,2000,8000)),(.04,sparkle(.35,3000))]),.5,.3))
save(P,'half',verb(fm(988,.4,ratio=2,idx=2,tau=.15)*expdec(int(.4*SR),.12),.5,.2))
save(P,'work',verb(mixat([(0,whoosh(.2,500,4000)),(.15,impact(.45,70))]),.6,.2))
save(P,'rest',verb(mixat([(0,whoosh(.5,5000,500)*.7),(.1,.5*fm(523,.6,ratio=2,idx=1,tau=.3)*expdec(int(.6*SR),.25))]),.8,.3))
save(P,'pr',verb(mixat([(0,powerup(.7)),(.68,impact(.8,50)),(.7,sparkle(.7,2400)),(.7,.5*sum(fm(note(m),1.0,ratio=2,idx=1.5,tau=.5)*expdec(int(SR),.45) for m in (72,76,79,84)))]),1.1,.3))
save(P,'lvl',verb(mixat([(0,powerup(1.1)),(1.05,impact(1.0,45)),(1.08,sparkle(.9,2200)),(1.08,.55*sum(fm(note(m),1.4,ratio=2,idx=1.8,tau=.6)*expdec(int(1.4*SR),.6) for m in (67,71,74,79,86)))]),1.4,.32))
save(P,'done',verb(mixat([(0,whoosh(.35,300,6000)),(.3,impact(.9,48))]+[(.35+i*.12,.5*fm(note(m),.7,ratio=2,idx=1.4,tau=.3)*expdec(int(.7*SR),.3)) for i,m in enumerate([72,76,79,84])]),1.2,.3))

# ---------------- SUAVE: marimba y campanas ----------------
def marimba(f,d=.6):n=int(SR*d);tt=t(d);return (np.sin(2*np.pi*f*tt)*expdec(n,.25)+.35*np.sin(2*np.pi*f*3.98*tt)*expdec(n,.04)+.1*np.sin(2*np.pi*f*9.9*tt)*expdec(n,.015))
def bell(f,d=1.2):return fm(f,d,ratio=3.5,idx=1.6,tau=.5)*expdec(int(d*SR),.45)
P='suave'
save(P,'tick',marimba(note(84),.25))
save(P,'go',verb(mixat([(0,marimba(note(72))),(.1,marimba(note(79))),(.2,marimba(note(84),.9))]),.7,.25))
save(P,'set',verb(marimba(note(79),.4),.5,.2))
save(P,'half',verb(marimba(note(76),.4),.5,.2))
save(P,'work',verb(mixat([(0,marimba(note(79))),(.12,marimba(note(84)))]),.5,.2))
save(P,'rest',verb(mixat([(0,marimba(note(79))),(.15,marimba(note(72),.8))]),.6,.25))
save(P,'pr',verb(mixat([(0,bell(note(84))),(.15,bell(note(88))),(.3,bell(note(91),1.5))]),1.0,.3))
save(P,'lvl',verb(mixat([(i*.14,marimba(note(m),.8)) for i,m in enumerate([72,76,79,84,88])]+[(.75,bell(note(96),1.6))]),1.1,.3))
save(P,'done',verb(mixat([(0,bell(note(72),1.6)),(.18,bell(note(79),1.6)),(.36,bell(note(84),1.8))]),1.2,.3))
print('ok')
