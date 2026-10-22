// lessons/design-patterns/strategy/quiz/

import { Curriculum, type Lesson } from "@/lib/lessons";
import { StrategyQuiz } from "./quiz-client";

function getStrategyLesson(): Lesson {
  const lesson = Curriculum.getInstance().getLesson("design-patterns", "strategy");
  if (!lesson) throw new Error("The Strategy lesson is missing from the curriculum.");
  return lesson;
}

const strategyLesson = getStrategyLesson();

export const metadata = { title: `${strategyLesson.title} Quiz` };

export default function Page() {
  return <StrategyQuiz lesson={strategyLesson} />;
}
