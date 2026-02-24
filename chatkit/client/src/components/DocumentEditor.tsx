import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  Save,
  Bold,
  Code,
  Heading1,
  Heading2,
  List,
  Plus,
  FileText,
  Trash2,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Italic,
  Strikethrough,
  GripVertical,
  Tag,
} from "lucide-react";

const lowlight = createLowlight(common);
const API = "http://localhost:8080/api/docs";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DocMeta {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  lastUpdated: string;
  category: string;
}

interface ToastState {
  message: string;
  type: "success" | "error";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── Toolbar Button ───────────────────────────────────────────────────────────
const ToolbarButton = ({
  onClick,
  icon,
  active,
  title,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  active?: boolean;
  title?: string;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-md transition-all duration-150 ${
      active
        ? "bg-[#00ff41] text-black"
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    }`}
  >
    {icon}
  </button>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-mono ${
        toast.type === "success"
          ? "bg-[#050505] border-[#00ff41]/30 text-[#00ff41]"
          : "bg-[#050505] border-red-500/30 text-red-400"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle size={16} />
      ) : (
        <AlertCircle size={16} />
      )}
      {toast.message}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DocumentEditor = () => {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("General");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ message, type });

  // ── Editor ───────────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [StarterKit, CodeBlockLowlight.configure({ lowlight })],
    content: "<h1></h1><p></p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[500px] py-10",
      },
    },
  });

  // ── Fetch docs ───────────────────────────────────────────────────────────
  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch(`${API}/list`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setDocs(json.data);
    } catch {
      showToast("Failed to load documents", "error");
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // ── Group docs by category ───────────────────────────────────────────────
  const groupedDocs = docs.reduce(
    (acc, doc) => {
      const cat = doc.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(doc);
      return acc;
    },
    {} as Record<string, DocMeta[]>,
  );

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  // ── Open doc ─────────────────────────────────────────────────────────────
  const openDoc = async (slug: string) => {
    if (!editor) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/get/${slug}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        const doc = json.data;
        setActiveDocId(doc._id);
        setTitle(doc.title);
        setSlug(doc.slug);
        setCategory(doc.category || "General");
        setStatus(doc.status);
        setSlugManuallyEdited(true);
        editor.commands.setContent(doc.content);
      } else {
        showToast("Failed to load document", "error");
      }
    } catch {
      showToast("Failed to load document", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ── New doc ──────────────────────────────────────────────────────────────
  const handleNew = () => {
    if (!editor) return;
    setActiveDocId(null);
    setTitle("");
    setSlug("");
    setCategory("General");
    setStatus("draft");
    setSlugManuallyEdited(false);
    editor.commands.setContent("<h1></h1><p></p>");
    setTimeout(() => editor.commands.focus("start"), 0);
  };

  // ── Extract H1 from editor ───────────────────────────────────────────────
  const extractTitleFromEditor = (): string => {
    if (!editor) return "Untitled Document";
    const json = editor.getJSON();
    const firstNode = json.content?.[0];
    if (firstNode?.type === "heading" && firstNode?.attrs?.level === 1) {
      const text =
        firstNode.content?.map((n: any) => n.text || "").join("") || "";
      return text.trim() || "Untitled Document";
    }
    return title?.trim() || "Untitled Document";
  };

  // ── Save / Publish ────────────────────────────────────────────────────────
  const handleSave = async (publishStatus: "draft" | "published") => {
    if (!editor) return;
    setIsSaving(true);
    try {
      const content = editor.getJSON();
      const derivedTitle = extractTitleFromEditor();
      const derivedSlug = slugManuallyEdited ? slug : toSlug(derivedTitle);

      setTitle(derivedTitle);
      setSlug(derivedSlug);

      const endpoint = activeDocId
        ? `${API}/update/${activeDocId}`
        : `${API}/save`;
      const method = activeDocId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: derivedTitle,
          slug: derivedSlug,
          content,
          status: publishStatus,
          category: category.trim() || "General",
        }),
      });

      const result = await res.json();
      if (result.success) {
        setActiveDocId(result.data._id);
        setStatus(publishStatus);
        showToast(
          publishStatus === "published" ? "🚀 Published!" : "Draft saved",
          "success",
        );
        fetchDocs();
      } else {
        showToast(result.message || "Save failed", "error");
      }
    } catch {
      showToast("Save failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (slugToDelete: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API}/delete/${slugToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        showToast("Document deleted", "success");
        setConfirmDelete(null);
        if (slug === slugToDelete) handleNew();
        fetchDocs();
      } else {
        showToast(result.message || "Delete failed", "error");
      }
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Drag to reorder ──────────────────────────────────────────────────────
  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    setDocs((prev) => {
      const from = prev.findIndex((d) => d._id === draggedId);
      const to = prev.findIndex((d) => d._id === targetId);
      if (from === -1 || to === -1) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  };

  const handleDragEnd = async () => {
    setDraggedId(null);
    try {
      await fetch(`${API}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: docs.map((d) => d._id) }),
      });
    } catch {
      showToast("Failed to save order", "error");
    }
  };

  if (!editor) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans flex flex-col selection:bg-[#00ff41] selection:text-black">
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-white/5">
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="text-gray-500 hover:text-white transition-colors p-1 rounded"
            >
              <ChevronRight
                size={18}
                className={`transition-transform duration-200 ${sidebarOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div className="flex flex-col min-w-0 flex-grow">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent border-none text-lg font-bold text-white focus:ring-0 w-full outline-none placeholder:opacity-30 truncate"
                placeholder="Title auto-read from H1..."
              />
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 flex-wrap">
                <span className="text-[#00ff41]">~/docs/</span>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className="bg-transparent border-none focus:ring-0 outline-none p-0 text-[#00ff41] min-w-0 w-32"
                  placeholder="auto-slug"
                />
                <span className="text-gray-700">|</span>
                <Tag size={10} className="text-gray-600" />
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 outline-none p-0 text-gray-400 hover:text-white min-w-0 w-24"
                  placeholder="Category"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeDocId && (
              <span
                className={`text-[10px] font-mono px-2 py-1 rounded-full border ${
                  status === "published"
                    ? "border-[#00ff41]/30 text-[#00ff41]"
                    : "border-yellow-500/30 text-yellow-400"
                }`}
              >
                {status}
              </span>
            )}
            <button
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-white/10 text-gray-300 hover:border-white/20 hover:text-white transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save Draft
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={isSaving}
              className="flex items-center gap-1.5 text-sm bg-[#00ff41] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#00cc33] transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Publish
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-1.5 flex items-center gap-1 border-t border-white/5">
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            icon={<Heading1 size={15} />}
            active={editor.isActive("heading", { level: 1 })}
            title="H1"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            icon={<Heading2 size={15} />}
            active={editor.isActive("heading", { level: 2 })}
            title="H2"
          />
          <div className="w-px h-4 bg-white/10 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            icon={<Bold size={15} />}
            active={editor.isActive("bold")}
            title="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            icon={<Italic size={15} />}
            active={editor.isActive("italic")}
            title="Italic"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            icon={<Strikethrough size={15} />}
            active={editor.isActive("strike")}
            title="Strike"
          />
          <div className="w-px h-4 bg-white/10 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            icon={<Code size={15} />}
            active={editor.isActive("codeBlock")}
            title="Code Block"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            icon={<List size={15} />}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          />
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 shrink-0 border-r border-white/5 flex flex-col bg-[#080808]">
            <div className="p-3 border-b border-white/5">
              <button
                onClick={handleNew}
                className="w-full flex items-center justify-center gap-2 text-sm py-2 px-3 rounded-lg border border-dashed border-white/10 text-gray-400 hover:border-[#00ff41]/40 hover:text-[#00ff41] transition-all"
              >
                <Plus size={14} /> New Document
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {docs.length === 0 && (
                <p className="text-center text-gray-600 text-xs font-mono py-8">
                  no documents yet
                </p>
              )}

              {/* Grouped by category */}
              {Object.entries(groupedDocs).map(([cat, catDocs]) => (
                <div key={cat} className="mb-2">
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    <span>{cat}</span>
                    <ChevronRight
                      size={10}
                      className={`transition-transform duration-200 ${collapsedCategories.has(cat) ? "" : "rotate-90"}`}
                    />
                  </button>

                  {/* Docs under category */}
                  {!collapsedCategories.has(cat) &&
                    catDocs.map((doc) => (
                      <div
                        key={doc._id}
                        draggable
                        onDragStart={() => handleDragStart(doc._id)}
                        onDragOver={(e) => handleDragOver(e, doc._id)}
                        onDragEnd={handleDragEnd}
                        className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                          activeDocId === doc._id
                            ? "bg-white/5 text-white"
                            : "text-gray-500 hover:bg-white/[0.03] hover:text-gray-300"
                        } ${draggedId === doc._id ? "opacity-40 scale-95" : ""}`}
                        onClick={() => openDoc(doc.slug)}
                      >
                        <GripVertical
                          size={12}
                          className="shrink-0 text-gray-700 cursor-grab active:cursor-grabbing"
                        />
                        <FileText size={13} className="shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {doc.title}
                          </p>
                          <p className="text-[10px] font-mono text-gray-600 truncate">
                            {timeAgo(doc.lastUpdated)}
                            {doc.status === "draft" && (
                              <span className="ml-1 text-yellow-600">
                                • draft
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Delete */}
                        {confirmDelete === doc.slug ? (
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleDelete(doc.slug)}
                              disabled={isDeleting}
                              className="text-[10px] text-red-400 hover:text-red-300 font-mono"
                            >
                              {isDeleting ? "..." : "yes"}
                            </button>
                            <span className="text-gray-600 text-[10px]">/</span>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-[10px] text-gray-500 hover:text-gray-300 font-mono"
                            >
                              no
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete(doc.slug);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Editor */}
        <main className="flex-1 overflow-y-auto relative">
          {isLoading && (
            <div className="absolute inset-0 bg-[#050505]/80 flex items-center justify-center z-10">
              <Loader2 size={24} className="animate-spin text-[#00ff41]" />
            </div>
          )}
          <div className="max-w-3xl mx-auto px-8">
            <EditorContent editor={editor} />
          </div>
        </main>
      </div>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      <style>{`
        .ProseMirror { min-height: 500px; }
        .ProseMirror h1 { font-size: 2.8rem; font-weight: 800; color: white; margin-bottom: 1.5rem; margin-top: 3rem; }
        .ProseMirror h2 { font-size: 1.6rem; color: white; margin-top: 2.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem; }
        .ProseMirror p { font-size: 1.05rem; line-height: 1.8; color: #a1a1aa; margin: 0.75rem 0; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5rem; color: #a1a1aa; }
        .ProseMirror pre { background: #000 !important; border: 1px solid rgba(255,255,255,0.08); padding: 1.25rem; border-radius: 10px; margin: 1.5rem 0; overflow-x: auto; }
        .ProseMirror code { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: #00ff41; }
        .ProseMirror strong { color: white; }
        .ProseMirror em { color: #d4d4d8; }
        .ProseMirror s { color: #71717a; }
      `}</style>
    </div>
  );
};

export default DocumentEditor;
