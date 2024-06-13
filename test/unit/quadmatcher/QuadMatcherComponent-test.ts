import { DataFactory } from 'rdf-data-factory';

import { QuadMatcherComponent } from '../../../lib/quadmatcher/QuadMatcherComponent';

const DF = new DataFactory();

describe('QuadMatcherComponent', () => {
  let matcher: QuadMatcherComponent;
  const charCodeMax = 65_535;
  const probabilitySampleSize = Math.floor(charCodeMax * 0.51);
  const randomChar = () => String.fromCharCode(Math.round(Math.random() * charCodeMax));

  describe('matches', () => {
    it.each([
      [ true, 'matching', 'noncapturing', undefined ],
      [ true, 'matching', 'noncapturing', 1 ],
      [ true, 'matching', 'noncapturing', 0.5 ],
      [ true, 'matching', 'noncapturing', 0 ],
      [ true, 'matching', 'capturing', undefined ],
      [ true, 'matching', 'capturing', 1 ],
      [ true, 'matching', 'capturing', 0.5 ],
      [ true, 'matching', 'capturing', 0 ],
      [ false, 'nonmatching', 'noncapturing', undefined ],
      [ false, 'nonmatching', 'noncapturing', 1 ],
      [ false, 'nonmatching', 'noncapturing', 0.5 ],
      [ false, 'nonmatching', 'noncapturing', 0 ],
      [ false, 'nonmatching', 'capturing', undefined ],
      [ false, 'nonmatching', 'capturing', 1 ],
      [ false, 'nonmatching', 'capturing', 0.5 ],
      [ false, 'nonmatching', 'capturing', 0 ],
    ])(`should return %p for %s quads using %s regex with probability of %p`, (result: boolean, prefix: string, regex: string, probability?: number) => {
      matcher = new QuadMatcherComponent(
        'subject',
        regex === 'capturing' ? '^(ex:matching.+)$' : '^ex:matching',
        probability,
      );
      let matchCount = 0;
      for (let i = 0; i < probabilitySampleSize; i++) {
        const quad = DF.quad(DF.namedNode(`ex:${prefix}${randomChar()}`), DF.namedNode('ex:p'), DF.namedNode('ex:o'));
        const matchResult = matcher.matches(quad);
        // Ensure that the match works consistently
        expect(matchResult).toBe(matcher.matches(quad));
        // Record the number of matches
        if (matchResult) {
          matchCount++;
        }
      }
      // Ensure the percentage chance is, on average, expected
      expect(matchCount / probabilitySampleSize).toBeCloseTo(result ? probability ?? 1 : 0);
    });
  });
});
