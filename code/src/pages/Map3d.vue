<template>

</template>
<script>
export default {
  data() {
    return {
      navIndex: "flatmap"
    };
  },
  mounted() {
    //加载场景
    this.$root._dataserver
      .loadScene()
      .then(scene => {
        console.log(scene);
        this._earth = this.$root._earth;

        this._earth.xbsjFromJSON(scene);

        //发送场景加载完成事件
        this.$root.$emit("scene.loaded");
      })
      .catch(ex => {
        console.log("query scene failed " + ex.message || ex);
      });
  },
  methods: {
    flyTo(index) {
      this._earth.cameraViewManager.views[index].flyTo();
    },
    tochina() {
      this.$router
        .push({ name: "flatmap", params: { area: "china" } })
        .catch(err => {
          err;
        });
      this._earth.cameraViewManager.china.flyTo();
      this._earth.cameraFlight.rotateGlobe.cancel();
    },
  },
  watch: {
    "$root.currentArea"(v) {
      if (v == "china") {
        //定位到中国
        this._earth.cameraViewManager.china.flyTo();
        this._earth.cameraFlight.rotateGlobe.cancel();
      } else {
        //定位到对应省区
        this._earth.cameraFlight.rotateGlobe.cancel();
      }
    },
    $route(to, from) {
      this.navIndex = to.name;
    }
  }
};
</script>
<style scoped>
a {
  text-decoration: none;
  color: white;
}
li {
  float: left;
  width: 28%;
  height: 30px;
  margin-left: 20%;
  text-align: center;
  line-height: 30px;
  /* background: url(../img/nav.png) no-repeat; */
  background-size: 100% 100%;
  cursor: pointer;
}

</style>
