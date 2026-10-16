export interface Lesson {
  title: string;
  slug: string;
  href: string;
}

export interface Unit {
  title: string;
  slug: string;
  items: Lesson[];
}

type LessonSpec = readonly [slug: string, title: string];

// Factory: builds a lesson so nobody ever types an href by hand
function createLesson(unitSlug: string, [slug, title]: LessonSpec): Lesson {
  return { title, slug, href: `/lessons/${unitSlug}/${slug}` };
}

// Factory: builds a unit and all of its lessons
function createUnit(slug: string, title: string, specs: LessonSpec[]): Unit {
  return {
    title,
    slug,
    items: specs.map((spec) => createLesson(slug, spec)),
  };
}

// The hardcoded curriculum: an array of unit objects, each holding an array of lesson objects
const units: Unit[] = [
  createUnit("js-basics", "JavaScript Basics", [
    ["variables", "Variables"],
    ["arrays", "Arrays"],
    ["objects", "Objects"],
    ["functions", "Functions"],
  ]),
  createUnit("design-patterns", "Design Patterns & jQuery", [
    ["factory", "Factory Pattern"],
    ["singleton", "Singleton Pattern"],
    ["jquery-selectors", "jQuery Selectors"],
  ]),
  createUnit("modularization", "Modularization & Frontend", [
    ["commonjs-amd", "CommonJS & AMD"],
    ["jquery-events", "jQuery Events & AJAX"],
  ]),
  createUnit("backbone", "Backbone.js", [
    ["views", "Views"],
    ["models-collections", "Models & Collections"],
    ["routers", "Routers"],
  ]),
  createUnit("nodejs", "Node.js", [
    ["http-module", "HTTP Module"],
    ["file-system", "File System"],
    ["npm-events", "npm & Events"],
  ]),
  createUnit("deployment", "Deployment", [
    ["client-server", "Client-Server Architecture"],
    ["npm-package", "npm Package Deployment"],
  ]),
];

// Singleton: one shared Curriculum, with the flat lesson list built once
export class Curriculum {
  private static instance: Curriculum | null = null;

  private readonly units: Unit[];
  private readonly lessons: Lesson[];

  private constructor(allUnits: Unit[]) {
    this.units = allUnits;
    this.lessons = allUnits.flatMap((unit) => unit.items);
  }

  static getInstance(): Curriculum {
    if (!Curriculum.instance) {
      Curriculum.instance = new Curriculum(units);
    }
    return Curriculum.instance;
  }

  getUnits(): Unit[] {
    return this.units;
  }

  getAdjacent(href: string): { prev: Lesson | null; next: Lesson | null } {
    const index = this.lessons.findIndex((lesson) => lesson.href === href);

    if (index === -1) {
      return { prev: null, next: null };
    }

    return {
      prev: this.lessons[index - 1] ?? null,
      next: this.lessons[index + 1] ?? null,
    };
  }
}
