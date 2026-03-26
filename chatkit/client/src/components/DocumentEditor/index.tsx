import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
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

import type { DocMeta, ToastState } from "./types";
import { toSlug, timeAgo } from "./types";
import ToolbarButton from "./ToolbarButton";
import Toast from "./Toast";
import CopyButtonInjector from "./CopyButtonInjector";

const lowlight = createLowlight();
lowlight.register("javascript", javascript);
lowlight.register("typescript", typescript);
lowlight.register("bash", bash);
lowlight.register("json", json);
lowlight.register("css", css);
lowlight.register("html", xml);

import { authFetch } from "../../lib/authFetch";
import { useAppConfig } from "../../store/appConfig";

const uploadImage = async (file: File, token: string, endpoint: string): Promise<string> => {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${endpoint}/hermes/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");
  return data.url ?? data.secure_url ?? data.data?.url;
};

const DocumentEditor = () => {
  const endpoint = useAppConfig((s) => s.endpoint);
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  const token = useRef<string>(sessionStorage.getItem("hermes_token") ?? "");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ message, type });

  const insertImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (!token.current) {
      showToast("No auth token — log in first", "error");
      return;
    }
    setImageUploading(true);
    try {
      const url = await uploadImage(file, token.current, endpoint);
      editor?.chain().focus().setImage({ src: url }).run();
      showToast("Image uploaded ✓", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : String(err), "error");
    } finally {
      setImageUploading(false);
    }
  }, []);

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
      transformPastedHTML(html) {
        return html.slice(0, 500000);
      },
      handlePaste(_view, event) {
        const items = Array.from(event.clipboardData?.items ?? []);
        const img = items.find((i) => i.type.startsWith("image/"));
        if (!img) return false;
        event.preventDefault();
        const file = img.getAsFile();
        if (file) insertImage(file);
        return true;
      },
      handleDrop(_view, event) {
        const files = Array.from(event.dataTransfer?.files ?? []);
        const img = files.find((f) => f.type.startsWith("image/"));
        if (!img) return false;
        event.preventDefault();
        insertImage(img);
        return true;
      },
    },
  });


  const fetchDocs = useCallback(async () => {
    try {
      const res = await authFetch("/api/docs/list");
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
      if (n.has(cat)) n.delete(cat);
      else n.add(cat);
      return n;
    });

  const openDoc = async (docSlug: string) => {
    if (!editor) return;
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/docs/get/${docSlug}`);
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
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : String(err), "error");
    } finally {
      setIsLoading(false);
    }
  };

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
      const t =
        first.content
          ?.map((n: { text?: string; [key: string]: unknown }) => n.text || "")
          .join("") || "";
      return t.trim() || "Untitled Document";
    }
    return title?.trim() || "Untitled Document";
  };

  const handleSave = async (s: "draft" | "published") => {
    if (!editor) return;
    setIsSaving(true);
    try {
      const derivedTitle = extractTitle();
      const derivedSlug = slugManuallyEdited ? slug : toSlug(derivedTitle);
      const res = await authFetch(
        activeDocId ? `/api/docs/update/${activeDocId}` : `/api/docs/save`,
        {
          method: activeDocId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
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
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : String(err), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (slugToDelete: string) => {
    setIsDeleting(true);
    try {
      const res = await authFetch(`/api/docs/delete/${slugToDelete}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      showToast("Document deleted", "success");
      setConfirmDelete(null);
      if (slug === slugToDelete) handleNew();
      fetchDocs();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : String(err), "error");
    } finally {
      setIsDeleting(false);
    }
  };

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
      await authFetch("/api/docs/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          backgroundColor: "rgba(0,0,0,0.8)",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <button
               onClick={() => setIsSidebarCollapsed((p) => !p)}
               className="text-[var(--brand-muted)] hover:text-[var(--brand-text)] transition-colors p-1 rounded"
               title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <ChevronRight
                size={18}
                className={`transition-transform duration-200 ${isSidebarCollapsed ? "" : "rotate-180"}`}
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
                      ? "rgba(255,255,255,0.12)"
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
          <div
            className="w-px h-4 mx-1"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          />
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
          <div
            className="w-px h-4 mx-1"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            icon={<List size={15} />}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            icon={<ListOrdered size={15} />}
            active={editor.isActive("orderedList")}
            title="Ordered List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            icon={<Quote size={15} />}
            active={editor.isActive("blockquote")}
            title="Blockquote"
          />
          <div
            className="w-px h-4 mx-1"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            icon={<Code size={15} />}
            active={editor.isActive("code")}
            title="Inline Code"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            icon={
              <span className="text-[11px] font-mono font-bold leading-none">
                {"</>"}
              </span>
            }
            active={editor.isActive("codeBlock")}
            title="Code Block"
          />
          <ToolbarButton
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

      {/* ── Body ── */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`shrink-0 md:border-r border-b flex flex-col transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "hidden md:flex md:w-20" : "w-full md:w-64 max-h-[30vh] md:max-h-none overflow-y-auto"
          }`}
          style={{
            backgroundColor: "var(--brand-card)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <div
            className={`p-4 border-b ${isSidebarCollapsed ? "flex justify-center" : "flex items-center gap-3"}`}
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <div className="w-6 h-6 shrink-0 flex items-center justify-center">
              <img src="/vite.svg" alt="Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold tracking-widest text-[10px] uppercase text-brand-muted">
                Editor
              </span>
            )}
          </div>
          <div
            className={`p-3 border-b ${isSidebarCollapsed ? "flex justify-center" : ""}`}
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <button
              onClick={handleNew}
              title="New Document"
              className={`flex items-center justify-center gap-2 text-sm py-2 px-3 rounded-lg border border-dashed transition-all ${
                isSidebarCollapsed ? "w-10 h-10 p-0" : "w-full"
              }`}
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                color: "var(--brand-muted)",
              }}
            >
              <Plus size={14} />
              {!isSidebarCollapsed && "New Document"}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {Object.entries(groupedDocs).map(([cat, catDocs]) => (
              <div key={cat} className="mb-2">
                {!isSidebarCollapsed && (
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
                )}
                
                {isSidebarCollapsed && (
                    <div className="w-full h-px bg-white/5 my-2" />
                )}

                {(!isSidebarCollapsed && collapsedCats.has(cat)) ? null : (
                  catDocs.map((doc) => (
                    <div
                      key={doc._id}
                      draggable
                      onDragStart={() => handleDragStart(doc._id)}
                      onDragOver={(e) => handleDragOver(e, doc._id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => openDoc(doc.slug)}
                      title={isSidebarCollapsed ? `${cat}: ${doc.title}` : ""}
                      className={`group flex items-center rounded-lg cursor-pointer transition-all ${
                        isSidebarCollapsed ? "justify-center p-2.5 mb-1" : "gap-2 px-3 py-2.5"
                      } ${
                        activeDocId === doc._id
                          ? "bg-white/5 text-[var(--brand-text)]"
                          : "text-[var(--brand-muted)] hover:bg-white/[0.03] hover:text-[var(--brand-text)]"
                      } ${draggedId === doc._id ? "opacity-40 scale-95" : ""}`}
                    >
                      {!isSidebarCollapsed && (
                        <GripVertical
                          size={12}
                          className="shrink-0 opacity-20 group-hover:opacity-100 cursor-grab"
                        />
                      )}
                      <FileText size={16} className="shrink-0" />
                      {!isSidebarCollapsed && (
                        <>
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
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </aside>

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
          background: rgba(255,255,255,0.03); border-radius: 0 8px 8px 0;
          color: var(--brand-muted); font-style: italic;
        }

        .ProseMirror code {
          font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.88rem;
          color: var(--brand-primary); background: rgba(255,255,255,0.05);
          padding: 0.15rem 0.45rem; border-radius: 5px; border: 1px solid rgba(255,255,255,0.08);
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
        .copy-code-btn:hover  { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: var(--brand-primary); }
        .copy-code-btn.copied { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15); color: var(--brand-primary); opacity: 1; }

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

        .ProseMirror ::selection { background: rgba(255,255,255,0.08); }
      `}</style>
    </div>
  );
};

export default DocumentEditor;
