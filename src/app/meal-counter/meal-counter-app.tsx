"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { AddMealPanel } from "./add-meal-panel";
import { ConfirmationModal } from "./confirmation-modal";
import { formatDate, getLocalDateKey, isWeekday } from "./date-utils";
import { MealCounterHeader } from "./meal-counter-header";
import { MealHistory } from "./meal-history";
import { MealSummaryCard } from "./meal-summary-card";
import { StatusMessage } from "./status-message";
import type { MealEntryRow, MealLog } from "./types";

const TOTAL_MEALS = 26;

export function MealCounterApp() {
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
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mealToRemove, setMealToRemove] = useState<MealLog | null>(null);

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
    } else {
      setShowSignOutConfirm(false);
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
      setMealToRemove(null);
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
      setShowResetConfirm(false);
    }

    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-[#f6f3ec] px-4 py-6 text-[#20201d] sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col gap-6">
        <MealCounterHeader
          busy={busy}
          totalMeals={TOTAL_MEALS}
          userSignedIn={Boolean(user)}
          onSignOut={() => setShowSignOutConfirm(true)}
        />

        <StatusMessage error={error} message={message} />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <MealSummaryCard
            authLoading={authLoading}
            busy={busy}
            mealsLoading={mealsLoading}
            progress={progress}
            remainingMeals={remainingMeals}
            today={today}
            todayAlreadyLogged={todayAlreadyLogged}
            todayIsWeekday={isWeekday(today)}
            totalMeals={TOTAL_MEALS}
            usedMeals={usedMeals}
            userSignedIn={Boolean(user)}
            onCountToday={() => void addMeal(today)}
          />

          <AddMealPanel
            authLoading={authLoading}
            busy={busy}
            email={email}
            hasLogs={logs.length > 0}
            mealsLoading={mealsLoading}
            selectedAlreadyLogged={selectedAlreadyLogged}
            selectedDate={selectedDate}
            selectedIsWeekday={isWeekday(selectedDate)}
            sessionExists={Boolean(session)}
            userSignedIn={Boolean(user)}
            onAddSelectedDate={() => void addMeal(selectedDate)}
            onEmailChange={setEmail}
            onOpenResetConfirm={() => setShowResetConfirm(true)}
            onSelectedDateChange={setSelectedDate}
            onSignIn={(event) => void signIn(event)}
          />
        </div>

        <MealHistory
          busy={busy}
          logs={sortedLogs}
          totalMeals={TOTAL_MEALS}
          usedMeals={usedMeals}
          onRequestRemoveMeal={setMealToRemove}
        />
      </section>

      {showSignOutConfirm ? (
        <ConfirmationModal
          cancelLabel="Stay signed in"
          confirmLabel="Yes, sign out"
          confirmTitle="Sign out?"
          disabled={busy}
          message={
            <p>
              You will need to use your email sign-in link again before adding
              or editing meals.
            </p>
          }
          titleId="sign-out-title"
          onCancel={() => setShowSignOutConfirm(false)}
          onConfirm={() => void signOut()}
        />
      ) : null}

      {showResetConfirm ? (
        <ConfirmationModal
          cancelLabel="Keep current pack"
          confirmLabel="Yes, start new pack"
          confirmTitle="Start new pack?"
          disabled={busy}
          message={
            <p>
              This will remove your current {usedMeals} counted meal
              {usedMeals === 1 ? "" : "s"} from Supabase and reset this pack to
              zero.
            </p>
          }
          titleId="reset-pack-title"
          onCancel={() => setShowResetConfirm(false)}
          onConfirm={() => void resetCycle()}
        />
      ) : null}

      {mealToRemove ? (
        <ConfirmationModal
          cancelLabel="Keep meal"
          confirmLabel="Yes, remove meal"
          confirmTitle="Remove meal?"
          disabled={busy}
          message={
            <p>
              This will delete the meal counted for{" "}
              <span className="font-bold text-[#20201d]">
                {formatDate(mealToRemove.date)}
              </span>{" "}
              from Supabase.
            </p>
          }
          titleId="remove-meal-title"
          onCancel={() => setMealToRemove(null)}
          onConfirm={() => void removeMeal(mealToRemove.id)}
        />
      ) : null}
    </main>
  );
}
