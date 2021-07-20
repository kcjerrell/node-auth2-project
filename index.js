const users = require('./api/users/users-model')

const server = require('./api/server.js');

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

qtest();

async function qtest() {
  console.log(await users.findById(2))
}
// 7579
