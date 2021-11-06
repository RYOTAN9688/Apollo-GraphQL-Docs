const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');

//データベースのセットアップを行うために必要
const { createStore } = require('./utils');

const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');

//データベースを作成する
const store = createStore();

const server = new ApolloServer({
  typeDefs,
  //dateSources関数をApolloServerに与え、graphに追加する
  //UserAPIにはデータベースを渡す
  dataSources: () => ({
    LaunchAPI: new LaunchAPI(),
    //this.contextをデータベースで使用しているため、
    //dataSources関数内で新しいインスタンスを作成し、単一のインスタンスを共有しないようにしている。
    //理由　initializeが他のユーザーによって実行された際にthis.contextが別のものに上書きされるため
    UserAPI: new UserAPI({ store }),
  }),
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
