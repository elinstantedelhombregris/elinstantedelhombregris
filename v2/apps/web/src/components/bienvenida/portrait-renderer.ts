/**
 * Image-derived instanced particles with a damped displacement texture.
 * Technique reference: Bruno Imbrizi / Codrops, Interactive Particles with Three.js
 * https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/
 * This implementation is written for the Grey Man welcome and its portrait asset.
 */
import {
  BufferAttribute,
  DataTexture,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  Mesh,
  NormalBlending,
  PerspectiveCamera,
  RawShaderMaterial,
  Scene,
  Texture,
  Vector2,
  Vector4,
  WebGLRenderer,
} from 'three';

import { createPortraitField, PORTRAIT_RESPONSE } from './portrait-field';

import type { PortraitBounds } from './portrait-field';

const random = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

const vertexShader = `
precision highp float;
precision highp int;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform sampler2D uImage;
uniform sampler2D uTouch;
uniform vec2 uResolution;
uniform vec4 uBox;
uniform vec2 uPointer;
uniform float uTime;
uniform float uAssembly;
uniform float uExit;
uniform float uMotion;
uniform float uSize;
uniform float uInteraction;
uniform float uHasTouch;
uniform float uPaper;
uniform float uPitch;
uniform vec2 uFieldScale;
attribute vec3 position;
attribute vec2 uv;
attribute vec2 aImageUv;
attribute vec3 aScatter;
attribute float aSeed;
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;

void main(){
  vec4 image=texture2D(uImage,aImageUv);
  float grey=dot(image.rgb,vec3(.2126,.7152,.0722));
  vec2 topUv=vec2(aImageUv.x,1.-aImageUv.y);
  float face=exp(-pow((topUv.y-.165)*10.,2.))*exp(-pow((topUv.x-.53)*5.3,2.));
  float cloth=smoothstep(.28,.85,topUv.y);
  float breath=sin(uTime*1.08)*uMotion;
  vec2 body=topUv;
  body.x+=(body.x-.47)*breath*.007*exp(-pow((body.y-.43)*4.,2.));
  body.x+=sin(body.y*16.-uTime*.8)*.0016*cloth*uMotion;
  body.y+=sin(body.x*12.+uTime*.6)*.0013*cloth*uMotion;
  float turn=(-.02+smoothstep(.7,3.8,uTime)*.035+sin(uTime*.39)*.004)*face*uMotion;
  vec2 head=body-vec2(.53,.24);
  body=mat2(cos(turn),sin(turn),-sin(turn),cos(turn))*head+vec2(.53,.24);

  vec3 point=vec3(uBox.xy+body*uBox.zw,0.);
  float grain=sin(aSeed*67.+uTime*.46)*cos(aSeed*33.-uTime*.31);
  point.z+=(grain*5.+(grey-.3)*8.)*uMotion*(1.-face*.88);
  point.xy+=vec2(sin(uTime*.37+aSeed*42.),cos(uTime*.29+aSeed*81.))*.24*uMotion*(1.-face*.7);
  point.xy+=uPointer*vec2(6.,4.)*(face*.7+cloth*.2);

  float touch=0.;
  if(uHasTouch>.5&&uInteraction>.001){
    vec4 field=texture2D(uTouch,topUv);
    vec2 encoded=vec2(dot(field.rg,vec2(256.,1.)),dot(field.ba,vec2(256.,1.)))*255.;
    vec2 displacement=(encoded-32768.)/32767.*uFieldScale.x;
    touch=clamp(length(displacement)/uFieldScale.x,0.,1.);
    // Stable grain breaks up compression lines without introducing any
    // time-varying noise or sudden changes in the direction of the gesture.
    point.xy+=(displacement*(.78+aSeed*.44)+aScatter.xy*touch*9.)*uInteraction;
    point.z+=touch*uFieldScale.y*(.85+aSeed*.3)*uInteraction;
  }

  float scatter=pow(1.-uAssembly,2.);
  float swirl=scatter*2.7;
  vec2 launch=mat2(cos(swirl),sin(swirl),-sin(swirl),cos(swirl))*aScatter.xy;
  point.xy+=launch*vec2(uBox.z*.85,uBox.w*.62)*scatter;
  point.z+=aScatter.z*230.*scatter;
  point.xy+=aScatter.xy*uExit*vec2(uResolution.x*.46,uResolution.y*.36);
  point.z+=uExit*(110.+aSeed*160.);

  float inkWeight=pow(1.-grey,.85);
  float size=uPitch*mix(.63+sqrt(max(grey,.02))*.54,.48+inkWeight*.77,uPaper)*uSize;
  size*=1.+face*.14;
  size*=1.-touch*.12*uInteraction;
  size*=.5+.5*uAssembly;
  size*=1.+sin(aSeed*21.+uTime*.56)*.045*uMotion;
  vec3 world=vec3(point.x-uResolution.x*.5,uResolution.y*.5-point.y,point.z);
  world.xy+=position.xy*size;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(world,1.);
  vUv=uv;
  float light=min(1.,pow(grey,.93)*1.43+.025);
  vec3 neutral=vec3(light)*vec3(.97,.965,.94);
  vec3 base=mix(neutral,vec3(.08627,.07451,.0549),uPaper);
  vec3 accent=mix(vec3(.6157,.5216,.9098),vec3(.3216,.1529,.8),uPaper);
  vColor=mix(base,accent,touch*.12*uInteraction);
  float hem=1.-smoothstep(.76,1.,topUv.y);
  vAlpha=image.a*hem*(1.-uExit)*smoothstep(0.,.28,uAssembly+aSeed*.12);
  vAlpha*=mix(1.,.14+.86*inkWeight,uPaper);
}
`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
void main(){
  float radius=length(vUv-.5);
  float circle=1.-smoothstep(.28,.5,radius);
  float alpha=circle*vAlpha;
  if(alpha<.015)discard;
  gl_FragColor=vec4(vColor,alpha);
}
`;

interface PortraitOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
}
interface RenderOptions {
  time: number;
  assembly: number;
  exit: number;
  motion: number;
  pointer: { x: number; y: number };
  size?: number;
  interaction?: number;
  reduced?: boolean;
  paper?: boolean;
}
export function createPortraitRenderer({ canvas, image }: PortraitOptions) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 5000);
  const texture = new Texture(image);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  const field = createPortraitField();
  const touchTexture = new DataTexture(
    field.pixels,
    PORTRAIT_RESPONSE.columns,
    PORTRAIT_RESPONSE.rows,
  );
  touchTexture.minFilter = touchTexture.magFilter = LinearFilter;
  touchTexture.generateMipmaps = false;
  touchTexture.needsUpdate = true;

  const uniforms = {
    uImage: { value: texture },
    uTouch: { value: touchTexture },
    uResolution: { value: new Vector2(1024, 680) },
    uBox: { value: new Vector4(0, 50, 530, 795) },
    uPointer: { value: new Vector2() },
    uTime: { value: 0 },
    uAssembly: { value: 0 },
    uExit: { value: 0 },
    uMotion: { value: 1 },
    uSize: { value: 0.98 },
    uInteraction: { value: 1 },
    uHasTouch: { value: 0 },
    uPaper: { value: 0 },
    uPitch: { value: 2 },
    uFieldScale: { value: new Vector2(PORTRAIT_RESPONSE.displacement, PORTRAIT_RESPONSE.depth) },
  };
  const material = new RawShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: NormalBlending,
  });
  let mesh: Mesh<InstancedBufferGeometry, RawShaderMaterial> | null = null;
  let count = 0,
    gridWidth = 0,
    width = 1024,
    height = 680;
  let bounds = { x: 0, y: 50, w: 530, h: 795 },
    lastRevision = -1,
    draws = 0;

  function createGeometry(columns: number) {
    const rows = Math.round(columns * 1.5);
    const sample = document.createElement('canvas');
    sample.width = columns;
    sample.height = rows;
    const sampleContext = sample.getContext('2d');
    if (!sampleContext) throw new Error('Canvas 2D unavailable');
    sampleContext.drawImage(image, 0, 0, columns, rows);
    const pixels = sampleContext.getImageData(0, 0, columns, rows).data;
    const coordinates = [],
      seeds = [],
      scatter = [];
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < columns; x++) {
        const i = (y * columns + x) * 4;
        if ((pixels[i + 3] ?? 0) < 32 || y > rows * 0.98) continue;
        coordinates.push((x + 0.5) / columns, 1 - (y + 0.5) / rows);
        const seed = random(y * columns + x + 7);
        seeds.push(seed);
        scatter.push(
          random(x * 7 + y * 23 + 3) * 2 - 1,
          random(x * 13 + y * 11 + 9) * 2 - 1,
          random(x * 29 + y * 19 + 2) * 2 - 1,
        );
      }
    const geometry = new InstancedBufferGeometry();
    geometry.setAttribute(
      'position',
      new BufferAttribute(
        new Float32Array([-0.5, 0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0]),
        3,
      ),
    );
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2));
    geometry.setIndex([0, 2, 1, 2, 3, 1]);
    geometry.setAttribute(
      'aImageUv',
      new InstancedBufferAttribute(new Float32Array(coordinates), 2),
    );
    geometry.setAttribute('aSeed', new InstancedBufferAttribute(new Float32Array(seeds), 1));
    geometry.setAttribute('aScatter', new InstancedBufferAttribute(new Float32Array(scatter), 3));
    geometry.instanceCount = seeds.length;
    if (mesh) {
      mesh.geometry.dispose();
      mesh.geometry = geometry;
    } else {
      mesh = new Mesh(geometry, material);
      mesh.frustumCulled = false;
      scene.add(mesh);
    }
    count = seeds.length;
    gridWidth = columns;
  }

  function resize(
    nextWidth: number,
    nextHeight: number,
    nextBox: PortraitBounds,
    pixelRatio: number,
  ) {
    width = nextWidth;
    height = nextHeight;
    bounds = { ...nextBox };
    field.resize(bounds);
    renderer.setPixelRatio(Math.min(pixelRatio, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = (height * 0.5) / Math.tan((35 * Math.PI) / 360);
    camera.updateProjectionMatrix();
    uniforms.uResolution.value.set(width, height);
    uniforms.uBox.value.set(bounds.x, bounds.y, bounds.w, bounds.h);
    const columns = width <= 360 ? 210 : 300;
    if (columns !== gridWidth) createGeometry(columns);
    uniforms.uPitch.value = bounds.w / gridWidth;
  }

  function interact(x: number, y: number, time: number, force = 0.65) {
    return field.interact(x, y, time, force);
  }

  function clearInteractions() {
    field.reset();
  }
  function updateTouch(time: number, reduced: boolean) {
    if (reduced && field.active) field.reset();
    else field.advance(time);
    if (field.revision !== lastRevision) {
      touchTexture.needsUpdate = true;
      lastRevision = field.revision;
    }
  }

  function render({
    time,
    assembly,
    exit,
    motion,
    pointer,
    size = 1,
    interaction = 1,
    reduced = false,
    paper = false,
  }: RenderOptions) {
    updateTouch(time, reduced);
    uniforms.uTime.value = time;
    uniforms.uAssembly.value = assembly;
    uniforms.uExit.value = exit;
    uniforms.uMotion.value = motion;
    uniforms.uSize.value = size;
    uniforms.uInteraction.value = reduced ? 0 : interaction;
    uniforms.uHasTouch.value = field.active ? 1 : 0;
    uniforms.uPaper.value = paper ? 1 : 0;
    uniforms.uPointer.value.set(pointer.x, pointer.y);
    renderer.render(scene, camera);
    draws++;
  }

  function dispose() {
    mesh?.geometry.dispose();
    material.dispose();
    texture.dispose();
    touchTexture.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }
  function stats() {
    return {
      engine: 'three.js',
      technique: 'instanced-quads-and-critical-spring-field',
      particleCount: count,
      drawCalls: renderer.info.render.calls,
      ...field.stats(),
      frames: draws,
    };
  }
  resize(width, height, bounds, 1);
  return {
    resize,
    render,
    interact,
    endInteraction: field.end,
    clearInteractions,
    dispose,
    stats,
    get count() {
      return count;
    },
  };
}
