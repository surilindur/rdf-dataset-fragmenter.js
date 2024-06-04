import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import type { IQuadMatcher } from '../quadmatcher/IQuadMatcher';
import type { IQuadTransformer } from './IQuadTransformer';
import type { ITermTemplate } from './termtemplate/ITermTemplate';

const DF = new DataFactory();

/**
 * A quad transformer that selectively replaces quads.
 */
export class QuadTransformerReplaceQuad implements IQuadTransformer {
  public constructor(
    public readonly matcher: IQuadMatcher,
    public readonly subject: ITermTemplate,
    public readonly predicate: ITermTemplate,
    public readonly object: ITermTemplate,
    public readonly graph: ITermTemplate,
  ) {}

  public transform(quad: RDF.Quad): RDF.Quad[] {
    if (this.matcher.matches(quad)) {
      return [ DF.quad(
        <RDF.Quad_Subject> this.subject.getTerm(quad),
        <RDF.Quad_Predicate> this.predicate.getTerm(quad),
        <RDF.Quad_Object> this.object.getTerm(quad),
        <RDF.Quad_Graph> this.graph.getTerm(quad),
      ) ];
    }
    return [ quad ];
  }
}
