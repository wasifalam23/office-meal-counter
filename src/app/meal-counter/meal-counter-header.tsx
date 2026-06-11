type MealCounterHeaderProps = {
  busy: boolean;
  totalMeals: number;
  userSignedIn: boolean;
  onSignOut: () => void;
};

export function MealCounterHeader({
  busy,
  totalMeals,
  userSignedIn,
  onSignOut,
}: MealCounterHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-5 border-b border-[#d8d0c2] pb-6 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7a5d38]">
          Office lunch
        </p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Meal Counter</h1>
      </div>

      <div className="rounded-md border border-[#d8d0c2] bg-white/70 px-4 py-3 shadow-sm">
        <p className="text-sm text-[#6f6a61]">Subscription pack</p>
        <p className="text-2xl font-bold">{totalMeals} meals</p>
        {userSignedIn ? (
          <button
            className="mt-2 text-sm font-bold text-[#8a382d]"
            disabled={busy}
            type="button"
            onClick={onSignOut}
          >
            Sign out
          </button>
        ) : null}
      </div>
    </header>
  );
}
