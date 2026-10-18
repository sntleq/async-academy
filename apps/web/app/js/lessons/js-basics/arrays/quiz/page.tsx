// lessons/js-basics/arrays/quiz/

import { Curriculum, type Lesson } from "@/lib/lessons";
import { ArraysQuiz } from "./quiz-client";

function getArraysLesson(): Lesson {
  const lesson = Curriculum.getInstance().getLesson("js-basics", "arrays");
  if (!lesson) throw new Error("The Arrays lesson is missing from the curriculum.");
  return lesson;
}

const arraysLesson = getArraysLesson();

export const metadata = { title: `${arraysLesson.title} Quiz` };

export default function Page() {
  return <ArraysQuiz lesson={arraysLesson} />;
}