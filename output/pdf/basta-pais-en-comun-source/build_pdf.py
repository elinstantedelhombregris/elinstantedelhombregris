from pathlib import Path
from xml.sax.saxutils import escape
import json, math
import numpy as np
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT

BASE=Path('/Users/juanb/Desktop/ElInstantedelHombreGris')
OUT=BASE/'output/pdf/basta-pais-en-comun-guia-del-sistema.pdf'
TMP=BASE/'output/pdf/basta-pais-en-comun-source'
FONT=BASE/'v2/tools/ascii-video-generator/assets/fonts'
for name,path in [('Anton',FONT/'Anton-Regular.ttf'),('Archivo',TMP/'fonts/Archivo-Regular.ttf'),('ArchivoB',TMP/'fonts/Archivo-Bold.ttf'),('Mono',FONT/'SpaceMono-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(path)))
pdfmetrics.registerFontFamily('Archivo',normal='Archivo',bold='ArchivoB',italic='Archivo',boldItalic='ArchivoB')
W,H=595.276,841.89; M=42; CW=W-2*M
PAPER=HexColor('#F2EFE7');RAW=HexColor('#FBFAF4');INK=HexColor('#16130E');BODY=HexColor('#33302A');MUTED=HexColor('#6B665C');LINE=HexColor('#D8D4C8');VIOLET=HexColor('#5227CC');VL=HexColor('#9D85E8');RED=HexColor('#C23B22');GREEN=HexColor('#1A7A4A');AMBER=HexColor('#946200');CYAN=HexColor('#0F6B8A');SOFT=HexColor('#E9E1F7')
ST={
 'body':ParagraphStyle('body',fontName='Archivo',fontSize=11.4,leading=16.8,textColor=BODY,spaceAfter=0),
 'small':ParagraphStyle('small',fontName='Archivo',fontSize=9.4,leading=13.5,textColor=MUTED),
 'tiny':ParagraphStyle('tiny',fontName='Archivo',fontSize=8.5,leading=11.7,textColor=MUTED),
 'title':ParagraphStyle('title',fontName='Anton',fontSize=35,leading=38.5,textColor=INK),
 'sub':ParagraphStyle('sub',fontName='ArchivoB',fontSize=14.5,leading=19,textColor=INK),
 'label':ParagraphStyle('label',fontName='Mono',fontSize=8.2,leading=12,textColor=MUTED),
 'table':ParagraphStyle('table',fontName='Archivo',fontSize=10.1,leading=14.1,textColor=BODY),
 'tablehead':ParagraphStyle('tablehead',fontName='Mono',fontSize=8.1,leading=11.5,textColor=INK),
 'cover':ParagraphStyle('cover',fontName='Anton',fontSize=51,leading=55,textColor=PAPER),
}
c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
c.setTitle('¡BASTA! | Mi Argentina ideal: del relato al diseño colectivo')
c.setAuthor('Proyecto ¡BASTA!')
c.setSubject('Diseño de participación ciudadana, análisis de relatos y opiniones, campañas por zona y tema, visión de país y seguimiento público')
AUDIT=[]
def rect(x,y,w,h,fill,stroke=None,lw=.7):
 c.setFillColor(fill);c.setStrokeColor(stroke or fill);c.setLineWidth(lw);c.rect(x,H-y-h,w,h,fill=1,stroke=bool(stroke))
def line(x1,y1,x2,y2,color=LINE,lw=.7):
 c.setStrokeColor(color);c.setLineWidth(lw);c.line(x1,H-y1,x2,H-y2)
def text(x,y,s,font='Archivo',size=11,color=INK):
 c.setFont(font,size);c.setFillColor(color);c.drawString(x,H-y-size*.82,s)
def para(s,x,y,w,style='body',color=None):
 st=ST[style]
 if color:st=ParagraphStyle('local',parent=st,textColor=color)
 p=Paragraph(s,st);_,h=p.wrap(w,H);p.drawOn(c,x,H-y-h)
 AUDIT.append({'page':len(PAGES_DONE)+1,'kind':'text','x':x,'y':y,'w':w,'h':h})
 return y+h

def brand(x,y,sz=23,dark=False):
 # Los signos en violeta, la palabra en tinta o papel.
 cur=x
 for s,col in [('¡',VL if dark else VIOLET),('BASTA',PAPER if dark else INK),('!',VL if dark else VIOLET)]:
  text(cur,y,s,'Anton',sz,col);cur+=pdfmetrics.stringWidth(s,'Anton',sz)
 return cur

def stamp(x,y,label,w=167):
 c.saveState();c.translate(x,H-y);c.rotate(-3);c.setStrokeColor(RED);c.setLineWidth(1.8);c.rect(0,-29,w,29);c.setFont('Mono',8.6);c.setFillColor(RED);c.drawString(10,-19,label);c.restoreState()

def arrow(x1,y1,x2,y2,color=VIOLET):
 line(x1,y1,x2,y2,color,1.2);a=math.atan2(y2-y1,x2-x1);l=6
 line(x2,y2,x2-l*math.cos(a-.45),y2-l*math.sin(a-.45),color,1.2)
 line(x2,y2,x2-l*math.cos(a+.45),y2-l*math.sin(a+.45),color,1.2)

def note(s,y,label='CRITERIO DE DISEÑO',tone='violet'):
 col={'violet':VIOLET,'amber':AMBER,'green':GREEN,'red':RED}[tone]
 p=Paragraph(s,ST['body']);_,h=p.wrap(CW-34,H);ht=h+45
 rect(M,y,CW,ht,RAW);rect(M,y,3,ht,col)
 text(M+17,y+12,label,'Mono',8,col);p.drawOn(c,M+17,H-y-31-h)
 AUDIT.append({'page':len(PAGES_DONE)+1,'kind':'note','x':M,'y':y,'w':CW,'h':ht})
 return y+ht+14

def table(headers,rows,y,widths=None):
 widths=widths or [CW/len(headers)]*len(headers)
 def row(cells,head=False):
  nonlocal y
  style=ST['tablehead' if head else 'table'];ps=[Paragraph(str(v),style) for v in cells]
  heights=[p.wrap(w-18,H)[1] for p,w in zip(ps,widths)];hh=max(heights)+18
  if head:rect(M,y,CW,hh,HexColor('#ECE8DC'))
  x=M
  for p,w,ph in zip(ps,widths,heights):p.drawOn(c,x+9,H-y-10-ph);x+=w
  line(M,y+hh,M+CW,y+hh,INK if head else LINE,.8 if head else .6)
  AUDIT.append({'page':len(PAGES_DONE)+1,'kind':'row','x':M,'y':y,'w':CW,'h':hh})
  y+=hh
 row(headers,True)
 for r in rows:row(r)
 return y+14

def cards(items,y,cols=2):
 gap=16;w=(CW-gap*(cols-1))/cols
 for i in range(0,len(items),cols):
  grp=items[i:i+cols];hs=[]
  for title,body in grp:
   p=Paragraph(body,ST['body']);_,h=p.wrap(w-28,H);t=Paragraph(title,ST['sub']);_,th=t.wrap(w-28,H);hs.append((p,h,t,th,h+th+46))
  ht=max(x[-1] for x in hs)
  for j,(p,h,t,th,_) in enumerate(hs):
   x=M+j*(w+gap);rect(x,y,w,ht,RAW,INK);t.drawOn(c,x+14,H-y-14-th);p.drawOn(c,x+14,H-y-25-th-h)
  y+=ht+16
 return y

def flow(items,y,vertical=False):
 if vertical:
  for i,(title,body) in enumerate(items):
   ht=59;rect(M+34,y,CW-68,ht,RAW,INK);text(M+48,y+12,title,'ArchivoB',12);para(body,M+48,y+30,CW-96,'small')
   if i<len(items)-1:arrow(W/2,y+ht,W/2,y+ht+16)
   y+=ht+22
  return y
 gap=14;w=(CW-gap*(len(items)-1))/len(items);ht=90
 for i,(title,body) in enumerate(items):
  x=M+i*(w+gap);rect(x,y,w,ht,RAW,INK);para(title,x+10,y+12,w-20,'sub');para(body,x+10,y+48,w-20,'small')
  if i<len(items)-1:arrow(x+w+2,y+ht/2,x+w+gap-2,y+ht/2)
 return y+ht+20

# Datos sintéticos reproducibles para el gráfico de PCA y el análisis de estabilidad.
rng=np.random.default_rng(27)
patterns=np.array([[1,1,-1,-1,1,-1,1,1],[-1,-1,1,1,1,-1,1,1],[1,-1,1,-1,-1,1,1,1]])
X=np.repeat(patterns,30,axis=0).astype(float)
noise=rng.random(X.shape)<.11;noise[:,-1]=False;X[noise]*=-1
passes=rng.random(X.shape)<.08;passes[:,-1]=False;X[passes]=0
missing=rng.random(X.shape)<.18;missing[:,-1]=False
obs=X.copy();obs[missing]=np.nan
means=np.nanmean(obs,axis=0);filled=np.where(np.isnan(obs),means,obs);centered=filled-means
u,s,v=np.linalg.svd(centered,full_matrices=False);proj=centered@v[:2].T
var=s*s/(s*s).sum()

def kmeans(a,k,seed):
 rr=np.random.default_rng(seed);cent=a[rr.choice(len(a),k,replace=False)].copy()
 for _ in range(100):
  labels=((a[:,None,:]-cent[None,:,:])**2).sum(2).argmin(1)
  new=np.array([a[labels==i].mean(0) if (labels==i).any() else cent[i] for i in range(k)])
  if np.allclose(new,cent):break
  cent=new
 inertia=((a-cent[labels])**2).sum()
 return labels,cent,inertia

def silhouette(a,l):
 d=np.sqrt(((a[:,None,:]-a[None,:,:])**2).sum(2));out=[]
 for i in range(len(a)):
  same=np.where(l==l[i])[0];same=same[same!=i]
  if not len(same):out.append(0);continue
  aa=d[i,same].mean();bb=min(d[i,l==j].mean() for j in set(l) if j!=l[i]);out.append((bb-aa)/max(aa,bb))
 return float(np.mean(out))
KS=[]
for k in [2,3,4,5]:
 cand=[kmeans(proj,k,seed) for seed in range(12)];lab,cent,iner=min(cand,key=lambda x:x[2]);KS.append((k,silhouette(proj,lab),lab,cent))


def fig_pca(y):
 ht=240;rect(M,y,CW,ht,RAW,LINE);px=M+47;py=y+26;pw=CW-190;ph=154
 xmin,xmax=np.min(proj[:,0])-.35,np.max(proj[:,0])+.35;ymin,ymax=np.min(proj[:,1])-.35,np.max(proj[:,1])+.35
 sx=lambda a:px+(a-xmin)/(xmax-xmin)*pw;sy=lambda a:py+ph-(a-ymin)/(ymax-ymin)*ph
 for t in [-2,0,2]:
  if xmin<=t<=xmax:line(sx(t),py,sx(t),py+ph,LINE,.5);text(sx(t)-4,py+ph+8,str(t),size=8,color=MUTED)
  if ymin<=t<=ymax:line(px,sy(t),px+pw,sy(t),LINE,.5);text(px-21,sy(t)-3,str(t),size=8,color=MUTED)
 for a,b in proj:
  c.setFillColor(VIOLET);c.circle(sx(a),H-sy(b),2.3,fill=1,stroke=0)
 text(px+pw/2-14,py+ph+28,'PC1',font='Mono',size=9)
 c.saveState();c.translate(M+14,H-(py+ph/2));c.rotate(90);c.setFont('Mono',9);c.setFillColor(INK);c.drawCentredString(0,0,'PC2');c.restoreState()
 text(M+CW-122,y+30,'VARIACIÓN','Mono',8,VIOLET)
 for i in range(3):
  text(M+CW-122,y+59+i*43,f'PC{i+1}: {var[i]*100:.1f}%','ArchivoB',11)
  rect(M+CW-122,y+77+i*43,101,4,LINE);rect(M+CW-122,y+77+i*43,101*var[i],4,VIOLET)
 text(M+17,y+ht-20,'90 personas / 8 afirmaciones / semilla 27 / datos sintéticos','Mono',7.3,MUTED)
 return y+ht+17

def fig_cluster(y):
 ht=216;rect(M,y,CW,ht,RAW,LINE);start=M+36;bw=(CW-80)/4
 for i,(k,val,_,_) in enumerate(KS):
  x=start+i*bw;text(x,y+20,f'K = {k}','Mono',10,INK);rect(x,y+62,bw-26,90,LINE);rect(x,y+152-90*max(0,val),bw-26,90*max(0,val),VIOLET)
  text(x,y+166,f'{val:.3f}','ArchivoB',12,VIOLET)
 text(M+18,y+ht-20,'Silueta en PCA 2D del ejemplo anterior. No es una prueba social.','Mono',7.1,MUTED)
 return y+ht+17

def fig_consensus(y):
 ht=258;rect(M,y,CW,ht,RAW,LINE);x0=M+100;plotw=CW-130
 for i,(g,n,aa,bb) in enumerate([('A',70,66,56),('B',20,18,16),('C',10,1,8)]):
  yy=y+30+i*62;text(M+16,yy+8,f'Grupo {g}','ArchivoB',11);text(M+16,yy+26,f'n = {n}','Mono',8,MUTED)
  rect(x0,yy,plotw*aa/n,12,INK);rect(x0,yy+23,plotw*bb/n,12,VIOLET)
  text(x0+plotw*aa/n+5,yy+1,f'{aa}/{n}',size=9)
  text(x0+plotw*bb/n+5,yy+24,f'{bb}/{n}',size=9,color=VIOLET)
 text(M+18,y+227,'A: tinta, 85% total / B: violeta, 80% total','Mono',8)
 text(M+18,y+243,'Ejemplo sintético. Todas las personas respondieron; no hay pases.','Mono',7.1,MUTED)
 return y+ht+17

def fig_matrix(y):
 ht=209;rect(M,y,CW,ht,RAW,LINE);vals=[[1,1,-1,0,None],[1,None,-1,1,1],[-1,-1,1,0,None],[-1,0,1,None,1],[None,1,0,1,1]]
 x0=M+90;y0=y+38;cell=31
 for j in range(5):text(x0+j*cell+7,y+17,f'A{j+1}','Mono',8)
 for i,row in enumerate(vals):
  text(M+17,y0+i*cell+10,f'P{i+1}','Mono',9)
  for j,val in enumerate(row):
   fill=SOFT if val==1 else HexColor('#E6E1D5') if val==-1 else RAW
   rect(x0+j*cell,y0+i*cell,cell-2,cell-2,fill,LINE)
   text(x0+j*cell+9,y0+i*cell+9,'+' if val==1 else '-' if val==-1 else '0' if val==0 else '.',font='Mono',size=11,color=VIOLET if val==1 else INK)
 x=M+300;para('Respuesta explícita',x,y+30,180,'sub');para('+ Acuerdo<br/>- Desacuerdo<br/>0 Paso<br/>. Dato faltante',x,y+60,175,'body')
 para('Codificación didáctica.<br/>El adaptador debe verificar<br/>la convención del motor.',x,y+137,175,'small')
 return y+ht+17

def fig_coverage(y):
 ht=226;rect(M,y,CW,ht,RAW,LINE)
 text(M+18,y+15,'COBERTURA POR CANAL / EJEMPLO SINTÉTICO','Mono',8,VIOLET)
 x0=M+126;pw=CW-206
 for i,(name,d,a) in enumerate([('Zona 1',48,12),('Zona 2',18,22),('Zona 3',6,14)]):
  yy=y+53+i*41;text(M+18,yy+5,name,'ArchivoB',11);rect(x0,yy,pw*d/60,15,VIOLET);rect(x0+pw*d/60,yy,pw*a/60,15,CYAN);text(x0+pw*(d+a)/60+5,yy+2,str(d+a),size=10)
 text(M+18,y+185,'Violeta: digital / Cian: asistido. Personas únicas por zona.','Mono',7.4)
 text(M+18,y+203,'120 participantes ficticios. No mide cobertura de la población.','Mono',7.1,MUTED)
 return y+ht+17

def fig_campaign_matrix(y):
 ht=220;rect(M,y,CW,ht,RAW,LINE);x0=M+116;y0=y+51;ww=(CW-137)/3;hh=43
 for j,t in enumerate(['SALUD','MOVILIDAD','AGUA']):text(x0+j*ww+8,y+21,t,'Mono',8,VIOLET)
 cells=[['Piloto','Escucha abierta','Por definir'],['Por definir','Comparación','Por definir'],['Por definir','Por definir','Diagnóstico']]
 for i,z in enumerate(['ZONA A','ZONA B','ZONA C']):
  text(M+18,y0+i*hh+14,z,'Mono',8)
  for j,val in enumerate(cells[i]):
   rect(x0+j*ww,y0+i*hh,ww-3,hh-3,SOFT if val!='Por definir' else PAPER,LINE);para(val,x0+j*ww+8,y0+i*hh+12,ww-19,'small',VIOLET if val!='Por definir' else MUTED)
 text(M+18,y+197,'Matriz conceptual: seleccionar territorios y temas no crea campañas.','Mono',7.1,MUTED)
 return y+ht+17

def fig_trace(y):
 items=[('Relato R-014','Fragmento original y publicación autorizada'),('Afirmación A-008','Texto confirmado y respuestas explícitas'),('Hallazgo H-003','Grupos, cobertura, objeciones y corte analítico'),('Condición V-002','Texto revisado; alcance territorial declarado')]
 return flow(items,y,True)

def fig_builder(y):
 ht=321;rect(M,y,CW,ht,RAW,INK);rect(M,y,CW,39,INK);text(M+16,y+12,'CREAR CAMPAÑA / BORRADOR','Mono',9,PAPER)
 fields=[('NOMBRE','La salud en nuestra vida ideal'),('ZONAS','Mendoza / territorios a validar'),('TEMAS','Salud + cuidados + trabajo'),('PREGUNTA','¿Cómo sería cuidar tu salud en tu comunidad ideal?'),('PARTICIPACIÓN','Abierta + encuentros asistidos'),('DEVOLUCIÓN','Informe y encuentro público al cerrar')]
 for i,(label,value) in enumerate(fields):
  yy=y+55+i*39;text(M+16,yy,label,'Mono',7.5,VIOLET);para(value,M+151,yy-2,CW-169,'table');line(M+16,yy+28,M+CW-16,yy+28)
 rect(M+16,y+282,153,26,VIOLET);text(M+25,y+289,'REVISAR CONTRATO','Mono',8,PAPER)
 text(M+185,y+290,'Publicación requiere revisión humana','Archivo',8.5,MUTED)
 return y+ht+17

def fig_journey(y):
 # Una interfaz de prueba, con contenido ficticio y sin cifras.
 ht=246;rect(M,y,CW,ht,RAW,INK);brand(M+15,y+13,20);text(M+138,y+18,'TU MIRADA / VISTA DE CONCEPTO','Mono',7.6,VIOLET);line(M+15,y+47,M+CW-15,y+47)
 para('En tu Argentina ideal, ¿qué sería posible en tu vida?',M+18,y+65,CW-36,'sub')
 rect(M+18,y+103,CW-36,68,PAPER,LINE)
 para('«Podría cuidar mi salud, trabajar y estar con mi familia sin tener que elegir una cosa a costa de otra».',M+30,y+116,CW-60,'body')
 text(M+18,y+185,'Podés corregir, guardar o continuar a tu ritmo.','Archivo',9.4,MUTED)
 rect(M+18,y+210,147,31,VIOLET);text(M+27,y+220,'CONTINUAR','Mono',8.8,PAPER)
 text(M+183,y+221,'Texto / audio / aporte asistido','Archivo',9,MUTED)
 return y+ht+17


def fig_life(y):
 return flow([('Vida imaginada','Estudiar, cuidar y elegir dónde vivir.'),('Condiciones deseadas','Tiempo, vínculos, acceso y autonomía.'),('Sistema diseñado','Servicios, reglas, espacios y capacidades.'),('Prueba y aprendizaje','Resultado observado, objeciones y revisión.')],y,True)

def fig_system(y):
 ht=255;rect(M,y,CW,ht,RAW,LINE)
 boxes=[('Tiempo propio',M+18,y+22,142,44),('Aprender cerca',M+183,y+22,142,44),('Trabajo digno',M+347,y+22,145,44),('Vida que queremos',M+146,y+105,220,44),('Movilidad',M+18,y+189,142,44),('Cuidados',M+183,y+189,142,44),('Hábitat y agua',M+347,y+189,145,44)]
 for title,x,yy,w,h in boxes:
  rect(x,yy,w,h,SOFT if title=='Vida que queremos' else PAPER,INK);para(title,x+10,yy+13,w-20,'table')
 for j in [0,1,2]:
  title,x,yy,w,h=boxes[j];arrow(x+w/2,yy+h,M+256,y+105)
 for j in [4,5,6]:
  title,x,yy,w,h=boxes[j];arrow(M+256,y+149,x+w/2,yy)
 return y+ht+16

def fig_country(y):
 # Geometría real del repositorio; vista parcial continental, sin datos de participación.
 geo=json.loads((BASE/'v2/apps/web/public/geo/provincias.geojson').read_text())
 ht=262;rect(M,y,CW,ht,RAW,LINE);mx=M+18;my=y+20;mw=155;mh=207
 sx=lambda x:mx+(x+74)/21*mw
 sy=lambda z:my+(-21-z)/35*mh
 c.saveState();cp=c.beginPath();cp.rect(mx,H-my-mh,mw,mh);c.clipPath(cp,stroke=0,fill=0)
 for f in geo['features']:
  g=f['geometry'];polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
  for poly in polys:
   for ring in poly[:1]:
    q=c.beginPath()
    for i,pt in enumerate(ring):
     x,z=pt[:2];(q.moveTo if i==0 else q.lineTo)(sx(x),H-sy(z))
    q.close();c.setFillColor(HexColor('#E4E0D3'));c.setStrokeColor(MUTED);c.setLineWidth(.4);c.drawPath(q,fill=1,stroke=1)
 c.restoreState()
 for i,(title,body) in enumerate([('Situación','Hechos y fuentes, con sus límites.'),('Capacidades','Recursos y prácticas disponibles.'),('Futuro','Condiciones de vida deseadas.'),('Caminos','Alternativas e interdependencias.'),('Seguimiento','Acciones y resultados comprobados.')]):
  yy=y+20+i*43;text(M+200,yy,title,'ArchivoB',11.4,VIOLET);para(body,M+200,yy+17,CW-221,'small')
 text(M+15,y+ht-20,'Mapa de referencia / vista continental / sin participación representada','Mono',6.7,MUTED)
 return y+ht+16

def fig_share(y):
 ht=245;rect(M,y,CW,ht,INK);brand(M+22,y+19,30,True)
 text(M+22,y+72,'MI ARGENTINA IDEAL','Mono',9,VL)
 para('«Podría estudiar lo que amo<br/>sin tener que irme».',M+22,y+101,CW-44,'title',PAPER)
 text(M+22,y+199,'¿Cómo sería la tuya?','ArchivoB',14,PAPER)
 text(M+22,y+225,'Ejemplo ficticio / publicación elegida por su autor','Mono',6.8,VL)
 return y+ht+17


PAGES_DONE=[]
def start(section,title,intro,refs=''):
 num=len(PAGES_DONE)+1;rect(0,0,W,H,PAPER)
 c.bookmarkPage(f'p{num}');c.addOutlineEntry(f'{num:02d}. {title.replace("<br/>"," ")}',f'p{num}',level=0,closed=False)
 brand(M,24,20);text(W-239,31,'MI ARGENTINA IDEAL / GUÍA DE DISEÑO','Mono',7.2,MUTED);line(M,60,W-M,60,INK,.8)
 text(M,81,section.upper(),'Mono',8.4,VIOLET)
 y=para(title,M,104,CW,'title')+13
 if intro:y=para(intro,M,y,CW,'body')+16
 return y

def finish(title,y,refs=''):
 if y>747:raise ValueError(f'Page overflow {len(PAGES_DONE)+1}: {y:.1f}')
 if refs:text(M,761,'FUENTES: '+refs+' / referencias al final','Mono',7.2,MUTED)
 line(M,783,W-M,783,INK,.7);text(M,800,'¡BASTA! / IMAGINAR · DISEÑAR · APRENDER','Mono',7.2,MUTED);text(W-M-19,798,f'{len(PAGES_DONE)+1:02d}','Mono',10,VIOLET)
 PAGES_DONE.append({'page':len(PAGES_DONE)+1,'title':title,'end_y':y});c.showPage()

def page(section,title,intro,blocks,refs=''):
 y=start(section,title,intro,refs)
 for b in blocks:
  typ=b[0]
  if typ=='p':y=para(b[1],M,y,CW)+12
  elif typ=='sub':y=para(b[1],M,y,CW,'sub')+10
  elif typ=='small':y=para(b[1],M,y,CW,'small')+13
  elif typ=='note':y=note(b[1],y,*b[2:])
  elif typ=='table':y=table(b[1],b[2],y,b[3] if len(b)>3 else None)
  elif typ=='cards':y=cards(b[1],y,b[2] if len(b)>2 else 2)
  elif typ=='flow':y=flow(b[1],y,b[2] if len(b)>2 else False)
  elif typ=='fig':y=b[1](y)
 finish(title,y,refs)

# 01 / Portada
rect(0,0,W,H,INK)
brand(M,55,121,True)
text(M,207,'GUÍA DE DISEÑO / VERSIÓN 2.0 / 08.10.2026','Mono',8.7,VL)
line(M,238,W-M,238,HexColor('#3A362D'))
para('MI ARGENTINA<br/>IDEAL',M,275,CW,'cover')
para('De la vida que imaginamos<br/>al país que diseñamos juntos.',M,420,CW,'sub',PAPER)
para('Diseño idealizado con participación ciudadana. Conversaciones, patrones, acuerdos y alternativas. Campañas por zonas y temas. Pruebas territoriales y memoria pública.',M,487,CW-20,'body',HexColor('#C9C5BA'))
stamp(M,605,'DISEÑO PROPUESTO',177)
line(M,691,W-M,691,HexColor('#3A362D'))
para('Primero, imaginar la vida.<br/>Después, diseñar sus condiciones.<br/>Probar, comprobar y volver a aprender.',M,715,CW,'body',PAPER)
text(M,808,'IDENTIDAD «PAPEL Y TINTA» / PROYECTO ¡BASTA!','Mono',7.8,VL)
PAGES_DONE.append({'page':1,'title':'Mi Argentina ideal','end_y':779});c.bookmarkPage('p1');c.showPage()

# 02
page('Lectura rápida','El país empieza<br/>en una vida.','Esta revisión pone el diseño idealizado en el centro. La entrada es una conversación sencilla; la profundidad aparece a medida que las personas quieren construir juntas.',[
 ('cards',[
 ('La primera invitación','En tu Argentina ideal, ¿qué sería posible en tu vida? Texto o audio, sin exigir un diagnóstico ni una propuesta técnica.'),
 ('La primera devolución','Esto entendimos de lo que contaste. Podés corregirlo. Estas otras voces se relacionan, si existen y si autorizaron publicarlas.'),
 ('El trabajo colectivo','Formular condiciones deseadas; discutir diferencias; diseñar alternativas; estudiar sus relaciones y probarlas en el territorio.'),
 ('La continuidad','Una campaña devuelve lo aprendido. Una acción comprueba su resultado. La memoria conserva también lo que falló.')]),
 ('note','<b>Primera entrega recomendada:</b> una entrada conversacional, un recibo corregible y una campaña operada por un equipo pequeño. El primer análisis y la devolución pueden ser humanos.','POR DÓNDE EMPEZAR','green'),
 ('small','Todos los recorridos nuevos de esta guía son propuestas de producto. No se cambiaron las páginas de la plataforma ni se comprobó el estado de su base de producción.')])

# 03
page('Recorrido de lectura','Una guía para imaginar,<br/>decidir y construir.','Podés leerla completa o entrar por la tarea que tenés entre manos. Los gráficos numéricos usan datos sintéticos y las pantallas muestran conceptos.',[
 ('table',['RECORRIDO','PÁGINAS'],[
 ['<link href="#p4">Propósito y relación con el proyecto</link>','04-07'],['<link href="#p8">Experiencia, conversación y datos</link>','08-13'],['<link href="#p14">Algoritmos, acuerdos y límites</link>','14-19'],['<link href="#p20">Mapa, diseño, pruebas y memoria</link>','20-26'],['<link href="#p27">Campaña nacional y campañas específicas</link>','27-35'],['<link href="#p36">Comunidad, gobernanza y arquitectura</link>','36-39'],['<link href="#p40">Primera entrega, piloto y decisiones</link>','40-42'],['<link href="#p43">Referencias externas y corpus del proyecto</link>','43-47']],[CW-91,91]),
 ('note','Para la primera decisión de producto, leé <b>8, 27, 30 y 40</b>: entrada ciudadana, campaña nacional, contrato de campaña y orden de construcción.'),
 ('small','Los plazos y criterios de aceptación son propuestas que el equipo debe acordar. Los PLANes inspiran diseños; sus metas, presupuestos y relatos de futuro no se usan aquí como resultados ya obtenidos.')])

# 04
page('01 / Propósito','Diseñar el país<br/>que queremos habitar.','¡BASTA! propone convertir la experiencia de personas comunes en capacidad para diseñar, actuar y aprender juntas. La calidad de vida orienta la arquitectura del sistema.',[
 ('cards',[
 ('Autonomía','Cada persona decide qué contar, qué compartir y cuándo profundizar. La transformación personal es una posibilidad, sin condición previa para participar.'),
 ('Amabilidad radical','La conversación escucha sin juzgar, respeta silencios y evita exigir intimidad. La diversidad de vínculos y formas de vida tiene lugar.'),
 ('Interdependencia','Un futuro personal necesita condiciones compartidas: tiempo, cuidados, aprendizaje, agua, hábitat, movilidad y relaciones.'),
 ('Responsabilidad','Quien sintetiza explica su lectura. Quien acepta una acción responde por ella. Quien observa puede corregir y aportar evidencia.')]),
 ('p','La ciudadanía diseña el propósito y las condiciones deseadas. La articulación con el Estado y la política exige responsables, competencias y acuerdos concretos de ejecución.'),
 ('note','La plataforma tiene que dejar a la persona con más claridad, conexión y capacidad de actuar. Hablar debe producir una devolución útil.','PROMESA CENTRAL','green')], 'S18-S20, L01, L04, L07-L08')

# 05
page('02 / El proyecto como sistema','Una biblioteca que<br/>abre posibilidades.','El registro estratégico contempla 27 PLANes temáticos y PLANRUTA como protocolo de coordinación. Esta agrupación editorial ayuda a leer el conjunto; no sustituye su registro ni sus misiones.',[
 ('table',['PREGUNTA HUMANA','PLANES COMO REFERENCIAS DE DISEÑO'],[
 ['¿Cómo vivimos y nos cuidamos?','AGUA, SAL, VIV, CUIDADO, ARCO, SEG, SUS.'],
 ['¿Cómo aprendemos y creamos?','EDU, CUL, FOCO, PREGUNTA.'],
 ['¿Cómo producimos y habitamos?','ISV, EB, REP, EN, MOV, TER, 24CN, PUERTA.'],
 ['¿Cómo decidimos y sostenemos?','MESA, TALLER, MEMORIA, DIG, JUS, MON, PACTO, GEO.'],
 ['¿Cómo coordinamos el conjunto?','PLANRUTA: dependencias, secuencia, responsabilidades y criterios para continuar o pausar.']],[174,CW-174]),
 ('p','MESA organiza aprendizaje y deliberación; TALLER prueba; CUIDADO sostiene a las personas; MEMORIA conserva precedentes. Sus funciones atraviesan los demás temas.'),
 ('note','Los PLANes son ejemplos abiertos al examen. Un aporte puede cuestionarlos, combinarlos o mostrar un futuro que todavía no contemplan. No se clasifica a la ciudadanía por su adhesión al corpus.','LIBERTAD DE DISEÑO'),
 ('small','Las cinco misiones y los tramos de ejecución simplifican coordinación. No son una lista cerrada de lo que se permite imaginar. Los nombres sin prefijo en la tabla remiten a PLANAGUA, PLANSAL y los demás códigos del registro.')], 'L01-L03, L05')

# 06
page('03 / Diseño idealizado','Imaginar con libertad.<br/>Diseñar con rigor.','La primera conversación abre posibilidades. El diseño colectivo les da forma: propósito, funcionamiento, relaciones, restricciones explícitas y capacidad de aprender.',[
 ('table',['MOMENTO','PREGUNTA QUE LO GUÍA'],[
 ['Imaginar una vida','¿Qué sería posible? ¿Qué sentirías? ¿Qué harías con otros?'],
 ['Diseñar las condiciones','¿Cómo tendría que funcionar el sistema que sostiene esa vida?'],
 ['Examinar el diseño','¿Puede funcionar? ¿Qué depende de qué? ¿A quién afecta?'],
 ['Trazar la transición','¿Qué falta crear y qué podemos probar primero?'],
 ['Aprender del resultado','¿Qué cambió, qué falló y qué tenemos que rediseñar?']],[150,CW-150]),
 ('p','En Ackoff, el diseño idealizado conserva viabilidad tecnológica y operativa, y debe poder aprender y adaptarse. Imaginarlo no exige que ya podamos implementarlo completo. La planificación posterior organiza medios y recursos.'),
 ('note','En la adaptación propuesta para ¡BASTA!, ninguna aspiración se descarta en la entrada por falta de presupuesto. Al desarrollar un diseño se explicitan tecnologías, cambios institucionales y condiciones todavía no resueltas.','DOS NIVELES DE TRABAJO'),
 ('small','Los textos del proyecto usan a veces «sin restricciones». Esta guía distingue la apertura creativa de la evaluación del diseño. Las reformas normativas se presentan como propuestas sujetas al proceso correspondiente.')], 'S24, L01-L02')

# 07
page('04 / De la vida al sistema','Una aspiración revela<br/>condiciones compartidas.','Una escena cotidiana permite descubrir relaciones que un formulario sectorial suele separar. El sistema conserva esa escena mientras ayuda a formular el diseño.',[
 ('fig',fig_life),
 ('p','Ejemplo ficticio: «Quiero estudiar sin irme y acompañar a mi familia». Puede abrir preguntas sobre oferta educativa, trabajo, movilidad, conectividad y cuidados. Ninguna de esas relaciones se impone sin revisión.'),
 ('note','Conectar dimensiones amplía la imaginación. Un vínculo sugerido por IA es una hipótesis que personas afectadas pueden confirmar, corregir o rechazar.','LECTURA SISTÉMICA')], 'L01-L02, L04, L07-L08')

# 08
page('05 / Primera experiencia','Tu Argentina ideal,<br/>con tus palabras.','La persona entra por una invitación amplia. Puede responder una frase, hablar o guardar un borrador. No necesita conocer el proyecto para empezar.',[
 ('fig',fig_journey),
 ('table',['PASO','RESULTADO'],[
 ['1. Imaginar','Una escena o posibilidad deseada, con palabras propias.'],['2. Profundizar','Por qué importa y qué la haría posible. Una pregunta por vez.'],['3. Revisar','Original e interpretación editables; lugar y publicación elegidos.'],['4. Conectar','Recibo y voces relacionadas, cuando hay material autorizado.']],[94,CW-94]),
 ('small','La primera frase puede escribirse sin cuenta. Guardar y recuperar borradores requiere explicar el mecanismo. El envío público necesita consentimiento comprensible; participar en decisiones formales puede exigir requisitos adicionales.')])

# 09
page('06 / Autonomía y privacidad','Primero, tu relato.<br/>Después, tu elección.','Una reflexión personal puede quedarse privada. Publicarla es una decisión específica. El participante tiene que ver qué saldrá a la luz antes de confirmarlo.',[
 ('table',['ELECCIÓN','COMPORTAMIENTO PROPUESTO'],[
 ['Guardar para mí','Borrador privado; no alimenta análisis públicos.'],['Compartir una versión','Elegir texto, fragmentos y territorio aproximado.'],['Autorizar audio','Explicar transcripción, procesamiento y conservación antes de enviarlo.'],['Corregir o retirar','Recibo con controles; actualización de vistas y análisis afectados.'],['Recuperar mi aporte','Cuenta opcional o mecanismo explicado, sin secretos en enlaces públicos.'],['Participar con asistencia','Lectura o escucha del aporte y autorización de su autor.']],[146,CW-146]),
 ('p','Las preguntas sobre familiares, salud o historia personal son opcionales. Pedir funciones y necesidades de sostén suele alcanzar; no hace falta registrar nombres de terceros ni diagnósticos.'),
 ('note','La conversación privada no puede publicarse ni enviarse a un modelo externo por asumir que la persona quiere participar. La autorización identifica destino, uso y contenido.','LÍMITE DE CONFIANZA','green'),
 ('small','El contrato actual de señales es público y no ofrece por sí solo este recorrido privado. Implementar la nueva entrada exige resolver el borrador y sus permisos como primera parte del producto.')], 'L09-L11')

# 10
page('07 / El significado de los datos','Nueve tipos.<br/>Cuatro operaciones distintas.','La conversación puede contener varias ideas. La estructura pública debe respetar el vocabulario vigente de v2, con interpretación confirmada y sin convertir aspiraciones en hechos.',[
 ('table',['CLASE','TIPOS DEL CANON','TRATAMIENTO'],[
 ['Hecho declarado','basta, necesidad, recurso, práctica, saber','Se contrasta y corrobora; la etiqueta no prueba el hecho.'],
 ['Deseo','sueño, propuesta','Se discute y delibera; no se verifica como verdadero.'],
 ['Acto','compromiso','Tiene fecha, responsable y cierre comprobable.'],
 ['Meta','pregunta','Abre una búsqueda y recibe respuesta.']],[98,197,CW-295]),
 ('p','Un valor puede orientar una condición deseada sin convertirse en un punto geográfico. Una adhesión vincula a alguien con una señal; una respuesta a una afirmación pertenece al proceso deliberativo. Son relaciones distintas.'),
 ('note','Tipo describe la naturaleza del aporte. Tema describe sobre qué trata. Una conversación extensa y sus fragmentos serían una capa nueva enlazada a las señales, no un reemplazo silencioso del canon.','COMPATIBILIDAD CON V2'),
 ('small','Original, canal, territorio, campaña, permisos y versiones acompañan al aporte. Los datos sensibles y el audio tienen reglas propias. Una oferta de recurso necesita disponibilidad y unidades para vincularse con una necesidad.')], 'L09-L11')

# 07
page('08 / Comprensión asistida','La interpretación<br/>necesita confirmación.','La IA puede proponer una lectura del relato y preguntas de aclaración. La persona conserva la última palabra sobre lo que quiso decir.',[
 ('cards',[
 ('Puede ayudar','Reconocer condiciones deseadas; sugerir relaciones; separar ideas; señalar datos personales; preparar resúmenes con fragmentos de origen.'),
 ('Requiere revisión','Cambiar el sentido de una frase; agrupar relatos; traducir o transcribir; publicar una síntesis; atribuir una posición a alguien.')]),
 ('table',['CONTROL','COMPORTAMIENTO PROPUESTO'],[
 ['Origen','Cada interpretación apunta al fragmento que la sostiene, sin sustituirlo.'],['Corrección','«Esto no me representa» permite editar o rechazar.'],['Confianza','Las dudas se expresan en lenguaje claro; no se inventa precisión.'],['Versiones','Conservar qué cambió, por qué y quién lo confirmó.'],['Privacidad','Antes de publicar, revisar lo que quedaría visible.']],[100,CW-100]),
 ('note','Ejemplo: «Entendimos que querés cuidar tu salud sin renunciar al trabajo ni a tu familia. ¿Te representa? ¿Qué cambiarías?». La persona puede rechazar la lectura completa.')])

# 08
page('09 / Dos análisis conectados','Temas y acuerdos<br/>usan datos distintos.','El análisis semántico relaciona relatos. El análisis de opiniones observa respuestas explícitas a afirmaciones. Ambos se conectan a las fuentes originales.',[
 ('fig',fig_matrix),
 ('cards',[
 ('Matriz de relatos','Una fila por fragmento y un vector de significado. Sirve para sugerir experiencias relacionadas. La similitud del texto no prueba acuerdo.'),
 ('Matriz de respuestas','Una fila por participante y una columna por afirmación. Sirve para estudiar patrones de apoyo y desacuerdo.')]),
 ('small','Guardar la respuesta explícita y también la exposición: no mostrada, mostrada sin respuesta o respondida. Mantener «paso» separado de los faltantes. La convención numérica debe validarse si se conecta un motor externo.')], 'S01-S02, S11, L11')

# 13
page('10 / Patrones de significado','Relacionar relatos<br/>sin aplanar sus voces.','La semejanza semántica puede sugerir conexiones. El agrupamiento editorial incorpora lectura humana, matices y aportes que no encajan todavía.',[
 ('table',['PASO','CONTROL NECESARIO'],[
 ['Fragmentar','Separar ideas sin perder negación, condiciones ni contexto.'],['Representar','Calcular vectores de significado sobre texto autorizado.'],['Relacionar','Sugerir fragmentos cercanos; conservar también desacuerdos.'],['Nombrar un patrón','Revisar ejemplos y contraejemplos antes de publicar la etiqueta.'],['Devolver','Permitir «me representa», corrección y rechazo de la conexión.']],[122,CW-122]),
 ('p','«Quiero estudiar cerca» y «prefiero irme para estudiar» comparten tema. Esa cercanía no demuestra que quieran el mismo futuro. Una condición general puede esconder diferencias que hay que preguntar.'),
 ('note','La convergencia de v1 se calcula por temas presentes en varios tipos de señal. No mide acuerdo entre personas. El nuevo análisis debe nombrar por separado similitud temática y respuestas explícitas.','APRENDIZAJE DE V1','amber'),
 ('small','Evaluar ejemplos argentinos, formas de hablar, ironía, negaciones y relatos de varias dimensiones. Las conexiones inciertas no se publican como conclusiones.')], 'S11, L12')

# 09
page('11 / PCA','Una vista reducida<br/>de muchas respuestas.','PCA encuentra ejes que conservan variación en los datos. El gráfico muestra una proyección calculada sobre un ejemplo sintético de respuestas.',[
 ('fig',fig_pca),
 ('p','Cada punto representa una persona del ejemplo. PC1 y PC2 combinan respuestas a varias afirmaciones. Sus sentidos deben explicarse leyendo qué afirmaciones pesan en cada eje; no vienen con etiquetas políticas.'),
 ('p','Al centrar una columna en la que todos responden igual, su variación es cero. Una idea compartida por todos puede aportar poco al dibujo y seguir siendo importante para la visión.'),
 ('note','El gráfico conserva una parte de la información. Publicar la variación retenida ayuda a entender su límite. La proximidad es una aproximación dentro del modelo.','LECTURA DEL GRÁFICO','amber'),
 ('small','Para este ejemplo se imputaron medias por columna solo para la proyección. Las imputaciones no se utilizan para calcular apoyos. No reproduce todas las correcciones de Polis.')], 'S03-S05')

# 10
page('12 / Agrupamiento','Grupos como hipótesis<br/>de una conversación.','K-means asigna puntos a centros y recalcula esos centros. La silueta permite comparar cohesión interna y separación entre agrupamientos.',[
 ('fig',fig_cluster),
 ('p','El gráfico compara K = 2, 3, 4 y 5 sobre la misma proyección sintética. Se tomó el mejor resultado por inercia entre 12 inicializaciones para cada K. La silueta observada no valida una interpretación social.'),
 ('p','Para el piloto, usar PCA y K-means como referencia y permitir «estructura insuficiente». Comparar semillas, muestras y cantidad de dimensiones. Revisar las afirmaciones que distinguen cada grupo.'),
 ('note','Una persona puede coincidir con distintos grupos según el tema. Los grupos describen patrones en un corte de una conversación; las etiquetas deben ser provisionales.','IDENTIDAD Y CONTEXTO'),
 ('small','La documentación de Polis describe K-means y selección por silueta. Su rango de K y sus ajustes históricos no deben copiarse como constantes universales.')], 'S06-S07')

# 11
page('13 / Comparación de métodos','Cada algoritmo responde<br/>una pregunta diferente.','La selección se evalúa sobre utilidad, estabilidad e interpretación. Un gráfico más separado no demuestra un análisis más fiel.',[
 ('table',['MÉTODO','USO PROPUESTO','CUIDADO PRINCIPAL'],[
 ['Embeddings','Relacionar fragmentos por significado.','Oposición y semejanza temática pueden coexistir.'],['PCA','Base interpretable del espacio de respuestas.','Reducir dimensiones descarta información.'],['UMAP','Explorar vecindades y estructuras no lineales.','Puede crear separaciones aparentes y alterar densidad.'],['t-SNE','Comparación exploratoria interna.','Distancias globales y tamaños no son una escala social.'],['Leiden','Detectar comunidades en una red de similitudes.','El resultado depende de cómo se construye la red.'],['Jerárquico','Explorar temas y subtemas a distintas escalas.','Un árbol único puede perder relaciones transversales.']],[88,200,CW-288]),
 ('p','La propuesta inicial usa semejanza semántica para sugerir conexiones y respuestas explícitas para estudiar opiniones. UMAP y Leiden se comparan fuera de la experiencia pública antes de adoptarlos.'),
 ('small','Evaluar el agrupamiento en el espacio de análisis, no únicamente en el gráfico 2D. Los aportes no agrupados siguen disponibles para revisión. No deben desaparecer como «ruido».')], 'S08-S13')

# 12
page('14 / Convergencia','Apoyo distribuido<br/>entre miradas distintas.','Un total alto puede esconder oposición concentrada. El ejemplo muestra dos propuestas evaluadas por tres grupos ficticios.',[
 ('fig',fig_consensus),
 ('p','Estimación por grupo: <b>p = (acuerdos + 1) / (respuestas + 2)</b>. El indicador descrito por Polis multiplica esas estimaciones entre grupos. En este ejemplo: propuesta A = <b>0,134</b>; propuesta B = <b>0,459</b>.'),
 ('p','B recibe menos apoyo total, pero su 80% de apoyo en cada grupo le da una señal de convergencia mayor. Los ajustes suavizan estimaciones con pocos datos. Los pases cuentan como respuestas; las ausencias no.'),
 ('note','El indicador sirve para ordenar hallazgos dentro del análisis. Su valor depende de los grupos y no es una probabilidad de acuerdo nacional.','ALCANCE DEL INDICADOR','amber')], 'S14')

# 13
page('15 / Evidencia suficiente','Mostrar cuánto sabemos<br/>y cuánto falta.','Una convergencia necesita cobertura y estabilidad. El sistema debe poder dejar una conclusión abierta cuando los datos no alcanzan.',[
 ('table',['PUBLICAR','PARA QUÉ SIRVE'],[
 ['Acuerdos / desacuerdos / pases','Leer la distribución completa de respuestas.'],['Personas que respondieron','Conocer el denominador por frase y por grupo.'],['Exposición y faltantes','Saber si el apoyo depende de a quién se mostró.'],['Cobertura territorial y por canal','Detectar voces y zonas pendientes.'],['Corte y versión del análisis','Identificar qué datos produjeron el hallazgo.'],['Estabilidad entre métodos y muestras','Comprobar si la conclusión se sostiene.'],['Objeciones y evidencia pendiente','Mantener visibles los límites del acuerdo.']],[213,CW-213]),
 ('p','Los intervalos pueden expresar incertidumbre dentro de las respuestas observadas. Una muestra autoseleccionada exige describir sus sesgos; un intervalo estrecho no corrige falta de representación.'),
 ('note','Los mínimos de respuestas por grupo y el umbral de estabilidad se definirán con el piloto. Si faltan, mostrar «pendiente de evidencia»; evitar un umbral automático que declare consenso.','DECISIÓN DE PRODUCTO','amber'),
 ('small','La métrica de frases características de un grupo ayuda a describir diferencias. «Característico del grupo» y «representativo de la población» son propiedades distintas.')], 'S15')

# 14
page('16 / Conversación continua','Aprender por rondas,<br/>publicar por versiones.','La entrada puede permanecer abierta. Los informes y las decisiones necesitan fechas de corte, reglas y versiones que permitan reconstruir su origen.',[
 ('flow',[('Ronda 1','Escuchar experiencias'),('Ronda 2','Comprobar afirmaciones'),('Ronda 3','Revisar hallazgos')]),
 ('table',['PRÓXIMA AFIRMACIÓN','OBJETIVO'],[
 ['Nueva','Dar exposición a ideas que recién ingresan.'],['Compartida entre participantes','Mantener preguntas comparables dentro del proceso.'],['Posible punto de encuentro','Obtener evidencia en grupos diferentes.'],['Diferencia abierta','Entender condiciones, límites y alternativas.'],['Selección aleatoria','Conservar exploración y auditar la selección.']],[186,CW-186]),
 ('p','Polis documenta una selección adaptativa. Nuestra mezcla y sus pesos son una propuesta a evaluar. Se registra qué se mostró, cuándo y con qué versión del mecanismo.'),
 ('note','Para medir cambios de opinión, distinguir a quienes cambiaron su respuesta de quienes entraron después. Tampoco comparar posiciones de gráficos recalculados sin alinear y evaluar las proyecciones.','COMPARACIÓN EN EL TIEMPO','amber')], 'S16')

# 20
page('17 / El mapa como instrumento','Cinco lentes.<br/>Un mismo territorio.','La spec de septiembre propone Situación, Capacidades, Futuro, Caminos y Seguimiento. La entrada idealizada agrega una puerta conversacional al instrumento territorial.',[
 ('fig',fig_country),
 ('p','Provincia, municipio, barrio y territorio comunitario pueden aportar contextos diferentes. Usar identificadores existentes, distinguir lugar de quien habla y ámbito del futuro propuesto, y mostrar qué precisión se publicó.'),
 ('p','Cobertura y procedencia atraviesan todas las lentes. Una zona sin aportes muestra falta de información. La lista accesible conserva la misma lectura y permite participar sin gestos sobre un mapa.'),
 ('note','Las lentes se habilitan cuando tienen datos y operaciones útiles. Esta figura muestra una arquitectura de producto, no cinco funciones ya terminadas.','ESTADO DE LA PROPUESTA','amber')], 'S17, L10-L11')

# 21
page('18 / Pensamiento sistémico','Diseñar las relaciones<br/>entre las partes.','La visión necesita explicar qué condiciones se sostienen entre sí y dónde aparecen tensiones. El gráfico ilustra relaciones posibles, sin atribuir causalidad medida.',[
 ('fig',fig_system),
 ('table',['RELACIÓN','PREGUNTA PARA DISEÑAR'],[
 ['Depende de','¿Qué debe existir primero para que esto funcione?'],['Puede reforzar','¿Qué otra condición mejora y bajo qué supuesto?'],['Puede tensionar','¿A quién le agrega costo, trabajo o una restricción?'],['Podría reemplazar','¿Qué regla o función dejaría de ser necesaria?']],[144,CW-144]),
 ('small','Las relaciones sugeridas requieren autoría, fuente y revisión. Las simulaciones llegan después de contar con datos y supuestos adecuados. Un grafo bonito no demuestra efectos nacionales.')], 'L01-L03, L10')

# 16
page('19 / Visión de país','Una visión con origen,<br/>diferencias y revisión.','La visión reúne condiciones deseadas y diseños relacionados. Cada síntesis conserva fuentes, alcance, objeciones y una fecha de revisión.',[
 ('fig',fig_trace),
 ('p','Ejemplo ficticio: «En la Argentina que queremos, atender la salud es compatible con trabajar y cuidar». Antes de llamarla compartida, revisar su apoyo, sus objeciones y los territorios ausentes. Distinguir aspiración individual, síntesis provisional, acuerdo del proceso y mandato con efecto declarado.'),
 ('small','Las soluciones pueden variar: horarios, traslados, personal o canales de reserva. La síntesis se revisa con participantes y conserva alternativas, diferencias locales y versiones. Los PLANes de ¡BASTA! aportan hipótesis para contrastar. La síntesis puede cuestionarlos y proponer otros diseños.')])

# 17
page('20 / Del acuerdo a la decisión','Dar forma a alternativas<br/>que podamos comparar.','Una condición deseada puede tener varios diseños posibles. Cada alternativa explica propósito, funcionamiento y transición. Las personas afectadas participan en su examen.',[
 ('flow',[('Condición','Vida que queremos'),('Diseños','Alternativas completas'),('Decisión','Proceso y efecto')]),
 ('table',['FICHA DE ALTERNATIVA','CONTENIDO'],[
 ['Beneficio esperado','Qué condición de vida busca mejorar.'],['Sistema y transición','Funcionamiento ideal; recursos, costos y dependencias para acercarnos.'],['Alternativas consideradas','Opciones y motivos para compararlas.'],['Enmiendas','Cambios propuestos con historia y autoría.'],['Mecanismo de decisión','Quién participa, cómo se verifica y qué se decide.'],['Efecto del resultado','Recomendación, compromiso o decisión vinculante.']],[174,CW-174]),
 ('p','Decidim ofrece propuestas, enmiendas, encuentros y presupuestos participativos dentro de procesos. Tomamos esa estructura como referencia, conservando el enlace a las experiencias que dieron origen a cada propuesta.'),
 ('small','Integrar o adaptar Decidim requiere una decisión técnica posterior. El apoyo a una afirmación no equivale automáticamente a elegir una política.')], 'S21-S22')

# 24
page('21 / El país que aprende','Aprender. Diseñar.<br/>Experimentar. Analizar.','El ciclo LDEA ofrece una disciplina para desarrollar y contrastar alternativas. La escucha abre preguntas; el trabajo colectivo construye propuestas con responsables.',[
 ('cards',[
 ('Aprender','Revisar relatos, situación, capacidades y precedentes. Registrar disensos, preguntas y conocimiento pendiente.'),
 ('Diseñar','Comparar alternativas con funcionamiento, presupuesto, supuestos, métricas y criterios para detener una prueba.'),
 ('Experimentar','Probar a escala acotada con equipo y personas afectadas. Registrar cambios y resultados, incluidos los fallidos.'),
 ('Analizar','Decidir qué corregir, volver a probar o ampliar. Publicar razones y conservar el aprendizaje.')]),
 ('p','PLANMESA, PLANTALLER y PLANMEMORIA inspiran estas funciones. El piloto del producto puede operarlas con equipos y encuentros existentes, sin crear de entrada nuevas instituciones.'),
 ('note','Las credenciales y reglas de autoridad del corpus son hipótesis institucionales a discutir. Escuchar y formular un futuro deben seguir abiertos sin exigir una trayectoria previa.','ACCESO Y AUTORIDAD','green'),
 ('small','Una Mesa solo puede producir efectos vinculantes donde exista autoridad o un acuerdo que los habilite. Una resolución en la plataforma no obliga automáticamente al Estado.')], 'L03-L06')

# 18
page('22 / Responsabilidad pública','Un compromiso termina<br/>en un resultado comprobado.','La institución informa lo que hizo. La ciudadanía aporta lo que cambió en su vida. Las dos lecturas deben poder contrastarse.',[
 ('table',['ETAPA','EVIDENCIA NECESARIA'],[
 ['Recibido','Destinatario competente y constancia de entrega.'],['Respondido','Aceptación, condiciones, rechazo, derivación o sin respuesta.'],['Comprometido','Responsable que acepta el alcance, el plazo y el próximo hito.'],['Financiado','Partida, monto o recurso comprometido con respaldo.'],['Implementado','Qué se hizo, dónde, cuándo y con qué documentación.'],['Resultado observado','Indicadores y experiencias posteriores al cambio.'],['Resultado verificado','Método, línea de base, límites y revisión del resultado.']],[152,CW-152]),
 ('p','Decidim permite enlazar resultados con propuestas y seguir hitos e historial. Nuestra propuesta distingue ejecución de beneficio observado y permite registrar objeciones a la verificación.'),
 ('note','Si nadie aceptó responder, la campaña debe decirlo desde el comienzo. Un plazo propuesto se distingue de uno acordado. El silencio conserva fecha, constancia y seguimiento.','PROMESA HONESTA','amber')], 'S23')

# 26
page('23 / Memoria y adopción','Que lo aprendido<br/>no vuelva a empezar.','Cada prueba deja un precedente consultable. El archivo registra qué se intentó, bajo qué condiciones, quién respondió y qué resultados se observaron.',[
 ('table',['REGISTRO','CONTENIDO QUE SE CONSERVA'],[
 ['Pregunta original','Qué querían comprender las personas y qué sigue abierto.'],['Versión del diseño','Alternativa probada, supuestos y responsables.'],['Resultado','Observaciones, límites, objeciones y evidencia disponible.'],['Corrección','Qué cambió después de escuchar a quienes participaron.'],['Adopción','Si puede funcionar cuando lo usa otro equipo o territorio.']],[142,CW-142]),
 ('p','PLANPREGUNTA distingue la prueba de diseño con sus autores de la prueba de adopción por terceros. Tomamos esa distinción; los plazos concretos se adaptan al caso y a la capacidad real del piloto.'),
 ('p','Quien aportó recibe una devolución y puede decir si responde a su pregunta. Una respuesta puede explicar que todavía falta saber, con próxima revisión y responsable.'),
 ('note','Los relatos de Visión 2040 ilustran posibilidades. Las referencias internas, una firma o un hash documentan procedencia; no convierten el contenido en un resultado observado.','IMAGINACIÓN, HIPÓTESIS Y PRUEBA','amber')], 'L05-L06, L12')

# 27
page('24 / Campaña nacional','MI ARGENTINA<br/>IDEAL.','Una invitación común, abierta al país: describir la vida que querríamos poder vivir. Su salida inicial es una devolución de aspiraciones y preguntas de diseño con alcance explícito.',[
 ('note','<b>En tu Argentina ideal, ¿qué sería posible en tu vida?</b><br/>Una frase alcanza para empezar. Podés contar más cuando quieras.','PREGUNTA DE ENTRADA'),
 ('table',['MOMENTO','EXPERIENCIA PROPUESTA'],[
 ['Entrar','Texto o audio. Ejemplos diversos, sin elegir un tema obligatorio.'],['Profundizar','Por qué importa; qué condiciones la harían posible.'],['Revisar','Original y lectura sugerida; corregir, guardar o compartir.'],['Ubicar','Territorio aproximado o alcance nacional, sin exigir GPS.'],['Recibir','Recibo, aporte revisable y devolución prevista.'],['Volver','Voces relacionadas, diferencias y nuevas preguntas de diseño.']],[125,CW-125]),
 ('small','Una entrada breve y otra conversacional más extensa permiten distintos ritmos. La hipótesis de duración se prueba con personas; no se promete completar todo el recorrido en treinta segundos.'),
 ('note','El ejercicio no necesita un problema previo. También admite futuros felices, capacidades que queremos cultivar y cosas valiosas que queremos sostener.','APERTURA CREATIVA','green')])

# 28
page('25 / Compartir y volver','Una voz puede<br/>invitar a otra.','Compartir es una elección del participante. La pieza pública lleva el fragmento que aprobó y una invitación a imaginar, sin publicar el relato privado completo.',[
 ('fig',fig_share),
 ('p','La persona elige su frase, firma opcional y lugar si desea mostrarlo. El enlace abre la pregunta y conserva la campaña de origen. No expone contactos, respuestas privadas ni claves de gestión.'),
 ('p','La devolución periódica puede mostrar qué escuchamos, qué condiciones aparecen, dónde hay diferencias y qué voces faltan. Publicar también qué cambió tras las correcciones.'),
 ('note','La difusión es una hipótesis a probar. Medir aportes completados que llegan por invitación, diversidad de entrada y retorno a la devolución. Vistas y compartidos solos no demuestran un país diseñado.','CRECIMIENTO CON PROPÓSITO','amber'),
 ('small','No exigir que se comparta para participar. No premiar cantidad de contactos, exposición emocional o repetición de aportes. No presentar una narrativa personal como apoyo a un programa político.')])

# 19
page('26 / Campañas específicas','Una pregunta.<br/>Un territorio. Un tema.','Una campaña focalizada abre una pregunta de diseño en territorios y temas concretos. La entrada nacional puede orientar a ella, con una invitación y autorización nuevas.',[
 ('fig',fig_campaign_matrix),
 ('cards',[
 ('Por territorio','Diseñar un futuro en una localidad, municipio, provincia, cuenca o conjunto explícito de zonas.'),
 ('Por tema','Reunir experiencias sobre salud, movilidad, agua, educación, cuidados u otro tema declarado.')]),
 ('p','También puede cruzar ambas dimensiones: «Cómo sería cuidar la salud en comunidades rurales de Mendoza». El alcance se publica; las personas de otras zonas pueden aportar contexto en un conjunto separado.'),
 ('small','Las campañas aquí son consultas cívicas y procesos de escucha. El producto necesita definir quién puede crearlas, quién las revisa y qué capacidad de facilitación requiere cada una.')])

# 20
page('27 / Contrato de campaña','Antes de convocar,<br/>explicar para qué.','Cada campaña publica un contrato breve. Permite a la persona saber qué aporta, qué se hará con ello y qué puede esperar.',[
 ('table',['CAMPO','DEFINICIÓN QUE SE PUBLICA'],[
 ['Propósito y pregunta','Qué futuro queremos explorar; pregunta abierta y concreta.'],['Zonas y temas','Territorios incluidos, temas centrales y límites.'],['Participantes','Personas afectadas, abierta o convocada, criterios si corresponde.'],['Canales','Web, audio y encuentros con asistencia y accesibilidad.'],['Calendario','Inicio, fases, cierre de aportes, revisión y devolución.'],['Facilitación','Organización convocante, moderadores y contacto de revisión.'],['Uso y privacidad','Qué será público, uso del audio, retiro y datos agregados.'],['Método','Cómo se conectan relatos y se calculan hallazgos.'],['Devolución y efecto','Informe, encuentro y relación con decisiones reales.'],['Responsabilidad','Quién acepta responder o si aún no existe ese acuerdo.']],[145,CW-145]),
 ('note','La pregunta invita a imaginar: «¿Cómo sería cuidar tu salud en tu comunidad ideal?». La situación actual se explora después. Las soluciones se incorporan como alternativas explícitas.','NEUTRALIDAD DE LA PREGUNTA')])

# 21
page('28 / Administrar campañas','Crear una campaña<br/>con límites claros.','El panel guía la configuración, muestra una vista previa ciudadana y exige una revisión del contrato antes de publicar.',[
 ('fig',fig_builder),
 ('p','Seleccionar zonas mediante nombres e identificadores oficiales; guardar varias zonas si hace falta. Elegir un tema principal y temas relacionados. El mapa sirve de apoyo a la selección, con alternativa en lista.'),
 ('p','El borrador permite duplicar estructura y materiales de una campaña anterior. Las respuestas y permisos no se copian. Los cambios posteriores de alcance o pregunta generan una nueva versión y un aviso visible.'),
 ('small','Estados propuestos: borrador, en revisión, programada, abierta, pausada, en devolución, cerrada y seguimiento. «Programada» requiere una acción explícita de publicación del equipo.')])

# 22
page('29 / Fases y operación','Cada fase produce<br/>una devolución útil.','El equipo establece fechas por fase y puede pausar con un motivo público. Cada fase tiene una salida concreta que habilita la siguiente.',[
 ('table',['FASE','SALIDA','RESPONSABLE'],[
 ['Preparar','Contrato, materiales, canal asistido y plan de convocatoria.','Coordinación'],['Imaginar','Vidas y condiciones deseadas, relatos revisados y vacíos.','Participantes'],['Contrastar','Condiciones formuladas, respuestas y objeciones.','Participantes'],['Diseñar','Fichas de futuro, alternativas y preguntas pendientes.','Equipos abiertos'],['Devolver','Informe accesible, encuentro y correcciones recibidas.','Coordinación'],['Probar y seguir','Acciones o pilotos, responsables y resultados.','Acuerdos explícitos']],[98,277,CW-375]),
 ('p','Pausar si hay un incidente de privacidad, capacidad insuficiente o una pregunta que debe reformularse. Conservar aportes, explicar el motivo y publicar el plan de recuperación.'),
 ('note','Una campaña cerrada puede abrir una nueva edición. Cada edición conserva su propio contrato, consentimiento, fechas y análisis. La conversación general puede seguir abierta.','CONTINUIDAD CON TRAZABILIDAD'),
 ('small','El modelo de fases y componentes se inspira en Decidim. El calendario operativo y los estados anteriores son decisiones propuestas para ¡BASTA!.')], 'S21')

# 23
page('30 / Campaña piloto de ejemplo','La salud en nuestra<br/>vida ideal.','Ejemplo de configuración para Mendoza. El territorio es real; la campaña, sus fases y sus compromisos son una propuesta ilustrativa.',[
 ('table',['DECISIÓN','PROPUESTA DE PILOTO'],[
 ['Pregunta','¿Cómo sería cuidar tu salud en tu comunidad ideal?'],['Alcance','Territorios urbanos y rurales a validar en Mendoza.'],['Temas','Salud, trabajo, cuidados y movilidad.'],['Personas a escuchar','Usuarios, cuidadores, personal de salud y quienes no usan internet.'],['Canales','Texto, audio con transcripción revisada y encuentros asistidos.'],['Agenda sugerida','Semanas 1-2: imaginar. 3-4: condiciones y contraste. 5: diseños. 6: devolución.'],['Devolución','Informe público con método y encuentro para corregirlo.'],['Efecto inicial','Ficha de futuro y alternativas; cualquier prueba o respuesta institucional se acuerda después.']],[147,CW-147]),
 ('p','Una escena deseada puede abrir preguntas sobre horarios, traslados, prevención y cuidados. La campaña también releva situación y capacidades para preparar alternativas. La convocatoria incluiría canales que alcancen a personas ausentes del primer conjunto de aportes. El equipo publicaría por qué eligió esos canales y qué zonas siguen pendientes.'),
 ('note','Una duración de seis semanas organiza el ejemplo. La capacidad del equipo, la cobertura y los acuerdos reales determinarán el calendario del piloto.','PLAZO ILUSTRATIVO','amber')])

# 24
page('31 / Medir una campaña','La cobertura guía<br/>a quién escuchar después.','El panel operativo debe distinguir personas, aportes y respuestas. La cantidad de actividad se interpreta junto con canales, zonas y ausencias.',[
 ('fig',fig_coverage),
 ('table',['INDICADOR','LECTURA CORRECTA'],[
 ['Personas únicas','Evitar sumar varias participaciones de una misma persona.'],['Canal y zona','Conocer dónde y cómo ingresaron las voces.'],['Revisión del relato','Medir si las personas corrigen la interpretación.'],['Exposición por afirmación','Evaluar qué voces respaldan cada hallazgo.'],['Revisión de resultados','Saber si la devolución se entiende y representa los aportes.']],[177,CW-177]),
 ('small','Los datos del gráfico son ficticios. No hay población de referencia ni verificación de identidad real. En producción, los datos desconocidos se muestran como desconocidos; la campaña no infiere características sensibles.')])

# 25
page('32 / De campañas a país','Conectar los aprendizajes<br/>sin borrar el contexto.','Una visión nacional relaciona condiciones deseadas y diseños locales. Publica también incompatibilidades, preguntas pendientes y territorios ausentes.',[
 ('flow',[('Campaña local','Experiencias y límites'),('Comparación','Condiciones y diferencias'),('Visión revisada','Origen y alcance federal')]),
 ('table',['PARA COMPARAR','REGLA PROPUESTA'],[
 ['Afirmaciones','Usar texto y versión comparables; una traducción requiere revisión.'],['Participantes','No sumar conteos locales como personas nacionales únicas.'],['Territorios','Mostrar qué zonas participaron y cuáles faltan.'],['Grupos','Los grupos de una campaña no equivalen a los de otra.'],['Tiempo','Comparar períodos y composición de participantes.'],['Conclusión','Declarar si el hallazgo es local, compartido o pendiente de contraste.']],[136,CW-136]),
 ('p','Puede aparecer una condición común -por ejemplo, acceso compatible con trabajo y cuidados- y soluciones diferentes en zonas rurales y urbanas. Esa diferencia se conserva en la ficha de visión.'),
 ('note','La ratificación de una visión de país necesita un proceso propio, público y acordado. Una agregación de campañas abiertas ofrece evidencia para ese proceso, no representatividad automática.','ESCALA FEDERAL','amber')])

# 36
page('33 / Comunidad que sostiene','Hablar. Encontrarse.<br/>Hacer juntos.','PLANCUL y los ensayos de interdependencia muestran que la confianza necesita vínculos y continuidad. El canal digital puede ayudar a sostener encuentros y trabajo compartido.',[
 ('table',['ROL POSIBLE','CONTRIBUCIÓN CONCRETA'],[
 ['Quien imagina','Describe una vida deseada y revisa la interpretación.'],['Quien observa','Aporta hechos, contexto o una pregunta pendiente.'],['Quien cuida','Hace posible participar: tiempo, accesibilidad y acompañamiento.'],['Quien construye','Ofrece capacidad y participa en una prueba.'],['Quien organiza','Convoca y facilita encuentros con límites claros.'],['Quien revisa y cuenta','Comprueba fuentes, conserva aprendizaje y comparte lo autorizado.']],[157,CW-157]),
 ('p','Una mesa barrial, biblioteca o cooperadora puede alojar escucha y diseño. Registrar acuerdos y relatos con permiso; reconocer lo que esas redes ya hacen sin imponerles una nueva identidad.'),
 ('note','Ofrecer acciones pequeñas y ritmos posibles. La participación no exige heroísmo, exposición personal ni disponibilidad permanente. El cuidado incluye a quien facilita.','PERMANENCIA HUMANA','green'),
 ('small','La familia y los vínculos elegidos son contexto para comprender necesidades de sostén. La plataforma no necesita cartografiar públicamente relaciones íntimas para aprender de ellas.')], 'L07-L08, L09')

# 26
page('34 / Confianza y gobernanza','La ciudadanía también<br/>revisa el sistema.','Roles, permisos y razones de cada decisión deben poder explicarse. La IA asiste; las decisiones editoriales y de gobernanza tienen responsables.',[
 ('table',['ROL','RESPONSABILIDAD'],[
 ['Participante','Revisar, corregir y retirar sus aportes según reglas explícitas.'],['Convocante','Publicar propósito, alcance, recursos y devolución.'],['Facilitación','Escuchar, asistir y evitar preguntas que induzcan respuestas.'],['Moderación','Aplicar reglas públicas y registrar motivo de cada acción.'],['Revisión independiente','Atender objeciones sin repetir a quien tomó la decisión.'],['Equipo de análisis','Versionar datos y método; explicar incertidumbre.'],['Institución destinataria','Responder y aceptar responsabilidades cuando exista acuerdo.']],[145,CW-145]),
 ('p','Separar identidad privada, seudónimo y contenido público. Proteger grupos pequeños y ubicaciones sensibles. Definir retención de audio, reglas de retiro y qué información agregada puede permanecer.'),
 ('note','La participación coordinada puede ser legítima. Detectar patrones anómalos abre una revisión; no justifica excluir automáticamente un desacuerdo. Una decisión que afecta un resultado debe quedar fundamentada.','INTEGRIDAD Y DERECHO A REVISIÓN','green')])

# 27
page('35 / Arquitectura propuesta','Cada conclusión conserva<br/>su cadena de evidencia.','La interfaz y el procesamiento comparten un modelo de datos versionado. La propuesta extiende v2 desde sus contratos existentes. Ninguna pantalla nueva basta por sí sola para crear deliberación, privacidad o autoridad.',[
 ('flow',[('Entrada','Texto, audio, actas'),('Procesamiento','Cola y revisión'),('Publicación','Fuentes y versiones')]),
 ('table',['ENTIDAD','RELACIÓN CENTRAL'],[
 ['Participante / permisos','Seudónimo y autorizaciones separados de identidad privada.'],['Campaña / territorios / temas','Contrato y ediciones con alcance explícito.'],['Conversación / señal / fragmento','Borrador privado; original autorizado; relación con señales canónicas.'],['Interpretación / conexión','Fragmento de origen, versión del modelo y revisión.'],['Afirmación / exposición / respuesta','Texto versionado y respuesta explícita por participante.'],['Corte / grupo / hallazgo','Datos utilizados, parámetros, exclusiones y método.'],['Ficha / diseño / prueba / memoria','Origen, versión, dependencias, responsables y resultados.']],[195,CW-195]),
 ('small','Recomendación técnica: API y base de datos con contratos tipados; trabajos de análisis desacoplados; modelos y parámetros registrados; cortes versionados con retiro de exposición y política explícita de conservación; pruebas de adaptación si se integra Polis. No exponer respuestas individuales ni identidades mediante exportaciones públicas.')])

# 39
page('36 / Qué recuperar y extender','Construir sobre<br/>lo que ya aprendimos.','Inventario de código y documentos leído el 08.10.2026. No certifica funcionamiento de punta a punta, despliegue ni estado de producción.',[
 ('table',['BASE LEÍDA','USO EN ESTA PROPUESTA'],[
 ['V1: textos y PLANes','Propósito, diseño sistémico, biblioteca de ejemplos y ciclo LDEA.'],['V1: campañas','Contratos de relevamiento y consulta, formularios y capas. Adaptar; no asumir equivalencia con v2.'],['V2: señales','Nueve tipos, cuatro clases, procedencia, retiro y permisos existentes.'],['V2: geografía y mapa','Búsqueda territorial, agregados y separación entre datos y dibujo.'],['V2: spec de futuro','Ficha trazable y lentes Situación, Capacidades, Futuro, Caminos, Seguimiento.'],['Capas a construir','Conversación privada; confirmación; campañas de diseño; afirmaciones, respuestas y deliberación; pruebas y memoria enlazadas.']],[151,CW-151]),
 ('note','Verificar cada operación en un entorno de prueba antes de reutilizarla. Una tabla o un contrato no demuestra una función completa. Un comentario histórico no prueba el estado actual.','CRITERIO DE INTEGRACIÓN','amber'),
 ('small','Mantener el Postgres y la arquitectura por dominios de v2. Empezar con procesamiento desacoplado y análisis pequeños. Un motor de grafos o un gemelo nacional requieren una necesidad y datos demostrados.')], 'L09-L12')

# 28
page('37 / Orden de construcción','Cuatro entregas.<br/>Un primer circuito completo.','Construir por resultados verificables evita intentar toda la plataforma a la vez. Las campañas aparecen desde la primera entrega, con operación manual.',[
 ('table',['ENTREGA','QUÉ CONSTRUIMOS','CRITERIO PARA AVANZAR'],[
 ['1. Imaginar','Entrada idealizada, borrador, revisión, recibo y una campaña.','La persona comprende qué comparte y puede corregir y retirar.'],['2. Conectar','Patrones revisables, fichas de futuro y afirmaciones claras.','La devolución preserva sentido y diferencias; sirve para diseñar.'],['3. Comprender acuerdos','PCA + K-means de referencia; apoyos por grupo y cortes.','Hallazgos estables, cobertura suficiente y límites visibles.'],['4. Probar y aprender','Diseños alternativos, piloto acordado, resultado y memoria.','Cada prueba deja origen, responsable y aprendizaje verificable.']],[81,217,CW-298]),
 ('p','La primera campaña puede usar la invitación MI ARGENTINA IDEAL y concentrar la operación en territorios piloto. El panel necesita borrador, contrato, alcance, fechas, estado y devolución. La convocatoria, moderación y publicación del informe pueden operarse manualmente.'),
 ('note','La próxima revisión concreta es la primera entrega: los minutos iniciales del participante y la ficha de una campaña piloto. La automatización avanzada se habilita cuando podamos evaluar sus efectos.','POR DÓNDE EMPEZAR')])

# 29
page('38 / Probar antes de ampliar','Aprender con personas,<br/>medir lo que importa.','El piloto debe probar libertad para imaginar, comprensión, fidelidad del relato, operación y confianza. Los objetivos numéricos se acuerdan después de observar el primer conjunto de casos.',[
 ('table',['PRUEBA','EVIDENCIA DE QUE FUNCIONA'],[
 ['Imaginación y comprensión','La pregunta abre futuros concretos; participantes entienden qué publican y qué recibirán.'],['Fidelidad','Revisión de extracciones contra originales, incluyendo negaciones y ambigüedad.'],['Accesibilidad','Recorrido usable en móvil, teclado y canal asistido; transcripciones revisables.'],['Conexiones','Revisión de relaciones sugeridas y de experiencias que quedaron aisladas.'],['Opiniones','Ausencias y pases separados; cobertura y estabilidad documentadas.'],['Campaña y difusión','Equipo devuelve; medir aportes por invitación y retorno, además de alcance.'],['Privacidad','Pruebas de permisos, retiro, exportación y separación de identidad.']],[107,CW-107]),
 ('p','Incluir casos con varias necesidades, relatos breves, contradicciones, territorios múltiples y aportes repetidos. No exigir una solución bien redactada para admitir una experiencia.'),
 ('note','Avanzar por calidad demostrada: publicar antes del piloto los criterios de evaluación y quién los revisará. Una falla de fidelidad obliga a corregir el recorrido antes de automatizarlo. La métrica norte añade condiciones deseadas revisadas por sus autores y conserva la resolución confirmada de necesidades sin exposición.','PUERTA DE CALIDAD','green')])

# 30
page('39 / Decisiones y vocabulario','Resolver lo esencial.<br/>Mantener abierta la revisión.','Las siguientes decisiones completan el diseño operativo. Pueden acordarse durante la preparación del primer piloto.',[
 ('table',['DECISIÓN PENDIENTE','RECOMENDACIÓN INICIAL'],[
 ['Quién crea campañas','Equipo facilitador; más adelante, solicitudes ciudadanas revisables.'],['Qué se verifica','Hechos por corroboración; deseos por deliberación; requisitos claros para decisiones.'],['Dónde empezar','Invitación nacional idealizada; operación inicial en territorios con equipo.'],['Quién devuelve','Equipo convocante con una fecha pública y revisión ciudadana.'],['Cómo integrar motores','Evaluar Polis como referencia y probar contratos antes de adaptar.']],[176,CW-176]),
 ('sub','Glosario mínimo'),
 ('table',['TÉRMINO','SIGNIFICADO'],[
 ['Diseño idealizado','Sistema deseado cuyo funcionamiento y aprendizaje se pueden examinar.'],['Convergencia','Apoyo compartido a una afirmación en grupos o contextos.'],['Ficha de futuro','Condición deseada, fuentes, diferencias, diseños y siguiente paso.'],['Grupo de opinión','Agrupación provisional por semejanza de respuestas.'],['Corte analítico','Conjunto fechado y versionado de datos y método.'],['Mandato','Resultado de un proceso con autoridad y efecto declarados.']],[155,CW-155])])

SOURCES=[
 ('S01','Polis: algoritmos','https://compdemocracy.org/algorithms/','Marco general y distinción entre respuestas y procesamiento del lenguaje.'),
 ('S02','Polis: matriz de opiniones','https://compdemocracy.org/polis-opinion-matrix/','Participantes, afirmaciones, respuestas y datos faltantes.'),
 ('S03','PCA explained visually / Powell y Lehe','https://setosa.io/ev/principal-component-analysis/','Explicación visual de ejes y variación.'),
 ('S04','Small et al. / Polis, 2021','https://doi.org/10.6035/recerca.5516','Artículo metodológico. Describe ajustes históricos; no certifica una versión actual.'),
 ('S05','Polis / implementación de PCA','https://github.com/compdemocracy/polis/blob/edge/math/src/polismath/math/pca.clj','Referencia de código consultada; revisar versión al integrar.'),
 ('S06','Polis: grupos de opinión','https://compdemocracy.org/opinion-groups/','K-means y selección por silueta.'),
 ('S07','scikit-learn: clustering','https://scikit-learn.org/stable/modules/clustering.html','Funciones y límites de algoritmos de agrupamiento.'),
 ('S08','Conlen y Hohman / Dimensionality Reduction','https://dimensionality-reduction-293e465c2a3443e8941b016d.vercel.app/','Comparación visual de PCA, t-SNE y UMAP.'),
 ('S09','UMAP: clustering','https://umap-learn.readthedocs.io/en/latest/clustering.html','Riesgos de densidad y separaciones aparentes.'),
 ('S10','Wattenberg et al. / interpretación de t-SNE','https://distill.pub/2016/misread-tsne/','Cómo evitar lecturas erróneas de distancias y tamaños.'),
 ('S11','Sentence Transformers: similitud semántica','https://sbert.net/docs/sentence_transformer/usage/semantic_textual_similarity.html','Representaciones de frases y comparación de semejanza.'),
 ('S12','Traag, Waltman y van Eck / Leiden','https://www.cwts.nl/blog?article=n-r2u2a4','Comunidades bien conectadas en redes.'),
 ('S13','SciPy: agrupamiento jerárquico','https://docs.scipy.org/doc/scipy/reference/generated/scipy.cluster.hierarchy.linkage.html','Métodos de enlace y estructura jerárquica.'),
 ('S14','Polis: consenso informado por grupos','https://compdemocracy.org/group-informed-consensus/','Estimación suavizada por grupo y producto de apoyos.'),
 ('S15','Polis: comentarios representativos','https://compdemocracy.org/representative-comments/','Afirmaciones características de un grupo.'),
 ('S16','Polis: selección de comentarios','https://compdemocracy.org/comment-routing/','Criterios adaptativos para elegir la próxima afirmación.'),
 ('S17','Georef: ejemplos de uso','https://www.argentina.gob.ar/georef/ejemplos-de-uso','Identificadores y referencias territoriales oficiales.'),
 ('S18','Perfil del Hombre Gris','PERFIL_HOMBRE_GRIS.md','Contexto local del proyecto: sistemas humanos y responsabilidad.'),
 ('S19','Persona del Hombre Gris','PERSONA_HOMBRE_GRIS.md','Contexto local: dignidad, amabilidad, liderazgo distribuido y tono.'),
 ('S20','¡BASTA! / Papel y Tinta','v2/docs/design-system/README.md','Identidad local: Anton, Archivo, Space Mono, papel, tinta y acentos semánticos.'),
 ('S21','Decidim: procesos participativos','https://docs.decidim.org/en/develop/admin/spaces/processes.html','Fases y componentes configurables.'),
 ('S22','Decidim: componentes','https://docs.decidim.org/en/develop/features/components.html','Propuestas, enmiendas, encuentros y presupuestos participativos.'),
 ('S24','Ackoff, Magidson y Addison: Idealized Design','https://isfcolombia.uniandes.edu.co/images/2019-intersemestral/14_de_junio/Idealized_Design_Ch_1_Ackoff.pdf','Cap. 1: diseño deseado, viabilidad y aprendizaje; adaptación cívica propuesta en esta guía.'),
 ('S23','Decidim: seguimiento de resultados','https://docs.decidim.org/en/develop/admin/components/accountability.html','Origen de resultados, hitos e historial de implementación.'),
]

def sources_page(title,items,last=False):
 y=start('Referencias / consulta 08.10.2026',title,'Referencias primarias y documentos del proyecto. La adaptación, los contratos y el orden de construcción son propuestas propias. Lectura y revisión: 08.10.2026.' if not last else 'Las referencias técnicas permiten auditar el método. La identidad y el propósito se apoyan en los documentos locales del proyecto.')
 for sid,name,url,desc in items:
  y=para(f'<font color="#5227CC"><b>{sid}</b></font>  <b>{escape(name)}</b>',M,y,CW,'table')+3
  link=f'<link href="{escape(url)}" color="#5227CC">Abrir fuente</link> - {escape(desc)}' if url.startswith('https:') else f'{escape(url)} - {escape(desc)}'
  y=para(link,M+32,y,CW-32,'small')+14
 if last:y=note('Primera acción: probar la entrada MI ARGENTINA IDEAL y el contrato de una campaña. Imaginar con libertad, devolver con fidelidad y aprender de las correcciones.',y,'DEL DOCUMENTO A LA PRÁCTICA','green')
 finish(title,y)
SOURCES.sort(key=lambda item:int(item[0][1:]))
sources_page('Fuentes para entender<br/>los datos.',SOURCES[:8])
sources_page('Fuentes para contrastar<br/>los métodos.',SOURCES[8:16])
sources_page('Fuentes para organizar<br/>la participación.',SOURCES[16:])

LOCAL_SOURCES=[
 ('L01','Visión, narrativa y biblioteca de v1','SocialJusticeHub/client/src/pages/LaVision.tsx; UnaRutaParaArgentina.tsx; Home.tsx','Invitación al diseño ciudadano y PLANes como ejemplos. Textos leídos; no auditoría visual ni funcional nueva.'),
 ('L02','Registro y sistema estratégico','Iniciativas Estratégicas/PLAN_REGISTRY.yml; PLAN_MAESTRO_RECONSTRUCCION_ARGENTINA_ES.md; MATRIZ_MISIONES_Y_PLANES_ES.md','27 PLANes temáticos y PLANRUTA. Lectura de briefs y estructura general; profundización en órganos cívicos. No validación externa de cifras.'),
 ('L03','PLANMESA y PLANTALLER','Iniciativas Estratégicas/PLANMESA_Argentina_ES.md; PLANTALLER_Argentina_ES.md','Aprender, diseñar, experimentar y analizar; alternativas y evidencia. Sus reglas institucionales son propuestas del corpus.'),
 ('L04','PLANCUIDADO y PLANARCO','Iniciativas Estratégicas/PLANCUIDADO_Argentina_ES.md; PLANARCO_Argentina_ES.md','Sostén, vínculos elegidos y trayectoria de vida como dimensiones transversales.'),
 ('L05','PLANMEMORIA y PLANRUTA','Iniciativas Estratégicas/PLANMEMORIA_Argentina_ES.md; PLANRUTA_Argentina_ES.md','Precedentes, archivo de aprendizaje y disciplina de coordinación; visión histórica separada de operación.'),
 ('L06','PLANPREGUNTA','Iniciativas Estratégicas/PLANPREGUNTA_Argentina_ES.md','Censo con devolución, testigos y distinción entre prueba de diseño y de adopción.'),
 ('L07','PLANCUL y PLANFOCO','Iniciativas Estratégicas/PLANCUL_Argentina_ES.md; PLANFOCO_Argentina_ES.md','Comunidad, confianza, lugares existentes y procedencia sin confundir firma con verdad.'),
 ('L08','Ensayos: interdependencia y Capa Cero','Ensayos/interdependencia/06-la-practica-del-tejido.md; Ensayos/la-mesa/01-la-capa-cero.md; 07-la-mesa.md','Vínculos, reciprocidad, continuidad y sostén. Lectura focalizada; no se afirma lectura íntegra de los 28 ensayos.'),
 ('L09','Constitución de producto','v2/apps/mobile/docs/PRODUCT_CONSTITUTION.md','Ciclo soberano, privacidad, autonomía y resolución confirmada. El nuevo ejercicio agrega diseño del futuro.'),
 ('L10','Mapa y visión de país: septiembre','v2/docs/specs/2026-09-09-mapa-vision-de-pais.md; v2/docs/plans/2026-09-09-mapa-vision-de-pais-plan.md','Ficha de futuro, cinco lentes y entregas. Los estados del plan no certifican una operación desplegada.'),
 ('L11','Vocabulario, ingesta y campañas','v2/packages/civic-core/src/senal/vocabulario.ts; v2/packages/shared/src/validation/senal.ts; SocialJusticeHub/shared/campaign-forms.ts','Canon en código, permisos y contratos. Estado leído del repositorio; producción no consultada.'),
 ('L12','Hallazgos y límites de esta revisión','docs/DEUDAS.md: D-097 y D-098; SocialJusticeHub/client/src/hooks/useConvergenceAnalysis.ts','Coincidencia temática distinta de acuerdo; escenario futuro distinto de resultado observado.'),
]
sources_page('Corpus del proyecto:<br/>visión y método.',LOCAL_SOURCES[:6])
sources_page('Corpus del proyecto:<br/>experiencia y contratos.',LOCAL_SOURCES[6:],True)

c.save()
(TMP/'layout-audit.json').write_text(json.dumps({'pages':PAGES_DONE,'text_boxes':AUDIT,'pca_variance':var.tolist(),'silhouettes':[(k,val) for k,val,_,_ in KS]},ensure_ascii=False,indent=2))
print(f'CREATED {OUT}\nPAGES {len(PAGES_DONE)}\nBYTES {OUT.stat().st_size}')
for p in PAGES_DONE:print(f"{p['page']:02d} / end {p['end_y']:.1f} / {p['title'].replace('<br/>',' ')}")
