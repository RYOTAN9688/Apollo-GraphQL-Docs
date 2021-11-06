const { paginateResults } = require('./utils');

module.exports = {
  //parentは常に空になる。なぜならgraphルートに当たるため親が存在しないため。
  //argmentsにはqueryに渡した引数が渡される。
  //contextにはcontextを渡すが、これを分解してデータソースを参照している。
  //これを通して、resolverからデータソースにアクセス可能となる
  Query: {
    launches: async (_, { pageSize = 20, after }, { dataSources }) => {
      const allLaunches = await dataSources.launchAPI.getAllLaunches();
      allLaunches.reverse();
      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches,
      });
      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        hasMore: launches.length
          ? launches[launches.length - 1].cursor !== allLaunches[allLaunches.length - 1].cursor
          : false,
      };
    },

    launch: (_, { id }, { dataSources }) => dataSources.launchAPI.getLaunchById({ launchId: id }),

    me: async (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser(),
  },
  Mission: {
    // make sure the default size is 'large' in case user doesn't specify
    missionPatch: (mission, { size } = { size: 'LARGE' }) => {
      return size === 'SMALL' ? mission.missionPatchSmall : mission.missionPatchLarge;
    },
  },

  Launch: {
    isBooked: async (launch, _, { dataSources }) => {
      dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id });
    },
  },
  User: {
    trips: async (_, __, { dataSources }) => {
      const launchIds = await dataSources.userAPI.getLaunchByUser();

      if (!launchIds.launch) return [];

      return dataSources.launchAPI.getLaunchByIds({ launchIds }) || [];
    },
  },
};
