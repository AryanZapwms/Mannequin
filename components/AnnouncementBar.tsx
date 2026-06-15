const MESSAGE = "FREE DELIVERY ON ORDERS ABOVE ₹499";
const MESSAGE_2 = "VITAMIN E SPECIALLY FORMULATED FOR INDIAN WOMEN";

function MarqueeSet({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={ariaHidden}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span className="px-4 font-sub text-[11px] font-medium uppercase tracking-[0.18em] text-brand-espresso sm:text-xs">
            {MESSAGE}
          </span>
          <span aria-hidden className="text-brand-espresso/50">
            &#10022;
          </span>
          <span className="px-4 font-sub text-[11px] font-medium uppercase tracking-[0.18em] text-brand-espresso sm:text-xs">
            {MESSAGE_2}
          </span>
          <span aria-hidden className="text-brand-espresso/50">
            &#10022;
          </span>
        </span>
      ))}
    </div>
  );
}

export default function AnnouncementBar() {
  return (
    <div className="group relative h-9 w-full overflow-hidden bg-brand-gold-500">
      <div className="flex h-full w-max animate-marquee items-center group-hover:[animation-play-state:paused]">
        <MarqueeSet />
        <MarqueeSet ariaHidden />
      </div>
    </div>
  );
}
