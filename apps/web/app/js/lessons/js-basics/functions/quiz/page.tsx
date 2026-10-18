// lessons/js-basics/functions/quiz/

import { Curriculum, type Lesson } from "@/lib/lessons";
import { FunctionsQuiz } from "./quiz-client";

function getFunctionsLesson(): Lesson {
  const lesson = Curriculum.getInstance().getLesson("js-basics", "functions");
  if (!lesson) throw new Error("The Functions lesson is missing from the curriculum.");
  return lesson;
}

const functionsLesson = getFunctionsLesson();

export const metadata = { title: `${functionsLesson.title} Quiz` };

export default function Page() {
  return <FunctionsQuiz lesson={functionsLesson} />;
}