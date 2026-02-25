export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function highlightCss(css: string): string {
  return css
    .split("\n")
    .map((line) => {
      // Comments
      if (/^\s*\/\*/.test(line) || /^\s*\*/.test(line)) {
        return `<span class="text-text-tertiary">${escapeHtml(line)}</span>`;
      }

      // Property: value lines (e.g.  --color-primary: #FF6B5E;)
      const propMatch = line.match(/^(\s*)(--[\w-]+)(:)(.+)(;?)$/);
      if (propMatch) {
        const [, indent, prop, colon, value, semi] = propMatch;
        return `${escapeHtml(indent)}<span class="text-coral">${escapeHtml(prop)}</span>${escapeHtml(colon)}<span class="text-accent-blue">${escapeHtml(value)}</span>${escapeHtml(semi)}`;
      }

      return escapeHtml(line);
    })
    .join("\n");
}

export function highlightJson(json: string): string {
  return json
    .split("\n")
    .map((line) => {
      // Key-value pairs
      return line.replace(
        /("(?:[^"\\]|\\.)*")\s*(:?)/g,
        (match, quoted: string, colon: string) => {
          if (colon) {
            // This is a key
            return `<span class="text-coral">${escapeHtml(quoted)}</span>${escapeHtml(colon)}`;
          }
          // This is a string value
          return `<span class="text-accent-blue">${escapeHtml(quoted)}</span>`;
        },
      ).replace(
        /:\s*(\d+(?:\.\d+)?)/g,
        (_match, num: string) => {
          return `: <span class="text-accent-green">${escapeHtml(num)}</span>`;
        },
      );
    })
    .join("\n");
}
