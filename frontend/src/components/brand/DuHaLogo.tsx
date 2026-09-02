export function DuHaLogo({ subtitle = false }: { subtitle?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div>
        <div className="font-serif text-3xl font-bold tracking-wide text-burgundy">
          <span className="text-cherry">D</span>u<span className="text-cherry">H</span>a
        </div>
        {subtitle ? <p className="text-xs uppercase tracking-[0.2em] text-muted">AI Interior · Tile Visualization</p> : null}
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
