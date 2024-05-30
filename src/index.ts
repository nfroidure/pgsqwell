import sql, {
  sqlPart,
  joinSQLValues,
  escapeSQLIdentifier,
  emptySQLPart,
  mergeSQLParts,
  buildQuery,
  type SQLStatement,
  type SQLPart,
  type SQLValues,
  type SQLValue,
  type SQLStringLiteralParameter,
} from './lib.js';

export {
  sqlPart,
  joinSQLValues,
  escapeSQLIdentifier,
  emptySQLPart,
  mergeSQLParts,
  buildQuery,
};

export type {
  SQLStatement,
  SQLPart,
  SQLValues,
  SQLValue,
  SQLStringLiteralParameter,
};

export default sql;
