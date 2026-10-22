export interface Lesson {
  title: string;
  slug: string;
  unitSlug: string;
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
  return { title, slug, unitSlug, href: `/js/lessons/${unitSlug}/${slug}` };
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
  createUnit("design-patterns", "Design Patterns", [
    ["factory", "Factory Pattern"],
    ["singleton", "Singleton Pattern"],
    ["strategy", "Strategy Pattern"],
    ["module", "Module Pattern"],
  ]),
  createUnit("jquery", "jQuery", [
    ["fundamentals", "Fundamentals"],
    ["selectors", "Selectors"],
    ["dom-manipulation", "DOM Manipulation"],
    ["events", "Event Handling"],
    ["ajax", "AJAX"],
    ["frontend", "Frontend Design"],
  ]),
  createUnit("modularization", "Modularization", [
    ["commonjs", "CommonJS"],
    ["amd", "AMD"],
  ]),
  createUnit("backbonejs", "Backbone.js", [
    ["overview", "Overview & Setup"],
    ["views", "Views"],
    ["events", "Events"],
    ["models", "Models"],
    ["collections", "Collections"],
    ["routers", "Routers"],
  ]),
  createUnit("nodejs", "Node.js", [
    ["overview", "Overview & Setup"],
    ["http-module", "HTTP Module"],
    ["file-system", "File System"],
    ["npm", "npm"],
    ["events", "Events"],
    ["uploading-files", "Uploading Files"],
  ]),
  createUnit("deployment", "Deployment", [
    ["client-server", "Client-Server Architecture"],
    ["intro-to-cloud", "Intro to Cloud Server"],
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

  getLesson(unitSlug: string, lessonSlug: string): Lesson | null {
    const unit = this.units.find((item) => item.slug === unitSlug);
    return unit?.items.find((lesson) => lesson.slug === lessonSlug) ?? null;
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
