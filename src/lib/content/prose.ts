/**
 * Shared content primitive used by `/blog` and `/use-cases` modules.
 *
 * A piece of long-form content is an array of `ProseSection`s. Sections are
 * rendered through `<ProseRenderer>` (see `src/components/content/prose.tsx`).
 * Authoring is plain TS — no MDX tooling, no runtime markdown parser.
 */

export interface ProseSection {
  /** Optional heading rendered as an h2. */
  heading?: string;
  /** Body paragraphs. Rendered with bottom margin between each. */
  paragraphs: string[];
  /** Optional bulleted list rendered after the paragraphs. */
  list?: string[];
  /** Optional callout block rendered after list. */
  callout?: {
    variant: "info" | "warn" | "success";
    text: string;
  };
}
