// lessons/design-patterns/module/quiz/

import { Curriculum, type Lesson } from "@/lib/lessons";
import { ModuleQuiz } from "./quiz-client";

function getModuleLesson(): Lesson {
  const lesson = Curriculum.getInstance().getLesson("design-patterns", "module");
  if (!lesson) throw new Error("The Module lesson is missing from the curriculum.");
  return lesson;
}

const moduleLesson = getModuleLesson();

export const metadata = { title: `${moduleLesson.title} Quiz` };

export default function Page() {
  return <ModuleQuiz lesson={moduleLesson} />;
}
