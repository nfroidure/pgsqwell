[//]: # ( )
[//]: # (This file is automatically generated by a `metapak`)
[//]: # (module. Do not change it  except between the)
[//]: # (`content:start/end` flags, your changes would)
[//]: # (be overridden.)
[//]: # ( )
# pgsqwell
> SQL template tag for PostgreSQL done well

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nfroidure/pgsqwell/blob/main/LICENSE)


[//]: # (::contents:start)

Done well because:

- immutable
- separation of concerns / specialization: use the `sql` tag for valid SQL statements, `sqlPart` for subparts that ain't necessarily valid

## Sample usage

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
const mergedQuery = sql`
${query}
UNION
${query2}
UNION
${query3}
`;
```

## Debug

To print any query built with `pgsqwell` use the `DEBUG=pgsqwell` environment variable:

```ts
DEBUG=pgsqwell npm t
```

## Testing

Use [`pgsqwell-mock`](https://github.com/nfroidure/pgsqwell-mock) to check you queries in your tests.

## Known downsides

- if you use the
  [vscode-sql-tagged-template-literal](https://marketplace.visualstudio.com/items?itemName=frigus02.vscode-sql-tagged-template-literals)
  plugin like I do, composed SQL queries won't be validated for their SQL
  syntax.

[//]: # (::contents:end)

# Authors
- [Nicolas Froidure](http://insertafter.com/en/index.html)

# License
[MIT](https://github.com/nfroidure/pgsqwell/blob/main/LICENSE)
