import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import { Search, ChevronRight, X, Menu } from "lucide-react";
import { useAppConfig } from "../store/appConfig";

const lowlight = createLowlight();
lowlight.register("javascript", javascript);
lowlight.register("typescript", typescript);
lowlight.register("bash", bash);
lowlight.register("json", json);

interface DocMeta {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  lastUpdated: string;
  category: string;
}

interface DocData extends DocMeta {
  content: Record<string, unknown> | null;
}

const DocumentationPage: React.FC = () => {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );

  const endpoint = useAppConfig((s) => s.endpoint);

  const editor = useEditor({
    editable: false,
    content: "",
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({
        inline: false,
        HTMLAttributes: { class: "doc-image" },
      }),
    ],
    immediatelyRender: false,
  });

  const { data: docListData } = useQuery({
    queryKey: ["docsList"],
    queryFn: async () => {
      const res = await fetch(`${endpoint}/api/docs/list`);
      if (!res.ok) throw new Error("Failed to fetch doc list");
      const json = await res.json();
      return json.success ? json.data : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const docList = useMemo(() => {
    if (!docListData) return [];
    return docListData.filter((d: DocMeta) => d.status === "published");
  }, [docListData]);

  useEffect(() => {
    if (!urlSlug && docList.length > 0) {
      navigate(`/documentation/${docList[0].slug}`, { replace: true });
    }
  }, [urlSlug, docList, navigate]);

  const { data: docResp, isLoading: docLoading, isError: docError } = useQuery<DocData | null>({
    queryKey: ["doc", urlSlug],
    queryFn: async () => {
      if (!urlSlug) return null;
      const res = await fetch(`${endpoint}/api/docs/get/${urlSlug}`);
      if (!res.ok) throw new Error("Not Found");
      const json = await res.json();
      if (!json.success || !json.data) throw new Error("Not Found");
      return json.data as DocData;
    },
    enabled: !!urlSlug,
    staleTime: 5 * 60 * 1000,
  });

  const docData = docResp || null;
  const loading = (docLoading && !!urlSlug) || (!docListData && !docList.length);
  const notFound = docError;

  useEffect(() => {
    setSidebarOpen(false); // close sidebar on mobile when navigating
  }, [urlSlug]);

  useEffect(() => {
    if (!editor || !docData?.content) return;
    editor.commands.setContent(docData.content);
  }, [docData, editor]);

  const filteredList = useMemo(() => {
    if (!search.trim()) return docList;
    return docList.filter(
      (d: DocMeta) =>
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.category.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, docList]);

  const groupedDocs = useMemo(() => {
    return filteredList.reduce(
      (acc: Record<string, DocMeta[]>, doc: DocMeta) => {
        const cat = doc.category || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(doc);
        return acc;
      },
      {} as Record<string, DocMeta[]>,
    );
  }, [filteredList]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const breadcrumb = docData
    ? [
        { label: "Docs", href: "/documentation" },
        { label: docData.category || "General", href: "#" },
        { label: docData.title, href: null },
      ]
    : [];

  const SidebarContent = () => (
    <>
      <div className="px-5 pt-6 pb-4">
        <div className={`flex items-center mb-5 ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 shrink-0 flex items-center justify-center">
              <img src="/vite.svg" alt="Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]" />
            </div>
            {!isSidebarCollapsed && (
              <span
                className="font-bold tracking-widest text-[10px] uppercase truncate"
                style={{ color: "var(--brand-muted)" }}
              >
                Documentation
              </span>
            )}
          </div>
          
          {/* Desktop Toggle Button */}
          <button 
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             className="hidden md:flex text-brand-muted hover:text-white transition-colors"
          >
             <ChevronRight size={14} className={`transition-transform duration-200 ${isSidebarCollapsed ? "" : "rotate-180"}`} />
          </button>

          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative">
          <Search
            size={12}
            className={`absolute top-1/2 -translate-y-1/2 ${isSidebarCollapsed ? "left-1/2 -translate-x-1/2" : "left-3"}`}
            style={{ color: "var(--brand-muted)" }}
          />
          {!isSidebarCollapsed && (
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search docs..."
              className="w-full bg-white/[0.03] border rounded-lg pl-8 pr-8 py-2 text-xs transition-colors outline-none"
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                color: "var(--brand-text)",
              }}
            />
          )}
          {!isSidebarCollapsed && search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--brand-muted)" }}
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      <nav className={`flex-1 overflow-y-auto px-3 pb-8 ${isSidebarCollapsed ? "flex flex-col items-center" : ""}`}>
        {Object.keys(groupedDocs).length === 0 && !isSidebarCollapsed && (
          <p
            className="text-[11px] font-mono px-3 py-4"
            style={{ color: "var(--brand-muted)" }}
          >
            {search ? "no results" : "no docs published yet"}
          </p>
        )}
        {Object.entries(groupedDocs).map(([cat, catDocs]) => (
          <div key={cat} className={`mb-2 w-full ${isSidebarCollapsed ? "flex flex-col items-center" : ""}`}>
            {!isSidebarCollapsed && (
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-2 py-1.5 mb-0.5 text-[10px] font-mono font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                style={{ color: "var(--brand-muted)" }}
              >
                <span>{cat}</span>
                <ChevronRight
                  size={9}
                  className={`transition-transform duration-200 ${collapsedCategories.has(cat) ? "" : "rotate-90"}`}
                />
              </button>
            )}
            
            {isSidebarCollapsed && (
                <div className="w-8 h-px bg-white/5 my-2" />
            )}

            {(!isSidebarCollapsed && collapsedCategories.has(cat)) ? null : (
              (catDocs as DocMeta[]).map((item: DocMeta) => (
                <Link
                  key={item.slug}
                  to={`/documentation/${item.slug}`}
                  title={isSidebarCollapsed ? item.title : ""}
                  className={`flex items-center rounded-lg transition-all duration-150 ${
                    isSidebarCollapsed ? "justify-center p-2.5 w-10 h-10 mb-1" : "py-2 px-3 text-sm"
                  } ${
                    urlSlug === item.slug
                      ? "bg-white/[0.06] font-semibold text-white"
                      : "text-brand-muted hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {urlSlug === item.slug && !isSidebarCollapsed && (
                    <span className="w-[2px] h-4 rounded-full mr-2.5 shrink-0 bg-white" />
                  )}
                  {isSidebarCollapsed ? (
                      <span className="text-[10px] font-mono font-black uppercase text-brand-primary">{item.title.charAt(0)}</span>
                  ) : (
                      <span className="truncate text-[13px]">{item.title}</span>
                  )}
                </Link>
              ))
            )}
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <div
      className="flex font-sans"
      style={{
        height: "calc(100vh - 64px)",
        marginTop: "64px",
        backgroundColor: "var(--brand-bg)",
        color: "var(--brand-text)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Mobile overlay ────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar — desktop always visible, mobile drawer ───────────────── */}
      <aside
        className="flex flex-col shrink-0 border-r transition-all duration-300 ease-in-out"
        style={{
          width: isSidebarCollapsed ? 80 : 272,
          borderColor: "rgba(255,255,255,0.05)",
          backgroundColor: "var(--brand-card)",
          // Mobile: fixed drawer, Desktop: persistent
          position: "fixed" as const,
          top: 64,
          left: 0,
          bottom: 0,
          zIndex: 40,
          transform: sidebarOpen || (typeof window !== 'undefined' && window.matchMedia("(min-width: 768px)").matches) ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1), width 0.3s ease-in-out",
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Desktop sidebar spacer ─────────────────────────────────────────── */}
      <div className="hidden md:block shrink-0 transition-all duration-300 ease-in-out" style={{ width: isSidebarCollapsed ? 80 : 272 }} />

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main
        className="flex-1 overflow-y-auto min-w-0"
        style={{ backgroundColor: "var(--brand-bg)" }}
      >
        {/* Mobile top bar */}
        <div
          className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b"
          style={{
            backgroundColor: "var(--brand-bg)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <Menu size={18} />
            <span className="text-xs font-mono uppercase tracking-wider">
              Menu
            </span>
          </button>
          {docData && (
            <>
              <span className="text-white/20 text-xs">/</span>
              <span className="text-xs text-white/50 truncate">
                {docData.title}
              </span>
            </>
          )}
        </div>

        <div className="max-w-3xl px-4 sm:px-6 pt-6 pb-24">
          {loading && (
            <div
              className="font-mono text-[10px] tracking-widest"
              style={{ color: "var(--brand-primary)" }}
            >
              &gt; FETCHING_RESOURCES...
            </div>
          )}

          {!loading && notFound && (
            <div className="h-[40vh] flex items-center font-mono text-xs opacity-50">
              [!] 404_PAGE_NOT_FOUND
            </div>
          )}

          {!loading && !notFound && docData && (
            <>
              {/* Breadcrumb */}
              <nav
                className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono mb-5"
                style={{ color: "var(--brand-muted)" }}
              >
                {breadcrumb.map((crumb, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <ChevronRight size={10} className="opacity-50" />}
                    {crumb.href && crumb.href !== "#" ? (
                      <Link
                        to={crumb.href}
                        className="hover:text-white transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={
                          i === breadcrumb.length - 1 ? "text-gray-400" : ""
                        }
                      >
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </nav>

              {/* Doc header */}
              <header className="mb-6 pb-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span
                    className="text-[10px] font-mono text-white/30 uppercase tracking-widest"
                    style={{
                      borderRadius: 4,
                      padding: "2px 8px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {docData.category || "General"}
                  </span>
                  <span className="text-[10px] text-white/20 font-mono">
                    updated{" "}
                    {new Date(docData.lastUpdated).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                  {docData.title}
                </h1>
              </header>
            </>
          )}

          <div
            className="prose prose-invert max-w-none"
            style={{
              display: loading || notFound || !docData ? "none" : "block",
            }}
          >
            <EditorContent editor={editor} />
          </div>

          {/* Prev / Next navigation */}
          {!loading &&
            !notFound &&
            docData &&
            (() => {
              const currentIndex = docList.findIndex((d: DocMeta) => d.slug === urlSlug);
              const prev = currentIndex > 0 ? docList[currentIndex - 1] : null;
              const next =
                currentIndex < docList.length - 1
                  ? docList[currentIndex + 1]
                  : null;
              if (!prev && !next) return null;
              return (
                <div className="flex items-stretch gap-3 mt-16 pt-8 border-t border-white/[0.06]">
                  {prev ? (
                    <Link
                      to={`/documentation/${prev.slug}`}
                      className="flex-1 flex flex-col gap-1 px-5 py-4 rounded-xl transition-all group"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <span
                        className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5"
                        style={{ color: "var(--brand-muted)" }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </span>
                      <span className="text-sm font-semibold text-white truncate">
                        {prev.title}
                      </span>
                      <span
                        className="text-[11px] font-mono"
                        style={{ color: "var(--brand-muted)" }}
                      >
                        {prev.category}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex-1" />
                  )}

                  {next ? (
                    <Link
                      to={`/documentation/${next.slug}`}
                      className="flex-1 flex flex-col gap-1 px-5 py-4 rounded-xl transition-all group text-right"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <span
                        className="text-[10px] font-mono uppercase tracking-widest flex items-center justify-end gap-1.5"
                        style={{ color: "var(--brand-muted)" }}
                      >
                        Next
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                      <span className="text-sm font-semibold text-white truncate">
                        {next.title}
                      </span>
                      <span
                        className="text-[11px] font-mono"
                        style={{ color: "var(--brand-muted)" }}
                      >
                        {next.category}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex-1" />
                  )}
                </div>
              );
            })()}
        </div>
      </main>

      {/* Desktop sidebar — always visible via CSS */}
      <style>{`
        @media (min-width: 768px) {
          aside[style] {
            position: sticky !important;
            top: 0 !important;
            transform: translateX(0) !important;
            height: calc(100vh - 64px) !important;
          }
        }

        .ProseMirror { outline: none; }
        .ProseMirror h1 { font-size: clamp(1.6rem, 5vw, 2.4rem); font-weight: 800; color: #fafafa; margin-top: 2rem; margin-bottom: 0.5rem; line-height: 1.15; letter-spacing: -0.03em; }
        .ProseMirror h2 { font-size: clamp(1.2rem, 3vw, 1.6rem); font-weight: 700; color: #e4e4e7; margin-top: 2rem; margin-bottom: 0.6rem; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.07); letter-spacing: -0.02em; }
        .ProseMirror h3 { font-size: 1.1rem; font-weight: 700; color: #d4d4d8; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .ProseMirror p { font-size: 0.95rem; line-height: 1.75; color: #a1a1aa; margin-bottom: 0.75rem; }
        .ProseMirror ul { padding-left: 1.25rem; list-style: disc; color: #a1a1aa; margin-bottom: 0.75rem; }
        .ProseMirror ol { padding-left: 1.25rem; list-style: decimal; color: #a1a1aa; margin-bottom: 0.75rem; }
        .ProseMirror li { margin-bottom: 0.35rem; line-height: 1.75; }
        .ProseMirror strong { color: #e4e4e7; font-weight: 600; }
        .ProseMirror em { color: #d4d4d8; font-style: italic; }
        .ProseMirror s { color: #52525b; }
        .ProseMirror hr { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 1.5rem 0; }
        .ProseMirror blockquote { border-left: 2px solid rgba(255,255,255,0.2); padding: 0.6rem 1rem; margin: 1.5rem 0; background: rgba(255,255,255,0.02); border-radius: 0 8px 8px 0; color: #a1a1aa; font-style: italic; }
        .ProseMirror :not(pre) > code { color: #e4e4e7; background: rgba(255,255,255,0.06); padding: 0.18rem 0.45rem; border-radius: 5px; font-size: 0.82em; font-family: 'JetBrains Mono', monospace; border: 1px solid rgba(255,255,255,0.1); }
        .ProseMirror pre { position: relative; background: #0c0c0e !important; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; margin: 0.75rem 0; overflow: hidden; }
        .ProseMirror pre::before { content: ''; display: flex; padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.015); }
        .ProseMirror pre code { background: none !important; border: none !important; color: #cbd5e1; font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; line-height: 1.8; display: block; padding: 1rem 1.1rem 1.25rem !important; overflow-x: auto; tab-size: 2; white-space: pre; }
        .hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: #c084fc; }
        .hljs-string, .hljs-attr { color: #86efac; }
        .hljs-function, .hljs-title { color: #93c5fd; }
        .hljs-comment, .hljs-quote { color: #4b5563; font-style: italic; }
        .hljs-number, .hljs-literal { color: #f9a8d4; }
        .hljs-variable, .hljs-template-variable { color: #fcd34d; }
        .hljs-type, .hljs-class { color: #67e8f9; }
        .hljs-operator, .hljs-punctuation { color: #71717a; }
        .hljs-tag { color: #fb7185; }
        .hljs-params { color: #fcd34d; }
        .copy-code-btn { position: absolute; top: 8px; right: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 4px 10px; cursor: pointer; font-size: 10px; font-family: 'JetBrains Mono', monospace; color: rgba(255,255,255,0.4); display: flex; align-items: center; gap: 4px; transition: all 0.15s; opacity: 1; }
        @media (hover: hover) { .ProseMirror pre:hover .copy-code-btn { opacity: 1; } .copy-code-btn { opacity: 0; } }
        .copy-code-btn:hover { background: rgba(255,255,255,0.07); color: #fafafa; }
        .copy-code-btn.copied { background: rgba(255,255,255,0.07); color: #86efac; opacity: 1; }
        .ProseMirror img { display: block; margin: 2rem auto; max-width: 100%; height: auto; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); }
        nav::-webkit-scrollbar { width: 3px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 4px; }
      `}</style>

      <CopyButtonInjector docSlug={urlSlug} />
    </div>
  );
};

const COPY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

const CopyButtonInjector = ({ docSlug }: { docSlug?: string }) => {
  useEffect(() => {
    const inject = (pre: HTMLElement) => {
      if (pre.querySelector(".copy-code-btn")) return;
      const btn = document.createElement("button");
      btn.className = "copy-code-btn";
      btn.innerHTML = `${COPY_SVG} Copy`;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const code = pre.querySelector("code")?.textContent ?? "";
        navigator.clipboard.writeText(code).then(() => {
          btn.className = "copy-code-btn copied";
          btn.innerHTML = `${CHECK_SVG} Copied!`;
          setTimeout(() => {
            btn.className = "copy-code-btn";
            btn.innerHTML = `${COPY_SVG} Copy`;
          }, 2000);
        });
      });
      pre.appendChild(btn);
    };

    const run = () => {
      document
        .querySelectorAll<HTMLElement>(".ProseMirror pre")
        .forEach(inject);
    };

    // Run immediately and after a short delay to catch async renders
    run();
    const t1 = setTimeout(run, 300);
    const t2 = setTimeout(run, 800);

    const observer = new MutationObserver(run);
    const pm = document.querySelector(".ProseMirror");
    if (pm) observer.observe(pm, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
    };
  }, [docSlug]); // re-run when doc changes

  return null;
};

export default DocumentationPage;
