import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Search, ChevronRight, X } from "lucide-react";

const lowlight = createLowlight(common);
const API = "http://localhost:8080/api/docs";

interface DocMeta {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  lastUpdated: string;
  category: string;
}

interface DocData extends DocMeta {
  content: any;
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

  // ── Editor ───────────────────────────────────────────────────────────────
  const editor = useEditor({
    editable: false,
    content: "",
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    immediatelyRender: false,
  });

  // ── Fetch list ───────────────────────────────────────────────────────────
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
      next.has(cat) ? next.delete(cat) : next.add(cat);
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
      className="flex bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden"
      style={{ height: "calc(100vh - 64px)", marginTop: "64px" }}
    >
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-64 md:w-72 border-r border-white/5 bg-[#070707] flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-4 h-4 bg-[#00ff41] rounded shadow-[0_0_10px_rgba(0,255,65,0.4)]" />
            <span className="font-bold tracking-widest text-[11px] text-gray-400 uppercase">
              Documentation
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search docs..."
              className="w-full bg-white/[0.03] border border-white/5 rounded-lg pl-8 pr-8 py-2 text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[#00ff41]/20 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-8">
          {Object.keys(groupedDocs).length === 0 && (
            <p className="text-[11px] font-mono text-gray-700 px-3 py-4">
              {search ? "no results" : "no docs published yet"}
            </p>
          )}

          {Object.entries(groupedDocs).map(([cat, catDocs]) => (
            <div key={cat} className="mb-3">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-2 py-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors"
              >
                <span>{cat}</span>
                <ChevronRight
                  size={10}
                  className={`transition-transform duration-200 ${collapsedCategories.has(cat) ? "" : "rotate-90"}`}
                />
              </button>

              {/* Docs */}
              {!collapsedCategories.has(cat) &&
                catDocs.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/documentation/${item.slug}`}
                    className={`flex items-center py-2 px-3 rounded-lg text-sm transition-all duration-150 ${
                      urlSlug === item.slug
                        ? "bg-white/[0.06] text-white font-medium"
                        : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.03]"
                    }`}
                  >
                    {urlSlug === item.slug && (
                      <span className="w-0.5 h-3.5 bg-[#00ff41] rounded-full mr-2.5 shrink-0" />
                    )}
                    <span className="truncate">{item.title}</span>
                  </Link>
                ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-[#050505]">
        <div className="max-w-3xl mx-auto px-8 lg:px-16 pt-10 pb-24">
          {/* Loading */}
          {loading && (
            <div className="font-mono text-[#00ff41] text-[10px] animate-pulse tracking-widest">
              &gt; FETCHING_RESOURCES...
            </div>
          )}

          {/* 404 */}
          {!loading && notFound && (
            <div className="h-[40vh] flex items-center font-mono text-gray-700 text-xs">
              [!] 404_PAGE_NOT_FOUND
            </div>
          )}

          {/* Content */}
          {!loading && !notFound && docData && (
            <>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-[11px] font-mono text-gray-600 mb-10">
                {breadcrumb.map((crumb, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <ChevronRight size={10} className="text-gray-700" />
                    )}
                    {crumb.href && crumb.href !== "#" ? (
                      <Link
                        to={crumb.href}
                        className="hover:text-gray-400 transition-colors"
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
              <header className="mb-10">
                <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
                  {docData.title}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="h-px w-12 bg-[#00ff41] opacity-40" />
                  <span className="text-[10px] font-mono text-gray-600">
                    last updated{" "}
                    {new Date(docData.lastUpdated).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </header>
            </>
          )}

          {/* Editor — always mounted */}
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
        .ProseMirror { outline: none; }
        .ProseMirror h1 { font-size: 2.5rem; font-weight: 800; color: white; margin-top: 3rem; margin-bottom: 1rem; }
        .ProseMirror h2 { font-size: 1.8rem; color: white; margin-top: 3.5rem; margin-bottom: 1.25rem; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem; }
        .ProseMirror p { font-size: 1.1rem; line-height: 1.8; color: #a1a1aa; margin-bottom: 1.5rem; }
        .ProseMirror ul { padding-left: 1.5rem; list-style: disc; color: #a1a1aa; margin-bottom: 1.5rem; }
        .ProseMirror ul li { margin-bottom: 0.4rem; }
        .ProseMirror strong { color: #e4e4e7; }
        .ProseMirror em { color: #d4d4d8; font-style: italic; }
        .ProseMirror s { color: #71717a; }
        .ProseMirror pre { background: #000 !important; border: 1px solid rgba(255,255,255,0.05); padding: 1.25rem; border-radius: 6px; margin: 2rem 0; font-family: 'JetBrains Mono', monospace; overflow-x: auto; }
        .ProseMirror code { color: #00ff41; background: rgba(0,255,65,0.05); padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.85em; }
        .ProseMirror pre code { background: none; padding: 0; color: inherit; }
        .hljs-keyword { color: #ff79c6; }
        .hljs-string { color: #f1fa8c; }
        .hljs-function { color: #50fa7b; }
        .hljs-comment { color: #6272a4; font-style: italic; }
        .hljs-number { color: #bd93f9; }
        .hljs-operator { color: #ff79c6; }
      `}</style>
    </div>
  );
};

export default DocumentationPage;
