(function () {
  let installPrompt = null;

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if (isStandalone) return;

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const manifestLink = document.querySelector('link[rel="manifest"]');
      const baseUrl = manifestLink ? manifestLink.href.replace(/manifest\.webmanifest$/, "") : `${window.location.origin}/`;
      navigator.serviceWorker.register(new URL("sw.js", baseUrl)).catch(() => {});
    });
  }

  const panel = document.createElement("div");
  panel.className = "install-panel";
  panel.innerHTML = `
    <div>
      <strong>Install this site</strong>
      <span>Open it from your phone home screen.</span>
    </div>
    <button type="button" class="install-action">Install</button>
    <button type="button" class="install-close" aria-label="Close install prompt">×</button>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .install-panel{
      position:fixed;
      right:18px;
      bottom:18px;
      z-index:1080;
      display:none;
      align-items:center;
      gap:14px;
      max-width:min(420px, calc(100vw - 28px));
      padding:14px;
      color:#e6edf3;
      background:rgba(22,27,34,.96);
      border:1px solid rgba(88,166,255,.34);
      border-radius:12px;
      box-shadow:0 18px 40px rgba(0,0,0,.38);
      backdrop-filter:blur(10px);
      font-family:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial;
    }
    .install-panel strong,.install-panel span{display:block}
    .install-panel span{color:#8b949e;font-size:.88rem;line-height:1.4}
    .install-action{
      border:0;
      border-radius:999px;
      padding:8px 14px;
      color:#0d1117;
      background:#58a6ff;
      font-weight:800;
      white-space:nowrap;
    }
    .install-close{
      width:30px;
      height:30px;
      border:1px solid #30363d;
      border-radius:50%;
      color:#e6edf3;
      background:transparent;
      font-size:20px;
      line-height:1;
    }
    @media (max-width:520px){
      .install-panel{
        right:14px;
        left:14px;
        bottom:14px;
      }
      .install-action{padding:8px 12px}
    }
  `;

  const showPanel = (message, buttonText) => {
    panel.querySelector("span").textContent = message;
    panel.querySelector(".install-action").textContent = buttonText;
    panel.style.display = "flex";
  };

  document.head.appendChild(style);
  document.body.appendChild(panel);

  panel.querySelector(".install-close").addEventListener("click", () => {
    panel.remove();
  });

  panel.querySelector(".install-action").addEventListener("click", async () => {
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (!installPrompt) {
      if (isIos) {
        showPanel("On iPhone: tap Share, then Add to Home Screen.", "Got it");
      }
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    panel.remove();
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    showPanel("Open it from your phone home screen.", "Install");
  });

  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  if (isIos) {
    window.addEventListener("load", () => {
      setTimeout(() => showPanel("On iPhone: tap Share, then Add to Home Screen.", "Got it"), 1200);
    });
  }
})();
