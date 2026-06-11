import type { FormEvent } from "react";

type AddMealPanelProps = {
  authLoading: boolean;
  busy: boolean;
  email: string;
  mealsLoading: boolean;
  selectedAlreadyLogged: boolean;
  selectedDate: string;
  selectedIsWeekday: boolean;
  sessionExists: boolean;
  userSignedIn: boolean;
  hasLogs: boolean;
  onAddSelectedDate: () => void;
  onEmailChange: (email: string) => void;
  onOpenResetConfirm: () => void;
  onSelectedDateChange: (date: string) => void;
  onSignIn: (event: FormEvent<HTMLFormElement>) => void;
};

export function AddMealPanel({
  authLoading,
  busy,
  email,
  mealsLoading,
  selectedAlreadyLogged,
  selectedDate,
  selectedIsWeekday,
  sessionExists,
  userSignedIn,
  hasLogs,
  onAddSelectedDate,
  onEmailChange,
  onOpenResetConfirm,
  onSelectedDateChange,
  onSignIn,
}: AddMealPanelProps) {
  return (
    <section className="rounded-lg border border-[#d8d0c2] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold">Add a meal</h2>
      <p className="mt-1 text-sm text-[#6f6a61]">
        Pick any weekday lunch date if you forgot to count it earlier.
      </p>

      {userSignedIn ? (
        <>
          <div className="mt-5 flex flex-col gap-3">
            <input
              className="rounded-md border border-[#cfc6b7] bg-white px-3 py-3 text-base outline-none transition focus:border-[#25765a] focus:ring-2 focus:ring-[#25765a]/20"
              max="9999-12-31"
              type="date"
              value={selectedDate}
              onChange={(event) => onSelectedDateChange(event.target.value)}
            />

            <button
              className="rounded-md border border-[#25765a] px-5 py-3 text-sm font-bold text-[#1d6049] transition hover:bg-[#eaf3ef] disabled:cursor-not-allowed disabled:border-[#cfc6b7] disabled:text-[#9d968a]"
              disabled={
                mealsLoading ||
                busy ||
                !selectedIsWeekday ||
                selectedAlreadyLogged
              }
              type="button"
              onClick={onAddSelectedDate}
            >
              {selectedAlreadyLogged
                ? "Date already counted"
                : selectedIsWeekday
                  ? "Add selected date"
                  : "Weekdays only"}
            </button>
          </div>

          <button
            className="mt-5 w-full rounded-md bg-[#20201d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3a3934] disabled:cursor-not-allowed disabled:bg-[#b9b2a7]"
            disabled={busy || !hasLogs}
            type="button"
            onClick={onOpenResetConfirm}
          >
            Start new 26-meal pack
          </button>
        </>
      ) : (
        !authLoading &&
        !sessionExists && (
          <form className="mt-5 flex flex-col gap-3" onSubmit={onSignIn}>
            <input
              className="rounded-md border border-[#cfc6b7] bg-white px-3 py-3 text-base outline-none transition focus:border-[#25765a] focus:ring-2 focus:ring-[#25765a]/20"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
            />
            <button
              className="rounded-md border border-[#25765a] px-5 py-3 text-sm font-bold text-[#1d6049] transition hover:bg-[#eaf3ef] disabled:cursor-not-allowed disabled:border-[#cfc6b7] disabled:text-[#9d968a]"
              disabled={authLoading || busy || !email.trim()}
              type="submit"
            >
              Send sign-in link
            </button>
          </form>
        )
      )}
    </section>
  );
}
