import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import type { QuadTermName } from 'rdf-terms';
import type { ITermTemplate } from './ITermTemplate';

const DF = new DataFactory();

/**
 * A term template that transforms the value if another component using regex.
 */
export class TermTemplateRegexNamedNode implements ITermTemplate {
  public readonly component: QuadTermName;
  public readonly regex: RegExp;
  public readonly replacement: string;

  public constructor(component: QuadTermName, regex: string, replacement: string) {
    this.component = component;
    this.regex = new RegExp(regex, 'u');
    this.replacement = replacement;
  }

  public getTerm(quad: RDF.Quad): RDF.Term {
    const term = quad[this.component];
    if (term.termType === 'NamedNode' && this.regex.test(term.value)) {
      return DF.namedNode(term.value.replace(this.regex, this.replacement));
    }
    return term;
  }
}
