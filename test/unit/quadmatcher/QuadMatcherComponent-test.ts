import { DataFactory } from 'rdf-data-factory';

import { QuadMatcherComponent } from '../../../lib/quadmatcher/QuadMatcherComponent';

const DF = new DataFactory();

describe('QuadMatcherComponent', () => {
  let matcher: QuadMatcherComponent;

  const randomChar = () => String.fromCharCode(Math.round(Math.random() * 65_535));

  describe('matches', () => {
    it('should return true on applicable quad with 100% chance', async() => {
      matcher = new QuadMatcherComponent('subject', 's$', 1);
      expect(matcher.matches(DF.quad(DF.namedNode('ex:s'), DF.namedNode('ex:p'), DF.namedNode('ex:o')))).toBeTruthy();
    });

    it('should return true on applicable quad with 50% chance', async() => {
      matcher = new QuadMatcherComponent('subject', 's.+$', 0.5);
      const total = 40_000;
      let matchCount = 0;
      for (let i = 0; i < total; i++) {
        if (matcher.matches(DF.quad(DF.namedNode(`ex:s${randomChar()}`), DF.namedNode('ex:p'), DF.namedNode('ex:o')))) {
          matchCount++;
        }
      }
      expect(matchCount / total).toBeCloseTo(0.5);
    });

    it('should return true on applicable quad with 33% chance consistently', async() => {
      matcher = new QuadMatcherComponent('subject', 's.+$', 0.33);
      const total = 40_000;
      let matchCount = 0;
      for (let i = 0; i < total; i++) {
        const quad = DF.quad(DF.namedNode(`ex:s${randomChar()}`), DF.namedNode('ex:p'), DF.namedNode('ex:o'));
        const match1 = matcher.matches(quad);
        const match2 = matcher.matches(quad);
        expect(match1).toBe(match2);
        if (match1) {
          matchCount++;
        }
      }
      expect(matchCount / total).toBeCloseTo(0.33);
    });

    it('should return false on non-applicable quads with 100% chance', async() => {
      matcher = new QuadMatcherComponent('subject', 's$', 1);
      expect(matcher.matches(DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p'), DF.namedNode('ex:o')))).toBeFalsy();
      expect(matcher.matches(DF.quad(DF.namedNode('ex:s2'), DF.namedNode('ex:p'), DF.namedNode('ex:o')))).toBeFalsy();
    });

    it('should return false on non-applicable quads with 0% chance', async() => {
      matcher = new QuadMatcherComponent('subject', 's$', 0);
      expect(matcher.matches(DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p'), DF.namedNode('ex:o')))).toBeFalsy();
      expect(matcher.matches(DF.quad(DF.namedNode('ex:s2'), DF.namedNode('ex:p'), DF.namedNode('ex:o')))).toBeFalsy();
    });
  });
});
