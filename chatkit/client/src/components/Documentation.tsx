import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { common, createLowlight } from "lowlight";
import { Search, ChevronRight, X } from "lucide-react";

const lowlight = createLowlight(common);
const API = `${import.meta.env.VITE_ENDPOINT}/api/docs`;

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

  const [docList, setDocList] = useState<DocMeta[]>([]);
  const [docData, setDocData] = useState<DocData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );

  // ── Editor (read-only) ───────────────────────────────────────────────────
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

  // ── Fetch doc list ───────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/list`)
      .then((res) => res.json())
      .then((json) => {
        const list: DocMeta[] = json.success ? json.data : [];
        const published = list.filter((d) => d.status === "published");
        setDocList(published);
        if (!urlSlug && published.length > 0) {
          navigate(`/documentation/${published[0].slug}`, { replace: true });
        }
      })
      .catch(() => setDocList([]));
  }, [urlSlug, navigate]);

  // ── Fetch doc content ────────────────────────────────────────────────────
  useEffect(() => {
    if (!urlSlug) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setNotFound(false);
    setDocData(null);

    fetch(`${API}/get/${urlSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => {
        if (json.success && json.data) setDocData(json.data);
        else setNotFound(true);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [urlSlug]);

  // ── Sync editor content ──────────────────────────────────────────────────
  useEffect(() => {
    if (!editor || !docData?.content) return;
    editor.commands.setContent(docData.content);
  }, [docData, editor]);

  // ── Search filter ────────────────────────────────────────────────────────
  const filteredList = useMemo(() => {
    if (!search.trim()) return docList;
    return docList.filter(
      (d) =>
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.category.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, docList]);

  // ── Group by category ────────────────────────────────────────────────────
  const groupedDocs = useMemo(() => {
    return filteredList.reduce(
      (acc, doc) => {
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

  // ── Breadcrumb ───────────────────────────────────────────────────────────
  const breadcrumb = docData
    ? [
        { label: "Docs", href: "/documentation" },
        { label: docData.category || "General", href: "#" },
        { label: docData.title, href: null },
      ]
    : [];

  return (
    <div
      className="flex font-sans overflow-hidden"
      style={{
        height: "calc(100vh - 64px)",
        marginTop: "64px",
        backgroundColor: "var(--brand-bg)",
        color: "var(--brand-text)",
      }}
    >
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className="w-64 md:w-72 border-r flex flex-col shrink-0"
        style={{
          borderColor: "rgba(255,255,255,0.05)",
          backgroundColor: "var(--brand-card)",
        }}
      >
        {/* Logo Section */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-6">
            <div
              className="w-5 h-5 rounded-md bg-white"
            />
            <span
              className="font-bold tracking-widest text-[11px] uppercase"
              style={{ color: "var(--brand-muted)" }}
            >
              Documentation
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--brand-muted)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search docs..."
              className="w-full bg-white/[0.03] border rounded-lg pl-8 pr-8 py-2 text-xs transition-colors"
              style={{
                borderColor: "rgba(255,255,255,0.05)",
                color: "var(--brand-text)",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                style={{ color: "var(--brand-muted)" }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-8">
          {Object.keys(groupedDocs).length === 0 && (
            <p
              className="text-[11px] font-mono px-3 py-4"
              style={{ color: "var(--brand-muted)" }}
            >
              {search ? "no results" : "no docs published yet"}
            </p>
          )}

          {Object.entries(groupedDocs).map(([cat, catDocs]) => (
            <div key={cat} className="mb-3">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-2 py-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                style={{ color: "var(--brand-muted)" }}
              >
                <span>{cat}</span>
                <ChevronRight
                  size={10}
                  className={`transition-transform duration-200 ${collapsedCategories.has(cat) ? "" : "rotate-90"}`}
                />
              </button>

              {!collapsedCategories.has(cat) &&
                catDocs.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/documentation/${item.slug}`}
                    className={`flex items-center py-2 px-3 rounded-lg text-sm transition-all duration-150 group ${
                      urlSlug === item.slug
                        ? "bg-white/[0.06] font-semibold text-white"
                        : "text-brand-muted hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    {urlSlug === item.slug && (
                      <span
                        className="w-[2px] h-4 rounded-full mr-2.5 shrink-0 bg-white"
                      />
                    )}
                    <span className="truncate">{item.title}</span>
                  </Link>
                ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: "var(--brand-bg)" }}
      >
        <div className="max-w-3xl mx-auto px-8 lg:px-16 pt-10 pb-24">
          {/* Loading */}
          {loading && (
            <div
              className="font-mono text-[10px]  tracking-widest"
              style={{ color: "var(--brand-primary)" }}
            >
              &gt; FETCHING_RESOURCES...
            </div>
          )}

          {/* 404 */}
          {!loading && notFound && (
            <div className="h-[40vh] flex items-center font-mono text-xs opacity-50">
              [!] 404_PAGE_NOT_FOUND
            </div>
          )}

          {/* Content */}
          {!loading && !notFound && docData && (
            <>
              {/* Breadcrumb */}
              <nav
                className="flex items-center gap-1.5 text-[11px] font-mono mb-10"
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
              <header className="mb-10 pb-8 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest"
                    style={{ borderRadius: 4, padding: "2px 8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    {docData.category || "General"}
                  </span>
                  <span className="text-[10px] text-white/20 font-mono">
                    updated {new Date(docData.lastUpdated).toLocaleDateString("en-GB", {day:"numeric",month:"short",year:"numeric"})}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                  {docData.title}
                </h1>
              </header>
            </>
          )}

          {/* Editor */}
          <div
            className="prose prose-invert max-w-none"
            style={{
              display: loading || notFound || !docData ? "none" : "block",
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </main>

      <style>{`
        /* ── Base ── */
        .ProseMirror { outline: none; }

        /* ── Headings ── */
        .ProseMirror h1 {
          font-size: 2.4rem; font-weight: 800; color: #fafafa;
          margin-top: 3rem; margin-bottom: 0.75rem; line-height: 1.15;
          letter-spacing: -0.03em;
        }
        .ProseMirror h2 {
          font-size: 1.6rem; font-weight: 700; color: #e4e4e7;
          margin-top: 3rem; margin-bottom: 1rem;
          padding-bottom: 0.6rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          letter-spacing: -0.02em;
        }
        .ProseMirror h3 {
          font-size: 1.15rem; font-weight: 700; color: #d4d4d8;
          margin-top: 2rem; margin-bottom: 0.75rem;
          letter-spacing: -0.01em;
        }

        /* ── Body ── */
        .ProseMirror p { font-size: 0.97rem; line-height: 1.85; color: #a1a1aa; margin-bottom: 1.1rem; }
        .ProseMirror ul { padding-left: 1.5rem; list-style: disc; color: #a1a1aa; margin-bottom: 1.5rem; }
        .ProseMirror ol { padding-left: 1.5rem; list-style: decimal; color: #a1a1aa; margin-bottom: 1.5rem; }
        .ProseMirror li { margin-bottom: 0.35rem; line-height: 1.75; }
        .ProseMirror strong { color: #e4e4e7; font-weight: 600; }
        .ProseMirror em     { color: #d4d4d8; font-style: italic; }
        .ProseMirror s      { color: #52525b; }
        .ProseMirror hr     { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 2.5rem 0; }

        /* ── Blockquote ── */
        .ProseMirror blockquote {
          border-left: 2px solid rgba(255,255,255,0.2);
          padding: 0.6rem 1.25rem; margin: 1.5rem 0;
          background: rgba(255,255,255,0.02); border-radius: 0 8px 8px 0;
          color: #a1a1aa; font-style: italic;
        }

        /* ── Inline code ── */
        .ProseMirror :not(pre) > code {
          color: #e4e4e7;
          background: rgba(255,255,255,0.06);
          padding: 0.18rem 0.45rem; border-radius: 5px;
          font-size: 0.82em;
          font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* ── Code blocks ── */
        .ProseMirror pre {
          position: relative;
          background: #0c0c0e !important;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; margin: 1.75rem 0;
          overflow: hidden;
        }
        /* macOS traffic lights */
        .ProseMirror pre::before {
          content: '';
          display: flex;
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.015);
        }
        .ProseMirror pre code {
          background: none !important; border: none !important; padding: 0 !important;
          color: #cbd5e1;
          font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
          font-size: 0.845rem; line-height: 1.8;
          display: block; padding: 1.1rem 1.25rem 1.25rem !important;
          overflow-x: auto;
          tab-size: 2;
        }

        /* ── CLI / command highlighting ── */
        .hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: #c084fc; }
        .hljs-string, .hljs-attr    { color: #86efac; }
        .hljs-function, .hljs-title { color: #93c5fd; }
        .hljs-comment, .hljs-quote  { color: #4b5563; font-style: italic; }
        .hljs-number, .hljs-literal { color: #f9a8d4; }
        .hljs-variable, .hljs-template-variable { color: #fcd34d; }
        .hljs-type, .hljs-class     { color: #67e8f9; }
        .hljs-operator, .hljs-punctuation { color: #71717a; }
        .hljs-tag    { color: #fb7185; }
        .hljs-params { color: #fcd34d; }

        /* copy button */
        .copy-code-btn {
          position: absolute; top: 8px; right: 10px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px; padding: 4px 10px; cursor: pointer;
          font-size: 10px; font-family: 'JetBrains Mono', monospace;
          color: rgba(255,255,255,0.3);
          display: flex; align-items: center; gap: 4px;
          transition: all 0.15s; opacity: 0;
          letter-spacing: 0.02em;
        }
        .ProseMirror pre:hover .copy-code-btn { opacity: 1; }
        .copy-code-btn:hover  { background: rgba(255,255,255,0.07); color: #fafafa; }
        .copy-code-btn.copied { background: rgba(255,255,255,0.07); color: #86efac; opacity: 1; }

        /* ── Images ── */
        .ProseMirror img.doc-image, .ProseMirror img {
          display: block; margin: 2rem auto; max-width: 100%; height: auto;
          border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .ProseMirror img:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.8); transform: translateY(-1px); }

        /* ── Scrollbar ── */
        .ProseMirror ::-webkit-scrollbar { height: 4px; }
        .ProseMirror ::-webkit-scrollbar-track { background: transparent; }
        .ProseMirror ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

        /* ── Sidebar scrollbar ── */
        nav::-webkit-scrollbar { width: 3px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 4px; }
      `}</style>

      <CopyButtonInjector />
    </div>
  );
};

// ── Copy Button Injector ──────────────────────────────────────────────────────
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
      document
        .querySelectorAll<HTMLElement>(".ProseMirror pre")
        .forEach(inject);
    });
    const pm = document.querySelector(".ProseMirror");
    if (pm) observer.observe(pm, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
};

export default DocumentationPage;
