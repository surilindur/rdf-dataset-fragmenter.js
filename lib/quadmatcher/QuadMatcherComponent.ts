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
  private readonly skipped: Set<string>;
  private readonly matched: Set<string>;

  /**
   * @param component The quad component to match
   * @param regex The regular expression to use when matching
   * @param probability The probability to match @range {float}
   */
  public constructor(component: QuadTermName, regex: string, probability?: number) {
    this.regex = new RegExp(regex, 'u');
    this.component = component;
    this.probability = probability ?? 1;
    this.skipped = new Set();
    this.matched = new Set();
  }

  public matches(quad: RDF.Quad): boolean {
    const componentValue = quad[this.component].value;
    if (this.regex.test(componentValue)) {
      const matchedValue = this.regex.exec(componentValue)?.at(1) ?? componentValue;
      if (this.skipped.has(matchedValue)) {
        return false;
      } else if (this.matched.has(matchedValue)) {
        return true;
      } else {
        let hash = 0;
        for (let i = 0; i < matchedValue.length; i++) {
          hash += matchedValue.charCodeAt(i);
        }
        if (hash % 100 < this.probability * 100) {
          this.matched.add(matchedValue);
          return true;
        } else {
          this.skipped.add(matchedValue);
          return false;
        }
      }
    }
    return false;
  }
}
