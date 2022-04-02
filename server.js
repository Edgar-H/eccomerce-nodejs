const { app } = require('./app');

const { sequelize } = require('./src/util/database');
const { initModels } = require('./src/util/initModels');

sequelize
  .authenticate()
  .then(() => console.log('Authentication successful'))
  .catch((err) => console.log(err));

// Models relations
initModels();

sequelize
  .sync({ force: false })
  .then(() => {
    console.log('Sync successful');
  })
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.clear();
  console.log('Server is running in port ' + PORT);
});
