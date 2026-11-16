(() => {
  const dialog = document.getElementById('recital-dialog');
  const mobile = matchMedia('(max-width:700px)');
  const modes = ['watch', 'explore'];
  const tabs = modes.map(mode => document.getElementById(`recital-${mode}-tab`));
  const panels = modes.map(mode => document.getElementById(`recital-${mode}-panel`));
  let active = 'watch';
  function render() {
    dialog.dataset.mobileView = active;
    modes.forEach((mode, index) => {
      const selected = mode === active;
      tabs[index].setAttribute('aria-selected', String(selected));
      tabs[index].tabIndex = selected ? 0 : -1;
      panels[index].inert = mobile.matches && !selected;
      if(mobile.matches) {
        panels[index].setAttribute('role', 'tabpanel');
        panels[index].setAttribute('aria-labelledby', tabs[index].id);
        panels[index].setAttribute('aria-hidden', String(!selected));
      } else {
        ['role', 'aria-labelledby', 'aria-hidden'].forEach(name => panels[index].removeAttribute(name));
      }
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => { active = modes[index];render(); });
    tab.addEventListener('keydown', event => {
      if(!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
      active = modes[next];render();tabs[next].focus();
    });
  });
  window.addEventListener('recital:open', () => { active = 'watch';render(); });
  mobile.addEventListener('change', render);
  render();
})();
