import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { useRef, useState } from "react";
import { CloudUpload, FileText, X, Sparkles, Globe, Lock, Users } from "lucide-react";
import { toast } from "sonner";
import { useUploadNotePDF } from "@/hooks/useNotes";

export const Route = createFileRoute("/upload")({ component: UploadPage });

const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "EE",
  "Mechanical",
];

const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];

function UploadPage() {
  const nav = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [semester, setSemester] = useState("1");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState("public");

  const uploadNote = useUploadNotePDF();

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Only PDF files are supported.");
      return;
    }
    setFile(selectedFile);
    setProgress(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFileSelect(selected);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject.");
      return;
    }
    if (!file) {
      toast.error("Please select a PDF file.");
      return;
    }

    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await uploadNote.mutateAsync({
        metadata: {
          title: title.trim(),
          description: description.trim(),
          subject: subject.trim(),
          department,
          semester: parseInt(semester, 10),
          tags: tagArray,
          visibility,
        },
        file,
        onProgress: (pct) => setProgress(pct),
      });

      toast.success("Note published successfully! 🎉");
      nav({ to: "/feed" });
    } catch {
      // Error already handled in hook
    }
  };

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-up">
        <PageHeader
          eyebrow="Upload"
          title={
            <>
              Share what you've <span className="text-gradient">learned</span>.
            </>
          }
          description="Upload a PDF, add context, and publish to your community in seconds."
        />

        {/* Hidden real file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileInput}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`glass rounded-2xl border-2 border-dashed transition ${
                dragging ? "border-primary shadow-glow" : "border-white/10"
              } p-10 text-center cursor-pointer`}
              onClick={handleBrowse}
            >
              {!file ? (
                <>
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 grid place-items-center mb-4">
                    <CloudUpload className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold">Drop your PDF here</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse — max 50 MB
                  </p>
                  <div className="mt-4 flex justify-center gap-2 flex-wrap text-xs text-muted-foreground">
                    <span className="glass rounded-full px-2 py-0.5">PDF</span>
                  </div>
                </>
              ) : (
                <div className="text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary grid place-items-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatBytes(file.size)} · {Math.round(progress)}%
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setProgress(0);
                      }}
                      className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {progress > 0 && (
                    <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Details form */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold">Details</h3>
              <Field
                label="Title"
                placeholder="Data Structures & Algorithms — Complete Guide"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              />
              <Field
                label="Description"
                placeholder="What will readers learn?"
                textarea
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(e.target.value)
                }
              />
              <div className="grid sm:grid-cols-3 gap-3">
                <SelectField
                  label="Department"
                  options={DEPARTMENTS}
                  value={department}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setDepartment(e.target.value)
                  }
                />
                <SelectField
                  label="Semester"
                  options={SEMESTERS}
                  value={semester}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSemester(e.target.value)
                  }
                />
              </div>
              <Field
                label="Subject"
                placeholder="e.g. DSA, Linear Algebra"
                value={subject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
              />
              <Field
                label="Tags (comma separated)"
                placeholder="algorithms, interview, cs"
                value={tags}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
              />
            </div>

            {/* Visibility */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-3">Visibility</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { id: "public", label: "Public", icon: Globe, desc: "Anyone on CloudNotes" },
                  {
                    id: "community",
                    label: "Community",
                    icon: Users,
                    desc: "Members of your communities",
                  },
                  { id: "private", label: "Private", icon: Lock, desc: "Only you" },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVisibility(v.id)}
                    className={`text-left rounded-xl p-4 border transition ${
                      visibility === v.id
                        ? "border-primary bg-primary/10 shadow-glow"
                        : "border-white/5 hover:bg-white/5"
                    }`}
                  >
                    <v.icon className="h-4 w-4 mb-2" />
                    <div className="text-sm font-medium">{v.label}</div>
                    <div className="text-xs text-muted-foreground">{v.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button className="h-10 px-4 rounded-xl glass hover:bg-white/10 text-sm">
                Save as draft
              </button>
              <button
                onClick={handlePublish}
                disabled={uploadNote.isPending}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium hover:shadow-glow transition disabled:opacity-60"
              >
                {uploadNote.isPending ? "Publishing…" : "Publish"}
              </button>
            </div>
          </div>

          {/* Preview */}
          <aside className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <div className="text-xs text-muted-foreground mb-2">Preview</div>
              <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-primary/40 to-secondary/40 grid place-items-center">
                <FileText className="h-12 w-12 opacity-70" />
              </div>
              <div className="mt-3">
                <div className="font-semibold text-sm">{title || "Your note title"}</div>
                <div className="text-xs text-muted-foreground">
                  {file ? `${formatBytes(file.size)} · ready` : "Draft · not published"}
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-secondary" />
                <span className="font-medium">AI suggestions</span>
              </div>
              <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                <li>• Add "interview" to tags — trending in your department</li>
                <li>• Similar notes get 3.1× more downloads with a detailed description</li>
                <li>• Public notes get 4× more downloads than private ones</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  textarea,
  ...props
}: {
  label: string;
  textarea?: boolean;
} & (
  React.InputHTMLAttributes<HTMLInputElement> | React.TextareaHTMLAttributes<HTMLTextAreaElement>
)) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          rows={3}
          className="mt-1 w-full glass rounded-xl px-3 py-2 text-sm bg-transparent outline-none focus:shadow-glow"
        />
      ) : (
        <input
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          className="mt-1 w-full glass rounded-xl px-3 h-10 text-sm bg-transparent outline-none focus:shadow-glow"
        />
      )}
    </label>
  );
}

function SelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="mt-1 w-full glass rounded-xl px-3 h-10 text-sm bg-transparent outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-background">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
