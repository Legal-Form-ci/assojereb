import DOMPurify from 'dompurify';

const ALLOWED_TAGS = ['p', 'strong', 'em', 'li', 'ul', 'ol', 'br', 'h1', 'h2', 'h3', 'h4', 'a', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'span', 'div', 'blockquote'];
const ALLOWED_ATTR = ['class', 'href', 'target', 'rel'];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}
