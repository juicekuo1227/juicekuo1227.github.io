(function(){
'use strict';

function send(name,params){
  if(typeof window.gtag==='function')window.gtag('event',name,params);
}

if(document.documentElement.hasAttribute('data-home-analytics')){
  var leadSource='';

  document.addEventListener('click',function(e){
    var a=e.target.closest('a');
    if(!a)return;

    var source=a.getAttribute('data-lead-source');
    if(source)leadSource=source;

    var situation=a.getAttribute('data-situation');
    if(situation){
      var target=a.getAttribute('data-situation-target')||'';
      send('select_situation',{situation:situation,target:target});
      if(target==='contact')leadSource=source||'mid1';
    }

    var href=a.getAttribute('href')||'';
    var inFooter=!!a.closest('footer');
    if(href.indexOf('line.me')>-1){
      send('generate_lead',{method:'line',link_location:inFooter?'footer':(leadSource||'contact')});
    }else if(href.indexOf('instagram.com')>-1){
      send('contact_click',{method:'instagram',link_location:inFooter?'footer':'contact'});
    }
  });

  document.querySelectorAll('.faq-item').forEach(function(item){
    item.addEventListener('toggle',function(){
      if(!item.open)return;
      leadSource='faq';
      send('faq_open',{question:item.querySelector('.qt').textContent});
    });
  });
}

(function(){
  var thresholds=[25,50,75,100];
  var sent=new Set();
  var ticking=false;

  function measure(){
    ticking=false;
    var height=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);
    if(!height)return;
    var percent=(window.scrollY+window.innerHeight)/height*100;
    thresholds.forEach(function(threshold){
      if(percent>=threshold&&!sent.has(threshold)){
        sent.add(threshold);
        send('scroll_depth',{percent_scrolled:threshold});
      }
    });
  }

  function requestMeasure(){
    if(ticking)return;
    ticking=true;
    (window.requestAnimationFrame||function(callback){setTimeout(callback,0);})(measure);
  }

  window.addEventListener('scroll',requestMeasure,{passive:true});
  window.addEventListener('resize',requestMeasure);
  requestMeasure();
})();
})();
