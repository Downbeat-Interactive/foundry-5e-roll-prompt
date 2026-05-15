// Skill Picker for Foundry VTT v14 + D&D5e
// Selected token actor first, then user's assigned character fallback.
// Centered panel, alphabetical skill list, large actor portrait.

const token = canvas.tokens.controlled[0];
const actor = token?.actor ?? game.user.character;

if (!actor) {
  return ui.notifications.warn("Select a token or assign a character to your user.");
}

if (game.system.id !== "dnd5e") {
  return ui.notifications.warn("This macro is written for the D&D5e system.");
}

// -----------------------------------------------------------------------------
// Icons
// GitHub source:
// https://github.com/intrinsical/tw-dnd/tree/6e5928176496f95d78874b273a840850a4317c70/icons/skill
//
// <img> needs raw.githubusercontent.com.
// -----------------------------------------------------------------------------

const ICON_BASE = "https://raw.githubusercontent.com/intrinsical/tw-dnd/6e5928176496f95d78874b273a840850a4317c70/icons/skill";

const ICON_FILE_BY_SKILL = {
  acr: "acrobatics",
  ani: "animal-handling",
  arc: "arcana",
  ath: "athletics",
  dec: "deception",
  his: "history",
  ins: "insight",
  itm: "intimidation",
  inv: "investigation",
  med: "medicine",
  nat: "nature",
  prc: "perception",
  prf: "performance",
  per: "persuasion",
  rel: "religion",
  slt: "sleight-of-hand",
  ste: "stealth",
  sur: "survival"
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[c]));

const cssUrl = (value) => String(value ?? "").replace(/['"\\()]/g, "\\$&");

const labelForSkill = (key, skill) => {
  const config = CONFIG.DND5E?.skills?.[key];
  const rawLabel = config?.label ?? config ?? skill?.label ?? key;
  return game.i18n.localize(rawLabel);
};

const getPortrait = () => {
  return token?.document?.texture?.src
    ?? token?.texture?.src
    ?? actor.img
    ?? "icons/svg/mystery-man.svg";
};

// -----------------------------------------------------------------------------
// Build skill data alphabetically
// -----------------------------------------------------------------------------

const skills = actor.system?.skills ?? {};

const skillData = Object.entries(skills)
  .map(([key, skill]) => {
    const label = labelForSkill(key, skill);
    const total = Number.isNumeric(skill?.total) ? skill.total : 0;
    const file = ICON_FILE_BY_SKILL[key] ?? key;

    return {
      key,
      label,
      mod: `${total >= 0 ? "+" : ""}${total}`,
      icon: `${ICON_BASE}/${file}.svg`
    };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

if (!skillData.length) {
  return ui.notifications.warn(`${actor.name} has no skills available.`);
}

// -----------------------------------------------------------------------------
// Cleanup existing picker
// -----------------------------------------------------------------------------

document.getElementById("intrinsical-skill-picker")?.remove();
document.getElementById("intrinsical-skill-picker-style")?.remove();

// -----------------------------------------------------------------------------
// CSS
// -----------------------------------------------------------------------------

const style = document.createElement("style");
style.id = "intrinsical-skill-picker-style";
style.textContent = `
  #intrinsical-skill-picker {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: grid;
    place-items: center;
    padding: 18px;
    background:
      radial-gradient(circle at center, rgba(135, 18, 18, 0.36), transparent 34%),
      linear-gradient(to bottom, rgba(7, 4, 5, 0.54), rgba(0, 0, 0, 0.76));
    backdrop-filter: blur(5px);
    animation: isp-overlay-in 130ms ease-out forwards;
  }

  #intrinsical-skill-picker.closing {
    animation: isp-overlay-out 120ms ease-in forwards;
  }

  .isp-panel {
    width: min(820px, calc(100vw - 36px));
    max-height: calc(100vh - 36px);
    overflow: hidden;
    color: #f5ead8;
    border: 1px solid rgba(186, 139, 78, 0.78);
    border-radius: 22px;
    background:
      radial-gradient(circle at top center, rgba(145, 27, 27, 0.34), transparent 38%),
      linear-gradient(145deg, rgba(28, 13, 13, 0.98), rgba(7, 8, 12, 0.99) 58%, rgba(12, 10, 8, 0.99));
    box-shadow:
      0 28px 90px rgba(0, 0, 0, 0.72),
      0 0 44px rgba(131, 18, 18, 0.34),
      inset 0 0 30px rgba(255, 229, 178, 0.035);
    opacity: 0;
    transform: scale(0.94) translateY(8px);
    animation: isp-panel-in 180ms cubic-bezier(.16,1.18,.25,1) forwards;
  }

  #intrinsical-skill-picker.closing .isp-panel {
    animation: isp-panel-out 110ms ease-in forwards;
  }

  .isp-header {
    position: relative;
    display: grid;
    grid-template-columns: 112px 1fr auto;
    align-items: center;
    gap: 18px;
    padding: 18px 20px;
    border-bottom: 1px solid rgba(186, 139, 78, 0.34);
    background:
      radial-gradient(circle at 62px 50%, rgba(196, 41, 35, 0.24), transparent 120px),
      linear-gradient(to bottom, rgba(255, 240, 210, 0.055), rgba(255, 255, 255, 0));
  }

  .isp-header::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.16;
    background:
      repeating-linear-gradient(
        115deg,
        transparent 0px,
        transparent 9px,
        rgba(255, 255, 255, 0.05) 10px,
        transparent 12px
      );
    mix-blend-mode: screen;
  }

  .isp-portrait-frame {
    position: relative;
    width: 112px;
    height: 112px;
    border-radius: 22px;
    padding: 5px;
    background:
      linear-gradient(145deg, rgba(230, 184, 104, 0.92), rgba(77, 31, 20, 0.88)),
      radial-gradient(circle at top, rgba(255, 234, 179, 0.4), transparent 55%);
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.6),
      0 0 26px rgba(154, 22, 22, 0.42),
      inset 0 0 16px rgba(255, 240, 190, 0.12);
  }

  .isp-portrait-frame::after {
    content: "";
    position: absolute;
    inset: -7px;
    border-radius: 27px;
    border: 1px solid rgba(191, 139, 78, 0.28);
    box-shadow: 0 0 22px rgba(168, 27, 27, 0.28);
    pointer-events: none;
  }

  .isp-portrait {
    width: 100%;
    height: 100%;
    border-radius: 17px;
    background-image:
      linear-gradient(to bottom, rgba(0,0,0,0.02), rgba(0,0,0,0.42)),
      var(--portrait);
    background-size: cover;
    background-position: center;
    border: 1px solid rgba(15, 8, 8, 0.92);
    box-shadow:
      inset 0 0 24px rgba(0,0,0,0.58),
      inset 0 0 0 1px rgba(255, 230, 177, 0.16);
  }

  .isp-title {
    font-family: var(--font-primary, serif);
    font-size: 34px;
    font-weight: 900;
    letter-spacing: 0.01em;
    line-height: 1;
    color: #f8ead3;
    text-transform: none;
    text-shadow:
      0 2px 4px rgba(0,0,0,0.9),
      0 0 14px rgba(154, 22, 22, 0.5);
  }

  .isp-subtitle {
    margin-top: 7px;
    font-size: 14px;
    font-weight: 800;
    color: rgba(229, 201, 160, 0.88);
    text-shadow: 0 1px 3px rgba(0,0,0,0.9);
  }

  .isp-close {
    position: relative;
    z-index: 1;
    width: 38px;
    height: 38px;
    border: 1px solid rgba(214, 176, 114, 0.28);
    border-radius: 12px;
    color: rgba(245, 234, 216, 0.82);
    background: rgba(255,255,255,0.055);
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;
  }

  .isp-close:hover,
  .isp-close:focus {
    outline: none;
    background: rgba(145, 27, 27, 0.42);
    border-color: rgba(230, 184, 104, 0.62);
    transform: scale(1.06);
  }

  .isp-body {
    padding: 16px;
    max-height: calc(100vh - 186px);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(186, 139, 78, 0.7) rgba(0,0,0,0.28);
  }

  .isp-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(205px, 1fr));
    gap: 11px;
  }

  .isp-skill {
    --delay: 0ms;

    min-height: 72px;
    display: grid;
    grid-template-columns: 46px 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 11px 13px;
    border: 1px solid rgba(177, 128, 78, 0.24);
    border-radius: 16px;
    color: #f5ead8;
    background:
      radial-gradient(circle at top left, rgba(154, 32, 28, 0.20), transparent 48%),
      linear-gradient(145deg, rgba(34, 31, 34, 0.98), rgba(12, 14, 19, 0.98));
    box-shadow:
      0 11px 24px rgba(0,0,0,0.36),
      inset 0 0 16px rgba(255,255,255,0.025);
    cursor: pointer;
    opacity: 0;
    transform: translateY(7px);
    animation: isp-skill-in 180ms ease-out forwards;
    animation-delay: var(--delay);
    transition:
      transform 120ms ease,
      box-shadow 120ms ease,
      border-color 120ms ease,
      background 120ms ease;
  }

  .isp-skill:hover,
  .isp-skill:focus {
    outline: none;
    border-color: rgba(228, 177, 97, 0.86);
    background:
      radial-gradient(circle at top left, rgba(170, 35, 30, 0.36), transparent 50%),
      linear-gradient(145deg, rgba(56, 35, 34, 0.99), rgba(17, 17, 22, 0.99));
    box-shadow:
      0 0 22px rgba(160, 30, 27, 0.35),
      0 15px 34px rgba(0,0,0,0.48),
      inset 0 0 18px rgba(255,255,255,0.04);
    transform: translateY(-2px);
  }

  .isp-skill:first-child {
    border-color: rgba(230, 184, 104, 0.82);
    box-shadow:
      0 0 24px rgba(154, 32, 28, 0.32),
      0 11px 24px rgba(0,0,0,0.36),
      inset 0 0 16px rgba(255,255,255,0.025);
  }

  .isp-icon-wrap {
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border-radius: 13px;
    background:
      radial-gradient(circle at top, rgba(233, 206, 155, 0.11), transparent 60%),
      rgba(255,255,255,0.07);
    box-shadow:
      inset 0 0 14px rgba(255,255,255,0.035),
      0 0 0 1px rgba(0,0,0,0.22);
    overflow: hidden;
  }

  .isp-icon {
    width: 34px;
    height: 34px;
    object-fit: contain;
    filter: brightness(0) invert(1);
    opacity: 0.92;
  }

  .isp-fallback-icon {
    font-size: 21px;
    color: rgba(245, 234, 216, 0.92);
  }

  .isp-name {
    min-width: 0;
    font-size: 15px;
    font-weight: 900;
    line-height: 1.12;
    text-align: left;
    color: #f8ead3;
    text-shadow: 0 1px 4px rgba(0,0,0,0.82);
  }

  .isp-mod {
    display: inline-grid;
    place-items: center;
    min-width: 44px;
    height: 30px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 900;
    color: #f8ead3;
    background:
      linear-gradient(to bottom, rgba(110, 58, 39, 0.94), rgba(47, 34, 28, 0.94));
    border: 1px solid rgba(224, 177, 101, 0.46);
    box-shadow:
      inset 0 0 10px rgba(255, 229, 178, 0.06),
      0 0 0 1px rgba(0,0,0,0.24);
  }

  @keyframes isp-overlay-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes isp-overlay-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes isp-panel-in {
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes isp-panel-out {
    to {
      opacity: 0;
      transform: scale(0.96) translateY(4px);
    }
  }

  @keyframes isp-skill-in {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 860px) {
    .isp-panel {
      width: min(620px, calc(100vw - 28px));
    }

    .isp-grid {
      grid-template-columns: repeat(2, minmax(205px, 1fr));
    }
  }

  @media (max-width: 560px) {
    #intrinsical-skill-picker {
      padding: 10px;
    }

    .isp-panel {
      width: calc(100vw - 20px);
      border-radius: 18px;
    }

    .isp-header {
      grid-template-columns: 82px 1fr auto;
      gap: 12px;
      padding: 13px;
    }

    .isp-portrait-frame {
      width: 82px;
      height: 82px;
      border-radius: 18px;
      padding: 4px;
    }

    .isp-portrait {
      border-radius: 14px;
    }

    .isp-title {
      font-size: 24px;
    }

    .isp-subtitle {
      font-size: 12px;
    }

    .isp-body {
      padding: 11px;
      max-height: calc(100vh - 128px);
    }

    .isp-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .isp-skill {
      min-height: 64px;
      grid-template-columns: 42px 1fr auto;
    }

    .isp-icon-wrap {
      width: 42px;
      height: 42px;
    }

    .isp-icon {
      width: 31px;
      height: 31px;
      filter: brightness(0) invert(1);
      opacity: 0.92;
    }
  }
`;

document.head.appendChild(style);

// -----------------------------------------------------------------------------
// Markup
// -----------------------------------------------------------------------------

const portrait = getPortrait();

const skillButtons = skillData.map((skill, index) => `
  <button
    type="button"
    class="isp-skill"
    data-skill="${escapeHtml(skill.key)}"
    title="Roll ${escapeHtml(skill.label)}"
    style="--delay:${25 + index * 12}ms;"
  >
    <span class="isp-icon-wrap">
      <img
        class="isp-icon"
        src="${escapeHtml(skill.icon)}"
        alt=""
        onerror="this.outerHTML='<i class=&quot;isp-fallback-icon fa-solid fa-dice-d20&quot;></i>';"
      >
    </span>
    <span class="isp-name">${escapeHtml(skill.label)}</span>
    <span class="isp-mod">${escapeHtml(skill.mod)}</span>
  </button>
`).join("");

const overlay = document.createElement("div");
overlay.id = "intrinsical-skill-picker";

overlay.innerHTML = `
  <section
    class="isp-panel"
    style="--portrait: url('${cssUrl(portrait)}');"
  >
    <header class="isp-header">
      <div class="isp-portrait-frame">
        <div class="isp-portrait"></div>
      </div>

      <div>
        <div class="isp-title">Choose Skill</div>
        <div class="isp-subtitle">${escapeHtml(actor.name)}</div>
      </div>

      <button type="button" class="isp-close" title="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </header>

    <main class="isp-body">
      <div class="isp-grid">
        ${skillButtons}
      </div>
    </main>
  </section>
`;

document.body.appendChild(overlay);

// -----------------------------------------------------------------------------
// Behavior
// -----------------------------------------------------------------------------

const cleanup = () => {
  overlay.remove();
  style.remove();
  document.removeEventListener("keydown", onKeydown);
};

const closeMenu = () => {
  if (!document.body.contains(overlay)) return;
  overlay.classList.add("closing");
  setTimeout(cleanup, 120);
};

const rollSkill = async (skillKey) => {
  closeMenu();

  if (typeof actor.rollSkill === "function") {
    return actor.rollSkill({ skill: skillKey });
  }

  return ui.notifications.error("This actor does not support skill rolls.");
};

const onKeydown = (event) => {
  if (event.key === "Escape") closeMenu();
};

document.addEventListener("keydown", onKeydown);

overlay.addEventListener("click", (event) => {
  if (event.target === overlay) closeMenu();
});

overlay.querySelector(".isp-close")?.addEventListener("click", closeMenu);

overlay.querySelectorAll(".isp-skill").forEach(button => {
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await rollSkill(button.dataset.skill);
  });
});

overlay.querySelector(".isp-skill")?.focus();
