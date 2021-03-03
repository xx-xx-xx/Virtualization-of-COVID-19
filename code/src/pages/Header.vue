<template>
  <div>
    <div class="header">

      <div class="back">
            <a
              @click="intro()"
              :class="{active: navIndex=='intro'}"
            >👣Back</a>
      </div>

      <div style="float: left; margin-left: -10px;">
        <p class="text">Virtualization of COVID-19</p>
      </div>

      <div class="title">
        <ul>
          <li
            :class="{active: areaType=='province'}"
            v-show="areaType=='province'"
          >{{areaName|f_short}}</li>
          <li
            :class="{active: areaType=='china'}"
            v-show="areaType=='china'"
          >China</li>
        </ul>
      </div>

      <div
        class="info"
        v-show="areaType=='china'"
      >
        <div style="display: inline-block; width: 350px;">
          <div class="infoItem">
            <span style="color: #f56262;">{{count.confirmedCount}}</span>
            <span>Confirmed</span>
          </div>
          <div class="infoItem">
            <span style="color: #6c757d;">{{count.deadCount}}</span>
            <span>Death</span>
          </div>
          <div class="infoItem">
            <span style="color: green;">{{count.curedCount}}</span>
            <span>Recovered</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  data() {
    return {
      areaName: "china",
      count: {
        confirmedCount: 0,
        curedCount: 0,
        deadCount: 0,
      },
    };
  },
  mounted() {
    this.$root.$on("scene.loaded", () => {
      this._earth = this.$root._earth;
    });
    this.updateChart();
  },
  methods: {
    tochina() {
      this.$router
        .push({ name: "flatmap", params: { area: "china" } })
        .catch(err => {
          err;
        });
      this._earth.cameraViewManager.china.flyTo();
      this._earth.cameraFlight.rotateGlobe.cancel();
    },
    updateChart() {
      this.$root._dataserver.loadOverall(this.$root.currentArea).then(data => {
        this.count = data;
      });
    },
    intro() {
      window.location.href="../../static/introduction/index.html"
    },
  },
  watch: {
    "$root.currentArea"(v) {
      this.areaName = v;
      this.updateChart();
    }
  },
  filters: {
    f_short(fn){
      const    areaMap = {
       "黑龙江省": "黑龙江",
        "宁夏回族自治区": "宁夏", 
        "广西壮族自治区": "广西",
        "内蒙古自治区": "内蒙古", 
        "新疆维吾尔自治区": "新疆",
        "西藏自治区": "西藏",
        "香港特别行政区": "香港",
        "澳门特别行政区": "澳门",
    };  
     return areaMap[fn] || fn;
    }
  },
  computed: {
    areaType() {
      if (this.areaName == "china")
        return this.areaName;
      return "province";
    }
  }
};
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
}
.header {
  width: 100%;
  height: 80px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  background: rgba(53, 41, 97, 0.89);
  display: flex;
  justify-content: space-between;
}
.title {
  float: left;
  width: 550px;
}
li {
  list-style: none;
  float: left;
  color: white;
  font-size: 26px;
  width: 82px;
  height: 36px;
  line-height: 36px;
  margin-top: 20px;
  margin-left: 200px;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.info {
  color: white;
  width: 420px;
  margin-top: 12px;
  text-align: center;
  float: left;
  margin-left: 44px;
}
.text {
  font-size: 24px;
  color: white;
  width: 440px;
  margin-left: 20px;
  text-align: center;
  line-height: 78px;
}
.infoItem {
  display: inline-block;
  width: 100px;
  font-size: 18px;
}
.infoItem span:nth-child(1) {
  display: block;
  font-size: 26px;
  font-weight: 500;
}
.origion {
  float: right;
  width: 244px;
  height: 28px;
  background-size: contain;
  margin-top: 26px;
  margin-right: 384px;
}
.back {
  margin-left: 20px;
  margin-right: -50px;
  width: 100px;
  margin-top: 25px;
  font-size: 20px;
  color: white;
}
</style>
