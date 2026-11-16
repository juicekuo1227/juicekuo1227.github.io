(() => {
  const scenes = [{"key": "31", "number": 31, "title": "他是海盜", "piece": "神鬼奇航：他是海盜", "id": "lower-15", "src": "assets/program-31.png", "alt": "神鬼奇航：他是海盜的 3D 互動舞台", "instrument": "長笛", "session": "下半場"}, {"key": "28", "number": 28, "title": "Married Life", "piece": "天外奇蹟：Married Life", "id": "lower-12", "src": "assets/program-28.png", "alt": "天外奇蹟：Married Life的 3D 互動舞台", "instrument": "鋼琴", "session": "下半場"}, {"key": "25", "number": 25, "title": "我看見了光明", "piece": "魔髮奇緣：我看見了光明", "id": "lower-09", "src": "assets/program-25.png", "alt": "魔髮奇緣：我看見了光明的 3D 互動舞台", "instrument": "長笛", "session": "下半場"}, {"key": "23", "number": 23, "title": "嘿美主題曲", "piece": "哈利波特：嘿美主題曲", "id": "lower-07", "src": "assets/program-23.png", "alt": "哈利波特：嘿美主題曲的 3D 互動舞台", "instrument": "鋼琴", "session": "下半場"}, {"key": "20", "number": 20, "title": "爺爺的大鐘", "piece": "亨利·克萊·沃克：爺爺的大鐘", "id": "lower-04", "src": "assets/program-20.png", "alt": "亨利·克萊·沃克：爺爺的大鐘的 3D 互動舞台", "instrument": "鋼琴", "session": "下半場"}, {"key": "16", "number": 16, "title": "千本櫻", "piece": "初音未來：千本櫻", "id": "upper-16", "src": "assets/program-16.png", "alt": "初音未來：千本櫻的 3D 互動舞台", "instrument": "鋼琴", "session": "上半場"}, {"key": "12", "number": 12, "title": "能看見海的街道", "piece": "魔女宅急便：能看見海的街道", "id": "upper-12", "src": "assets/program-12.png", "alt": "魔女宅急便：能看見海的街道的 3D 互動舞台", "instrument": "鋼琴", "session": "上半場"}, {"key": "8", "number": 8, "title": "天鵝", "piece": "聖桑：天鵝", "id": "upper-08", "src": "assets/program-08.png", "alt": "聖桑：天鵝的 3D 互動舞台", "instrument": "長笛", "session": "上半場"}, {"key": "3", "number": 3, "title": "傑克與魔豆", "piece": "芬貝爾：傑克與魔豆", "id": "upper-03", "src": "assets/program-03.png", "alt": "芬貝爾：傑克與魔豆的 3D 互動舞台", "instrument": "鋼琴", "session": "上半場"}, {"key": "1", "number": 1, "title": "向星星許願", "piece": "木偶奇遇記：向星星許願", "id": "upper-01", "src": "assets/program-01.png", "alt": "木偶奇遇記：向星星許願的 3D 互動舞台", "instrument": "鋼琴", "session": "上半場"}];
  const image = document.getElementById('recital-scene-image');
  const link = document.getElementById('recital-scene-link');
  const caption = document.getElementById('recital-scene-caption');
  const enter = document.querySelector('.recital-enter');
  const dialog = document.getElementById('recital-dialog');
  const frame = document.getElementById('recital-frame');
  const loading = document.getElementById('recital-loading');
  const external = document.getElementById('recital-open-separately');
  const choices = [...document.querySelectorAll('.recital-scene-choice')];
  const rowLinks = [...document.querySelectorAll('.program-open')];
  let opener = null;
  function selectScene(index) {
    const scene = scenes[index];
    image.src = scene.src;
    image.alt = scene.alt;
    caption.textContent = scene.piece;
    link.href = enter.href = `https://2026-demo.tingyumusic.com/?guest=1&performance=${scene.id}`;
    link.setAttribute('aria-label',`播放${scene.title}演出與互動舞台`);
    enter.setAttribute('aria-label',`播放${scene.title}演出與互動舞台`);
    document.getElementById('program-preview-meta').textContent = `第 ${scene.number} 場 · ${scene.instrument}`;
    document.getElementById('recital-scene-count').textContent = `${index + 1} / ${scenes.length}`;
    choices.forEach((button,i) => button.setAttribute('aria-pressed',String(i === index)));
  }
  function showStage(url, trigger) {
    opener = trigger;
    external.href = url;
    loading.hidden = false;
    document.documentElement.classList.add('recital-modal-open');
    dialog.showModal();
    window.dispatchEvent(new CustomEvent('recital:open',{detail:{url}}));
    document.getElementById('recital-dialog-close').focus({preventScroll:true});
  }
  choices.forEach((button,i) => {
    button.addEventListener('click', () => {
      selectScene(i);
      if(matchMedia('(max-width:700px)').matches) showStage(link.href,button);
    });
    button.addEventListener('keydown', event => {
      let target;
      if(event.key === 'ArrowDown' || event.key === 'ArrowRight') target = Math.min(scenes.length-1,i+1);
      if(event.key === 'ArrowUp' || event.key === 'ArrowLeft') target = Math.max(0,i-1);
      if(event.key === 'Home') target = 0;
      if(event.key === 'End') target = scenes.length-1;
      if(target === undefined) return;
      event.preventDefault();selectScene(target);choices[target].focus();
    });
  });
  [link,enter,...rowLinks].forEach(anchor => anchor.addEventListener('click', event => {
    if(event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if(anchor.dataset.scene) selectScene(scenes.findIndex(s => s.key === anchor.dataset.scene));
    showStage(anchor.href,anchor);
  }));
  frame.addEventListener('load', () => { if(dialog.open && frame.hasAttribute('src')) loading.hidden = true; });
  document.getElementById('recital-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if(event.target !== dialog) return;
    const b = dialog.getBoundingClientRect();
    if(event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    window.dispatchEvent(new Event('recital:close'));
    frame.removeAttribute('src');loading.hidden = true;
    document.documentElement.classList.remove('recital-modal-open');
    opener?.focus({preventScroll:true});opener = null;
  });
  selectScene(0);
})();
