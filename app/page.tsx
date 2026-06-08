"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

const TOTAL_MEALS = 26;

type MealLog = {
  id: string;
  date: string;
};

type MealEntryRow = {
  id: string;
  date: string;
};

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function isWeekday(dateKey: string) {
  const day = parseDateKey(dateKey).getDay();

  return day >= 1 && day <= 5;
}

function formatDate(dateKey: string) {
  return dayFormatter.format(parseDateKey(dateKey));
}

export default function Home() {
  const today = getLocalDateKey();
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => {
    let ignore = false;

    async function loadSession() {
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!ignore) {
        if (sessionError) {
          setError(sessionError.message);
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setAuthLoading(false);
      }
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => setLogs([]));
      return;
    }

    let ignore = false;
    const userId = user.id;

    async function loadMeals() {
      setMealsLoading(true);
      setError("");

      const { data, error: entriesError } = await supabase
        .from("meal_entries")
        .select("id, date")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (ignore) {
        return;
      }

      if (entriesError) {
        setError(entriesError.message);
      } else {
        setLogs(
          ((data ?? []) as MealEntryRow[]).map((entry) => ({
            id: entry.id,
            date: entry.date,
          })),
        );
      }

      setMealsLoading(false);
    }

    void loadMeals();

    return () => {
      ignore = true;
    };
  }, [user]);

  const usedMeals = logs.length;
  const remainingMeals = Math.max(TOTAL_MEALS - usedMeals, 0);
  const progress = Math.min((usedMeals / TOTAL_MEALS) * 100, 100);
  const selectedAlreadyLogged = logs.some((log) => log.date === selectedDate);
  const todayAlreadyLogged = logs.some((log) => log.date === today);

  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => b.date.localeCompare(a.date)),
    [logs],
  );

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || busy) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      setMessage("Check your email for the sign-in link.");
    }

    setBusy(false);
  }

  async function signOut() {
    setBusy(true);
    setError("");
    setMessage("");

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
    }

    setBusy(false);
  }

  async function addMeal(date: string) {
    if (
      !user ||
      !isWeekday(date) ||
      logs.some((log) => log.date === date) ||
      busy
    ) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    const { data, error: insertError } = await supabase
      .from("meal_entries")
      .insert({
        user_id: user.id,
        date,
      })
      .select("id, date")
      .single();

    if (insertError) {
      setError(insertError.message);
    } else if (data) {
      const entry = data as MealEntryRow;

      setLogs((currentLogs) => [
        ...currentLogs,
        {
          id: entry.id,
          date: entry.date,
        },
      ]);
    }

    setBusy(false);
  }

  async function removeMeal(id: string) {
    if (!user || busy) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("meal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setLogs((currentLogs) => currentLogs.filter((log) => log.id !== id));
    }

    setBusy(false);
  }

  async function resetCycle() {
    if (!user || busy) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("meal_entries")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setLogs([]);
    }

    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-[#f6f3ec] px-4 py-6 text-[#20201d] sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-5 border-b border-[#d8d0c2] pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7a5d38]">
              Office lunch
            </p>
            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
              Meal Counter
            </h1>
          </div>

          <div className="rounded-md border border-[#d8d0c2] bg-white/70 px-4 py-3 shadow-sm">
            <p className="text-sm text-[#6f6a61]">Subscription pack</p>
            <p className="text-2xl font-bold">{TOTAL_MEALS} meals</p>
            {user ? (
              <button
                className="mt-2 text-sm font-bold text-[#8a382d]"
                disabled={busy}
                type="button"
                onClick={signOut}
              >
                Sign out
              </button>
            ) : null}
          </div>
        </header>

        {(message || error) && (
          <div className="rounded-md border border-[#d8d0c2] bg-white px-4 py-3 text-sm shadow-sm">
            {message ? <p className="font-bold text-[#25765a]">{message}</p> : null}
            {error ? <p className="font-bold text-[#8a382d]">{error}</p> : null}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
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
                  <span className="text-lg text-[#6f6a61]">
                    of {TOTAL_MEALS}
                  </span>
                </div>
              </div>

              <button
                className="rounded-md bg-[#25765a] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1d6049] disabled:cursor-not-allowed disabled:bg-[#9bb9ad]"
                disabled={
                  authLoading ||
                  mealsLoading ||
                  busy ||
                  !user ||
                  !isWeekday(today) ||
                  todayAlreadyLogged
                }
                type="button"
                onClick={() => void addMeal(today)}
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

          <section className="rounded-lg border border-[#d8d0c2] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold">Add a meal</h2>
            <p className="mt-1 text-sm text-[#6f6a61]">
              Pick any weekday lunch date if you forgot to count it earlier.
            </p>

            {user ? (
              <>
                <div className="mt-5 flex flex-col gap-3">
                  <input
                    className="rounded-md border border-[#cfc6b7] bg-white px-3 py-3 text-base outline-none transition focus:border-[#25765a] focus:ring-2 focus:ring-[#25765a]/20"
                    max="9999-12-31"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                  />

                  <button
                    className="rounded-md border border-[#25765a] px-5 py-3 text-sm font-bold text-[#1d6049] transition hover:bg-[#eaf3ef] disabled:cursor-not-allowed disabled:border-[#cfc6b7] disabled:text-[#9d968a]"
                    disabled={
                      mealsLoading ||
                      busy ||
                      !isWeekday(selectedDate) ||
                      selectedAlreadyLogged
                    }
                    type="button"
                    onClick={() => void addMeal(selectedDate)}
                  >
                    {selectedAlreadyLogged
                      ? "Date already counted"
                      : isWeekday(selectedDate)
                        ? "Add selected date"
                        : "Weekdays only"}
                  </button>
                </div>

                <button
                  className="mt-5 w-full rounded-md bg-[#20201d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3a3934] disabled:cursor-not-allowed disabled:bg-[#b9b2a7]"
                  disabled={busy || logs.length === 0}
                  type="button"
                  onClick={() => void resetCycle()}
                >
                  Start new 26-meal pack
                </button>
              </>
            ) : (
              !authLoading &&
              !session && (
                <form className="mt-5 flex flex-col gap-3" onSubmit={signIn}>
                  <input
                    className="rounded-md border border-[#cfc6b7] bg-white px-3 py-3 text-base outline-none transition focus:border-[#25765a] focus:ring-2 focus:ring-[#25765a]/20"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
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
        </div>

        <section className="rounded-lg border border-[#d8d0c2] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Meal history</h2>
              <p className="mt-1 text-sm text-[#6f6a61]">
                Synced with your Supabase account.
              </p>
            </div>
            <span className="rounded-md bg-[#f6f3ec] px-3 py-2 text-sm font-bold">
              {usedMeals}/{TOTAL_MEALS}
            </span>
          </div>

          {sortedLogs.length > 0 ? (
            <ul className="mt-5 divide-y divide-[#ece5da]">
              {sortedLogs.map((log) => (
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
                    onClick={() => void removeMeal(log.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-md bg-[#f6f3ec] p-5 text-sm text-[#6f6a61]">
              No meals counted yet. Count your first office lunch when you use
              one from this pack.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
