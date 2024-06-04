import type * as RDF from '@rdfjs/types';
import type { QuadTermName } from 'rdf-terms';
import type { IQuadMatcher } from './IQuadMatcher';

/**
 * Matches a quad by the given predicate regex.
 */
export class QuadMatcherComponent implements IQuadMatcher {
  private readonly regex: RegExp;
  private readonly component: QuadTermName;
  private readonly probability: number;
  private readonly matched: Set<number>;
  private readonly accepted: Set<number>;

  public constructor(component: QuadTermName, regex: string, probability?: number) {
    this.regex = new RegExp(regex, 'u');
    this.component = component;
    this.probability = probability ?? 1;
    this.matched = new Set();
    this.accepted = new Set();
  }

  public matches(quad: RDF.Quad): boolean {
    const componentValue = quad[this.component].value;
    if (this.regex.test(componentValue)) {
      let hash = 0;
      for (let i = 0; i < componentValue.length; i++) {
        hash += componentValue.charCodeAt(i);
      }
      if (!this.matched.has(hash)) {
        this.matched.add(hash);
        if (hash % 100 < this.probability * 100) {
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
