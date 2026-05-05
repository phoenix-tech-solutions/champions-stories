import * as React from "react";
import {
    BoldPlugin,
    BlockquotePlugin,
    H1Plugin,
    H2Plugin,
    H3Plugin,
    ItalicPlugin,
    UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { MarkdownPlugin } from "@platejs/markdown";
import {
    createPlatePlugin,
    Plate,
    PlateContent,
    PlateElement,
    type PlateElementProps,
    useEditorRef,
    usePath,
    usePlateEditor,
} from "platejs/react";
import type { Value } from "platejs";
import {
    Bold,
    Heading1,
    Heading2,
    Image,
    Images,
    Italic,
    Quote,
    Underline,
    Upload,
} from "lucide-react";
import { Button } from "../ui/button.tsx";
import {
    nextImageIndex,
    type StoryImageNode,
    type StoryImageRowItem,
    type StoryImageRowNode,
} from "../../lib/storyEditor.ts";

type MediaUrls = Record<number, string | undefined>;

type StoryRichEditorProps = {
    initialValue: Value;
    mediaUrls: MediaUrls;
    onChange: (value: Value) => void;
    onUploadImage: (index: number, file: File) => Promise<void>;
};

type MediaContextValue = {
    mediaUrls: MediaUrls;
    onUploadImage: (index: number, file: File) => Promise<void>;
};

const MediaContext = React.createContext<MediaContextValue | null>(null);

const StoryImagePlugin = createPlatePlugin({
    key: "storyImage",
    node: {
        isElement: true,
        isVoid: true,
        type: "story-image",
    },
}).withComponent(StoryImageElement);

const StoryImageRowPlugin = createPlatePlugin({
    key: "storyImageRow",
    node: {
        isElement: true,
        isVoid: true,
        type: "story-image-row",
    },
}).withComponent(StoryImageRowElement);

export function StoryRichEditor({
    initialValue,
    mediaUrls,
    onChange,
    onUploadImage,
}: StoryRichEditorProps) {
    const editor = usePlateEditor({
        plugins: [
            BoldPlugin,
            ItalicPlugin,
            UnderlinePlugin,
            H1Plugin.withComponent(H1Element),
            H2Plugin.withComponent(H2Element),
            H3Plugin.withComponent(H3Element),
            BlockquotePlugin.withComponent(BlockquoteElement),
            StoryImagePlugin,
            StoryImageRowPlugin,
            MarkdownPlugin,
        ],
        value: initialValue,
    });

    const insertImage = () => {
        const imageIndex = nextImageIndex(editor.children as Value);
        editor.tf.insertNodes({
            type: "story-image",
            imageIndex,
            children: [{ text: "" }],
        });
        editor.tf.focus();
    };

    const insertImageRow = () => {
        const first = nextImageIndex(editor.children as Value);
        editor.tf.insertNodes({
            type: "story-image-row",
            items: [{ imageIndex: first }, { imageIndex: first + 1 }],
            children: [{ text: "" }],
        });
        editor.tf.focus();
    };

    return (
        <MediaContext.Provider value={{ mediaUrls, onUploadImage }}>
            <Plate
                editor={editor}
                onValueChange={({ value }) => onChange(value as Value)}
            >
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                    <div className="flex h-10 items-center gap-1 border-b border-stone-200 bg-stone-50 px-2">
                        <ToolbarIcon
                            title="Bold"
                            onClick={() => editor.tf.bold.toggle()}
                        >
                            <Bold />
                        </ToolbarIcon>
                        <ToolbarIcon
                            title="Italic"
                            onClick={() => editor.tf.italic.toggle()}
                        >
                            <Italic />
                        </ToolbarIcon>
                        <ToolbarIcon
                            title="Underline"
                            onClick={() => editor.tf.underline.toggle()}
                        >
                            <Underline />
                        </ToolbarIcon>
                        <Divider />
                        <ToolbarIcon
                            title="Heading"
                            onClick={() => editor.tf.h1.toggle()}
                        >
                            <Heading1 />
                        </ToolbarIcon>
                        <ToolbarIcon
                            title="Section"
                            onClick={() => editor.tf.h2.toggle()}
                        >
                            <Heading2 />
                        </ToolbarIcon>
                        <ToolbarIcon
                            title="Quote"
                            onClick={() => editor.tf.blockquote.toggle()}
                        >
                            <Quote />
                        </ToolbarIcon>
                        <Divider />
                        <ToolbarIcon title="Image" onClick={insertImage}>
                            <Image />
                        </ToolbarIcon>
                        <ToolbarIcon title="Image pair" onClick={insertImageRow}>
                            <Images />
                        </ToolbarIcon>
                    </div>
                    <PlateContent
                        className="min-h-[520px] px-8 py-7 text-[17px] leading-8 text-stone-900 outline-none selection:bg-[#F45151]/20"
                        placeholder="Write here..."
                    />
                </div>
            </Plate>
        </MediaContext.Provider>
    );
}

function ToolbarIcon({
    title,
    onClick,
    children,
}: {
    title: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md text-stone-700 transition-colors hover:bg-stone-200/70 focus-visible:bg-stone-200/70"
            title={title}
            aria-label={title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
        >
            {children}
        </Button>
    );
}

function Divider() {
    return <div className="mx-1 h-5 w-px bg-stone-200" />;
}

function H1Element(props: PlateElementProps) {
    return (
        <PlateElement
            as="h1"
            className="mb-4 mt-8 text-3xl font-semibold leading-tight"
            {...props}
        />
    );
}

function H2Element(props: PlateElementProps) {
    return (
        <PlateElement
            as="h2"
            className="mb-3 mt-7 text-2xl font-semibold leading-tight"
            {...props}
        />
    );
}

function H3Element(props: PlateElementProps) {
    return (
        <PlateElement
            as="h3"
            className="mb-2 mt-6 text-xl font-semibold leading-tight"
            {...props}
        />
    );
}

function BlockquoteElement(props: PlateElementProps) {
    return (
        <PlateElement
            as="blockquote"
            className="my-5 border-l-2 border-stone-300 pl-4 text-stone-600"
            {...props}
        />
    );
}

function StoryImageElement(props: PlateElementProps) {
    const element = props.element as StoryImageNode;
    const editor = useEditorRef();
    const path = usePath();
    const media = React.useContext(MediaContext);
    const src = media?.mediaUrls[element.imageIndex];

    const setCaption = (caption: string) => {
        editor.tf.setNodes({ caption }, { at: path });
    };

    return (
        <PlateElement as="figure" className="my-7" {...props}>
            <div
                className="rounded-lg border border-stone-200 bg-stone-50 p-3"
                contentEditable={false}
            >
                <ImageUploadSurface
                    title={`Image ${element.imageIndex}`}
                    src={src}
                    onFile={(file) => media?.onUploadImage(element.imageIndex, file)}
                />
                <input
                    className="mt-2 w-full rounded-md bg-transparent px-2 py-1 text-center text-sm text-stone-600 outline-none placeholder:text-stone-400 focus:bg-white"
                    value={element.caption ?? ""}
                    placeholder="Caption"
                    onChange={(event) => setCaption(event.target.value)}
                />
            </div>
            {props.children}
        </PlateElement>
    );
}

function StoryImageRowElement(props: PlateElementProps) {
    const element = props.element as StoryImageRowNode;
    const editor = useEditorRef();
    const path = usePath();
    const media = React.useContext(MediaContext);
    const items = element.items?.length ? element.items : [{ imageIndex: 1 }];

    const updateItem = (index: number, nextItem: StoryImageRowItem) => {
        const nextItems = items.map((item, itemIndex) =>
            itemIndex === index ? nextItem : item
        );
        editor.tf.setNodes({ items: nextItems }, { at: path });
    };

    return (
        <PlateElement as="div" className="my-7" {...props}>
            <div
                className="grid grid-cols-1 gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 sm:grid-cols-2"
                contentEditable={false}
            >
                {items.map((item, index) => (
                    <div key={`${item.imageIndex}-${index}`}>
                        <ImageUploadSurface
                            title={`Image ${item.imageIndex}`}
                            src={media?.mediaUrls[item.imageIndex]}
                            onFile={(file) =>
                                media?.onUploadImage(item.imageIndex, file)
                            }
                        />
                        <input
                            className="mt-2 w-full rounded-md bg-transparent px-2 py-1 text-center text-sm text-stone-600 outline-none placeholder:text-stone-400 focus:bg-white"
                            value={item.caption ?? ""}
                            placeholder="Caption"
                            onChange={(event) =>
                                updateItem(index, {
                                    ...item,
                                    caption: event.target.value,
                                })
                            }
                        />
                    </div>
                ))}
            </div>
            {props.children}
        </PlateElement>
    );
}

function ImageUploadSurface({
    title,
    src,
    onFile,
}: {
    title: string;
    src?: string;
    onFile?: (file: File) => void;
}) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    return (
        <button
            type="button"
            className="group flex min-h-44 w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-stone-300 bg-white text-stone-500 transition-colors hover:border-stone-400 hover:bg-stone-100 focus-visible:border-stone-500"
            title={title}
            onClick={() => inputRef.current?.click()}
        >
            {src ? (
                <img
                    src={src}
                    alt={title}
                    className="max-h-[420px] w-full object-contain"
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
                    if (file) onFile?.(file);
                    event.currentTarget.value = "";
                }}
            />
        </button>
    );
}
