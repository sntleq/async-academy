// lessons/design-patterns/singleton/quiz/

import { Curriculum, type Lesson } from "@/lib/lessons";
import { SingletonQuiz } from "./quiz-client";

function getSingletonLesson(): Lesson {
  const lesson = Curriculum.getInstance().getLesson("design-patterns", "singleton");
  if (!lesson) throw new Error("The Singleton lesson is missing from the curriculum.");
  return lesson;
}

const singletonLesson = getSingletonLesson();

export const metadata = { title: `${singletonLesson.title} Quiz` };

export default function Page() {
  return <SingletonQuiz lesson={singletonLesson} />;
}
