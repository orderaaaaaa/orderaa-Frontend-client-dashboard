import { Fragment } from 'react';

export function VisualizedSpelling({ text }: { text: string }) {
  const leadingMatch = text.match(/^\s+/);
  const trailingMatch = text.match(/\s+$/);
  const leading = leadingMatch?.[0] ?? '';
  const trailing = trailingMatch?.[0] ?? '';
  const core = text.slice(leading.length, text.length - trailing.length);

  return (
    <span dir="rtl" className="whitespace-pre">
      {leading && (
        <span className="text-muted-foreground" aria-hidden>
          {'·'.repeat(leading.length)}
        </span>
      )}
      {core || <Fragment>&nbsp;</Fragment>}
      {trailing && (
        <span className="text-muted-foreground" aria-hidden>
          {'·'.repeat(trailing.length)}
        </span>
      )}
    </span>
  );
}
