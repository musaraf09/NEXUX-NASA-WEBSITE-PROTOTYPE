'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Component, useMemo, useRef, type ReactNode } from 'react'
import { ShaderMaterial, Vector2 } from 'three'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uAspect;
uniform float uIntensity;
uniform float uImmersive;
uniform vec2 uPointer;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) {
  float v=0.0, a=0.5;
  for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(5.2,1.7);a*=0.5;}
  return v;
}
void main() {
  vec2 screen=(vUv-0.5)*vec2(uAspect,1.0);
  float mobile=1.0-step(1.0,uAspect);
  vec2 center=mix(vec2(uAspect*0.23,0.015),vec2(0.01,-0.16),mobile);
  center=mix(center,vec2(0.0,0.0),uImmersive);
  vec2 p=screen-center-uPointer*0.009;
  float scale=mix(1.0,0.72,mobile);
  p/=scale;
  float angle=-0.11+uPointer.x*0.025;
  p=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*p;
  float r=length(p), theta=atan(p.y,p.x);
  vec3 color=vec3(0.009,0.012,0.019);
  vec2 starUv=screen*140.0;
  vec2 cell=floor(starUv);
  vec2 point=vec2(hash(cell),hash(cell+40.0));
  float star=pow(max(0.0,1.0-length(fract(starUv)-point)*4.5),12.0);
  star*=step(0.967,hash(cell+19.0));
  color+=vec3(0.62,0.70,0.83)*star*(0.5+0.5*hash(cell+9.0));
  float haze=fbm(screen*3.0+vec2(0.0,uTime*0.002));
  color+=vec3(0.05,0.031,0.025)*haze*exp(-r*1.8);
  float radius=0.225;
  float turbul=fbm(vec2(theta*6.0+uTime*0.12,r*75.0-uTime*0.3));
  float halo=exp(-abs(r-radius)*17.0)*0.13;
  color+=vec3(1.0,0.25,0.055)*halo;
  float photon=exp(-abs(r-radius)*205.0);
  float inner=exp(-abs(r-radius*1.025)*72.0);
  float ringTexture=0.7+0.3*turbul;
  color+=vec3(1.0,0.51,0.20)*inner*0.65*ringTexture*uIntensity;
  color+=vec3(1.0,0.80,0.53)*photon*1.45*ringTexture*uIntensity;
  vec2 diskP=vec2(p.x,p.y*5.7);
  float dr=length(diskP);
  float da=atan(diskP.y,diskP.x);
  float diskMask=smoothstep(0.20,0.255,dr)*(1.0-smoothstep(0.35,0.74,dr));
  float diskNoise=fbm(vec2(dr*65.0-uTime*0.20,da*8.0+uTime*0.10));
  float streak=pow(0.5+0.5*sin(dr*310.0+diskNoise*13.0-uTime*0.3),3.0);
  float diskLight=(0.20+0.80*diskNoise+0.30*streak)*diskMask;
  float heat=exp(-max(0.0,dr-0.24)*8.0);
  vec3 diskColor=mix(vec3(0.55,0.12,0.025),vec3(1.0,0.72,0.40),heat);
  float shadow=smoothstep(radius*0.94,radius*1.01,r);
  color*=shadow;
  float foreground=step(p.y,-0.018);
  color+=diskColor*diskLight*mix(shadow,1.0,foreground)*uIntensity;
  float horizontal=exp(-abs(p.y)*95.0)*exp(-abs(p.x)*2.5);
  color+=vec3(0.80,0.38,0.12)*horizontal*0.17*shadow;
  float glow=exp(-length(vec2(p.x,p.y*3.5))*5.0)*0.12*shadow;
  color+=vec3(0.9,0.28,0.065)*glow;
  float vignette=1.0-smoothstep(0.45,1.2,length((vUv-0.5)*vec2(0.9,1.0)));
  color*=vignette;
  color=vec3(1.0)-exp(-color*1.45);
  color=pow(color,vec3(0.92));
  gl_FragColor=vec4(color,1.0);
}`

function Singularity({ paused, intensity, immersive }: SceneProps) {
  const material = useRef<ShaderMaterial>(null)
  const { size } = useThree()
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uIntensity: { value: 1 },
    uImmersive: { value: 0 },
    uPointer: { value: new Vector2() },
  }), [])

  useFrame((state, delta) => {
    if (!material.current) return
    const u = material.current.uniforms
    if (!paused) u.uTime.value += Math.min(delta, 0.05)
    u.uAspect.value = size.width / size.height
    u.uIntensity.value = intensity
    u.uImmersive.value += ((immersive ? 1 : 0) - u.uImmersive.value) * 0.07
    if (!paused) u.uPointer.value.lerp(state.pointer, 0.035)
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} depthTest={false} depthWrite={false} />
    </mesh>
  )
}

type SceneProps = { paused: boolean; intensity: number; immersive: boolean }

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <div className="scene-fallback" aria-hidden="true" /> : this.props.children }
}

export default function BlackHoleScene(props: SceneProps) {
  return (
    <SceneBoundary>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }} fallback={<div className="scene-fallback" />} aria-label="Animated artistic 3D visualization of a black hole and its glowing accretion disk">
        <Singularity {...props} />
      </Canvas>
    </SceneBoundary>
  )
}
