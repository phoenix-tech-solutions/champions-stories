import * as React from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import type { Id } from "../../../../convex/_generated/dataModel.js";
import { api } from "../../../../convex/_generated/api.js";
import { Button } from "../../components/ui/button.tsx";
import { StoryRichEditor } from "../../components/admin/StoryRichEditor.tsx";
import {
    editorValueToStoryBody,
    parseStoredEditorValue,
    slugFromTitle,
} from "../../lib/storyEditor.ts";
import type { Value } from "platejs";
import {
    Eye,
    EyeOff,
    FileClock,
    LogIn,
    LogOut,
    Plus,
    RotateCcw,
    Save,
    Trash2,
    Upload,
} from "lucide-react";

type AdminStory = FunctionReturnType<typeof api.adminStories.list>[number];
type StoryVersion = FunctionReturnType<typeof api.adminStories.versions>[number];

type StoryForm = {
    storyId?: Id<"stories">;
    title: string;
    subtitle: string;
    author: string;
    slug: string;
    status: "draft" | "published";
    editorValue: Value;
    thumbnailFileId?: Id<"_storage">;
    thumbnailUrl?: string | null;
    embeddedFileIds: Array<Id<"_storage"> | null>;
    mediaUrls: Record<number, string | undefined>;
    deletedAt?: number;
};

const emptyForm = (): StoryForm => ({
    title: "",
    subtitle: "",
    author: "",
    slug: "",
    status: "draft",
    editorValue: [{ type: "p", children: [{ text: "" }] }],
    embeddedFileIds: [],
    mediaUrls: {},
});

const passwordKey = "champions-stories-admin-password";

export default function AdminStories() {
    const convex = useConvex();
    const [password, setPassword] = React.useState(() =>
        sessionStorage.getItem(passwordKey) ?? ""
    );
    const [passwordDraft, setPasswordDraft] = React.useState(password);
    const [authenticated, setAuthenticated] = React.useState(false);
    const [authenticating, setAuthenticating] = React.useState(Boolean(password));
    const [authError, setAuthError] = React.useState("");
    const [statusText, setStatusText] = React.useState("");
    const [selectedStoryId, setSelectedStoryId] = React.useState<
        Id<"stories"> | null
    >(null);
    const [form, setForm] = React.useState<StoryForm>(() => emptyForm());
    const [slugTouched, setSlugTouched] = React.useState(false);
    const [deleteArmed, setDeleteArmed] = React.useState(false);
    const [editorKey, setEditorKey] = React.useState("new");

    const stories = useQuery(
        api.adminStories.list,
        authenticated ? { password, limit: 200 } : "skip",
    );
    const versions = useQuery(
        api.adminStories.versions,
        authenticated && form.storyId
            ? { password, storyId: form.storyId, limit: 12 }
            : "skip",
    );

    const saveStory = useMutation(api.adminStories.save);
    const deleteStory = useMutation(api.adminStories.softDelete);
    const restoreStory = useMutation(api.adminStories.restore);
    const getUploadUrl = useMutation(api.adminStories.getUploadUrl);

    React.useEffect(() => {
        if (!password) {
            setAuthenticating(false);
            return;
        }

        let cancelled = false;
        setAuthenticating(true);
        convex.query(api.adminStories.authenticate, { password })
            .then(() => {
                if (cancelled) return;
                setAuthenticated(true);
                setAuthError("");
            })
            .catch(() => {
                if (cancelled) return;
                setAuthenticated(false);
                setAuthError("Nope.");
                sessionStorage.removeItem(passwordKey);
            })
            .finally(() => {
                if (!cancelled) setAuthenticating(false);
            });

        return () => {
            cancelled = true;
        };
    }, [convex, password]);

    React.useEffect(() => {
        if (!stories || selectedStoryId || form.storyId) return;
        const first = stories[0];
        if (first) loadStory(first);
    }, [stories, selectedStoryId, form.storyId]);

    const login = (event: React.FormEvent) => {
        event.preventDefault();
        sessionStorage.setItem(passwordKey, passwordDraft);
        setPassword(passwordDraft);
    };

    const logout = () => {
        sessionStorage.removeItem(passwordKey);
        setPassword("");
        setPasswordDraft("");
        setAuthenticated(false);
        setSelectedStoryId(null);
        setForm(emptyForm());
    };

    const newStory = () => {
        setSelectedStoryId(null);
        setSlugTouched(false);
        setDeleteArmed(false);
        setForm(emptyForm());
        setEditorKey(`new-${Date.now()}`);
    };

    const loadStory = (story: AdminStory) => {
        const mediaUrls: Record<number, string | undefined> = {};
        for (const [index, url] of Object.entries(story.embeddedUrlsByIndex ?? {})) {
            mediaUrls[Number(index)] = url;
        }

        setSelectedStoryId(story._id);
        setSlugTouched(true);
        setDeleteArmed(false);
        setForm({
            storyId: story._id,
            title: story.title,
            subtitle: story.subtitle ?? "",
            author: story.author,
            slug: story.slug,
            status: story.status ?? "published",
            editorValue: parseStoredEditorValue(story.body, story.bodyEditorJson),
            thumbnailFileId: story.thumbnailFileId,
            thumbnailUrl: story.thumbnailUrl,
            embeddedFileIds: story.embeddedFileIds ?? [],
            mediaUrls,
            deletedAt: story.deletedAt,
        });
        setEditorKey(story._id);
    };

    const updateTitle = (title: string) => {
        setForm((current) => ({
            ...current,
            title,
            slug: slugTouched ? current.slug : slugFromTitle(title),
        }));
    };

    const uploadFile = async (file: File) => {
        const uploadUrl = await getUploadUrl({ password });
        const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type || "application/octet-stream" },
            body: file,
        });
        if (!result.ok) throw new Error("Upload failed.");
        const { storageId } = await result.json() as { storageId: string };
        return storageId as Id<"_storage">;
    };

    const uploadThumbnail = async (file: File) => {
        setStatusText("Uploading...");
        const fileId = await uploadFile(file);
        setForm((current) => ({
            ...current,
            thumbnailFileId: fileId,
            thumbnailUrl: URL.createObjectURL(file),
        }));
        setStatusText("Uploaded.");
    };

    const uploadEmbeddedImage = async (index: number, file: File) => {
        setStatusText("Uploading...");
        const fileId = await uploadFile(file);
        setForm((current) => {
            const embeddedFileIds = current.embeddedFileIds.slice();
            while (embeddedFileIds.length < index) embeddedFileIds.push(null);
            embeddedFileIds[index - 1] = fileId;
            return {
                ...current,
                embeddedFileIds,
                mediaUrls: {
                    ...current.mediaUrls,
                    [index]: URL.createObjectURL(file),
                },
            };
        });
        setStatusText("Uploaded.");
    };

    const save = async () => {
        setStatusText("Saving...");
        const input = {
            title: form.title,
            ...(form.subtitle ? { subtitle: form.subtitle } : {}),
            author: form.author,
            slug: form.slug || slugFromTitle(form.title),
            status: form.status,
            body: editorValueToStoryBody(form.editorValue),
            bodyEditorJson: JSON.stringify(form.editorValue),
            ...(form.thumbnailFileId ? { thumbnailFileId: form.thumbnailFileId } : {}),
            ...(form.embeddedFileIds.length > 0
                ? { embeddedFileIds: form.embeddedFileIds }
                : {}),
        };
        const savedId = await saveStory({
            password,
            ...(form.storyId ? { storyId: form.storyId } : {}),
            input,
            ...(form.author ? { adminName: form.author } : {}),
        });
        setSelectedStoryId(savedId);
        setForm((current) => ({ ...current, storyId: savedId }));
        setSlugTouched(true);
        setStatusText("Saved.");
    };

    const remove = async () => {
        if (!form.storyId) return;
        if (!deleteArmed) {
            setDeleteArmed(true);
            setStatusText("Tap trash again.");
            return;
        }
        setStatusText("Deleting...");
        await deleteStory({ password, storyId: form.storyId });
        setDeleteArmed(false);
        setForm((current) => ({ ...current, deletedAt: Date.now() }));
        setStatusText("Deleted.");
    };

    const restore = async () => {
        if (!form.storyId) return;
        setStatusText("Restoring...");
        await restoreStory({ password, storyId: form.storyId });
        setForm((current) => ({ ...current, deletedAt: undefined }));
        setStatusText("Restored.");
    };

    if (authenticating) {
        return <ShellCenter text="..." />;
    }

    if (!authenticated) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-950">
                <form
                    className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-stone-200 bg-white p-1.5"
                    onSubmit={login}
                >
                    <input
                        className="h-10 min-w-0 flex-1 rounded-md bg-transparent px-3 text-sm outline-none placeholder:text-stone-300 focus:bg-stone-50"
                        type="password"
                        autoFocus
                        placeholder="Password"
                        value={passwordDraft}
                        onChange={(event) => setPasswordDraft(event.target.value)}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="h-10 w-10 rounded-md bg-stone-950 text-white hover:bg-stone-800"
                        title="Enter"
                        aria-label="Enter"
                    >
                        <LogIn />
                    </Button>
                </form>
                {authError && (
                    <div className="fixed bottom-4 text-xs text-stone-500">
                        {authError}
                    </div>
                )}
            </main>
        );
    }

    const visibleStories = stories ?? [];
    const urlPreview = form.slug
        ? `champions-stories.pages.dev/story/${form.slug}`
        : "champions-stories.pages.dev/story/...";

    return (
        <main className="min-h-screen bg-stone-50 text-stone-950">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_180px]">
                <aside className="border-r border-stone-200 bg-stone-100/70">
                    <div className="flex h-12 items-center gap-1 border-b border-stone-200 px-2">
                        <IconButton label="New" onClick={newStory}>
                            <Plus />
                        </IconButton>
                        <IconButton label="Exit" onClick={logout}>
                            <LogOut />
                        </IconButton>
                    </div>
                    <div className="max-h-[calc(100vh-3rem)] overflow-auto">
                        {visibleStories.map((story) => (
                            <button
                                key={story._id}
                                type="button"
                                className={`flex w-full items-center gap-3 border-b border-stone-200/70 px-3 py-3 text-left text-stone-700 transition-colors hover:bg-white focus-visible:bg-white ${
                                    story._id === selectedStoryId
                                        ? "bg-white text-stone-950"
                                        : "bg-transparent"
                                } ${story.deletedAt ? "opacity-40" : ""}`}
                                onClick={() => loadStory(story)}
                                title={story.title}
                            >
                                <span
                                    className={`h-2 w-2 shrink-0 rounded-full ${
                                        story.deletedAt
                                            ? "bg-stone-300"
                                            : (story.status ?? "published") === "published"
                                            ? "bg-[#F45151]"
                                            : "bg-stone-300"
                                    }`}
                                />
                                <span className="min-w-0 truncate text-sm">
                                    {story.title}
                                </span>
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="min-w-0">
                    <div className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-stone-200 bg-white/95 px-2 backdrop-blur">
                        <div className="flex items-center gap-1">
                            <IconButton label="Save" onClick={save}>
                                <Save />
                            </IconButton>
                            <IconButton
                                label={form.status === "published" ? "Published" : "Draft"}
                                onClick={() =>
                                    setForm((current) => ({
                                        ...current,
                                        status: current.status === "published"
                                            ? "draft"
                                            : "published",
                                    }))
                                }
                            >
                                {form.status === "published" ? <Eye /> : <EyeOff />}
                            </IconButton>
                            {form.storyId && !form.deletedAt && (
                                <IconButton label="Delete" onClick={remove} armed={deleteArmed}>
                                    <Trash2 />
                                </IconButton>
                            )}
                            {form.storyId && form.deletedAt && (
                                <IconButton label="Restore" onClick={restore}>
                                    <RotateCcw />
                                </IconButton>
                            )}
                        </div>
                        <div className="truncate font-mono text-xs text-stone-500">
                            {statusText || urlPreview}
                        </div>
                    </div>

                    <div className="mx-auto max-w-5xl px-4 py-5">
                        <div className="grid gap-3 rounded-xl border border-stone-200 bg-white p-3 md:grid-cols-[1fr_180px]">
                            <div className="grid gap-2">
                                <input
                                    className="h-12 w-full rounded-md bg-transparent px-1 text-3xl font-semibold outline-none placeholder:text-stone-300 focus:bg-stone-50"
                                    placeholder="Title"
                                    value={form.title}
                                    onChange={(event) => updateTitle(event.target.value)}
                                />
                                <input
                                    className="h-9 w-full rounded-md bg-transparent px-1 text-sm text-stone-600 outline-none placeholder:text-stone-300 focus:bg-stone-50"
                                    placeholder="Subtitle"
                                    value={form.subtitle}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            subtitle: event.target.value,
                                        }))
                                    }
                                />
                                <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr]">
                                    <input
                                        className="h-9 rounded-md bg-stone-50 px-3 text-sm outline-none placeholder:text-stone-300 focus:bg-stone-100"
                                        placeholder="By"
                                        value={form.author}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                author: event.target.value,
                                            }))
                                        }
                                    />
                                    <input
                                        className="h-9 rounded-md bg-stone-50 px-3 font-mono text-xs outline-none placeholder:text-stone-300 focus:bg-stone-100"
                                        placeholder="web-address"
                                        value={form.slug}
                                        onChange={(event) => {
                                            setSlugTouched(true);
                                            setForm((current) => ({
                                                ...current,
                                                slug: slugFromTitle(event.target.value),
                                            }));
                                        }}
                                    />
                                </div>
                                <code className="truncate text-xs text-stone-400">
                                    {urlPreview}
                                </code>
                            </div>

                            <ThumbnailPicker
                                src={form.thumbnailUrl ?? undefined}
                                onFile={uploadThumbnail}
                            />
                        </div>

                        <div className="mt-4">
                            <StoryRichEditor
                                key={editorKey}
                                initialValue={form.editorValue}
                                mediaUrls={form.mediaUrls}
                                onChange={(value) =>
                                    setForm((current) => ({
                                        ...current,
                                        editorValue: value,
                                    }))
                                }
                                onUploadImage={uploadEmbeddedImage}
                            />
                        </div>
                    </div>
                </section>

                <aside className="hidden border-l border-stone-200 bg-stone-100/70 lg:block">
                    <div className="flex h-12 items-center border-b border-stone-200 px-3">
                        <FileClock className="h-4 w-4 text-stone-500" />
                    </div>
                    <div className="max-h-[calc(100vh-3rem)] overflow-auto">
                        {(versions ?? []).map((version) => (
                            <VersionRow key={version._id} version={version} />
                        ))}
                    </div>
                </aside>
            </div>
        </main>
    );
}

function ShellCenter({ text }: { text: string }) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-stone-50 text-sm text-stone-500">
            {text}
        </main>
    );
}

function IconButton({
    label,
    onClick,
    armed,
    children,
}: {
    label: string;
    onClick: () => void;
    armed?: boolean;
    children: React.ReactNode;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-md transition-colors ${
                armed
                    ? "bg-[#F45151] text-white hover:bg-[#d14343]"
                    : "text-stone-700 hover:bg-stone-100 focus-visible:bg-stone-100"
            }`}
            title={label}
            aria-label={label}
            onClick={onClick}
        >
            {children}
        </Button>
    );
}

function ThumbnailPicker({
    src,
    onFile,
}: {
    src?: string;
    onFile: (file: File) => void;
}) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    return (
        <button
            type="button"
            className="flex min-h-36 items-center justify-center overflow-hidden rounded-lg border border-dashed border-stone-300 bg-stone-50 text-stone-500 transition-colors hover:border-stone-400 hover:bg-stone-100 focus-visible:border-stone-500"
            title="Cover"
            onClick={() => inputRef.current?.click()}
        >
            {src ? (
                <img
                    src={src}
                    alt="Cover"
                    className="max-h-44 w-full object-contain"
                />
            ) : (
                <Upload className="h-5 w-5" />
            )}
            <input
                ref={inputRef}
                className="hidden"
                type="file"
                accept="image/*"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onFile(file);
                    event.currentTarget.value = "";
                }}
            />
        </button>
    );
}

function VersionRow({ version }: { version: StoryVersion }) {
    return (
        <div className="border-b border-stone-200/70 px-3 py-2">
            <div className="truncate text-xs text-stone-700">{version.action}</div>
            <div className="font-mono text-[10px] text-stone-400">
                {new Date(version.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                })}
            </div>
        </div>
    );
}
