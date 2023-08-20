import { env } from 'node:process';
import initDebug from 'debug';
import { printStackTrace } from 'yerror';

/* Architecture Note #1.1: Debug

Run your process with the `DEBUG='pgsqwell'` env var
 to log every built queries during its execution.
*/
const debug = initDebug('pgsqwell');

export const SQLStatementTypeSymbol = Symbol('SQLStatement');
export const SQLPartTypeSymbol = Symbol('SQLPart');
export const SQLValuesTypeSymbol = Symbol('SQLValues');
export const SQLTypesSymbols = [
  SQLPartTypeSymbol,
  SQLStatementTypeSymbol,
] as const;

export type SQLStatement = {
  type: typeof SQLStatementTypeSymbol;
  parts: string[];
  values: SQLValue[];
  text: string;
};

export type SQLPart = {
  type: typeof SQLPartTypeSymbol;
  parts: string[];
  values: SQLValue[];
};

export type SQLValues = {
  type: typeof SQLValuesTypeSymbol;
  values: SQLValue[];
};

export type SQLValue =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | null
  | Date
  | undefined;

export type SQLStringLiteralParameter =
  | SQLStatement
  | SQLPart
  | SQLValue
  | SQLValues;

/* Architecture Note #1.1: Utils

To avoid dependencies injections, this module provides
 a few useful utils.
*/

/* Architecture Note #1.1.1: joinSQLValues

Allow to create that kind of requests easily:
```ts
sql`SELECT * FROM users WHERE id IN (${joinSQLValues([1, 2])})`
```
*/
export const joinSQLValues = (values: SQLValue[]): SQLValues => {
  return {
    type: SQLValuesTypeSymbol,
    values,
  };
};

const createSQLPart = (str: string): SQLPart => {
  return {
    type: SQLPartTypeSymbol,
    parts: [str],
    values: [],
  };
};

function isSQLValues(value: SQLStringLiteralParameter): value is SQLValues {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as unknown as SQLValues).type == SQLValuesTypeSymbol
  );
}

function isSQLPart(value: SQLStringLiteralParameter): value is SQLPart {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as unknown as SQLPart).type == SQLPartTypeSymbol
  );
}

function isSQLStatement(
  value: SQLStringLiteralParameter,
): value is SQLStatement {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as unknown as SQLStatement).type == SQLStatementTypeSymbol
  );
}

export function mergeSQLParts(parts: SQLPart[], separator: SQLPart): SQLPart {
  const allParts = separator
    ? parts.reduce<SQLPart[]>(
        (parts, part) => [...parts, ...(parts.length ? [separator] : []), part],
        [],
      )
    : parts;
  return {
    type: SQLPartTypeSymbol,
    ...mergeSQLChunks(
      allParts.map(() => '') as unknown as TemplateStringsArray,
      allParts,
    ),
  };
}

function mergeSQLChunks<T extends SQLStringLiteralParameter[]>(
  chunks: TemplateStringsArray,
  parameters: T,
): Omit<SQLPart, 'type'> {
  const parts: string[] = [];
  const values: SQLValue[] = [];
  const parametersLength = parameters.length;

  for (let i = 0, len = chunks.length; i < len; i++) {
    const unterminatedPart = parts.length > values.length;

    if (i >= parametersLength) {
      if (unterminatedPart) {
        parts.push((parts.pop() || '') + chunks[i]);
      } else {
        parts.push(chunks[i]);
      }
      continue;
    }

    if (isSQLStatement(parameters[i]) || isSQLPart(parameters[i])) {
      if (unterminatedPart) {
        parts.push(
          (parts.pop() || '') +
            chunks[i] +
            (parameters[i] as SQLStatement).parts[0],
        );
      } else {
        parts.push(chunks[i] + (parameters[i] as SQLStatement).parts[0]);
      }
      parts.push(...(parameters[i] as SQLStatement).parts.slice(1));
      values.push(...(parameters[i] as SQLStatement).values);
    } else if (isSQLValues(parameters[i])) {
      if (unterminatedPart) {
        parts.push((parts.pop() || '') + chunks[i]);
      } else {
        parts.push(chunks[i]);
      }
      parts.push(
        ...(parameters[i] as SQLValues).values.slice(1).map(() => ', '),
      );
      values.push(...(parameters[i] as SQLValues).values);
    } else {
      if (unterminatedPart) {
        parts.push((parts.pop() || '') + chunks[i]);
      } else {
        parts.push(chunks[i]);
      }
      values.push(parameters[i]);
    }
  }

  return {
    parts,
    values,
  };
}

/* Architecture Note #1.1.2: emptySQLPart

Allow to create queries with empty condition branches:
```ts
sql`
SELECT * FROM users${
  env.BY_PASS_CHECKS ?
  sqlPart` WHERE role = 'admin'` :
  emptySQLPart
}`
```
*/
export const emptySQLPart = createSQLPart('');

/* Architecture Note #1.1.2: escapeSQLIdentifier

Sometime, you need to  set a SQL identifier dynamically.
That function allow you to ensure you won't create a
 SQL injection issue:
```ts
sql`
SELECT * FROM users ${escapeSQLIdentifier(
  env.ROLE_FIELD
)} = 'admin'`

⚠️ You should NOT use it until you are forced to by
 some kind of black magics.
```
*/
export const escapeSQLIdentifier = (str: string): SQLPart => {
  return createSQLPart('"' + str.replace(/"/g, '""') + '"');
};

/* Architecture Note #1.1.2: sqlPart

Allow to create queries sub parts conditionally:
```ts
sql`SELECT * FROM users WHERE id IN (${
  env.BY_PASS_CHECKS ?
    sqlPart`SELECT id FROM users` :
    sqlPart`SELECT id FROM users WHERE role = ${'admin`}
)})`
```
*/
export function sqlPart<T extends SQLStringLiteralParameter[]>(
  chunks: TemplateStringsArray,
  ...parameters: T
): SQLPart {
  const { parts, values } = mergeSQLChunks<T>(chunks, parameters);
  return {
    type: SQLPartTypeSymbol,
    parts,
    values,
  };
}

/* Architecture Note #1.1.3: buildQuery

Allow to build a query from its parts and values. More
 usefull for debug since query object can be put in your
 favorite SQL client as is. See `postgresql-service` for
 an example of its support.
```
*/
export function buildQuery(query: SQLStatement): string {
  return query.text.replace(/\$(\d+)/g, (_, num) => {
    const index = parseInt(num, 10) - 1;

    if (
      typeof query.values[index] === 'boolean' ||
      typeof query.values[index] === 'number'
    ) {
      return query.values[index]?.toString() || '';
    }

    if (null === query.values[index]) {
      return 'NULL';
    }

    if (typeof query.values[index] === 'object') {
      try {
        return `'${JSON.stringify(query.values[index])}'`;
      } catch (err) {
        debug(
          `⁉️ - Could not JSON serialize a query value: ` +
            printStackTrace(err as Error),
        );
        return 'NULL';
      }
    }

    return `'${(query.values?.[index]?.toString() || 'NULL').replace(
      /'/g,
      "''",
    )}'`;
  });
}

/* Architecture Note #1: Tagged template queries

The `pg` module uses simple `$n` placeholder for queries values
 that are provided in an array.

This tagged template function adds a level of abstraction
 transforming the following expression:
 `sql\`SELECT * FROM users WHERE id=${userId}\`` with `userId=1` }
 into `{ text: 'SELECT * FROM users WHERE id=$1', values: [1] }`
 under the hood.

Note that you can put queries in your queries 😙.
*/
export default function sql<T extends SQLStringLiteralParameter[]>(
  chunks: TemplateStringsArray,
  ...parameters: T
): SQLStatement {
  const { parts, values } = mergeSQLChunks<T>(chunks, parameters);
  const query: SQLStatement = {
    type: SQLStatementTypeSymbol,
    parts,
    values,
    get text() {
      return this.parts.reduce(
        (text: string, part: string, index: number) =>
          text + part + (index < this.values.length ? '$' + (index + 1) : ''),
        '',
      );
    },
  };

  if (env.DEBUG) {
    debug(`🏗 - Built a query: \n${buildQuery(query)}`);
  }

  return query;
}
