// We have to export from lib for the Jest mock
//  to work as expected

import sql, {
  sqlPart,
  joinSQLValues,
  escapeSQLIdentifier,
  emptySQLPart,
} from './lib';

export { sqlPart, joinSQLValues, escapeSQLIdentifier, emptySQLPart };

export default sql;
