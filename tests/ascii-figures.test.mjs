import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile('src/lib/ascii-figures.ts', 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { ASCII_SCENES, ASCII_CHARACTERS, ASCII_FLIGHT_DURATION, ASCII_ASSEMBLY_DURATION, createAsciiFigure, createGlyphRelay, getAssemblyPose, getRelayPose, getAsciiGlyphIndex, getRequestedAsciiFigure, getAsciiFlightBudget, getAsciiFigureForSection, beginAsciiArrival, advanceAsciiArrival, shouldAssembleAsciiLocally, advanceAsciiMotion, getAsciiFlightProgress, getAsciiLayerBounds, shouldPaintAsciiFrame } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const navigationSource = await readFile('src/lib/section-navigation-scroll.ts', 'utf8');
const navigationCode = ts.transpileModule(navigationSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { getSectionNavScrollPlan, getSectionNavScrollPosition } = await import(`data:text/javascript;base64,${Buffer.from(navigationCode).toString('base64')}`);
const models = ASCII_SCENES.map(({figure})=>createAsciiFigure(figure));

test('six distinct silhouettes are deterministic, bounded, and contain a readable contour plus a faint halo', () => {
  const signatures = new Set();
  models.forEach((model,index)=>{
    assert.deepEqual(model,createAsciiFigure(ASCII_SCENES[index].figure));
    assert.ok(model.length>400 && model.length<68*68);
    assert.ok(model.some(point=>point.ink>.6));
    assert.ok(model.some(point=>point.ink<.06));
    for (const point of model) {
      for (const key of ['x','y','ink','tint']) assert.ok(Number.isFinite(point[key]) && point[key]>=0 && point[key]<=1);
    }
    signatures.add(JSON.stringify(model));
  });
  assert.equal(signatures.size,6);
});

test('assembly starts transparent and lands exactly on its typographic lattice without discontinuities', () => {
  for (const glyph of models[0].filter((_,i)=>i%13===0)) {
    assert.equal(getAssemblyPose(glyph,0,600).alpha,0);
    const end=getAssemblyPose(glyph,ASCII_ASSEMBLY_DURATION,600);
    assert.equal(end.x,glyph.x*600); assert.equal(end.y,glyph.y*600); assert.equal(end.alpha,glyph.ink);
    let previous=getAssemblyPose(glyph,0,600);
    for (let elapsed=10;elapsed<=2000;elapsed+=10) {
      const pose=getAssemblyPose(glyph,elapsed,600);
      assert.ok(Math.hypot(pose.x-previous.x,pose.y-previous.y)<40);
      assert.ok(pose.alpha>=0 && pose.alpha<=glyph.ink);
      previous=pose;
    }
  }
});

test('relay conserves resting ink when unequal silhouettes share couriers and reverses on the same paths', () => {
  const sum=points=>points.reduce((total,point)=>total+point.ink,0);
  for (let i=0;i<models.length-1;i++) {
    const relay=createGlyphRelay(models[i],models[i+1]);
    assert.ok(Math.abs(sum(relay.map(c=>c.from))-sum(models[i]))<1e-8);
    assert.ok(Math.abs(sum(relay.map(c=>c.to))-sum(models[i+1]))<1e-8);
    const a={x:100,y:200,size:660},b={x:740,y:1200,size:540};
    for (const courier of relay.filter((_,n)=>n%17===0)) {
      const start=getRelayPose(courier,0,a,b),end=getRelayPose(courier,1,a,b);
      assert.equal(start.x,a.x+courier.from.x*a.size);
      assert.ok(Math.abs(end.x-b.x-courier.to.x*b.size)<1e-8);
      assert.ok(Math.abs(end.y-b.y-courier.to.y*b.size)<1e-8);
      for (let p=0;p<=1;p+=.025) {
        const pose=getRelayPose(courier,p,a,b);
        assert.ok(Number.isFinite(pose.x) && Number.isFinite(pose.y));
        assert.ok(pose.alpha>=0 && pose.alpha<=1);
        assert.deepEqual(pose,getRelayPose(courier,p,a,b));
      }
    }
  }
});

test('scroll selects a destination early, resolves deep links, and ignores tiny direction changes', () => {
  for (const height of [640,900,1215,2160]) {
    const centres=[1600,2500,3400,4300];
    assert.equal(getRequestedAsciiFigure(-5000,centres,height),0);
    assert.equal(getRequestedAsciiFigure(5000,centres,height),3);
    let previous=0;
    for (let scroll=0;scroll<=4000;scroll+=4) {
      const next=getRequestedAsciiFigure(scroll,centres,height,previous);
      assert.ok(next>=previous && next<=3);
      previous=next;
    }
    const threshold=Math.max(1600-height*.3,2500-height*.94);
    assert.equal(getRequestedAsciiFigure(threshold,centres,height,0),0);
    assert.equal(getRequestedAsciiFigure(threshold+80,centres,height,0),1);
    assert.equal(getRequestedAsciiFigure(threshold,centres,height,1),1);
    assert.equal(getRequestedAsciiFigure(threshold-80,centres,height,1),0);
  }
  assert.deepEqual(createGlyphRelay([],models[0]),[]);
});

test('a triggered flight lands by time with no further scroll events and remains settled', () => {
  let state=advanceAsciiMotion({settled:2,requested:2,flight:null},3,100,true);
  const flight=state.flight;
  assert.ok(flight);
  let previous=0;
  for (let now=100;now<100+ASCII_FLIGHT_DURATION;now+=16) {
    state=advanceAsciiMotion(state,3,now,true);
    assert.equal(state.flight,flight);
    const progress=getAsciiFlightProgress(state.flight,now);
    assert.ok(progress>=previous && progress<1);
    previous=progress;
  }
  state=advanceAsciiMotion(state,3,100+ASCII_FLIGHT_DURATION,true);
  assert.deepEqual(state,{settled:3,requested:3,flight:null});
  assert.deepEqual(advanceAsciiMotion(state,3,20000,true),state);
});

test('a reversal accelerates the current landing without moving a particle at the retiming instant', () => {
  let state=advanceAsciiMotion({settled:2,requested:2,flight:null},3,0,true);
  const outward=state.flight;
  const now=300;
  const progress=getAsciiFlightProgress(outward,now);
  state=advanceAsciiMotion(state,2,now,true);
  assert.equal(state.flight.from,2); assert.equal(state.flight.to,3);
  assert.ok(Math.abs(getAsciiFlightProgress(state.flight,now)-progress)<1e-12);
  assert.ok(state.flight.started+state.flight.duration<=now+450+1e-9);
  const courier=createGlyphRelay(models[2],models[3])[100];
  const a={x:100,y:200,size:660},b={x:740,y:1200,size:540};
  assert.deepEqual(getRelayPose(courier,progress,a,b),getRelayPose(courier,getAsciiFlightProgress(state.flight,now),a,b));
  const landed=state.flight.started+state.flight.duration;
  state=advanceAsciiMotion(state,1,landed,true);
  assert.equal(state.settled,3);
  assert.equal(state.flight.from,3); assert.equal(state.flight.to,1);
  assert.equal(getAsciiFlightProgress(state.flight,landed),0);
  state=advanceAsciiMotion(state,1,landed+state.flight.duration,true);
  assert.deepEqual(state,{settled:1,requested:1,flight:null});
});

test('first assembly can finish before departure; reduced motion snaps to a complete destination', () => {
  const initial={settled:0,requested:0,flight:null};
  const waiting=advanceAsciiMotion(initial,1,400,true,false);
  assert.equal(waiting.flight,null);
  const flying=advanceAsciiMotion(waiting,1,1900,true);
  assert.ok(flying.flight);
  assert.deepEqual(advanceAsciiMotion(flying,1,2000,false),{settled:1,requested:1,flight:null});
  assert.deepEqual(advanceAsciiMotion(initial,5,100,false),{settled:5,requested:5,flight:null});
  const jump=advanceAsciiMotion(initial,5,0,true);
  assert.equal(jump.flight.to,5);
  assert.ok(jump.flight.duration<=ASCII_FLIGHT_DURATION);
});

test('ordinary scrolling preserves a readable flight instead of shrinking it into a flash', () => {
  const centres=[1500,2333,3166,3999,4898,6004];
  for (const height of [640,900,1215,2160]) for (const speed of [.3,.65,1.1]) for (const direction of [1,-1]) {
    let scroll=direction>0 ? centres[0]-height*.6 : centres.at(-1)-height*.4;
    let requested=getRequestedAsciiFigure(scroll,centres,height);
    let state={settled:requested,requested,flight:null};
    const checked=new Set();
    for (let now=0;now<30000;now+=1000/120) {
      scroll+=direction*speed*1000/120;
      requested=getRequestedAsciiFigure(scroll,centres,height,requested);
      const budget=getAsciiFlightBudget(scroll,centres[requested],height,direction*speed);
      assert.ok(budget>=1200 && budget<=1700);
      state=advanceAsciiMotion(state,requested,now,true,true,budget);
      if (state.flight && state.flight.to===requested && getAsciiFlightProgress(state.flight,now)>.15 && getAsciiFlightProgress(state.flight,now)<.85) checked.add(requested);
      if (scroll>centres.at(-1)+height || scroll<centres[0]-height) break;
    }
    assert.ok(checked.size>=3);
  }
});

test('a menu jump starts a visible local arrival and keeps it assembling after the page arrives', () => {
  assert.equal(getAsciiFigureForSection('platforms'),5);
  assert.equal(getAsciiFigureForSection('features'),0);
  assert.equal(getAsciiFigureForSection('get-started'),5);
  assert.equal(getAsciiFigureForSection('unknown'),null);
  for (const hz of [60,120,144]) {
    const plan=getSectionNavScrollPlan(0,5784);
    let state=beginAsciiArrival(5);
    for (let now=0;now<plan.duration+1000/hz;now+=1000/hz) {
      const scroll=getSectionNavScrollPosition(plan,now);
      state=advanceAsciiArrival(state,now,scroll>plan.to-500);
      state=advanceAsciiMotion(state,5,now,true);
      assert.equal(state.flight,null);
    }
    assert.equal(state.arrival.index,5);
    assert.ok(state.arrival.started!==null);
    const age=plan.duration-state.arrival.started;
    assert.ok(age>0 && age<ASCII_ASSEMBLY_DURATION*.4);
    const poses=models[5].filter(glyph=>glyph.ink>.4).map(glyph=>getAssemblyPose(glyph,age,730));
    assert.ok(poses.some(pose=>pose.alpha>.02 && pose.progress>0 && pose.progress<1));
    state=advanceAsciiArrival(state,state.arrival.started+ASCII_ASSEMBLY_DURATION,true);
    assert.deepEqual(state,{settled:5,requested:5,flight:null});
  }
});

test('fast skips replace stale journeys immediately but never prebuild the destination off screen', () => {
  assert.equal(shouldAssembleAsciiLocally(0,5,1500,5600,1200),true);
  assert.equal(shouldAssembleAsciiLocally(0,1,1500,1200,1200),false);
  assert.equal(shouldAssembleAsciiLocally(0,1,1500,4000,1200),true);
  let state=beginAsciiArrival(3);
  state=advanceAsciiArrival(state,1000,false);
  state=advanceAsciiArrival(state,10000,false);
  assert.equal(state.arrival.started,null);
  state=advanceAsciiArrival(state,10000,true);
  assert.equal(state.arrival.started,9910);
  state=beginAsciiArrival(5);
  state=advanceAsciiArrival(state,10100,true);
  assert.equal(state.arrival.index,5);
  assert.equal(state.arrival.started,10010);
  assert.equal(state.flight,null);
  assert.deepEqual(advanceAsciiMotion(state,5,10100,false),{settled:5,requested:5,flight:null});
});

test('arrival has visible moving particles for over a second and settles exactly after scroll stops', () => {
  const glyphs=models[5].filter(glyph=>glyph.ink>.45);
  for (const age of [150,500,950,1150]) {
    const moving=glyphs.filter(glyph=>{
      const pose=getAssemblyPose(glyph,age,730);
      return pose.alpha>.02 && Math.hypot(pose.x-glyph.x*730,pose.y-glyph.y*730)>.1;
    });
    assert.ok(moving.length>0,`still visibly moving at ${age}ms`);
  }
  let state=advanceAsciiArrival(beginAsciiArrival(5),0,true);
  const started=state.arrival.started;
  state=advanceAsciiArrival(state,500,true);
  assert.equal(state.arrival.started,started);
  state=advanceAsciiArrival(state,started+ASCII_ASSEMBLY_DURATION,true);
  assert.equal(state.arrival,undefined);
});

test('acceleration is continuous and a stopped wheel never slows an already shortened flight', () => {
  let state=advanceAsciiMotion({settled:0,requested:0,flight:null},1,0,true);
  const before=getAsciiFlightProgress(state.flight,200);
  state=advanceAsciiMotion(state,1,200,true,true,300);
  assert.ok(Math.abs(getAsciiFlightProgress(state.flight,200)-before)<1e-12);
  const deadline=state.flight.started+state.flight.duration;
  state=advanceAsciiMotion(state,1,250,true,true,getAsciiFlightBudget(0,2000,900,0));
  assert.equal(state.flight.started+state.flight.duration,deadline);
  state=advanceAsciiMotion(state,1,deadline,true);
  assert.equal(state.settled,1); assert.equal(state.flight,null);
});

test('typographic palette includes punctuation and mathematics, stays deterministic, and settles exactly', () => {
  const characters=new Set();
  for (const model of models) for (const glyph of model) {
    const index=getAsciiGlyphIndex(glyph.seed,glyph.ink,0);
    assert.ok(index>=0 && index<ASCII_CHARACTERS.length);
    assert.equal(index,getAsciiGlyphIndex(glyph.seed,glyph.ink,20000,0));
    characters.add(ASCII_CHARACTERS[index]);
    for (const time of [0,300,700]) {
      const changing=getAsciiGlyphIndex(glyph.seed,glyph.ink,time,1);
      assert.ok(changing>=0 && changing<ASCII_CHARACTERS.length);
    }
  }
  assert.equal(characters.size,ASCII_CHARACTERS.length);
  assert.ok([...characters].filter(char=>char!=='0' && char!=='1').length>=9);
});

test('document-anchored layers preserve exact glyph offsets through fractional scroll and direction changes', () => {
  const from={x:1050.25,y:4200.5,size:760}, to={x:1740.75,y:5100.25,size:730};
  const bounds=getAsciiLayerBounds([from,to]);
  for (const courier of createGlyphRelay(models[3],models[4]).filter((_,i)=>i%23===0)) {
    for (const progress of [0,.2,.5,.8,1]) {
      const pose=getRelayPose(courier,progress,from,to);
      assert.ok(pose.x>=bounds.x && pose.x<=bounds.x+bounds.width);
      assert.ok(pose.y>=bounds.y && pose.y<=bounds.y+bounds.height);
      const localY=pose.y-bounds.y;
      for (const scroll of [4000,4000.5,4120.75,4300,4120.75,4000]) {
        const screenY=bounds.y-scroll+localY;
        assert.ok(Math.abs(screenY-(pose.y-scroll))<1e-9);
        assert.ok(Math.abs((screenY-(from.y-scroll))-(pose.y-from.y))<1e-9);
      }
    }
  }
});

test('flight continues every display frame after scroll stops at 60–144Hz; ambient changes stay capped', () => {
  for (const hz of [60,120,144]) {
    let last=0, idleFrames=0;
    for (let frame=1;frame<=hz;frame++) {
      const now=frame*1000/hz;
      assert.equal(shouldPaintAsciiFrame(now,now-1000/hz,true,false),true);
      assert.equal(shouldPaintAsciiFrame(now,now-1000/hz,false,false,true),true);
      if (shouldPaintAsciiFrame(now,last,false,false)) { idleFrames++;last=now; }
    }
    assert.ok(idleFrames<=20 && idleFrames>=16);
    assert.equal(shouldPaintAsciiFrame(1,0,false,true),true);
  }
});
