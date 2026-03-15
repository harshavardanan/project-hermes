import { useEffect } from "react";

// Injects "Copy" buttons into TipTap code blocks via MutationObserver
const CopyButtonInjector = () => {
  useEffect(() => {
    const inject = (pre: HTMLElement) => {
      if (pre.querySelector(".copy-code-btn")) return;
      const btn = document.createElement("button");
      btn.className = "copy-code-btn";
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy`;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const code = pre.querySelector("code")?.textContent ?? "";
        navigator.clipboard.writeText(code).then(() => {
          btn.className = "copy-code-btn copied";
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
          setTimeout(() => {
            btn.className = "copy-code-btn";
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy`;
          }, 2000);
        });
      });
      pre.appendChild(btn);
    };

    document.querySelectorAll<HTMLElement>(".ProseMirror pre").forEach(inject);
    const observer = new MutationObserver(() => {
      document.querySelectorAll<HTMLElement>(".ProseMirror pre").forEach(inject);
    });
    const pm = document.querySelector(".ProseMirror");
    if (pm) observer.observe(pm, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
};

export default CopyButtonInjector;
