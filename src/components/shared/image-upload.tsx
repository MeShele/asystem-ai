"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";

interface Props {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
  shape?: "square" | "circle";
  maxSize?: number; // px (longest side); default 512
  hint?: string;
}

async function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas context"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({
  value,
  onChange,
  label,
  shape = "square",
  maxSize = 512,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = () => inputRef.current?.click();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Можно загружать только изображения");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("Файл слишком большой (макс 8 МБ)");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await resizeImage(file, maxSize);
      onChange(dataUrl);
    } catch {
      alert("Не удалось обработать изображение");
    } finally {
      setBusy(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";

  return (
    <div>
      {label && <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>}
      <div className="flex items-center gap-3">
        <div
          onClick={pick}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={`w-20 h-20 ${radius} bg-bg-secondary border-2 border-dashed border-border-faint hover:border-brand-500 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer transition-colors`}
        >
          {busy ? (
            <span className="text-[10px] text-text-muted animate-pulse">обработка</span>
          ) : value ? (
            <Image
              src={value}
              alt="preview"
              width={80}
              height={80}
              unoptimized
              className="object-cover w-full h-full"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-text-muted" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={pick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-bg-secondary hover:bg-surface border border-border-faint hover:border-brand-500/30 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              {value ? "Заменить" : "Загрузить"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg text-text-muted hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Удалить
              </button>
            )}
          </div>
          <p className="text-[11px] text-text-muted mt-1">
            {hint || "JPG, PNG · авто-сжатие до 512px · макс 8 МБ"}
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onInputChange}
        className="hidden"
      />
    </div>
  );
}
