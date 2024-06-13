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

  /**
   * @param component The quad component to match
   * @param regex The regular expression to use when matching
   * @param probability The probability to match @range {float}
   */
  public constructor(component: QuadTermName, regex: string, probability?: number) {
    this.regex = new RegExp(regex, 'u');
    this.component = component;
    this.probability = probability ?? 1;
  }

  public matches(quad: RDF.Quad): boolean {
    const componentValue = quad[this.component].value;
    const matchResult = this.regex.exec(componentValue);
    if (matchResult) {
      const matchedValue = matchResult.at(1) ?? componentValue;
      let hash = 0;
      for (let i = 0; i < matchedValue.length; i++) {
        hash += matchedValue.charCodeAt(i);
      }
      if (hash % 100 < this.probability * 100) {
        return true;
      }
    }
    return false;
  }
}
