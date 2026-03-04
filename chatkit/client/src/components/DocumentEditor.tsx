import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
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
  Image as ImageIcon,
  Link,
  Quote,
  Minus,
  ListOrdered,
} from "lucide-react";

const lowlight = createLowlight(common);
const API = "http://localhost:8080/api/docs";
const UPLOAD = "http://localhost:8080/hermes/upload";

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
const toSlug = (t: string) =>
  t
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

// ─── Upload image to server, get back a URL ───────────────────────────────────
const uploadImage = async (file: File, token: string): Promise<string> => {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(UPLOAD, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");
  return data.url ?? data.secure_url ?? data.data?.url;
};

// ─── Toolbar Button ───────────────────────────────────────────────────────────
const TB = ({
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
        ? "bg-[var(--brand-primary)] text-black shadow-[0_0_10px_rgba(57,255,20,0.3)]"
        : "text-[var(--brand-muted)] hover:bg-white/5 hover:text-[var(--brand-text)]"
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
          ? "bg-[var(--brand-card)] border-[var(--brand-primary)]/30 text-[var(--brand-primary)]"
          : "bg-[var(--brand-card)] border-red-500/30 text-red-400"
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

// ─── Copy Button Injector (for code blocks) ───────────────────────────────────
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
  const [imageUploading, setImageUploading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  // Store token so image upload can auth — set this from wherever you auth in your app
  const token = useRef<string>(sessionStorage.getItem("hermes_token") ?? "");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ message, type });

  // ── Insert image: upload to server, insert URL into editor ───────────────
  const insertImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (!token.current) {
      showToast("No auth token — log in first", "error");
      return;
    }
    setImageUploading(true);
    try {
      const url = await uploadImage(file, token.current);
      editor?.chain().focus().setImage({ src: url }).run();
      showToast("Image uploaded ✓", "success");
    } catch (err: any) {
      showToast(err.message ?? "Image upload failed", "error");
    } finally {
      setImageUploading(false);
    }
  }, []);

  // ── Editor ───────────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "doc-image" },
      }),
    ],
    content: "<h1></h1><p></p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[500px] py-10",
      },
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items ?? []);
        const img = items.find((i) => i.type.startsWith("image/"));
        if (!img) return false;
        event.preventDefault();
        const file = img.getAsFile();
        if (file) insertImage(file);
        return true;
      },
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files ?? []);
        const img = files.find((f) => f.type.startsWith("image/"));
        if (!img) return false;
        event.preventDefault();
        insertImage(img);
        return true;
      },
    },
  });

  // ── Fetch doc list ───────────────────────────────────────────────────────
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

  const groupedDocs = docs.reduce(
    (acc, doc) => {
      const cat = doc.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(doc);
      return acc;
    },
    {} as Record<string, DocMeta[]>,
  );

  const toggleCat = (cat: string) =>
    setCollapsedCats((p) => {
      const n = new Set(p);
      n.has(cat) ? n.delete(cat) : n.add(cat);
      return n;
    });

  // ── Open doc ─────────────────────────────────────────────────────────────
  const openDoc = async (docSlug: string) => {
    if (!editor) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/get/${docSlug}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load");
      const doc = json.data;
      setActiveDocId(doc._id);
      setTitle(doc.title);
      setSlug(doc.slug);
      setCategory(doc.category || "General");
      setStatus(doc.status);
      setSlugManuallyEdited(true);
      editor.commands.setContent(doc.content);
    } catch (err: any) {
      showToast(err.message || "Failed to load document", "error");
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
  };

  const extractTitle = (): string => {
    if (!editor) return "Untitled Document";
    const first = editor.getJSON().content?.[0];
    if (first?.type === "heading" && first?.attrs?.level === 1) {
      const t = first.content?.map((n: any) => n.text || "").join("") || "";
      return t.trim() || "Untitled Document";
    }
    return title?.trim() || "Untitled Document";
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async (s: "draft" | "published") => {
    if (!editor) return;
    setIsSaving(true);
    try {
      const derivedTitle = extractTitle();
      const derivedSlug = slugManuallyEdited ? slug : toSlug(derivedTitle);
      const res = await fetch(
        activeDocId ? `${API}/update/${activeDocId}` : `${API}/save`,
        {
          method: activeDocId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: derivedTitle,
            slug: derivedSlug,
            content: editor.getJSON(),
            status: s,
            category: category.trim() || "General",
          }),
        },
      );
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Save failed");
      setActiveDocId(result.data._id);
      setStatus(s);
      showToast(s === "published" ? "🚀 Published!" : "Draft saved", "success");
      fetchDocs();
    } catch (err: any) {
      showToast(err.message || "Save failed", "error");
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
      if (!result.success) throw new Error(result.message);
      showToast("Document deleted", "success");
      setConfirmDelete(null);
      if (slug === slugToDelete) handleNew();
      fetchDocs();
    } catch (err: any) {
      showToast(err.message || "Delete failed", "error");
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
      const arr = [...prev];
      const from = arr.findIndex((d) => d._id === draggedId);
      const to = arr.findIndex((d) => d._id === targetId);
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return arr;
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
    <div
      className="min-h-screen flex flex-col font-sans selection:bg-[var(--brand-primary)] selection:text-black pt-16"
      style={{ backgroundColor: "var(--brand-bg)", color: "var(--brand-text)" }}
    >
      {/* Hidden file input for image upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) insertImage(f);
          e.target.value = "";
        }}
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          backgroundColor: "rgba(0,0,0,0.8)",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        {/* Title row */}
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="text-[var(--brand-muted)] hover:text-[var(--brand-text)] transition-colors p-1 rounded"
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
                className="bg-transparent border-none text-lg font-bold focus:ring-0 w-full outline-none placeholder:opacity-30 truncate"
                style={{ color: "var(--brand-text)" }}
                placeholder="Title auto-read from H1..."
              />
              <div
                className="flex items-center gap-2 text-[10px] font-mono flex-wrap"
                style={{ color: "var(--brand-muted)" }}
              >
                <span style={{ color: "var(--brand-primary)" }}>~/docs/</span>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className="bg-transparent border-none focus:ring-0 outline-none p-0 min-w-0 w-32"
                  style={{ color: "var(--brand-primary)" }}
                  placeholder="auto-slug"
                />
                <span className="opacity-20">|</span>
                <Tag size={10} className="opacity-60" />
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 outline-none p-0 min-w-0 w-24"
                  style={{ color: "var(--brand-muted)" }}
                  placeholder="Category"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeDocId && (
              <span
                className="text-[10px] font-mono px-2 py-1 rounded-full border"
                style={{
                  borderColor:
                    status === "published"
                      ? "rgba(57,255,20,0.3)"
                      : "rgba(234,179,8,0.3)",
                  color:
                    status === "published" ? "var(--brand-primary)" : "#eab308",
                }}
              >
                {status}
              </span>
            )}
            <button
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-all disabled:opacity-50"
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                color: "var(--brand-muted)",
              }}
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}{" "}
              Save Draft
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={isSaving}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50"
              style={{
                backgroundColor: "var(--brand-primary)",
                color: "black",
              }}
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}{" "}
              Publish
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div
          className="px-4 py-1.5 flex items-center gap-1 border-t flex-wrap"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <TB
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            icon={<Heading1 size={15} />}
            active={editor.isActive("heading", { level: 1 })}
            title="H1"
          />
          <TB
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            icon={<Heading2 size={15} />}
            active={editor.isActive("heading", { level: 2 })}
            title="H2"
          />
          <div
            className="w-px h-4 mx-1"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          />
          <TB
            onClick={() => editor.chain().focus().toggleBold().run()}
            icon={<Bold size={15} />}
            active={editor.isActive("bold")}
            title="Bold"
          />
          <TB
            onClick={() => editor.chain().focus().toggleItalic().run()}
            icon={<Italic size={15} />}
            active={editor.isActive("italic")}
            title="Italic"
          />
          <TB
            onClick={() => editor.chain().focus().toggleStrike().run()}
            icon={<Strikethrough size={15} />}
            active={editor.isActive("strike")}
            title="Strike"
          />
          <div
            className="w-px h-4 mx-1"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          />
          <TB
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            icon={<List size={15} />}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          />
          <TB
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            icon={<ListOrdered size={15} />}
            active={editor.isActive("orderedList")}
            title="Ordered List"
          />
          <TB
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            icon={<Quote size={15} />}
            active={editor.isActive("blockquote")}
            title="Blockquote"
          />
          <div
            className="w-px h-4 mx-1"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          />
          <TB
            onClick={() => editor.chain().focus().toggleCode().run()}
            icon={<Code size={15} />}
            active={editor.isActive("code")}
            title="Inline Code"
          />
          <TB
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            icon={
              <span className="text-[11px] font-mono font-bold leading-none">
                {"</>"}
              </span>
            }
            active={editor.isActive("codeBlock")}
            title="Code Block"
          />
          <TB
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            icon={<Minus size={15} />}
            title="Divider"
          />
          <div
            className="w-px h-4 mx-1"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          />

          {/* Image from file */}
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={imageUploading}
            title="Upload image"
            className={`p-2 rounded-md transition-all duration-150 flex items-center gap-1.5 ${
              imageUploading
                ? "opacity-50 cursor-not-allowed text-[var(--brand-muted)]"
                : "text-[var(--brand-muted)] hover:bg-white/5 hover:text-[var(--brand-text)]"
            }`}
          >
            {imageUploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ImageIcon size={15} />
            )}
            <span className="hidden sm:inline text-[11px] font-mono">
              {imageUploading ? "Uploading..." : "Image"}
            </span>
          </button>

          {/* Image from URL */}
          <button
            onClick={() => {
              const url = window.prompt("Paste image URL:");
              if (url?.trim())
                editor.chain().focus().setImage({ src: url.trim() }).run();
            }}
            title="Insert image from URL"
            className="p-2 rounded-md transition-all duration-150 text-[var(--brand-muted)] hover:bg-white/5 hover:text-[var(--brand-text)]"
          >
            <Link size={15} />
          </button>

          <span className="ml-2 text-[10px] font-mono opacity-20 hidden lg:block">
            Tip: paste or drag images directly into the editor
          </span>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside
            className="w-64 shrink-0 border-r flex flex-col"
            style={{
              backgroundColor: "var(--brand-card)",
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <div
              className="p-3 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              <button
                onClick={handleNew}
                className="w-full flex items-center justify-center gap-2 text-sm py-2 px-3 rounded-lg border border-dashed transition-all"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "var(--brand-muted)",
                }}
              >
                <Plus size={14} /> New Document
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {Object.entries(groupedDocs).map(([cat, catDocs]) => (
                <div key={cat} className="mb-2">
                  <button
                    onClick={() => toggleCat(cat)}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest hover:text-[var(--brand-text)] transition-colors"
                    style={{ color: "var(--brand-muted)" }}
                  >
                    <span>{cat}</span>
                    <ChevronRight
                      size={10}
                      className={`transition-transform duration-200 ${collapsedCats.has(cat) ? "" : "rotate-90"}`}
                    />
                  </button>
                  {!collapsedCats.has(cat) &&
                    catDocs.map((doc) => (
                      <div
                        key={doc._id}
                        draggable
                        onDragStart={() => handleDragStart(doc._id)}
                        onDragOver={(e) => handleDragOver(e, doc._id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => openDoc(doc.slug)}
                        className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                          activeDocId === doc._id
                            ? "bg-white/5 text-[var(--brand-text)]"
                            : "text-[var(--brand-muted)] hover:bg-white/[0.03] hover:text-[var(--brand-text)]"
                        } ${draggedId === doc._id ? "opacity-40 scale-95" : ""}`}
                      >
                        <GripVertical
                          size={12}
                          className="shrink-0 opacity-20 group-hover:opacity-100 cursor-grab"
                        />
                        <FileText size={13} className="shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {doc.title}
                          </p>
                          <p className="text-[10px] font-mono opacity-40 truncate">
                            {timeAgo(doc.lastUpdated)}
                            {doc.status === "draft" && (
                              <span className="ml-1 text-yellow-600">
                                • draft
                              </span>
                            )}
                          </p>
                        </div>
                        {confirmDelete === doc.slug ? (
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleDelete(doc.slug)}
                              disabled={isDeleting}
                              className="text-[10px] text-red-400 font-mono"
                            >
                              yes
                            </button>
                            <span className="opacity-20 text-[10px]">/</span>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-[10px] opacity-40 font-mono"
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
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
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
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-[2px]">
              <Loader2
                size={24}
                className="animate-spin"
                style={{ color: "var(--brand-primary)" }}
              />
            </div>
          )}
          <div className="max-w-3xl mx-auto px-8">
            <EditorContent editor={editor} />
          </div>
        </main>
      </div>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      <CopyButtonInjector />

      <style>{`
        .ProseMirror { min-height: 500px; }
        .ProseMirror h1 { font-size: 2.8rem; font-weight: 800; color: var(--brand-text); margin-bottom: 1.5rem; margin-top: 3rem; line-height: 1.15; }
        .ProseMirror h2 { font-size: 1.6rem; font-weight: 700; color: var(--brand-text); margin-top: 2.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; color: var(--brand-text); margin-top: 2rem; }
        .ProseMirror p  { font-size: 1.05rem; line-height: 1.8; color: var(--brand-muted); margin: 0.75rem 0; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5rem; color: var(--brand-muted); margin: 0.75rem 0; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; color: var(--brand-muted); margin: 0.75rem 0; }
        .ProseMirror li { margin: 0.35rem 0; line-height: 1.7; }
        .ProseMirror strong { color: var(--brand-text); font-weight: 700; }
        .ProseMirror em    { color: var(--brand-text); opacity: 0.8; }
        .ProseMirror s     { opacity: 0.5; }
        .ProseMirror hr    { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 2rem 0; }

        .ProseMirror blockquote {
          border-left: 3px solid var(--brand-primary);
          padding: 0.75rem 1.25rem; margin: 1.5rem 0;
          background: rgba(57,255,20,0.04); border-radius: 0 8px 8px 0;
          color: var(--brand-muted); font-style: italic;
        }

        .ProseMirror code {
          font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.88rem;
          color: var(--brand-primary); background: rgba(57,255,20,0.07);
          padding: 0.15rem 0.45rem; border-radius: 5px; border: 1px solid rgba(57,255,20,0.15);
        }

        .ProseMirror pre {
          position: relative; background: #0d1117 !important;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          margin: 1.5rem 0; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        }
        .ProseMirror pre::before {
          content: "● ● ●"; display: block; padding: 10px 16px 8px;
          font-size: 10px; letter-spacing: 4px; color: rgba(255,255,255,0.15);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02); font-family: monospace;
        }
        .ProseMirror pre code {
          background: none !important; border: none !important;
          color: #e6edf3; font-family: 'JetBrains Mono', monospace;
          font-size: 0.88rem; line-height: 1.7; display: block;
          padding: 1rem 1.25rem 1.25rem !important; overflow-x: auto;
        }

        .copy-code-btn {
          position: absolute; top: 6px; right: 10px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px; padding: 3px 8px; cursor: pointer;
          font-size: 10px; font-family: 'JetBrains Mono', monospace;
          color: rgba(255,255,255,0.35); display: flex; align-items: center;
          gap: 4px; transition: all 0.2s; opacity: 0;
        }
        .ProseMirror pre:hover .copy-code-btn { opacity: 1; }
        .copy-code-btn:hover  { background: rgba(57,255,20,0.1); border-color: rgba(57,255,20,0.3); color: var(--brand-primary); }
        .copy-code-btn.copied { background: rgba(57,255,20,0.12); border-color: rgba(57,255,20,0.4); color: var(--brand-primary); opacity: 1; }

        .ProseMirror img.doc-image, .ProseMirror img {
          max-width: 100%; height: auto; border-radius: 10px; margin: 1.5rem 0;
          display: block; border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5); transition: box-shadow 0.2s;
        }
        .ProseMirror img:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1); }
        .ProseMirror img.ProseMirror-selectednode { outline: 2px solid var(--brand-primary); outline-offset: 2px; }

        .hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: #ff79c6; }
        .hljs-string, .hljs-attr    { color: #f1fa8c; }
        .hljs-function, .hljs-title { color: var(--brand-primary); }
        .hljs-comment, .hljs-quote  { color: #6272a4; font-style: italic; }
        .hljs-number, .hljs-literal { color: #bd93f9; }
        .hljs-variable, .hljs-template-variable { color: #ffb86c; }
        .hljs-type, .hljs-class     { color: #8be9fd; }
        .hljs-operator, .hljs-punctuation { color: #a0aec0; }
        .hljs-tag    { color: #ff5555; }
        .hljs-params { color: #ffb86c; }

        .ProseMirror ::selection { background: rgba(57,255,20,0.2); }
      `}</style>
    </div>
  );
};

export default DocumentEditor;
