import type { Advice, AdviceLevel } from "../lib/advice";

const ADVICE_ICON: Record<AdviceLevel, string> = {
  good: "✓",
  info: "i",
  warn: "!",
  danger: "!",
};

export function AdviceList({ items }: { items: Advice[] }) {
  return (
    <div className="list">
      {items.map((a, i) => (
        <article className={`advice advice--${a.level}`} key={`${a.title}-${i}`}>
          <div className="advice__icon" aria-hidden>
            {ADVICE_ICON[a.level]}
          </div>
          <div>
            {a.kicker && <div className="advice__kicker">{a.kicker}</div>}
            <div className="advice__title">{a.title}</div>
            {a.metric && <div className="advice__metric">{a.metric}</div>}
            <div className="advice__text">{a.text}</div>
          </div>
        </article>
      ))}
    </div>
  );
}
