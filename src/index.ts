// We have to export from lib for the Jest mock
//  to work as expected

import sql, {
  sqlPart,
  joinSQLValues,
  escapeSQLIdentifier,
  emptySQLPart,
  mergeSQLParts,
  buildQuery,
} from './lib';

export {
  sqlPart,
  joinSQLValues,
  escapeSQLIdentifier,
  emptySQLPart,
  mergeSQLParts,
  buildQuery,
};

export default sql;
