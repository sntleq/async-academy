"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseClient, isFirebaseConfigured } from "@/lib/firebase/client";
import { subscribeToProgress, type LessonProgress } from "@/lib/firebase/progress";
import type { Lesson } from "@/lib/lessons";

interface AuthState {
  user: User | null;
  loading: boolean;
  configured: boolean;
  completedLessons: LessonProgress[];
  progressLoading: boolean;
  progressError: boolean;
  markLessonCompleted: (lesson: Lesson) => void;
  unmarkLessonCompleted: (lesson: Lesson) => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  configured: false,
  completedLessons: [],
  progressLoading: false,
  progressError: false,
  markLessonCompleted: () => {},
  unmarkLessonCompleted: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<LessonProgress[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState(false);

  useEffect(() => {
    const client = getFirebaseClient();
    if (!client) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(client.auth, (nextUser) => {
      setUser(nextUser);
      setCompletedLessons([]);
      setProgressLoading(Boolean(nextUser));
      setProgressError(false);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setCompletedLessons([]);
      setProgressLoading(false);
      setProgressError(false);
      return;
    }

    setProgressLoading(true);
    return subscribeToProgress(
      user.uid,
      (items) => {
        setCompletedLessons(items);
        setProgressLoading(false);
        setProgressError(false);
      },
      () => {
        setProgressLoading(false);
        setProgressError(true);
      }
    );
  }, [user]);

  function markLessonCompleted(lesson: Lesson) {
    setCompletedLessons((items) => {
      if (items.some((item) => item.unitSlug === lesson.unitSlug && item.lessonSlug === lesson.slug)) {
        return items;
      }
      return [...items, { lessonSlug: lesson.slug, lessonTitle: lesson.title, unitSlug: lesson.unitSlug }];
    });
  }

  function unmarkLessonCompleted(lesson: Lesson) {
    setCompletedLessons((items) =>
      items.filter((item) => !(item.unitSlug === lesson.unitSlug && item.lessonSlug === lesson.slug))
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: isFirebaseConfigured,
        completedLessons,
        progressLoading,
        progressError,
        markLessonCompleted,
        unmarkLessonCompleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
