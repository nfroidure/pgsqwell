[//]: # ( )
[//]: # (This file is automatically generated by a `metapak`)
[//]: # (module. Do not change it  except between the)
[//]: # (`content:start/end` flags, your changes would)
[//]: # (be overridden.)
[//]: # ( )
# pgsqwell
> SQL template tag for PostgreSQL done well

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nfroidure/pgsqwell/blob/master/LICENSE)
[![Build status](https://secure.travis-ci.org/nfroidure/pgsqwell.svg)](https://travis-ci.org/nfroidure/pgsqwell)
[![Coverage Status](https://coveralls.io/repos/nfroidure/pgsqwell/badge.svg?branch=master)](https://coveralls.io/r/nfroidure/pgsqwell?branch=master)
[![NPM version](https://badge.fury.io/js/pgsqwell.svg)](https://npmjs.org/package/pgsqwell)
[![Dependency Status](https://david-dm.org/nfroidure/pgsqwell.svg)](https://david-dm.org/nfroidure/pgsqwell)
[![devDependency Status](https://david-dm.org/nfroidure/pgsqwell/dev-status.svg)](https://david-dm.org/nfroidure/pgsqwell#info=devDependencies)
[![Package Quality](http://npm.packagequality.com/shield/pgsqwell.svg)](http://packagequality.com/#?package=pgsqwell)
[![Code Climate](https://codeclimate.com/github/nfroidure/pgsqwell.svg)](https://codeclimate.com/github/nfroidure/pgsqwell)


[//]: # (::contents:start)

Done well because:

- immutable
- the `sql` tag for valid SQL statements `sqlPart` for subparts
- allows syntax checking in your tests

Sample usage:

```ts
import sql, {
  escapeSQLIdentifier,
  sqlPart,
  emptySQLPart,
  joinSQLValues,
} from 'pgsqwell';

const limit = 10;
const query = sql`SELECT id FROM users WHERE name=${'toto'} ${
  limit ? sqlPart`LIMIT ${limit}` : emptySQLPart
}`;
const query2 = sql`SELECT id FROM ${escapeSQLIdentifier('table')}`;
const query3 = sql`SELECT id FROM users WHERE id IN ${joinSQLValues([1, 2])}}`;
const mergedQuery = `
${query}
UNION
${query2}
UNION
${query3}
`;
```

To check queries in your Jest tests: To use it with Jest, simply add this to
your tests files:

```js
jest.mock('pgsqwell', require('pgsqwell/dist/mock'));
```

Known downsides:

- if you use the
  [vscode-sql-tagged-template-literal](https://marketplace.visualstudio.com/items?itemName=frigus02.vscode-sql-tagged-template-literals)
  plugin like I do, composed SQL queries won't be validated for their SQL
  syntax.

[//]: # (::contents:end)

# Authors
- [Nicolas Froidure](http://insertafter.com/en/index.html)

# License
[MIT](https://github.com/nfroidure/pgsqwell/blob/master/LICENSE)
