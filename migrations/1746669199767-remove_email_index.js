/**
 * Make any changes you need to make to the database here
 */
async function up(db) {
  // 删除 email 索引
  await db.collection('users').dropIndex('email_1');
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down(db) {
  // 重建 email 索引
  await db.collection('users').createIndex({ email: 1 });
}

module.exports = { up, down };