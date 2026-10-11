(() => {
const audio = new Audio();
audio.preload = 'none';
const buttons = [...document.querySelectorAll('[data-narration]')];
const stops = [...document.querySelectorAll('[data-stop]')];
const status = document.getElementById('narration-status');
const speaker = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" aria-hidden=\"true\"><path d=\"M11 5 6 9H3v6h3l5 4V5Z\"/><path d=\"M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14\"/></svg>";
const pauseIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM14 5h4v14h-4z" fill="currentColor"/></svg>';
let selected = null;
let request = 0;
function announce(text) { status.textContent = text; }
function sync() {
  for (const button of buttons) {
    const playing = button === selected && !audio.paused && !audio.ended;
    const resumable = button === selected && audio.currentTime > 0 && !audio.ended;
    const action = playing ? '일시정지' : resumable ? '이어 듣기' : '재생';
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', button.dataset.label + ' 음성 ' + action);
    button.title = button.dataset.label + ' 음성 ' + action;
    button.innerHTML = playing ? pauseIcon : speaker;
  }
  for (const stop of stops) stop.hidden = !selected || stop.dataset.stop !== selected.dataset.narration;
}
window.stopNarration = function() {
  request++;
  audio.pause();
  audio.currentTime = 0;
  selected = null;
  sync();
};
for (const button of buttons) button.addEventListener('click', async () => {
  if (selected === button && !audio.paused) {
    request++;
    audio.pause();
    sync();
    announce(button.dataset.label + ' 음성을 일시정지했습니다.');
    return;
  }
  if (selected !== button) {
    window.stopNarration();
    selected = button;
    audio.src = 'assets/narration-' + button.dataset.narration + '.mp3';
  }
  const ticket = ++request;
  try {
    await audio.play();
    if (ticket !== request) return;
    sync();
    announce(button.dataset.label + ' 음성을 재생합니다.');
  } catch (error) {
    if (ticket !== request) return;
    sync();
    announce('음성을 재생할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  }
});
for (const button of stops) button.addEventListener('click', () => {
  const label = selected?.dataset.label || '';
  const toggle = selected;
  window.stopNarration();
  announce(label + ' 음성을 정지했습니다.');
  toggle?.focus();
});
audio.addEventListener('play', sync);
audio.addEventListener('pause', sync);
audio.addEventListener('ended', () => {
  const label = selected?.dataset.label || '';
  window.stopNarration();
  announce(label + ' 음성 재생이 끝났습니다.');
});
window.addEventListener('pagehide', window.stopNarration);
sync();
})();