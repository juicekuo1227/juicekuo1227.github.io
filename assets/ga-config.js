window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
(function(){
  var KEY = 'tt_internal';
  var internal = false;
  try {
    var params = new URLSearchParams(window.location.search);
    if (params.get('internal') === '1') localStorage.setItem(KEY, '1');
    else if (params.get('internal') === '0') localStorage.removeItem(KEY);
    internal = localStorage.getItem(KEY) === '1';
  } catch (e) {}
  if (window.location.hostname !== 'tingyumusic.com') return;
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-JE1G1W4X4V';
  document.head.appendChild(script);
  gtag('js', new Date());
  var config = {};
  if (internal) config.traffic_type = 'internal';
  gtag('config', 'G-JE1G1W4X4V', config);
})();
