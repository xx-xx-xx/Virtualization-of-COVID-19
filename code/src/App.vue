<template>
  <div id="app">
    <div style="width: 100%; height: 100%">
      <div ref="earthContainer" style="width: 100%; height: 100%"></div>
    </div>
    <Map3d></Map3d>
    <Header></Header>
    <Left></Left>
    <router-view :key="$route.fullPath" />
  </div>
</template>

<script>
import Header from "@/pages/Header";
import Left from "@/pages/Left";
import Map3d from "@/pages/Map3d";
import DataServer from "./js/DataServer";
export default {
  components: {
    Header,
    Left,
    Map3d
  },
  // name: 'App'
  data() {
    return {
      // _earth: undefined // 注意：Earth和Cesium的相关变量放在vue中，必须使用下划线作为前缀！
    };
  },
  created() {
    this.$root._dataserver = new DataServer();
    window.dataserver = this.$root._dataserver;
  },
  mounted() {
    // 创建地球
    var earth = new XE.Earth(this.$refs.earthContainer);
    // 添加默认地球影像
    earth.sceneTree.root = {
      children: [
        {
          czmObject: {
            name: "默认离线影像",
            xbsjType: "Imagery",
            xbsjImageryProvider: {
              createTileMapServiceImageryProvider: {
                url: XE.HTML.cesiumDir + "Assets/Textures/NaturalEarthII",
                fileExtension: "jpg"
              },
              type: "createTileMapServiceImageryProvider"
            }
          }
        }
      ]
    };
    this.$root._earth = earth;
    window.uia = earth;

    this.$router
      .push({ name: "flatmap", params: { area: "china" } })
      .catch(err => {
        err;
      });
  },
  // 资源销毁
  beforeDestroy() {
    // vue程序销毁时，需要清理相关资源
    this.$root._earth = this.$root._earth && this.$root._earth.destroy();
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
li {
  list-style: none;
}
</style>
