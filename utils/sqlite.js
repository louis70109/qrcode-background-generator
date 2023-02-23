const { promisify } = require('util');
class MessageDB {
  constructor() {
    const file = './memory.db';

    const sqlite3 = require('sqlite3').verbose();
    this.db = new sqlite3.Database(file);
    this.query = promisify(this.db.all).bind(this.db);
  }

  init() {
    let sqlCreate = `CREATE TABLE User (uid TEXT, keyword TEXT);`;
    const createResult = this.query(sqlCreate);
    console.log('Init success' + createResult);
    return createResult;
  }

  async create(uid, keyword) {
    //新增資料
    const sqlInsert = `INSERT INTO User(uid, keyword) VALUES ('${uid}','${keyword}')`;
    const insertResult = await this.query(sqlInsert);
    console.log('Insert success' + insertResult);
    return insertResult;
  }

  async find(uid) {
    // //查詢資料
    const sqlSelect = `SELECT uid, keyword FROM User WHERE uid = '${uid}' LIMIT 1`;
    const findResult = await this.query(sqlSelect);
    return findResult;
  }

  async update(uid, keyword) {
    const sqlUpdate = `UPDATE User SET keyword = '${keyword}' where uid = '${uid}'`;
    const updateResult = await this.query(sqlUpdate);
    console.log('update' + updateResult);
    return updateResult;
  }
  get close() {
    return this.close();
  }
  close() {
    this.db.close();
  }
}

module.exports = MessageDB;
