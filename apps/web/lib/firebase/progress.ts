import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase/client";
import type { Lesson } from "@/lib/lessons";

export interface LessonProgress {
  lessonSlug: string;
  lessonTitle: string;
  unitSlug: string;
}

export function subscribeToProgress(
  userId: string,
  onUpdate: (lessons: LessonProgress[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const client = getFirebaseClient();
  if (!client) throw new Error("Firebase is not configured yet.");

  return onSnapshot(
    collection(client.db, "users", userId, "progress"),
    (snapshot) => {
      onUpdate(snapshot.docs.map((item) => item.data() as LessonProgress));
    },
    (error) => onError(error)
  );
}

export async function saveLessonCompletion(userId: string, lesson: Lesson) {
  const client = getFirebaseClient();
  if (!client) throw new Error("Firebase is not configured yet.");

  const progressId = `${lesson.unitSlug}-${lesson.slug}`;
  await setDoc(
    doc(client.db, "users", userId, "progress", progressId),
    {
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      unitSlug: lesson.unitSlug,
      completedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
