/* eslint-disable react/no-unknown-property */
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { easing } from 'maath';
import { COLORS } from '@/palette';
import { sceneVisibility } from './sceneState';

const colorGeometry=(geometry,color)=>{const value=new THREE.Color(color);const colors=new Float32Array(geometry.attributes.position.count*3);for(let i=0;i<geometry.attributes.position.count;i+=1)value.toArray(colors,i*3);geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));return geometry;};
const part=(geometry,color,position)=>{geometry.translate(...position);return colorGeometry(geometry,color,position);};
const createSidewalk=()=>mergeGeometries([
  part(new THREE.CylinderGeometry(.2,.2,.055,14),'#c9d6d4',[0,.2,0]),
  part(new THREE.CylinderGeometry(.025,.025,.5,8),'#384345',[0,.45,0]),
  part(new THREE.ConeGeometry(.36,.13,16),'#fbfbf8',[0,.74,0]),
  ...[-.25,.25].flatMap(x=>[-.18,.18].map(z=>part(new THREE.BoxGeometry(.06,.23,.06),'#9fb5b1',[x,.12,z])))
],false);
const createRoadway=()=>mergeGeometries([
  part(new THREE.BoxGeometry(.78,.08,.46),'#65433f',[0,.04,0]),
  part(new THREE.BoxGeometry(.78,.42,.07),'#b84f43',[0,.29,-.19]),
  part(new THREE.BoxGeometry(.07,.42,.42),'#c55a4e',[-.355,.29,0]),
  part(new THREE.BoxGeometry(.07,.42,.42),'#c55a4e',[.355,.29,0]),
  part(new THREE.BoxGeometry(.84,.1,.5),'#943b34',[0,.54,0])
],false);

function Tree({position=[0,0,0],scale=1}){return <group position={position} scale={scale}><mesh position={[0,.35,0]}><cylinderGeometry args={[.045,.06,.7,7]}/><meshStandardMaterial color="#6d5947"/></mesh><mesh position={[0,.85,0]} castShadow><icosahedronGeometry args={[.34,1]}/><meshStandardMaterial color="#77947c" roughness={1}/></mesh></group>;}
function Water({position=[0,.05,0],scale=[1,1,1]}){return <mesh position={position} scale={scale} rotation-x={-Math.PI/2}><circleGeometry args={[1,32]}/><meshStandardMaterial color="#99b5bd" roughness={.72}/></mesh>;}
function Base({children}){return <group><mesh position={[0,-.16,0]} receiveShadow><cylinderGeometry args={[1.35,1.45,.28,10]}/><meshStandardMaterial color="#eceeeb" roughness={1}/></mesh>{children}</group>;}
function Buildings({billboard=false}){return <group>{[-.68,0,.64].map((x,index)=><mesh key={x} position={[x,.58,index%2?.18:-.2]} castShadow><boxGeometry args={[.46,1.15+index*.2,.55]}/><meshStandardMaterial color={index===1?'#c9cecd':'#b7bfbe'}/>{billboard&&<mesh position={[0,.18,.286]}><planeGeometry args={[.34,.32]}/><meshBasicMaterial color={index===1?'#c45145':'#d7c66f'}/></mesh>}</mesh>)}</group>;}
function LandmarkSignature({modelKey,detailed}){
  const trees=detailed?[-.78,-.4,.45,.8]:[-.7,.62];
  if(modelKey==='times-square')return <><Buildings billboard/><mesh position={[0,.02,0]} rotation-x={-Math.PI/2}><planeGeometry args={[2.1,.44]}/><meshStandardMaterial color="#8f9695"/></mesh></>;
  if(modelKey==='central-park'||modelKey==='prospect-park')return <><Water scale={[.72,1,.42]}/>{trees.map((x,i)=><Tree key={x} position={[x,0,i%2?.45:-.4]} scale={.8}/>)}</>;
  if(modelKey==='high-line')return <><mesh position={[0,.45,0]}><boxGeometry args={[2.1,.18,.5]}/><meshStandardMaterial color="#75827f"/></mesh>{trees.slice(0,3).map((x,i)=><Tree key={x} position={[x,.5,0]} scale={.46}/>)}</>;
  if(modelKey==='washington-square')return <><mesh position={[0,.58,0]}><torusGeometry args={[.48,.1,8,20,Math.PI]}/><meshStandardMaterial color="#e3e4df"/></mesh>{[-.49,.49].map(x=><mesh key={x} position={[x,.28,0]}><boxGeometry args={[.13,.6,.15]}/><meshStandardMaterial color="#e3e4df"/></mesh>)}<Water scale={[.38,1,.38]}/></>;
  if(modelKey==='brooklyn-bridge'||modelKey==='dumbo')return <><Water scale={[1.25,1,.55]}/><group position={[0,.42,0]}><mesh><boxGeometry args={[2.2,.08,.16]}/><meshStandardMaterial color="#697170"/></mesh>{[-.72,.72].map(x=><mesh key={x} position={[x,.35,0]}><boxGeometry args={[.18,.75,.22]}/><meshStandardMaterial color="#9c8070"/></mesh>)}</group>{modelKey==='dumbo'&&<Buildings/>}</>;
  if(modelKey==='gantry')return <>{[-.55,.5].map(x=><group key={x} position={[x,.48,0]}><mesh><boxGeometry args={[.12,1,.12]}/><meshStandardMaterial color="#5f6a69"/></mesh><mesh position={[.25,.42,0]}><boxGeometry args={[.62,.1,.12]}/><meshStandardMaterial color="#5f6a69"/></mesh></group>)}<Water position={[0,.04,.48]} scale={[1.2,1,.38]}/></>;
  if(modelKey==='unisphere')return <><mesh position={[0,.72,0]}><sphereGeometry args={[.55,16,12]}/><meshStandardMaterial color="#8b9694" wireframe/></mesh><mesh position={[0,.24,0]}><cylinderGeometry args={[.07,.12,.5,8]}/><meshStandardMaterial color="#777f7e"/></mesh></>;
  if(modelKey==='stadium')return <><mesh position={[0,.42,0]} rotation-x={-Math.PI/2}><torusGeometry args={[.72,.24,10,28]}/><meshStandardMaterial color="#b7bfbe"/></mesh>{detailed&&[-.9,.9].map(x=><mesh key={x} position={[x,.75,0]}><boxGeometry args={[.06,1.2,.06]}/><meshStandardMaterial color="#697170"/></mesh>)}</>;
  if(modelKey==='botanical')return <><mesh position={[0,.5,0]}><sphereGeometry args={[.62,18,10,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#dce4df" transparent opacity={.84} wireframe/></mesh>{trees.slice(0,3).map((x,i)=><Tree key={x} position={[x,0,i%2?.55:-.5]} scale={.62}/>)}</>;
  return <><mesh position={[-.28,.33,0]}><boxGeometry args={[1.2,.55,.65]}/><meshStandardMaterial color="#b7bfbe"/></mesh><mesh position={[.62,.18,.32]}><boxGeometry args={[.8,.22,.38]}/><meshStandardMaterial color="#d5dbd8"/></mesh><Water position={[0,.03,.55]} scale={[1.25,1,.42]}/></>;
}

function LandmarkMiniature({landmark,active,selected,nearbyContext,interactive,onHover,onSelect}){
  const ref=useRef();const [localHover,setLocalHover]=useState(false);const detailed=active||selected;
  useFrame((_,delta)=>{if(!ref.current)return;const base=landmark.stagePosition;const target=nearbyContext?(selected?[1.15,0,0]:[base[0]*1.18,-1.5,base[2]*1.18]):selected?[2.65,0,.25]:base;const scale=nearbyContext?(selected?1.22:.2):(selected?1.18:localHover?1.08:1);easing.damp3(ref.current.position,target,.42,delta);easing.damp3(ref.current.scale,[scale,scale,scale],.32,delta);easing.damp(ref.current.rotation,'z',localHover&&!nearbyContext?-.035:0,.2,delta);});
  return <group ref={ref} position={landmark.stagePosition}
    onPointerEnter={interactive?event=>{event.stopPropagation();setLocalHover(true);onHover(landmark.id);document.body.style.cursor='pointer';}:undefined}
    onPointerLeave={interactive?()=>{setLocalHover(false);onHover(null);document.body.style.cursor='auto';}:undefined}
    onClick={interactive?event=>{event.stopPropagation();onSelect(landmark.id);}:undefined}>
    <mesh position={[0,.48,0]} visible={interactive}><sphereGeometry args={[selected?1.35:1.05,12,8]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
    <Base><LandmarkSignature modelKey={landmark.modelKey} detailed={detailed}/></Base>
    {!nearbyContext&&(active||selected)&&<Html position={[0,1.55,0]} center distanceFactor={11} zIndexRange={[2,0]}><button className={`landmark-label ${selected?'is-selected':''}`} type="button" onPointerDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();onSelect(landmark.id);}}><strong>{landmark.name}</strong><span>{landmark.borough}</span></button></Html>}
  </group>;
}

const hashString=value=>[...String(value)].reduce((sum,char)=>((sum*31)+char.charCodeAt(0))>>>0,7);
const ignoreRaycast=()=>null;
export const createNearbyLayout=locations=>{const total=locations.length;const ringCounts=total<=6?[total]:total<=14?[6,total-6]:[6,8,total-14];const radii=[2.7,4.5,6.25];const rotationSeed=total?((hashString(locations[0].id)%360)*Math.PI)/180:0;return locations.map((restaurant,index)=>{let ring=0;let slot=index;while(slot>=ringCounts[ring]&&ring<ringCounts.length-1){slot-=ringCounts[ring];ring+=1;}const count=ringCounts[ring];const seed=hashString(restaurant.id);const angle=rotationSeed+(slot/Math.max(1,count))*Math.PI*2+ring*.17;const radius=radii[ring]+((seed%7)-3)*.025;return {restaurant,restaurantId:restaurant.id,instanceId:index,position:[Math.cos(angle)*radius,.18,Math.sin(angle)*radius],rotation:[0,-angle,0],scale:restaurant.licenseType==='Sidewalk'?.7:.66,revealDelay:index/Math.max(1,total-1)};});};

function NearbyInstances({layout,selectedId,hoveredId,revealProgress,interactive,onSelect,onHover}){
  const sidewalkGeometry=useMemo(createSidewalk,[]);const roadwayGeometry=useMemo(createRoadway,[]);
  const sidewalk=useMemo(()=>layout.filter(item=>item.restaurant.licenseType==='Sidewalk').map((item,index)=>({...item,instanceId:index})),[layout]);
  const roadway=useMemo(()=>layout.filter(item=>item.restaurant.licenseType==='Roadway').map((item,index)=>({...item,instanceId:index})),[layout]);
  const canvas=useThree(state=>state.gl.domElement);const hoveredRestaurantRef=useRef(null);const pointerStartRef=useRef(null);const onSelectRef=useRef(onSelect);
  useEffect(()=>{onSelectRef.current=onSelect;},[onSelect]);
  useEffect(()=>{if(!interactive)return undefined;const handleDown=event=>{if(event.button!==0)return;pointerStartRef.current={x:event.clientX,y:event.clientY};};const handleUp=event=>{const start=pointerStartRef.current;pointerStartRef.current=null;if(!start||Math.hypot(event.clientX-start.x,event.clientY-start.y)>6||!hoveredRestaurantRef.current)return;onSelectRef.current(hoveredRestaurantRef.current);};canvas.addEventListener('pointerdown',handleDown);canvas.addEventListener('pointerup',handleUp);return()=>{canvas.removeEventListener('pointerdown',handleDown);canvas.removeEventListener('pointerup',handleUp);};},[canvas,interactive]);
  const reportHover=(restaurant,entry)=>{hoveredRestaurantRef.current=restaurant;onHover(restaurant,entry);};
  const MeshPair=({entries,geometry,type})=>{
    const visual=useRef();const proxy=useRef();const dummy=useMemo(()=>new THREE.Object3D(),[]);const fullColor=useMemo(()=>new THREE.Color('#ffffff'),[]);const dimColor=useMemo(()=>new THREE.Color('#8b9190'),[]);
    useFrame(()=>{if(!visual.current||!proxy.current)return;entries.forEach((entry,index)=>{const chosen=entry.restaurantId===selectedId||entry.restaurantId===hoveredId;const selected=entry.restaurantId===selectedId;const visible=Math.max(0,Math.min(1,(revealProgress-entry.revealDelay*.35)/.65));dummy.position.set(entry.position[0],entry.position[1]+(selected ? .28 : chosen ? .16 : 0),entry.position[2]);dummy.rotation.set(chosen ? -.055 : 0,entry.rotation[1],chosen ? .045 : 0);dummy.scale.setScalar(entry.scale*visible*(selected ? 1.26 : chosen ? 1.18 : selectedId ? .92 : 1));dummy.updateMatrix();visual.current.setMatrixAt(index,dummy.matrix);visual.current.setColorAt(index,selectedId&&!chosen?dimColor:fullColor);dummy.position.set(entry.position[0],entry.position[1]+.25,entry.position[2]);dummy.rotation.set(0,entry.rotation[1],0);dummy.scale.setScalar(entry.scale*1.6*Math.max(.01,visible));dummy.updateMatrix();proxy.current.setMatrixAt(index,dummy.matrix);});visual.current.instanceMatrix.needsUpdate=true;if(visual.current.instanceColor)visual.current.instanceColor.needsUpdate=true;proxy.current.instanceMatrix.needsUpdate=true;});
    const resolve=event=>entries[event.instanceId]?.restaurant;
    const handleMove=interactive?event=>{if(event.instanceId==null)return;event.stopPropagation();const restaurant=resolve(event);const entry=entries[event.instanceId];reportHover(restaurant,entry);document.body.style.cursor='pointer';}:undefined;
    const handleOut=interactive?()=>{reportHover(null,null);document.body.style.cursor='auto';}:undefined;
    const pointerProps={onPointerMove:handleMove,onPointerOut:handleOut};
    return <><instancedMesh ref={visual} args={[geometry,undefined,entries.length]} castShadow frustumCulled={false} raycast={ignoreRaycast}><meshStandardMaterial vertexColors roughness={.88}/></instancedMesh><instancedMesh ref={proxy} args={[undefined,undefined,entries.length]} frustumCulled={false}
      {...pointerProps}>
      {type==='Sidewalk'?<cylinderGeometry args={[.43,.43,.9,10]}/>:<boxGeometry args={[1,.85,.7]}/>}<meshBasicMaterial transparent opacity={0} depthWrite={false}/>
    </instancedMesh></>;
  };
  return <><MeshPair entries={sidewalk} geometry={sidewalkGeometry} type="Sidewalk"/><MeshPair entries={roadway} geometry={roadwayGeometry} type="Roadway"/></>;
}

function RestaurantFocusIndicator({entry,type}){
  const ref=useRef();
  useFrame(({clock})=>{if(!ref.current)return;const pulse=1+Math.sin(clock.elapsedTime*3.2)*.045;ref.current.scale.setScalar(pulse);});
  if(!entry)return null;
  const color=type==='Roadway'?'#c45145':'#263638';
  return <group ref={ref} position={[entry.position[0],.055,entry.position[2]]} rotation-x={-Math.PI/2}>
    <mesh position={[0,0,-.01]} raycast={ignoreRaycast}><circleGeometry args={[.7,40]}/><meshBasicMaterial color={color} transparent opacity={.14} depthWrite={false}/></mesh>
    <mesh raycast={ignoreRaycast}><ringGeometry args={[.5,.61,40]}/><meshBasicMaterial color={color} transparent opacity={.98} depthWrite={false}/></mesh>
    <mesh position={[0,0,.012]} raycast={ignoreRaycast}><ringGeometry args={[.72,.77,40]}/><meshBasicMaterial color="#151717" transparent opacity={.82} depthWrite={false}/></mesh>
  </group>;
}

function CameraRig({phase,selectedLandmark,hoveredLandmark,reducedMotion}){
  const {camera}=useThree();const target=useRef(new THREE.Vector3());
  useFrame((_,delta)=>{let position=[7.4,5.5,11.5],look=[1.4,.8,0];if(phase==='landmark-enter'){position=[0,13.6,18.5];look=[0,0,.7];}if(phase==='landmark'){position=[0,11.8,14.8];look=[0,0,.7];}if(phase==='nearby'){position=[6.2,10.8,12.8];look=[1.15,.08,0];}if(phase==='detail'){position=[5.7,9.5,11.4];look=[1.15,.2,0];}if(phase==='landmark'&&hoveredLandmark&&!reducedMotion)look=[hoveredLandmark.stagePosition[0]*.12,0,.7+hoveredLandmark.stagePosition[2]*.08];easing.damp3(camera.position,position,reducedMotion?.02:.48,delta);easing.damp3(target.current,look,reducedMotion?.02:.48,delta);camera.lookAt(target.current);});return null;
}

function Exhibition({children,enabled,reset}){
  const ref=useRef();const drag=useRef(null);const rotation=useRef(0);const tilt=useRef(0);
  useFrame((_,delta)=>{if(!ref.current)return;if(reset){rotation.current=THREE.MathUtils.damp(rotation.current,0,5,delta);tilt.current=THREE.MathUtils.damp(tilt.current,0,5,delta);}easing.damp(ref.current.rotation,'y',rotation.current,.18,delta);easing.damp(ref.current.rotation,'x',tilt.current,.18,delta);});
  return <group ref={ref}>{children}<mesh rotation-x={-Math.PI/2} position={[0,-.34,0]} visible={enabled}
    onPointerDown={event=>{event.stopPropagation();drag.current={x:event.nativeEvent.clientX,y:event.nativeEvent.clientY};event.target.setPointerCapture?.(event.pointerId);if(enabled)document.body.style.cursor='grabbing';}}
    onPointerMove={event=>{if(!drag.current||!enabled)return;const x=event.nativeEvent.clientX;const y=event.nativeEvent.clientY;rotation.current+=(x-drag.current.x)*.004;tilt.current=THREE.MathUtils.clamp(tilt.current+(y-drag.current.y)*.0015,-.12,.12);drag.current={x,y};}}
    onPointerUp={event=>{event.stopPropagation();drag.current=null;event.target.releasePointerCapture?.(event.pointerId);document.body.style.cursor=enabled?'grab':'auto';}}>
    <planeGeometry args={[22,14]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh></group>;
}

export default function TravelScene({phase,exploreMode,landmarks,selectedLandmark,hoveredLandmarkId,nearbyLocations,selectedRestaurantId,hoveredRestaurantId,onLandmarkHover,onLandmarkSelect,onRestaurantHover,onRestaurantSelect,reducedMotion,coarsePointer}){
  const visibility=sceneVisibility(phase);const [hoveredRestaurant,setHoveredRestaurant]=useState(null);const [hoveredEntry,setHoveredEntry]=useState(null);
  const nearbyContext=['nearby','restaurant-detail'].includes(exploreMode);const revealProgress=nearbyContext?1:0;
  const nearbyLayout=useMemo(()=>createNearbyLayout(nearbyLocations),[nearbyLocations]);
  const selectedEntry=useMemo(()=>nearbyLayout.find(entry=>entry.restaurantId===selectedRestaurantId)||null,[nearbyLayout,selectedRestaurantId]);
  const focusEntry=hoveredEntry||selectedEntry;
  const focusRestaurant=hoveredRestaurant||selectedEntry?.restaurant||null;
  useEffect(()=>()=>{document.body.style.cursor='auto';},[]);
  useEffect(()=>{if(!visibility.nearby){setHoveredRestaurant(null);setHoveredEntry(null);}},[visibility.nearby]);
  return <><color attach="background" args={[COLORS.paper]}/><fog attach="fog" args={[COLORS.paper,18,38]}/><ambientLight intensity={1.5}/><directionalLight position={[-7,13,9]} intensity={2.1} castShadow shadow-mapSize={[1024,1024]}/><hemisphereLight args={[COLORS.paperLight,COLORS.road,.9]}/>
    <CameraRig phase={phase} selectedLandmark={selectedLandmark} hoveredLandmark={landmarks.find(item=>item.id===hoveredLandmarkId)} reducedMotion={reducedMotion}/>
    {visibility.landmarks&&<Exhibition enabled={!coarsePointer&&phase==='landmark'} reset={nearbyContext}>{landmarks.map(landmark=><LandmarkMiniature key={landmark.id} landmark={landmark} active={landmark.id===hoveredLandmarkId} selected={landmark.id===selectedLandmark?.id} nearbyContext={nearbyContext} interactive={phase==='landmark'} onHover={onLandmarkHover} onSelect={onLandmarkSelect}/>)}</Exhibition>}
    {visibility.nearby&&nearbyLocations.length>0&&<group position={[1.15,0,0]}><NearbyInstances layout={nearbyLayout} selectedId={selectedRestaurantId} hoveredId={hoveredRestaurantId} revealProgress={revealProgress} interactive={phase==='nearby'||phase==='detail'} onHover={(restaurant,entry)=>{setHoveredRestaurant(restaurant);setHoveredEntry(entry);onRestaurantHover?.(restaurant);}} onSelect={onRestaurantSelect}/><RestaurantFocusIndicator entry={focusEntry} type={focusRestaurant?.licenseType}/>{hoveredRestaurant&&hoveredEntry&&<Html position={[hoveredEntry.position[0],hoveredEntry.position[1]+1.35,hoveredEntry.position[2]]} center><div className="map-tooltip"><strong>{hoveredRestaurant.name}</strong><span>{hoveredRestaurant.cuisine||'Cuisine not matched'} · {hoveredRestaurant.distanceKm<1?`${Math.round(hoveredRestaurant.distanceKm*1000)} m`:`${hoveredRestaurant.distanceKm.toFixed(1)} km`} · {hoveredRestaurant.licenseType} Cafe</span></div></Html>}</group>}
  </>;
}
