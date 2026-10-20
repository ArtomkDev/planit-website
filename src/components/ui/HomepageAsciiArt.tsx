"use client";

import { useEffect, useRef } from "react";
import {
  ASCII_SCENES, ASCII_CHARACTERS, ASCII_ASSEMBLY_DURATION, createAsciiFigure, createGlyphRelay, getAssemblyPose,
  getRelayPose, getAsciiGlyphIndex, getRequestedAsciiFigure, advanceAsciiMotion,
  getAsciiFlightProgress, getAsciiFlightBudget, getAsciiFigureForSection, getAsciiLayerBounds, shouldPaintAsciiFrame,
  beginAsciiArrival, advanceAsciiArrival, shouldAssembleAsciiLocally,
  type AsciiGlyph, type AsciiMotion, type GlyphRelay,
} from "@/lib/ascii-figures";
import { SECTION_NAV_TRAVEL_EVENT, type SectionNavTravelDetail } from "@/lib/section-navigation-scroll";
import styles from "./homepage-ascii-art.module.css";

interface Box { x: number; y: number; width: number; height: number }
interface Layer extends Box {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  dpr: number;
}
interface Scene {
  id: string; element: HTMLElement; copy: HTMLElement; glyphs: AsciiGlyph[];
  x: number; y: number; size: number; entered: number | null; layer: Layer;
}
// Exclude entrance transforms when measuring the stable layout anchors.
function layoutBox(element: HTMLElement): Box {
  let x = 0, y = 0;
  for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) {
    x += node.offsetLeft; y += node.offsetTop;
  }
  return { x, y, width: element.offsetWidth, height: element.offsetHeight };
}
const mix = (a: number, b: number, t: number) => Math.round(a+(b-a)*t);

/** Canvas layers move with their sections in the compositor, independently of the drawing cadence. */
export function HomepageAsciiArt() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scope = root.parentElement;
    function createLayer(canvas: HTMLCanvasElement | null): Layer | null {
      const context = canvas?.getContext("2d", { alpha: true });
      return canvas && context ? {canvas, context, x:0, y:0, width:0, height:0, dpr:1} : null;
    }
    const scenes: Scene[] = ASCII_SCENES.flatMap(({id,figure}) => {
      const element = scope?.querySelector<HTMLElement>(`#${id}`);
      const copy = element?.querySelector<HTMLElement>("[data-ascii-copy], h2");
      const layer = createLayer(root.querySelector<HTMLCanvasElement>(`[data-ascii-scene="${id}"]`));
      return element && copy && layer ? [{id,element,copy,layer,glyphs:createAsciiFigure(figure),x:0,y:0,size:0,entered:null}] : [];
    });
    const relayLayer = createLayer(root.querySelector<HTMLCanvasElement>("[data-ascii-relay-layer]"));
    if (!relayLayer) return;
    if (!scenes.length) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0, elapsed=0, lastTime=0, lastPaint=0, lastScroll=NaN, disposed=false, dirty=true;
    let height=0, rootX=0, rootY=0, paintRight=0, compact=false, dark=true, masks:Box[]=[];
    let visibilityKey="", relayKey="", couriers:GlyphRelay[]=[];
    let motion:AsciiMotion | null=null;
    let velocity=0, velocityTime=0;
    let navigation:{index:number} | null=null;
    // The browser can restore a fragment through several scroll frames after hydration.
    let initialPositionSettled=!window.location.hash, initialScrollChanged=0;
    let atlas:HTMLCanvasElement;

    function makeAtlas() {
      dark=document.documentElement.classList.contains("dark");
      const colors=dark ? [[62,247,210],[77,174,218],[151,131,225]] : [[244,91,138],[170,73,145],[113,99,173]];
      atlas=document.createElement("canvas"); atlas.width=320; atlas.height=ASCII_CHARACTERS.length*20;
      const ink=atlas.getContext("2d");
      if (!ink) return;
      ink.font="500 14px ui-monospace, Consolas, monospace";
      ink.textAlign="center"; ink.textBaseline="middle";
      for (let i=0;i<16;i++) {
        const t=i/15*2, segment=Math.min(1,Math.floor(t)), a=colors[segment], b=colors[segment+1];
        ink.fillStyle=`rgb(${a.map((v,c)=>mix(v,b[c],t-segment)).join(",")})`;
        [...ASCII_CHARACTERS].forEach((character,row)=>ink.fillText(character,i*20+10,row*20+10));
      }
      dirty=true;
    }
    function placeLayer(layer:Layer, bounds:Box) {
      Object.assign(layer,bounds);
      // These coordinates change only with layout, never as a counter-offset to scrollY.
      Object.assign(layer.canvas.style,{
        left:`${bounds.x-rootX}px`, top:`${bounds.y-rootY}px`,
        width:`${bounds.width}px`, height:`${bounds.height}px`,
      });
    }
    function prepareLayer(layer:Layer, budget:number) {
      layer.dpr=Math.min(window.devicePixelRatio || 1,1.5,Math.sqrt(budget/Math.max(1,layer.width*layer.height)));
      const width=Math.max(1,Math.round(layer.width*layer.dpr));
      const height=Math.max(1,Math.round(layer.height*layer.dpr));
      if (layer.canvas.width!==width) layer.canvas.width=width;
      if (layer.canvas.height!==height) layer.canvas.height=height;
      layer.context.setTransform(layer.dpr,0,0,layer.dpr,0,0);
      layer.context.clearRect(0,0,layer.width,layer.height);
      layer.canvas.style.visibility="visible";
    }
    function releaseLayer(layer:Layer) {
      layer.canvas.style.visibility="hidden";
      if (layer.canvas.width) layer.canvas.width=0;
      if (layer.canvas.height) layer.canvas.height=0;
    }
    function measure() {
      if (disposed) return;
      const bounds=layoutBox(root!);
      rootX=bounds.x; rootY=bounds.y; height=window.innerHeight;
      compact=window.innerWidth<768;
      const menuVisible=window.innerWidth>=1920 && height>=640;
      paintRight=bounds.x+bounds.width-(menuVisible ? 272 : 0);
      masks=[];
      scenes.forEach((scene,index)=>{
        const box=layoutBox(scene.element), copy=layoutBox(scene.copy);
        const feature=scene.id.startsWith("feature-");
        scene.size=compact ? 250 : Math.min(760,(feature ? copy.width : 470)+260);
        const outward=window.innerWidth>=1280 ? (index%2 ? 100 : -100) : 0;
        let cx=compact ? box.x+box.width-65 : feature ? copy.x+copy.width*.5+outward : box.x+(index%2 ? box.width-300 : 300);
        if (menuVisible) cx=Math.min(cx,paintRight-scene.size/2-8);
        const cy=box.y+(compact ? 125 : feature ? Math.min(box.height*.36,300) : 220);
        scene.x=cx-scene.size/2; scene.y=cy-scene.size/2;
        placeLayer(scene.layer,getAsciiLayerBounds([scene],compact ? 24 : 160));
        masks.push({x:copy.x-12,y:copy.y-12,width:Math.min(copy.width,620)+24,height:copy.height+24});
      });
      relayKey=""; dirty=true; requestPaint();
    }
    function textStrength(x:number,y:number) {
      for (const box of masks) if (x>box.x && x<box.x+box.width && y>box.y && y<box.y+box.height) {
        const edge=Math.min(x-box.x,box.x+box.width-x,y-box.y,box.y+box.height-y);
        const t=Math.min(1,edge/32);
        return 1-.86*t*t*(3-2*t);
      }
      return 1;
    }
    function stamp(layer:Layer,x:number,y:number,size:number,alpha:number,tint:number,seed:number,ink:number,activity:number) {
      const sx=x-layer.x, sy=y-layer.y;
      if (sx<-20 || sx>layer.width+20 || sy<-20 || sy>layer.height+20 || alpha<.008) return;
      const character=getAsciiGlyphIndex(seed,ink,elapsed,activity);
      const tile=Math.min(15,Math.max(0,Math.round(tint*15)));
      const edgeFade=Math.min(1,Math.max(0,(paintRight-x)/48));
      layer.context.globalAlpha=Math.min(1,alpha*(compact ? .2 : dark ? .62 : .43)*textStrength(x,y)*edgeFade);
      layer.context.drawImage(atlas,tile*20,character*20,20,20,sx-size/2,sy-size/2,size,size);
    }
    function wave(glyph:AsciiGlyph,index:number) {
      const sweep=((elapsed+index*1100)%7600)/7600*1.4-.2;
      return Math.max(0,1-Math.abs(glyph.y-sweep)/.095);
    }
    function canReveal(scene:Scene,scroll:number) {
      const exposure=Math.min(scene.y+scene.size,scroll+height)-Math.max(scene.y,scroll);
      return exposure>=Math.min(120,scene.size*.18);
    }
    function paint(scroll:number,animate:boolean) {
      const flight=animate ? motion?.flight : null;
      let phase="still";
      let reveal=1;
      if (flight) {
        const a=scenes[flight.from], b=scenes[flight.to], progress=getAsciiFlightProgress(flight,elapsed);
        a.entered=b.entered=-2000;
        const key=`${flight.from}/${flight.to}`;
        if (relayKey!==key) {
          placeLayer(relayLayer!,getAsciiLayerBounds([a,b]));
          couriers=createGlyphRelay(a.glyphs,b.glyphs);
          relayKey=key;
        }
        prepareLayer(relayLayer!,2600000); phase="relay";
        for (const courier of couriers) {
          const pose=getRelayPose(courier,progress,a,b);
          const tint=courier.from.tint+(courier.to.tint-courier.from.tint)*pose.progress;
          const size=(a.size+(b.size-a.size)*pose.progress)/68*1.18;
          const seed=pose.progress<.5 ? courier.from.seed : courier.to.seed;
          const ink=courier.from.ink+(courier.to.ink-courier.from.ink)*pose.progress;
          const activity=Math.sin(pose.progress*Math.PI);
          const pulse=.88+(wave(courier.from,flight.from)*(1-pose.progress)+wave(courier.to,flight.to)*pose.progress)*.24;
          if (pose.progress>.08 && pose.progress<.92) {
            const trail=getRelayPose(courier,Math.max(0,progress-.025),a,b);
            stamp(relayLayer!,trail.x,trail.y,size,pose.alpha*.1,tint,seed,ink,activity);
          }
          stamp(relayLayer!,pose.x,pose.y,size,pose.alpha*pulse,tint,seed,ink,activity);
        }
      } else {
        releaseLayer(relayLayer!); relayKey="";
      }
      scenes.forEach((scene,i)=>{
        if ((animate && (flight || i!==motion?.settled)) || scene.y+scene.size<scroll-80 || scene.y>scroll+height+80) {
          releaseLayer(scene.layer); return;
        }
        prepareLayer(scene.layer,1600000);
        const arrival=motion?.arrival?.index===i ? motion.arrival : null;
        if (animate && arrival?.started===null) { releaseLayer(scene.layer); return; }
        if (scene.entered===null) {
          if (animate && !canReveal(scene,scroll)) { releaseLayer(scene.layer); return; }
          scene.entered=elapsed-90;
        }
        const age=animate ? elapsed-(arrival?.started ?? scene.entered) : 2000, assembling=age<ASCII_ASSEMBLY_DURATION;
        if (assembling) { phase="forming"; reveal=Math.max(0,Math.min(1,age/ASCII_ASSEMBLY_DURATION)); }
        else if (animate && phase==="still") phase="wave";
        for (const glyph of scene.glyphs) {
          const pose=assembling ? getAssemblyPose(glyph,age,scene.size) : null;
          const band=wave(glyph,i);
          if (pose && pose.progress>.05 && pose.progress<.9) {
            const trail=getAssemblyPose(glyph,age-38,scene.size);
            stamp(scene.layer,scene.x+trail.x,scene.y+trail.y,scene.size/68*1.18,
              pose.alpha*.12,glyph.tint,glyph.seed,glyph.ink,Math.sin(pose.progress*Math.PI));
          }
          stamp(scene.layer,scene.x+(pose?.x ?? glyph.x*scene.size),scene.y+(pose?.y ?? glyph.y*scene.size),scene.size/68*1.18,
            (pose?.alpha ?? glyph.ink)*(animate ? .88+band*.24 : 1),glyph.tint,glyph.seed,glyph.ink,
            pose ? Math.sin(pose.progress*Math.PI) : animate ? band*.55 : 0);
        }
      });
      root!.dataset.asciiPhase=phase;
      root!.dataset.asciiReveal=reveal.toFixed(3);
    }
    function tick(now:number) {
      frame=0;
      if (disposed || document.hidden) return;
      const scroll=window.scrollY, scrollChanged=scroll!==lastScroll;
      if (scrollChanged && Number.isFinite(lastScroll)) {
        const speed=Math.max(-3,Math.min(3,(scroll-lastScroll)/Math.min(100,Math.max(16,now-velocityTime))));
        velocity=velocity*speed<0 ? speed : velocity*.55+speed*.45;
        velocityTime=now;
      }
      if (now-velocityTime>160) velocity=0;
      if (lastTime) elapsed+=now-lastTime;
      lastTime=now;
      if (!initialPositionSettled) {
        if (scrollChanged) initialScrollChanged=elapsed;
        initialPositionSettled=elapsed-initialScrollChanged>=150 || elapsed>=1800;
      }
      const requested=navigation?.index ?? getRequestedAsciiFigure(scroll,scenes.map(scene=>scene.y+scene.size/2),height,motion?.requested);
      motion ??= {settled:requested,requested,flight:null};
      const visible=scenes.map(scene=>scene.y+scene.size>scroll-80 && scene.y<scroll+height+80);
      const source=scenes[motion.settled];
      const sourceCentre=source.y+source.size/2-scroll;
      const canDepart=!!navigation || !visible[motion.settled] || sourceCentre<height*.35 || sourceCentre>height*.8 || (source.entered!==null && elapsed-source.entered>=ASCII_ASSEMBLY_DURATION);
      const enabled=!media.matches && !compact;
      const previousTarget=motion.arrival?.index ?? motion.flight?.to ?? motion.settled;
      if (enabled && initialPositionSettled && requested!==previousTarget && (motion.arrival || shouldAssembleAsciiLocally(motion.settled,requested,source.y+source.size/2,scroll,height))) {
        motion=beginAsciiArrival(requested);
        scenes[requested].entered=-2000;
      }
      const destination=scenes[requested];
      motion=advanceAsciiArrival(motion,elapsed,canReveal(destination,scroll));
      const budget=getAsciiFlightBudget(scroll,destination.y+destination.size/2,height,velocity);
      motion=advanceAsciiMotion(motion,requested,elapsed,enabled && initialPositionSettled,canDepart,budget);
      const flight=motion.flight;
      const key=`${visible.join(",")}/${motion.settled}/${flight?.from}/${flight?.to}/${motion.arrival?.index}/${motion.arrival?.started}`;
      dirty ||= key!==visibilityKey;
      const animate=enabled && (visible.includes(true) || !!flight || !!navigation || motion.arrival?.started!=null);
      const assembling=motion.arrival?.started!=null || (source.entered!==null && elapsed-source.entered<ASCII_ASSEMBLY_DURATION);
      if (dirty || (animate && shouldPaintAsciiFrame(now,lastPaint,scrollChanged,false,!!flight || assembling))) {
        paint(scroll,animate); lastPaint=now; dirty=false;
      }
      lastScroll=scroll; visibilityKey=key;
      root!.dataset.asciiMotion=animate ? "animated" : "static";
      root!.dataset.asciiFigure=scenes[motion.settled].id;
      root!.dataset.asciiDestination=scenes[flight?.to ?? motion.settled].id;
      root!.dataset.asciiProgress=flight ? getAsciiFlightProgress(flight,elapsed).toFixed(3) : "1";
      if (animate) frame=requestAnimationFrame(tick);
      else lastTime=0;
    }
    function requestPaint() {
      if (!frame && !disposed && !document.hidden) frame=requestAnimationFrame(tick);
    }
    function sectionTravel(event:Event) {
      const detail=(event as CustomEvent<SectionNavTravelDetail>).detail;
      const index=getAsciiFigureForSection(detail.id);
      if (index===null) return;
      navigation=detail.phase==="start" && detail.duration>0 ? {index} : null;
      if (detail.phase!=="cancel") {
        initialPositionSettled=true;
        const current=motion?.arrival?.index ?? motion?.flight?.to ?? motion?.settled;
        if (current!==index) {
          motion=beginAsciiArrival(index);
          scenes[index].entered=-2000;
        }
        if (detail.phase==="finish" || detail.duration===0) {
          if (motion) motion=advanceAsciiArrival(motion,elapsed,canReveal(scenes[index],window.scrollY));
          // Arrival remains in motion after navigation. Never replace it with a completed silhouette.
          if (!document.hidden) {
            paint(window.scrollY,!media.matches && !compact);
            root!.dataset.asciiFigure=scenes[index].id;
            root!.dataset.asciiDestination=scenes[index].id;
            root!.dataset.asciiProgress="1";
          }
        }
      }
      dirty=true; requestPaint();
    }
    function syncVisibility() {
      cancelAnimationFrame(frame); frame=0; lastTime=0; dirty=true;
      root!.dataset.asciiMotion=document.hidden ? "suspended" : "static";
      if (!document.hidden) requestPaint();
    }
    makeAtlas(); measure();
    const resize=new ResizeObserver(measure);
    resize.observe(root); scenes.forEach(scene=>{resize.observe(scene.element);resize.observe(scene.copy);});
    const theme=new MutationObserver(()=>{makeAtlas();requestPaint();});
    theme.observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
    window.addEventListener("scroll",requestPaint,{passive:true}); window.addEventListener("resize",measure);
    window.addEventListener(SECTION_NAV_TRAVEL_EVENT,sectionTravel);
    document.addEventListener("visibilitychange",syncVisibility); media.addEventListener("change",syncVisibility);
    return ()=>{
      disposed=true; cancelAnimationFrame(frame); resize.disconnect(); theme.disconnect();
      window.removeEventListener("scroll",requestPaint); window.removeEventListener("resize",measure);
      window.removeEventListener(SECTION_NAV_TRAVEL_EVENT,sectionTravel);
      document.removeEventListener("visibilitychange",syncVisibility); media.removeEventListener("change",syncVisibility);
      scenes.forEach(scene=>releaseLayer(scene.layer)); releaseLayer(relayLayer);
    };
  },[]);
  return <div ref={rootRef} className={styles.scene} aria-hidden="true" data-ascii-art="planit">
    {ASCII_SCENES.map(({id})=><canvas key={id} data-ascii-scene={id} className={styles.layer} width={0} height={0} />)}
    <canvas data-ascii-relay-layer="true" className={styles.layer} width={0} height={0} />
  </div>;
}
