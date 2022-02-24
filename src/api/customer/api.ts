let databasePath = 'db/test.db';
import betterSqlite from 'better-sqlite3';

export const getTest = () =>{
  console.log("HEHE");

}

export const getAllCustomer = async () => {
  /**
   * starting connection
   */

  let page : number = 1;
  const database = betterSqlite(databasePath);

  /**
   * selecting all in the interval to 10 for each page
   */
  const sqlScript = `SELECT * FROM 'customer'`;
  // WHERE(id > ? AND id <= ?);`


  /**
   * preparing and running script
   */

  const dbResponse = database.prepare(sqlScript).all();
  // const dbResponse = database.prepare(sqlScript).all(((page-1)*10), (page*10));

  /**
   * for pagination
   *
   * the number of all in database
   */

   const numberOfProducts = database.prepare('SELECT * FROM customer;').all().length;

  /**
   * organizing to be more clear in the react app
   */
  const productInfo = {
    page,
    pages: (numberOfProducts / 10) + 1
  }
  const response = {
    data: dbResponse,
    productInfo
  };

   /**
    * disconect
    */
  database.close();
  return response;
}
