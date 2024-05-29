import sql, {
  sqlPart,
  joinSQLValues,
  escapeSQLIdentifier,
  emptySQLPart,
  buildQuery,
  mergeSQLParts,
} from './lib.js';
import { YError } from 'yerror';
import { parse } from 'pgsql-parser';
import type { SQLStringLiteralParameter, SQLStatement } from './lib.js';

export {
  sqlPart,
  joinSQLValues,
  escapeSQLIdentifier,
  emptySQLPart,
  mergeSQLParts,
};

/* Architecture Note #2: Checking SQL syntax

Its purpose it to ensure queries made with the `sql` tag are well
 formed while running your unit tests.
*/
export default function sqlMock<T extends SQLStringLiteralParameter[]>(
  chunks: TemplateStringsArray,
  ...parameters: T
): SQLStatement {
  const query = sql<T>(chunks, ...parameters);
  const builtQuery = buildQuery(query);
  try {
    parse(builtQuery);
  } catch (err) {
    throw new YError('E_INVALID_QUERY', builtQuery, err);
  }

  return query;
}
