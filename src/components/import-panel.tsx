"use client";

import { useState, type DragEvent } from "react";
import { RotateCcw, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card
      id="import"
      role="region"
      aria-labelledby="import-title"
      className="scroll-mt-6 gap-[18px] rounded-[28px] bg-secondary ring-brand-line [--card-spacing:--spacing(7)]"
    >
      <CardHeader>
        <CardTitle>
          <h2 id="import-title" className="text-xl font-semibold">
            {t.title}
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-[18px]">
        <label
          htmlFor="csv-upload"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex min-h-[200px] flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed border-sky-300 bg-background p-6 text-center transition-colors",
            "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
            dragging && "border-brand bg-brand-soft",
            loading && "pointer-events-none opacity-60",
          )}
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-sky-100">
            <Upload className="size-[26px] text-primary" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold">{loading ? t.loading : t.dropTitle}</span>
          <span className="text-[13px] text-muted-foreground">
            {t.dropOr} <span className="font-semibold text-primary underline">{t.choose}</span> · {t.dropHint}
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
            <Button variant="outline" className="h-11 rounded-full px-[18px] font-semibold" onClick={onReset} disabled={loading}>
              <RotateCcw aria-hidden="true" />
              {t.reset}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
