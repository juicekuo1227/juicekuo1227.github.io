(() => {
  const frame = document.getElementById('recital-frame');
  let video = document.getElementById('youtube-recital-video');
  const sound = document.getElementById('recital-enable-sound');
  let player = null, playbackRevision = 0, apiReady;
  function youtubeAPI() {
    if(window.YT?.Player) return Promise.resolve(window.YT);
    if(!apiReady) apiReady = new Promise((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = () => { apiReady = null; reject(Error('播放器控制暫時無法載入，請使用影片內的播放按鈕。')); };
      document.head.appendChild(script);
    });
    return apiReady;
  }
  function clearPlayer() {
    playbackRevision++;
    sound.hidden = true;
    if(player) {
      const replacement = video.cloneNode(false);
      replacement.removeAttribute('src');
      video.before(replacement);
      player.destroy();
      video = replacement;
      player = null;
    }
    video.removeAttribute('src');
  }
  function playVideo(item, autoplay) {
    clearPlayer();
    const request = playbackRevision;
    let mutedFallback = false;
    video.title = `第 ${item.number} 場：${item.title}`;
    video.src = `https://www.youtube.com/embed/${item.youtubeId}?autoplay=${autoplay ? 1 : 0}&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
    youtubeAPI().then(YT => {
      if(request !== playbackRevision || !dialog.open) return;
      player = new YT.Player(video, { events: {
        onReady(event) {
          if(request !== playbackRevision || !dialog.open) return;
          if(autoplay) event.target.playVideo();
        },
        onAutoplayBlocked(event) {
          if(request !== playbackRevision || !dialog.open) return;
          sound.hidden = false;
          if(mutedFallback) return;
          mutedFallback = true;
          event.target.mute();
          event.target.playVideo();
        },
        onStateChange(event) {
          if(request !== playbackRevision || !dialog.open) return;
          if(event.data === YT.PlayerState.PLAYING) sound.hidden = !event.target.isMuted();
        }
      }});
    }).catch(error => {
      if(request !== playbackRevision || !dialog.open) return;
      message.textContent = error.message;message.hidden = false;
    });
  }
  sound.addEventListener('click', () => {
    if(!player) return;
    player.unMute();player.setVolume(100);player.playVideo();sound.hidden = true;
  });
  const dialog = document.getElementById('recital-dialog');
  const message = document.getElementById('local-video-message');
  const previous = document.getElementById('local-piece-prev');
  const next = document.getElementById('local-piece-next');
  const ready = fetch('assets/recital-media.json').then(r=>{if(!r.ok)throw Error('無法讀取演出清單');return r.json();});
  let items = [], current = 0, revision = 0, bridgeToken = 0;
  function setVideo(index, autoplay = false) {
    const item = items[index];if(!item)return;
    current = index;
    document.getElementById('local-video-title').textContent = item.title;
    document.getElementById('book-chapter-number').textContent = `第 ${String(item.number).padStart(2,'0')} 個音樂故事`;
    document.getElementById('book-piece-title').textContent = item.shortTitle || item.title;
    document.getElementById('book-story').textContent = item.story || '';
    document.getElementById('local-video-number').textContent = `第 ${String(item.number).padStart(2,'0')} 場`;
    document.getElementById('local-piece-position').textContent = `${item.number} / ${items.length}`;
    previous.disabled = index === 0;next.disabled = index === items.length-1;
    message.hidden = !!item.available;video.hidden = !item.available;
    message.textContent = item.available ? '' : '這首曲目的影片尚未加入，仍可探索 3D 舞台。';
    video.title = `第 ${item.number} 場：${item.title}`;
    if(item.available && /^[A-Za-z0-9_-]{11}$/.test(item.youtubeId)) {
      playVideo(item, autoplay);
    }
  }
  function setStage(index, autoplay = false) {
    setVideo(index, autoplay);
    const url = new URL('recital-stage/',location.href);
    url.searchParams.set('guest','1');url.searchParams.set('performance',items[index].id);
    url.searchParams.set('bridgeToken',String(++bridgeToken));
    document.getElementById('recital-loading').hidden = false;
    frame.src = url.href;
  }
  window.addEventListener('recital:open',async event => {
    const request = ++revision;
    try {
      items = await ready;
      if(request !== revision || !dialog.open)return;
      const id = new URL(event.detail.url).searchParams.get('performance');
      setStage(Math.max(0,items.findIndex(item=>item.id===id)),true);
    } catch(error) {message.textContent=error.message;message.hidden=false;}
  });
  previous.addEventListener('click',()=>{if(current>0)setStage(current-1,true);});
  next.addEventListener('click',()=>{if(current<items.length-1)setStage(current+1,true);});
  window.addEventListener('message',event => {
    if(event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'recital:stage-selection' || event.data.token !== String(bridgeToken) || !dialog.open)return;
    const index = items.findIndex(item=>item.number===event.data.number);
    if(index>=0 && index!==current)setVideo(index,true);
  });
  window.addEventListener('recital:close',()=>{revision++;clearPlayer();});
})();
