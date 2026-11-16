(() => {
  if(parent === window) return;
  let last = '';
  const token = new URLSearchParams(location.search).get('bridgeToken');
  const publish = () => {
    const raw = document.getElementById('compact-number')?.textContent.trim();
    if(!raw || raw === last) return;
    const number = Number(raw.split('/')[0]);
    if(!Number.isInteger(number) || number < 1 || number > 31) return;
    last = raw;
    parent.postMessage({type:'recital:stage-selection',number,token},location.origin);
  };
  new MutationObserver(publish).observe(document.body,{childList:true,subtree:true,characterData:true});
  publish();
})();
// Compact the local embedded stage; the host already shows the active piece.
if(parent !== window) {
  const style = document.createElement('style');
  style.textContent = `#app{min-height:0!important;height:100svh!important}
    #app[data-stage-layout="compact"] .stage-intro,#app[data-stage-layout="compact"] .bottom-nav{display:none!important}
    #app[data-stage-layout="compact"] .performance-card{bottom:10px!important;left:12px!important;right:12px!important;width:auto!important;max-width:none!important;transform:none!important;padding:9px 11px!important;background:#fff9e8ed!important;border:1px dashed #b9b58d!important;border-radius:9px 5px 12px 5px!important;box-shadow:2px 3px 0 #9d977d20!important}
    #app[data-stage-layout="compact"] .gift-options button{min-height:43px!important;background:#faf5e5!important;border-color:#d8cfb1!important;border-radius:8px 5px 9px 5px!important;font-size:13px!important}
    #app[data-stage-layout="compact"] #feedback{font-size:9px!important;margin-top:5px!important}
  @media(max-width:700px) and (max-height:600px){
    #app[data-stage-layout="compact"] .stage-intro{display:none!important}
    #app[data-stage-layout="compact"] .bottom-nav{display:none!important}
    #app[data-stage-layout="compact"] .performance-card{bottom:10px!important;left:12px!important;right:12px!important;width:auto!important;max-width:none!important;transform:none!important;padding:8px 10px!important}
    #app[data-stage-layout="compact"] .gift-options button{min-height:40px!important;padding:8px!important;font-size:12px!important}
    #app[data-stage-layout="compact"] #feedback{font-size:9px!important;margin-top:5px!important}
  }`;
  document.head.appendChild(style);
}
