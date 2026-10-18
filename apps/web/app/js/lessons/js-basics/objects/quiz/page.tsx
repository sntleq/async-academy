// lessons/js-basics/objects/quiz/

import { Curriculum, type Lesson } from "@/lib/lessons";
import { ObjectsQuiz } from "./quiz-client";

function getObjectsLesson(): Lesson {
  const lesson = Curriculum.getInstance().getLesson("js-basics", "objects");
  if (!lesson) throw new Error("The Objects lesson is missing from the curriculum.");
  return lesson;
}

const objectsLesson = getObjectsLesson();

export const metadata = { title: `${objectsLesson.title} Quiz` };

export default function Page() {
  return <ObjectsQuiz lesson={objectsLesson} />;
}