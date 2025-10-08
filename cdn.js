(function () {
  var QUEUE = [];
  var API_NAME = "YourChat";
  var STATE = {
    inited: false,
    options: null,
    isOpen: false,
    shadowRoot: null,
    buttonEl: null,
    panelEl: null,
    iframeEl: null,
    poweredByEl: null,
  };
  function ensureHost() {
    if (STATE.shadowRoot) return;
    var host = document.createElement("div");
    host.id = "ychat-host";
    host.style.all = "initial";
    host.style.position = "fixed";
    host.style.zIndex = "2147483647";
    host.style.bottom = "16px";
    host.style.right = "16px";
    host.style.display = "flex";
    host.style.flexDirection = "column";
    host.style.gap = "12px";
    host.style.alignItems = "flex-end";
    host.style.justifyContent = "flex-end";
    host.style.alignSelf = "flex-end";
    host.style.alignContent = "flex-end";
    host.style.alignItems = "flex-end";
    host.style.justifyContent = "flex-end";
    host.style.alignSelf = "flex-end";
    host.style.alignContent = "flex-end";



    var sr = host.attachShadow({ mode: "open" });
    document.documentElement.appendChild(host);
    STATE.shadowRoot = sr;
  }
  function css(s) {
    return s[0];
  }
  function render() {
    ensureHost();
    var sr = STATE.shadowRoot;

    sr.innerHTML = "";
    var style = document.createElement("style");
    style.textContent = css`
      :host {
        all: initial;
      }
        body {
        margin:0px;
        padding:0px;
      }
      .ychat-button {
        all: initial;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        width: 56px;
        height: 56px;
        border-radius: 9999px;
        background: #00EBA8;
        background-color: #00EBA8;
        color: #fff;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                    box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                    background-color 0.25s ease;
        will-change: transform, box-shadow;
        -webkit-tap-highlight-color: transparent;
      }
        .ychat-button:hover {
        transform: scale(1.06);
        box-shadow: 0 14px 28px rgba(0, 0, 0, 0.28);
      }
        .ychat-button:active {
        transform: scale(0.97);
      }
      .ychat-button svg {
        display: block;
        width: 30px;
        height: 30px;
        color: #000;
        margin-left: 2px;
      }
      .ychat-panel {
        all: initial;
        position: fixed;
        bottom: calc(16px + 48px + 12px);
        right: 16px;
        width: ${380}px;
        height: ${Number(790)}px;

        background: #F2F2F2;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

        display: ${STATE.isOpen ? "block" : "none"};
        transform-origin: right bottom;
        transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
                    opacity 0.32s cubic-bezier(0.22, 1, 0.36, 1),
                    box-shadow 0.32s cubic-bezier(0.22, 1, 0.36, 1);
        will-change: transform, opacity;
        opacity: 0;
        transform: scale(0.9) translateY(8px);
      }
      .ychat-panel.open {
        opacity: 1;
        transform: scale(1) translateY(0);
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.5);
      }
      .ychat-iframe {
        all: initial;
        width: 100%;
        height: 450px;
        border: 0;
        border-radius: 16px;
      }
      @media (max-width: 640px) {
        .ychat-panel {
          left: 0 !important;
          right: 0 !important;
          width: 100vw;
          height: ${Math.round(
      ((STATE.options && STATE.options.mobileHeight) || 0.9) * 100
    )}vh;
          bottom: 0;
          border-radius: 12px 12px 0 0;
          transform-origin: center bottom;
          transform: translateY(100%);
        }
        .ychat-panel.open {
          transform: translateY(0);
          box-shadow: 0 -16px 60px rgba(0, 0, 0, 0.45);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .ychat-button,
        .ychat-button img,
        .ychat-panel {
          transition: none !important;
        }
      }
      .ychat-title {
        all: initial;
        position: fixed;
        bottom: 136px;
        ${STATE.options && STATE.options.position === "left"
        ? "left:16px;"
        : "right:16px;"}background:#F2F2F2;
        color: #e5e7eb;
        font: 600 14px ui-sans-serif, system-ui;
        padding: 6px 10px;
        border-radius: 8px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
        display: ${STATE.isOpen ? "none" : "inline-block"};
      }
    `;
    sr.appendChild(style);
    // var title = document.createElement("div");
    // title.className = "ychat-title";
    // title.textContent = (STATE.options && STATE.options.title) || "Chat";
    // sr.appendChild(title);
    var button = document.createElement("button");
    button.setAttribute("aria-label", "Open chat");
    button.className = "ychat-button";
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-more-icon lucide-message-square-more"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="M12 11h.01"/><path d="M16 11h.01"/><path d="M8 11h.01"/></svg>`;
    button.addEventListener("click", toggle);
    STATE.buttonEl = button;

    var panel = document.createElement("div");
    panel.className = "ychat-panel";
    panel.style.display = "none"; // Force hidden by default - removes from layout completely
    var iframe = document.createElement("iframe");
    var origin = location.origin;
    var url =
      ((STATE.options && STATE.options.iframeUrl) || "") +
      "?appId=" +
      encodeURIComponent((STATE.options && STATE.options.appId) || "") +
      "&parent_origin=" +
      encodeURIComponent(origin);
    iframe.className = "ychat-iframe";
    iframe.title = (STATE.options && STATE.options.title) || "Chat";
    iframe.src = url;
    iframe.style.height = window.innerHeight > 860 ? "700px" : "525px";
    iframe.style.width = window.innerHeight > 860 ? "490px" : "375px";
    iframe.style.borderRadius = "16px";
    iframe.style.border = "none";
    panel.appendChild(iframe);
    STATE.iframeEl = iframe;
    STATE.panelEl = panel;
    sr.appendChild(panel);
    sr.appendChild(button);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && STATE.isOpen) {
        close();
        STATE.buttonEl && STATE.buttonEl.focus && STATE.buttonEl.focus();
      }
    });


    //powered by 913.ai
    var poweredBy = document.createElement("span");

    poweredBy.textContent = "Powered by 913.ai";
    poweredBy.style.fontSize = "12px";
    poweredBy.style.color = "#71717A";
    poweredBy.style.textAlign = "center";
    poweredBy.style.width = window.innerHeight > 860 ? "490px" : "375px";
    poweredBy.style.position = "fixed";
    poweredBy.style.bottom = "58px";
    poweredBy.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif";
    poweredBy.style.display = "none"; // Hidden by default
    poweredBy.style.opacity = "0";
    poweredBy.style.transition = "opacity 0.32s cubic-bezier(0.22, 1, 0.36, 1)";
    STATE.poweredByEl = poweredBy;
    sr.appendChild(poweredBy);
  }
  function open() {
    if (!STATE.inited) return;
    STATE.isOpen = true;
    if (STATE.panelEl) {
      STATE.panelEl.style.display = "block";
      // Trigger reflow to ensure animation plays
      STATE.panelEl.offsetHeight;
      STATE.panelEl.classList.add("open");
    }
    if (STATE.poweredByEl) {
      STATE.poweredByEl.style.display = "block";
      // Trigger reflow to ensure animation plays
      STATE.poweredByEl.offsetHeight;
      STATE.poweredByEl.style.opacity = "1";
    }
    if (STATE.buttonEl) {
      STATE.buttonEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>`;
      STATE.buttonEl.setAttribute("aria-label", "Close chat");
    }
  }
  function close() {
    if (!STATE.inited) return;
    STATE.isOpen = false;
    if (STATE.panelEl) {
      STATE.panelEl.classList.remove("open");
      // Wait for animation to finish before hiding

      if (!STATE.isOpen) {
        STATE.panelEl.style.display = "none";
      }

    }
    if (STATE.poweredByEl) {
      STATE.poweredByEl.style.opacity = "0";
      // Wait for animation to finish before hiding completely

      if (!STATE.isOpen && STATE.poweredByEl) {
        STATE.poweredByEl.style.display = "none";
      }

    }
    if (STATE.buttonEl) {
      STATE.buttonEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-more-icon lucide-message-square-more"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="M12 11h.01"/><path d="M16 11h.01"/><path d="M8 11h.01"/></svg>`;
      STATE.buttonEl.setAttribute("aria-label", "Open chat");
    }
  }
  function toggle() {
    STATE.isOpen ? close() : open();
  }
  function handleMessage(event) {
    if (!STATE.iframeEl || event.source !== STATE.iframeEl.contentWindow)
      return;
    var data = event.data || {};
    if (data && typeof data === "object" && typeof data.type === "string") {
      if (data.type === "ychat:open") open();
      else if (data.type === "ychat:close") close();
      else if (data.type === "ychat:toggle") toggle();
      else if (data.type === "ychat:resize" && STATE.panelEl) {
      }
    }
  }
  function init(opts) {
    if (STATE.inited) return;
    STATE.inited = true;
    STATE.options = opts || {};
    STATE.isOpen = false;
    render();
    window.addEventListener("message", handleMessage);
  }
  function api(cmd) {
    if (cmd === "init") return init(arguments[1] || {});
    if (cmd === "open") return open();
    if (cmd === "close") return close();
    if (cmd === "toggle") return toggle();
  }
  var existing = window[API_NAME];
  if (typeof existing === "function" && Array.isArray(existing.q)) {
    QUEUE = existing.q.slice();
  }
  window[API_NAME] = function () {
    api.apply(null, arguments);
  };
  window[API_NAME].q = [];
  for (var i = 0; i < QUEUE.length; i++) {
    try {
      api.apply(null, QUEUE[i]);
    } catch (e) { }
  }
})();
