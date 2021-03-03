<template>
  <div>
    <div class="legend">
      <div class="tuli">
        <span>Legend</span>
      </div>
      <!-- heatmap_legend -->
      <div class="heatmap_legend" style="">
        <div ref="legend">
        <canvas ref="legendCanvas"></canvas>
        </div>
        <div class="legend_text">
          <div style="position: absolute; bottom: 90px;margin-left: 25px;">>50</div>
          <div style="position: absolute; bottom: 10px; margin-left: 25px;">0</div>
        </div>
      </div>
      <!-- flat_legend -->
      <div class="flat_legend">
        <div>
          <div
            class="legend_color"
            style="background-color: rgb(118, 22, 26);"
          ></div>
          <div class="legend_label">> 1000</div>
        </div>
        <div>
          <div
            class="legend_color"
            style="background-color: rgb(201, 47, 49);"
          ></div>
          <div class="legend_label">500-999</div>
        </div>
        <div>
          <div
            class="legend_color"
            style="background-color: rgb(227, 102, 84);"
          ></div>
          <div class="legend_label">100-499</div>
        </div>
        <div>
          <div
            class="legend_color"
            style="background-color: rgb(242, 168, 141);"
          ></div>
          <div class="legend_label">10-99</div>
        </div>
        <div>
          <div
            class="legend_color"
            style="background-color: rgb(250, 230, 210);"
          ></div>
          <div class="legend_label">1-9</div>
        </div>
      </div>

    </div>

    <div
      class="label"
      :style="{left:labelPosition.x+ 'px',top:labelPosition.y+ 'px'}"
    >
      <p>{{label.name}}</p>
      <p>Confirmed：{{label.confirmedCount}}</p>
      <p>Death：{{label.deadCount}}</p>
      <p>Recovered：{{label.curedCount}}</p>
    </div>

  </div>
</template>
<script>

import areaMap from "./AreaMap";
import VirusHeatMap from "./VirusHeatMap";

/**
 * @type { VirusHeatMap | undefined }
 */
let g_heatMap = undefined;
let g_canvasReady = false;

export default {
  data() {
    return {
      areaName: "",
      analysis: 60,
      index: 0,
      world: null,
      labelPosition: {
        x: -1000,
        y: -1000
      },
      label: {},
      colorLegend: [
        new Cesium.Color(118 / 255, 22 / 255, 26 / 255, 0.5),
        new Cesium.Color(201 / 255, 47 / 255, 49 / 255, 0.5),
        new Cesium.Color(227 / 255, 102 / 255, 84 / 255, 0.5),
        new Cesium.Color(242 / 255, 168 / 255, 141 / 255, 0.5),
        new Cesium.Color(250 / 255, 230 / 255, 210 / 255, 0.5),
        new Cesium.Color(1, 1, 1, 0.5)
      ]
    };
  },
  mounted() {
    this.areaMap = areaMap;
    this.areaName = this.$route.params.area;

    //修改根下的区域
    this.$nextTick(function() {
      this.$root.currentArea = this.areaName;

      if (!g_heatMap) {
        const fetchCityInfosCallback = (updateTime, callback) => {
          this.$root._dataserver
            .loadCitiesData(updateTime)
            .then(result => callback(result));
        };
        // http://www.earthsdk.com/static/data/cities.json
        const cityCoordsJsonPath =
          this.$root._dataserver.earthsdkServer + "cities.json";
        console.log(cityCoordsJsonPath);
        g_heatMap = new VirusHeatMap(
          this.$root._earth,
          fetchCityInfosCallback,
          cityCoordsJsonPath
        );
        // g_heatMap.updateDate = this.$root.currentDay;
        window.g_heatMap = g_heatMap;
      }
      g_heatMap.show = true;

      console.log(this.$refs.legendCanvas);

      g_canvasReady = true;
      if (this.$refs.legendCanvas instanceof HTMLCanvasElement) {
        const canvas = this.$refs.legendCanvas;
        canvas.width = 20;
        canvas.height = 100;
        var ctx = canvas.getContext("2d");

        var gradient = ctx.createLinearGradient(0, 100, 0, 0);

        /**
         * @type { [number, string][] }
         */
        const gradientConfig = [
          [0, "rgba(0, 255, 0, 0.0)"],
          [0.05, "rgba(0, 255, 0, 0.3)"],
          [0.5, "rgba(255, 255, 0, 0.5)"],
          [1, "red"]
        ];
        gradientConfig.forEach(gc => {
          gradient.addColorStop(gc[0], gc[1]);
        });

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 20, 100);
      }
    });

    this._earth = this.$root._earth;
    var viewer = this._earth.czm.viewer;
    this.changeArea();
    this.setArea(this.areaName);
    var self = this;
    viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(
      movement
    ) {
      var pickedFeature = viewer.scene.pick(movement.endPosition);
      self.highlight(pickedFeature);
      if (pickedFeature) {
        self.labelPosition = movement.endPosition;
        if (
          self._areaKV.hasOwnProperty(
            pickedFeature.id.properties["Name"]._value
          )
        ) {
          self.label = self._areaKV[pickedFeature.id.properties["Name"]._value];
          self.label.deadRatio =
            Math.round(
              (self.label.deadCount * 10000) /
                (self.label.confirmedCount +
                  self.label.curedCount +
                  self.label.deadCount)
            ) / 100;
        } else {
          self.label = {
            name: pickedFeature.id.properties["Name"]._value,
            confirmedCount: 0,
            deadCount: 0,
            curedCount: 0
          };
        }
      }
    },
    Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //根据 areaName 加载 geo 数据 和 疫情数据，并在地图上显示
    //这么获取 earth
    //在beforedestroy中销毁显示资源
  },
  methods: {
    highlight(pickedFeature) {
      this.labelPosition = { x: -1000, y: -1000 };
      if (self._highlightFace) {
        self._highlightFace.outline = false;
      }
      if (pickedFeature && pickedFeature.id.polygon) {
        //判断之前是否有高亮面存在
        self._highlightFace = pickedFeature.id.polygon;
        self._highlightFace.outline = true;
      }
    },
    flyTo(index) {
      this._earth.cameraViewManager.views[index].flyTo();
      this.navindex = index;
    },
    getAreaColor(confirmedCount) {
      if (confirmedCount >= 1000) {
        return this.colorLegend[0];
      } else if (confirmedCount >= 500) {
        return this.colorLegend[1];
      } else if (confirmedCount >= 100) {
        return this.colorLegend[2];
      } else if (confirmedCount >= 10) {
        return this.colorLegend[3];
      } else {
        return this.colorLegend[4];
      }
    },
    setArea() {
      let self = this;
      let viewer = this._earth.czm.viewer;
      var promise = Cesium.GeoJsonDataSource.load(
        this.$root._dataserver.earthsdkServer +
          self.areaMap[this.areaName] +
          ".json"
      );
      promise.then(function(dataSource) {
        viewer.dataSources.add(dataSource);
        self._dataSource = dataSource;
        viewer.flyTo(dataSource.entities.values, {
          duration: 2,
          offset: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-90)
          }
        });
        self.setColor();
      });
    },
    setColor() {
      if (this._dataSource) {
        let self = this;
        this.$root._dataserver
          .loadSubArea(this.areaName, this.$root.currentTime)
          .then(data => {
            var colorMap = {};
            self._areaKV = {};
            var length = data.subs.length;
            for (var i = 0; i < length; i++) {
              var province = data.subs[i];
              colorMap[province.name] = self.getAreaColor(
                province.confirmedCount
              );
              self._areaKV[province.name] = province;
            }
            var entities = self._dataSource.entities.values;
            for (var i = 0; i < entities.length; i++) {
              var entity = entities[i];
              entity.polygon.material = colorMap[
                entity.properties["Name"]._value
              ]
                ? colorMap[entity.properties["Name"]._value]
                : self.colorLegend[5];
              entity.polygon.outline = false;
              entity.polygon.outlineWidth = 3;
            }
          });
      }
    },
    changeArea() {
      if (this._dataSource) {
        let viewer = this._earth.czm.viewer;
        viewer.dataSources.remove(this._dataSource);
      }
    }
  },
  beforeDestroy() {
    this.changeArea();
    var viewer = this._earth.czm.viewer;
    viewer.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );
  },
  watch: {
    "$root.currentTime"(v) {
      console.log("$root.currentTime changed:", v);
      g_heatMap && (g_heatMap.updateTime = v);
      this.setColor();
    },
    beforeDestroy() {
      g_heatMap.show = false;
      console.log("heatmap destroy!");
    },
    "$root.mousemoveArea"(v) {
      if (this._dataSource) {
        var entities = this._dataSource.entities.values;
        for (var i = 0; i < entities.length; i++) {
          var entity = entities[i];
          if (entity.properties["Name"]._value === v) {
            this.highlight({ id: entity });
          }
        }
      }
    }

  }
};
</script>
<style scoped>
.legend {
  position: absolute;
  right: 250px;
  bottom: 98px;
  width: 180px;
  height: 150px;
  background: url(../../img/tuli_bg.png) no-repeat;
  background-size: 100% 100%;
}
.heatmap_legend {
  margin-left: 60%;
  margin-top: 5%; 
  overflow: hidden;
}
.flat_legend {
  margin-top: -203px;
  margin-left: 3%;
  overflow: hidden;
}
.tuli {
  display: inline-block;
  line-height: 5px;
  margin-top: 8px;
  margin-left: 5px;
}
.tuli span {
  display: inline-block;
  color: #ffffff;
  font-size: 16px;
  padding-left: 8px;
  margin-top: 10px;
  margin-bottom: -5px;
}
.legend_color {
  width: 26px;
  height: 16px;
  float: left;
  margin-bottom: 2px;
  margin-left: 10px;
  border-radius: 2px;
}
.legend_text {
  width: 70px;
  height: 100px;
  float: left;
  margin-left: 5px;
  color: white;
  font-size: 14px;
}
.legend_label {
  color: #fff;
  font-size: 14px;
  margin-left: 40px;
}
.label {
  position: absolute;
  z-index: 1000;
  width: 500;
  height: 100;
  margin-left: 10px;
  padding: 5px;
  border-radius: 4px;
  background-color: #517ca58a;
}
.label p {
  color: #fff;
}
</style>
