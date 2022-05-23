import sql, { joinSQLValues } from './mock';
import YError from 'yerror';

describe('sql', () => {
  test('should work with a valid simple query', () => {
    const query = sql`SELECT * FROM users`;

    expect(query).toMatchInlineSnapshot(`
      Object {
        "parts": Array [
          "SELECT * FROM users",
        ],
        "text": "SELECT * FROM users",
        "type": Symbol(SQLStatement),
        "values": Array [],
      }
    `);
  });

  test('should work with a valid complexer query', () => {
    const query = sql`SELECT * FROM users WHERE id=${1} AND type IN (${joinSQLValues(
      ['admin', 'user'],
    )}, ${joinSQLValues(['root', 'visitor'])})`;

    expect(query).toMatchInlineSnapshot(`
      Object {
        "parts": Array [
          "SELECT * FROM users WHERE id=",
          " AND type IN (",
          ", ",
          ", ",
          ", ",
          ")",
        ],
        "text": "SELECT * FROM users WHERE id=$1 AND type IN ($2, $3, $4, $5)",
        "type": Symbol(SQLStatement),
        "values": Array [
          1,
          "admin",
          "user",
          "root",
          "visitor",
        ],
      }
    `);
  });

  test('should fail with malformed query', async () => {
    try {
      sql`SELECT * FROM ${null}`;
      throw new YError('E_UNEXPECTED_SUCCESS');
    } catch (err) {
      expect({
        errorCode: (err as YError).code,
        errorParams: (err as YError).params,
      }).toMatchInlineSnapshot(`
        Object {
          "errorCode": "E_INVALID_QUERY",
          "errorParams": Array [
            "SELECT * FROM NULL",
            [Error: syntax error at or near "NULL"],
          ],
        }
      `);
    }
  });
});
