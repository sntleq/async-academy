import { Curriculum, type Lesson } from "@/lib/lessons";
import { VariablesQuiz } from "./quiz-client";

function getVariablesLesson(): Lesson {
  const lesson = Curriculum.getInstance().getLesson("js-basics", "variables");
  if (!lesson) throw new Error("The Variables lesson is missing from the curriculum.");
  return lesson;
}

const variablesLesson = getVariablesLesson();

export const metadata = { title: `${variablesLesson.title} Quiz` };

export default function Page() {
  return <VariablesQuiz lesson={variablesLesson} />;
}
