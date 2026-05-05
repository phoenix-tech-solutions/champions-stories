import type { Value } from "platejs";

export type StoryImageNode = {
    type: "story-image";
    imageIndex: number;
    caption?: string;
    children: [{ text: "" }];
};

export type StoryImageRowItem = {
    imageIndex: number;
    caption?: string;
};

export type StoryImageRowNode = {
    type: "story-image-row";
    items: StoryImageRowItem[];
    children: [{ text: "" }];
};

type TextLeaf = {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
};

const emptyParagraph = (): Value[number] => ({
    type: "p",
    children: [{ text: "" }],
});

const imageNode = (imageIndex: number, caption?: string): StoryImageNode => ({
    type: "story-image",
    imageIndex,
    ...(caption ? { caption } : {}),
    children: [{ text: "" }],
});

const imageRowNode = (items: StoryImageRowItem[]): StoryImageRowNode => ({
    type: "story-image-row",
    items,
    children: [{ text: "" }],
});

export function slugFromTitle(title: string) {
    return title
        .trim()
        .toLowerCase()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}

export function parseStoredEditorValue(
    body: string,
    bodyEditorJson?: string | null,
): Value {
    if (bodyEditorJson) {
        try {
            const parsed = JSON.parse(bodyEditorJson) as unknown;
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed as Value;
            }
        } catch {
            // Fall back to the legacy body format below.
        }
    }

    return storyBodyToEditorValue(body);
}

export function storyBodyToEditorValue(body: string): Value {
    const blocks = body
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean);

    if (blocks.length === 0) return [emptyParagraph()];

    return blocks.map((block) => {
        const rowMatch = block.match(/^\[img-box\|([\s\S]+?)\|img-box\]$/);
        if (rowMatch) {
            const items = [...rowMatch[1].matchAll(imageTokenRegex())].map((match) => ({
                imageIndex: Number(match[1]),
                ...(match[2] ? { caption: match[2] } : {}),
            }));
            return imageRowNode(items.length > 0 ? items : [{ imageIndex: 1 }]);
        }

        const imageMatch = block.match(/^{{image:(\d+)}}(?:\[caption:([^\]]+)\])?$/);
        if (imageMatch) {
            return imageNode(Number(imageMatch[1]), imageMatch[2]);
        }

        const headingMatch = block.match(/^(#{1,3})\s+(.+)$/);
        if (headingMatch) {
            return {
                type: `h${headingMatch[1].length}`,
                children: parseInlineText(headingMatch[2]),
            };
        }

        if (block.startsWith("> ")) {
            return {
                type: "blockquote",
                children: parseInlineText(block.replace(/^>\s?/gm, "")),
            };
        }

        return {
            type: "p",
            children: parseInlineText(block),
        };
    }) as Value;
}

export function editorValueToStoryBody(value: Value) {
    return value
        .map((node) => nodeToBodyBlock(node as Record<string, unknown>))
        .filter(Boolean)
        .join("\n\n")
        .trim();
}

export function nextImageIndex(value: Value) {
    const refs = collectImageIndexes(value);
    return refs.length === 0 ? 1 : Math.max(...refs) + 1;
}

export function collectImageIndexes(value: Value) {
    const indexes: number[] = [];

    for (const node of value as Array<Record<string, unknown>>) {
        if (node.type === "story-image" && typeof node.imageIndex === "number") {
            indexes.push(node.imageIndex);
        }
        if (node.type === "story-image-row" && Array.isArray(node.items)) {
            for (const item of node.items as StoryImageRowItem[]) {
                if (typeof item.imageIndex === "number") indexes.push(item.imageIndex);
            }
        }
    }

    return indexes;
}

function nodeToBodyBlock(node: Record<string, unknown>) {
    const type = String(node.type ?? "p");

    if (type === "story-image") {
        return imageToken(Number(node.imageIndex), stringValue(node.caption));
    }

    if (type === "story-image-row") {
        const items = Array.isArray(node.items)
            ? (node.items as StoryImageRowItem[])
            : [];
        const inner = items
            .map((item) => imageToken(item.imageIndex, item.caption))
            .join(" ");
        return `[img-box| ${inner} |img-box]`;
    }

    const children = Array.isArray(node.children)
        ? (node.children as TextLeaf[])
        : [];
    const text = childrenToMarkdown(children);

    if (!text) return "";
    if (type === "h1") return `# ${text}`;
    if (type === "h2") return `## ${text}`;
    if (type === "h3") return `### ${text}`;
    if (type === "blockquote") {
        return text.split("\n").map((line) => `> ${line}`).join("\n");
    }
    return text;
}

function childrenToMarkdown(children: TextLeaf[]) {
    return children
        .map((leaf) => {
            let text = leaf.text ?? "";
            if (leaf.bold) text = `**${text}**`;
            if (leaf.italic) text = `*${text}*`;
            if (leaf.underline) text = `<u>${text}</u>`;
            return text;
        })
        .join("");
}

function parseInlineText(text: string): TextLeaf[] {
    const leaves: TextLeaf[] = [];
    const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|<u>[\s\S]+?<\/u>)/g;
    let lastIndex = 0;

    for (const match of text.matchAll(pattern)) {
        if (match.index === undefined) continue;
        if (match.index > lastIndex) {
            leaves.push({ text: text.slice(lastIndex, match.index) });
        }

        const token = match[0];
        if (token.startsWith("**")) {
            leaves.push({ text: token.slice(2, -2), bold: true });
        } else if (token.startsWith("*")) {
            leaves.push({ text: token.slice(1, -1), italic: true });
        } else {
            leaves.push({ text: token.slice(3, -4), underline: true });
        }
        lastIndex = match.index + token.length;
    }

    if (lastIndex < text.length) leaves.push({ text: text.slice(lastIndex) });
    return leaves.length > 0 ? leaves : [{ text: "" }];
}

function imageToken(index: number, caption?: string) {
    const safeIndex = Number.isFinite(index) && index > 0 ? Math.floor(index) : 1;
    const safeCaption = caption?.trim();
    return `{{image:${safeIndex}}}${safeCaption ? `[caption:${safeCaption}]` : ""}`;
}

function imageTokenRegex() {
    return /{{image:(\d+)}}(?:\[caption:([^\]]+)\])?/g;
}

function stringValue(value: unknown) {
    return typeof value === "string" ? value : undefined;
}
