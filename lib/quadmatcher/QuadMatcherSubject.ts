import type * as RDF from '@rdfjs/types';
import type { IQuadMatcher } from './IQuadMatcher';

/**
 * Matches a quad by the given subject regex.
 */
export class QuadMatcherSubject implements IQuadMatcher {
  private readonly subject: RegExp;
  private readonly threshold: number;
  private readonly matched: Set<number>;
  private readonly accepted: Set<number>;

  public constructor(subjectRegex: string, chance: number) {
    this.subject = new RegExp(subjectRegex, 'u');
    this.threshold = 100 * chance;
    this.matched = new Set();
    this.accepted = new Set();
  }

  public matches(quad: RDF.Quad): boolean {
    if (this.subject.test(quad.subject.value)) {
      let hash = 0;
      for (let i = 0; i < quad.subject.value.length; i++) {
        hash += quad.subject.value.charCodeAt(i);
      }
      if (!this.matched.has(hash)) {
        this.matched.add(hash);
        if (hash % 100 < this.threshold) {
          this.accepted.add(hash);
          return true;
        }
      } else if (this.accepted.has(hash)) {
        return true;
      }
    }
    return false;
  }
}
