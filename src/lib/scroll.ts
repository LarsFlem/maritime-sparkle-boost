/** Route state that asks the next page to scroll to a section, e.g. `{ scrollTo: "contact" }`. */
export type ScrollState = { scrollTo?: string } | null;

export const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};
