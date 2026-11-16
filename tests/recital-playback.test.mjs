import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../assets/recital-video.js',import.meta.url),'utf8');
const items=JSON.parse(readFileSync(new URL('../assets/recital-media.json',import.meta.url),'utf8'));
async function setup() {
  const elements=new Map(),events={},players=[];
  const element=(id)=>({id,hidden:true,open:true,listeners:{},addEventListener(type,fn){this.listeners[type]=fn},removeAttribute(key){delete this[key]},cloneNode(){return element(id)},before(replacement){elements.set(id,replacement)}});
  const document={getElementById(id){if(!elements.has(id))elements.set(id,element(id));return elements.get(id)}};
  class Player {
    constructor(video,{events}){this.video=video;this.events=events;this.plays=0;this.muted=false;players.push(this);queueMicrotask(()=>events.onReady({target:this}));}
    playVideo(){this.plays++} mute(){this.muted=true} unMute(){this.muted=false} isMuted(){return this.muted} setVolume(n){this.volume=n} destroy(){this.destroyed=true}
  }
  const window={YT:{Player,PlayerState:{PLAYING:1}},addEventListener(type,fn){events[type]=fn}};
  vm.runInNewContext(source,{document,window,location:{origin:'http://localhost',href:'http://localhost/'},URL,fetch:async()=>({ok:true,json:async()=>items})});
  const open=async number=>{await events['recital:open']({detail:{url:`https://example.com/?performance=${items[number-1].id}`}});await Promise.resolve()};
  await open(28);
  return {elements,events,players,open};
}
test('player readiness explicitly starts the selected performance',async()=>{const t=await setup();assert.equal(t.players[0].plays,1);assert.match(t.elements.get('youtube-recital-video').src,/J6CruvmHwu0.*enablejsapi=1/)});
test('blocked audible autoplay retries muted and offers sound control only once',async()=>{const t=await setup(),p=t.players[0];p.events.onAutoplayBlocked({target:p});assert.equal(p.muted,true);assert.equal(p.plays,2);assert.equal(t.elements.get('recital-enable-sound').hidden,false);p.events.onAutoplayBlocked({target:p});assert.equal(p.plays,2);t.elements.get('recital-enable-sound').listeners.click();assert.equal(p.muted,false);assert.equal(p.volume,100);assert.equal(p.plays,3);assert.equal(t.elements.get('recital-enable-sound').hidden,true)});
test('all 31 performances load with autoplay and dispose the previous player',async()=>{const t=await setup();for(const item of items){const previous=t.players.at(-1);await t.open(item.number);assert.equal(previous.destroyed,true);assert.match(t.elements.get('youtube-recital-video').src,new RegExp(`/embed/${item.youtubeId}\\?autoplay=1`));assert.equal(t.players.at(-1).plays,1)}});
test('closing destroys playback and stale events cannot restart it',async()=>{const t=await setup(),p=t.players[0];t.events['recital:close']();p.events.onReady({target:p});p.events.onAutoplayBlocked({target:p});assert.equal(p.destroyed,true);assert.equal(p.plays,1);assert.equal(t.elements.get('youtube-recital-video').src,undefined);assert.equal(t.elements.get('recital-enable-sound').hidden,true)});
