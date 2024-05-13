import * as readline from 'readline';
import type { Writable } from 'stream';
import type * as RDF from '@rdfjs/types';
import type { IQuadSink } from './IQuadSink';
import { ParallelFileWriter } from './ParallelFileWriter';

/**
 * A quad sink that writes to files using an IRI to local file system path mapping.
 */
export class QuadSinkFile implements IQuadSink {
  private readonly outputFormat: string;
  private readonly iriToPath: Map<RegExp, string>;
  private readonly fileWriter: ParallelFileWriter;
  private readonly log: boolean;
  private readonly fileExtension?: string;

  private counter = 0;

  public constructor(options: IQuadSinkFileOptions) {
    this.outputFormat = options.outputFormat;
    this.iriToPath = new Map(Object.entries(options.iriToPath).map(([ exp, sub ]) => [
      new RegExp(exp, 'u'),
      sub,
    ]));
    this.log = Boolean(options.log);
    this.fileExtension = options.fileExtension;

    this.fileWriter = new ParallelFileWriter({ streams: 128 });

    this.attemptLog();
  }

  protected attemptLog(newLine = false): void {
    if (this.log && (this.counter % 1_000 === 0 || newLine)) {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`\rHandled quads: ${this.counter / 1_000}K`);
      if (newLine) {
        process.stdout.write(`\n`);
      }
    }
  }

  protected getFilePaths(iri: string): string[] {
    // Find base path from the first matching baseIRI
    const paths = new Set<string>();
    for (const [ exp, sub ] of this.iriToPath) {
      if (exp.test(iri)) {
        // Perform the mapping using regex
        let path = iri.replace(exp, sub);
        // Escape illegal directory names
        path = path.replace(/[*|"<>?:]/ug, '_');
        // Add file extension if we don't have one yet
        if (this.fileExtension && !/\.[a-z]$/iu.test(this.fileExtension)) {
          path = `${path}${this.fileExtension}`;
        }
        paths.add(path);
      }
    }

    // Crash if we did not find a matching baseIRI
    if (paths.size === 0) {
      throw new Error(`No IRI mappings found for ${iri}`);
    }

    return [ ...paths.values() ];
  }

  protected async getFileStream(path: string): Promise<Writable> {
    return this.fileWriter.getWriteStream(path, this.outputFormat);
  }

  public async push(iri: string, quad: RDF.Quad): Promise<void> {
    this.counter++;
    this.attemptLog();

    // Remove hash fragment
    const posHash = iri.indexOf('#');
    if (posHash >= 0) {
      iri = iri.slice(0, posHash);
    }

    const paths = this.getFilePaths(iri);

    for (const path of paths) {
      const os = await this.getFileStream(path);
      os.write(quad);
    }
  }

  public async close(): Promise<void> {
    await this.fileWriter.close();
    this.attemptLog(true);
  }
}

export interface IQuadSinkFileOptions {
  outputFormat: string;
  /**
   * @range {json}
   */
  iriToPath: Record<string, string>;
  log?: boolean;
  fileExtension?: string;
}
