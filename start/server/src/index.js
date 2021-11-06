const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
//データベースのセットアップを行うために必要
const { createStore } = require('./utils');
const resolvers = require('./resolvers');

const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');
const isEmail = require('isemail');

//データベースを作成する
const store = createStore();

const server = new ApolloServer({
  //ユーザの認証
  context: async ({ req }) => {
    const auth = (req.headers && req.headers.authorization) || '';
    const email = Buffer.from(auth, 'base64').toString('ascii');
    if (!isEmail.validate(email)) return { user: null };
    //userのemailを見つける
    const users = await store.users.findOrCreate({ where: { email } });
    const user = (users && users[0]) || null;
    return { user: { ...user.dataValues } };
  },
  typeDefs,
  resolvers,
  //dateSources関数をApolloServerに与え、graphに追加する
  //UserAPIにはデータベースを渡す
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    //this.contextをデータベースで使用しているため、
    //dataSources関数内で新しいインスタンスを作成し、単一のインスタンスを共有しないようにしている。
    //理由　initializeが他のユーザーによって実行された際にthis.contextが別のものに上書きされるため
    userAPI: new UserAPI({ store }),
  }),
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
