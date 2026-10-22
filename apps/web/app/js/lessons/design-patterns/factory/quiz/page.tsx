// lessons/design-patterns/factory/quiz/

import { Curriculum, type Lesson } from "@/lib/lessons";
import { FactoryQuiz } from "./quiz-client";

function getFactoryLesson(): Lesson {
  const lesson = Curriculum.getInstance().getLesson("design-patterns", "factory");
  if (!lesson) throw new Error("The Factory lesson is missing from the curriculum.");
  return lesson;
}

const factoryLesson = getFactoryLesson();

export const metadata = { title: `${factoryLesson.title} Quiz` };

export default function Page() {
  return <FactoryQuiz lesson={factoryLesson} />;
}
