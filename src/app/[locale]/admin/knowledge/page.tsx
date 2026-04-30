"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { BookOpen, Upload, Pin, PinOff, Trash2, FileText, Plus, X } from "lucide-react";

interface KnowledgeDoc {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string | null;
  file_size: number;
  mime_type: string | null;
  category: string;
  pinned: boolean;
  created_at: string;
}

const CATEGORIES = [
  { key: "general", label: "Общее" },
  { key: "pitch", label: "Презентации" },
  { key: "legal", label: "Юридическое" },
  { key: "marketing", label: "Маркетинг" },
  { key: "faq", label: "FAQ" },
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

function fmtSize(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminKnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    fetch("/api/admin/knowledge")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setDocs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const togglePin = async (id: number, pinned: boolean) => {
    await fetch(`/api/admin/knowledge/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !pinned }),
    });
    load();
  };

  const deleteDoc = async (id: number) => {
    if (!confirm("Удалить документ?")) return;
    await fetch(`/api/admin/knowledge/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-brand-500" />
            <h1 className="text-2xl font-bold">База знаний</h1>
          </div>
          <p className="text-sm text-text-muted">Документы для партнёров — презентации, шаблоны, FAQ</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Загрузить
        </button>
      </motion.div>

      {showForm && <UploadForm onClose={() => setShowForm(false)} onSuccess={load} />}

      {loading ? (
        <div className="text-center py-8 text-sm text-text-muted">Загрузка...</div>
      ) : docs.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-border-faint text-center">
          <BookOpen className="w-10 h-10 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted mb-3">Документов пока нет</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-brand-500 hover:text-brand-400 font-medium"
          >
            Загрузить первый
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-4 rounded-xl border border-border-faint bg-surface">
              <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-sm font-semibold truncate">{d.title}</span>
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-bg-secondary text-text-muted">
                    {CATEGORIES.find((c) => c.key === d.category)?.label || d.category}
                  </span>
                  {d.pinned && (
                    <span className="text-[10px] text-amber-500 inline-flex items-center gap-1 font-medium">
                      <Pin className="w-2.5 h-2.5" /> закреп
                    </span>
                  )}
                </div>
                {d.description && <p className="text-xs text-text-muted line-clamp-1 mb-1">{d.description}</p>}
                <div className="flex items-center gap-2 text-[11px] text-text-muted font-mono">
                  {d.file_name && <span className="truncate max-w-[260px]">{d.file_name}</span>}
                  {d.file_size > 0 && <span>· {fmtSize(d.file_size)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <a
                  href={d.file_url}
                  download={d.file_name || true}
                  className="p-2 rounded-lg text-text-muted hover:text-brand-500 hover:bg-brand-500/5 transition-colors"
                  title="Скачать"
                >
                  <Upload className="w-4 h-4 rotate-180" />
                </a>
                <button
                  onClick={() => togglePin(d.id, d.pinned)}
                  className={`p-2 rounded-lg hover:bg-bg-secondary transition-colors ${d.pinned ? "text-amber-500" : "text-text-muted hover:text-amber-500"}`}
                  title={d.pinned ? "Открепить" : "Закрепить"}
                >
                  {d.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => deleteDoc(d.id)}
                  className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/5 transition-colors"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [pinned, setPinned] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (!title.trim() || !file) {
      alert("Название и файл обязательны");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert(`Файл слишком большой (макс ${MAX_FILE_SIZE / 1024 / 1024} МБ)`);
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          file_url: dataUrl,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          category,
          pinned,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Ошибка загрузки");
        return;
      }
      onSuccess();
      onClose();
    } catch {
      alert("Не удалось загрузить файл");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mb-6"
    >
      <div className="p-5 rounded-2xl border border-brand-500/30 bg-brand-500/[0.03]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Загрузить документ</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-text-muted mb-1">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Презентация asystem.ai 2026"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border-faint focus:border-brand-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Категория</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border-faint focus:border-brand-500 outline-none text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="block text-xs text-text-muted mb-1">Описание (опционально)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Что внутри и для какого момента в воронке"
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-surface border border-border-faint focus:border-brand-500 outline-none text-sm mb-3 resize-none"
        />

        <label className="block text-xs text-text-muted mb-1">Файл</label>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) setFile(f);
          }}
          className="w-full p-4 rounded-lg border-2 border-dashed border-border-faint hover:border-brand-500 cursor-pointer transition-colors mb-3 text-center"
        >
          {file ? (
            <div className="flex items-center justify-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-brand-500" />
              <span className="font-medium truncate max-w-[260px]">{file.name}</span>
              <span className="text-text-muted font-mono text-xs">· {fmtSize(file.size)}</span>
            </div>
          ) : (
            <div className="text-sm text-text-muted">
              <Upload className="w-5 h-5 mx-auto mb-1" />
              Перетащите файл сюда или кликните · до {MAX_FILE_SIZE / 1024 / 1024} МБ
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.zip"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
            e.target.value = "";
          }}
          className="hidden"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="accent-brand-500"
            />
            <Pin className="w-3.5 h-3.5 text-amber-500" /> Закрепить вверху
          </label>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors">
              Отмена
            </button>
            <button
              onClick={submit}
              disabled={busy}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-50 transition-colors"
            >
              {busy ? "Загрузка..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
