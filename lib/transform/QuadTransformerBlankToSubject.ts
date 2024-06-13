import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import type { IQuadTransformer } from './IQuadTransformer';

const DF = new DataFactory();

/**
 * A quad transformer that appends a quad to matching quads.
 */
export class QuadTransformerBlankToSubject implements IQuadTransformer {
  public readonly mappings: Record<string, RDF.NamedNode>;
  public readonly regex: RegExp;

  public constructor(regex: string) {
    this.mappings = {};
    this.regex = new RegExp(regex, 'u');
  }

  public transform(quad: RDF.Quad): RDF.Quad[] {
    if (quad.subject.termType === 'NamedNode' && quad.object.termType === 'BlankNode') {
      const fragment = this.regex.exec(quad.object.value)?.at(1);
      if (fragment) {
        const subject = quad.subject.value.split('#')[0];
        this.mappings[quad.object.value] = DF.namedNode(`${subject}#${fragment}`);
      }
    }
    if (quad.subject.termType === 'BlankNode' && quad.subject.value in this.mappings) {
      quad.subject = this.mappings[quad.subject.value];
    }
    if (quad.object.termType === 'BlankNode' && quad.object.value in this.mappings) {
      quad.object = this.mappings[quad.object.value];
    }
    return [ quad ];
  }
}
