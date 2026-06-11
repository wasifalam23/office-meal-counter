import { formatDate } from "./date-utils";

type MealSummaryCardProps = {
  authLoading: boolean;
  busy: boolean;
  mealsLoading: boolean;
  progress: number;
  remainingMeals: number;
  today: string;
  todayAlreadyLogged: boolean;
  todayIsWeekday: boolean;
  totalMeals: number;
  usedMeals: number;
  userSignedIn: boolean;
  onCountToday: () => void;
};

export function MealSummaryCard({
  authLoading,
  busy,
  mealsLoading,
  progress,
  remainingMeals,
  today,
  todayAlreadyLogged,
  todayIsWeekday,
  totalMeals,
  usedMeals,
  userSignedIn,
  onCountToday,
}: MealSummaryCardProps) {
  return (
    <section className="rounded-lg border border-[#d8d0c2] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6f6a61]">
            Remaining meals
          </p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-6xl font-bold leading-none">
              {remainingMeals}
            </span>
            <span className="text-lg text-[#6f6a61]">of {totalMeals}</span>
          </div>
        </div>

        <button
          className="rounded-md bg-[#25765a] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1d6049] disabled:cursor-not-allowed disabled:bg-[#9bb9ad]"
          disabled={
            authLoading ||
            mealsLoading ||
            busy ||
            !userSignedIn ||
            !todayIsWeekday ||
            todayAlreadyLogged
          }
          type="button"
          onClick={onCountToday}
        >
          {todayAlreadyLogged ? "Today counted" : "Count today"}
        </button>
      </div>

      <div className="mt-6">
        <div className="h-3 overflow-hidden rounded-full bg-[#e8e1d5]">
          <div
            className="h-full rounded-full bg-[#25765a] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between text-sm text-[#6f6a61]">
          <span>{usedMeals} meals used</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md bg-[#f6f3ec] p-4">
          <p className="text-sm text-[#6f6a61]">Today</p>
          <p className="mt-1 font-bold">{formatDate(today)}</p>
        </div>
        <div className="rounded-md bg-[#f6f3ec] p-4">
          <p className="text-sm text-[#6f6a61]">Lunch days</p>
          <p className="mt-1 font-bold">Monday to Friday</p>
        </div>
        <div className="rounded-md bg-[#f6f3ec] p-4">
          <p className="text-sm text-[#6f6a61]">Status</p>
          <p className="mt-1 font-bold">
            {remainingMeals === 0 ? "Pack complete" : "Active pack"}
          </p>
        </div>
      </div>
    </section>
  );
}
