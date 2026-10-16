"use client";

import { useState, type DragEvent } from "react";
import { RotateCcw, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/section-card";
import type { Dictionary } from "@/i18n/types";
import { cn } from "@/lib/utils";

interface ImportPanelProps {
  dict: Dictionary;
  loading: boolean;
  sourceLabel: string;
  errors: string[];
  canReset: boolean;
  onFiles: (files: FileList) => void;
  onReset: () => void;
}

/** Zone de dépôt : glisser-déposer ou sélection au clavier via le vrai <input type="file">. */
export function ImportPanel({ dict, loading, sourceLabel, errors, canReset, onFiles, onReset }: ImportPanelProps) {
  const t = dict.import;
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (!loading && event.dataTransfer.files.length) onFiles(event.dataTransfer.files);
  }

  return (
    <SectionCard id="import-title" title={t.title} tone="warm">
      <label
        htmlFor="csv-upload"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "bg-hero flex min-h-[200px] flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-[12px] border-2 border-dashed border-blue-border p-6 text-center transition-colors",
          "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
          dragging && "border-bar",
          loading && "pointer-events-none opacity-60",
        )}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-background shadow-[0_2px_8px_rgb(69_137_255/15%)]">
          <Upload className="size-[26px] text-primary" aria-hidden="true" />
        </span>
        <span className="text-base font-extrabold text-navy">{loading ? t.loading : t.dropTitle}</span>
        <span className="text-[13px] text-slate-600">
          {t.dropOr} <span className="font-bold text-primary underline">{t.choose}</span> · {t.dropHint}
        </span>
        <input
          id="csv-upload"
          type="file"
          accept=".csv,text/csv"
          multiple
          disabled={loading}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) onFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      <div aria-live="polite" className="flex flex-col gap-2">
        {errors.map((message, i) => (
          <Alert key={`${i}:${message}`} variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[13px] text-muted-foreground" aria-live="polite">
          {sourceLabel}
        </span>
        {canReset && (
          <Button
            variant="outline"
            className="h-11 rounded-[20px] border-[1.5px] border-primary bg-background px-[18px] font-bold text-primary transition-[transform,box-shadow] duration-300 hover:bg-background hover:text-primary hover:shadow-[0_8px_25px_rgb(30_64_175/35%)] motion-safe:hover:-translate-y-0.5"
            onClick={onReset}
            disabled={loading}
          >
            <RotateCcw aria-hidden="true" />
            {t.reset}
          </Button>
        )}
      </div>
    </SectionCard>
  );
}
