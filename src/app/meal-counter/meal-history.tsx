import { formatDate } from "./date-utils";
import type { MealLog } from "./types";

type MealHistoryProps = {
  busy: boolean;
  logs: MealLog[];
  totalMeals: number;
  usedMeals: number;
  onRequestRemoveMeal: (meal: MealLog) => void;
};

export function MealHistory({
  busy,
  logs,
  totalMeals,
  usedMeals,
  onRequestRemoveMeal,
}: MealHistoryProps) {
  return (
    <section className="rounded-lg border border-[#d8d0c2] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Meal history</h2>
          <p className="mt-1 text-sm text-[#6f6a61]">
            Synced with your Supabase account.
          </p>
        </div>
        <span className="rounded-md bg-[#f6f3ec] px-3 py-2 text-sm font-bold">
          {usedMeals}/{totalMeals}
        </span>
      </div>

      {logs.length > 0 ? (
        <ul className="mt-5 divide-y divide-[#ece5da]">
          {logs.map((log) => (
            <li
              className="flex items-center justify-between gap-4 py-3"
              key={log.id}
            >
              <div>
                <p className="font-bold">{formatDate(log.date)}</p>
                <p className="text-sm text-[#6f6a61]">{log.date}</p>
              </div>
              <button
                className="rounded-md px-3 py-2 text-sm font-bold text-[#8a382d] transition hover:bg-[#f9ebe8] disabled:cursor-not-allowed disabled:text-[#b9b2a7]"
                disabled={busy}
                type="button"
                onClick={() => onRequestRemoveMeal(log)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 rounded-md bg-[#f6f3ec] p-5 text-sm text-[#6f6a61]">
          No meals counted yet. Count your first office lunch when you use one
          from this pack.
        </div>
      )}
    </section>
  );
}
