export function DuHaLogo({ subtitle = false }: { subtitle?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div>
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-muted">Showroom</p>
        <div className="font-serif text-2xl font-bold leading-none tracking-wide text-burgundy">
          <span className="text-cherry">D</span>ũng <span className="text-cherry">H</span>ậu
        </div>
        {subtitle ? <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">AI Interior · Tile Visualization</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-1">
        <span className="h-3 w-3 rotate-45 rounded-[2px] bg-burgundy" />
        <span className="h-3 w-3 rotate-45 rounded-[2px] bg-ruby" />
        <span className="h-3 w-3 rotate-45 rounded-[2px] bg-ruby" />
        <span className="h-3 w-3 rotate-45 rounded-[2px] bg-cherry" />
      </div>
    </div>
  );
}
