const { RESTDataSource } = require('apollo-datasource-rest');

class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.spacexdata.com/v2/';
  }
  async getAllLaunches() {
    //this getを実行すると、GEt requestを'https://api.spacexdata.com/v2/'に対して行う
    //取得した結果はresponse変数に保存され、getAllLaunchesメソッドは、取得した結果をthis.launchReducerを使用し、変換する。
    const response = await this.get('launches');
    return Array.isArray(response) ? response.map((launch) => this.launchReducer(launch)) : [];
  }
  //取得してきたlaunchをschemaが要求する形状に変換するためのメソッド
  launchReducer(launch) {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch,
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
    };
  }
  //発射予定をIDで指定して取得する機能

  //単一の発射予定を返す
  async getLaunchById({ launchId }) {
    const response = await this.get('launches', { flight_number: launchId });
    return this.launchReducer(response[0]);
  }
  //複数の発射予定を返す
  getLaunchesByIds({ launchIds }) {
    return Promise.all(launchIds.map((launchId) => this.getLaunchById({ launchId })));
  }
}

module.exports = LaunchAPI;
