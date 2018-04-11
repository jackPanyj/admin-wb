<template>
  <div class="map flex-d bd">
    <div class="header">
      <div class="logo">为式</div>
      <div class="bdb fg-1 flex-d">
        <div class="row bdb">
          <el-input class="search" v-model="search" size="small" placeholder="请输入内容"></el-input>
          <el-button type="primary" @click="handleSearch" size="small" style="margin: 0 100px 0 20px;">鹰眼一下</el-button>
          <div style="margin-right: 20px; width: 30px;">{{distance}}km</div>
          &nbsp;<el-slider v-model="distance" :min='3' :max='15' style="width: 200px;"></el-slider>&nbsp;
          <span class="bold logout" @click="logout">退出</span>
        </div>
        <div class="row" style="margin-left: 20px;">
          <el-cascader size="small" style="width: 400px;" :options="options" v-model="selectedOptions" @change="handleChange"></el-cascader>
        </div>
      </div>
    </div>
    <div class="content flex fg-1">
      <div class="c-left fg-1 bdr flex">
        <div id="city-map" class="fg-1"></div>
      </div>
      <div class="c-right fb-3 flex-d">
        <div class="c-top bdb" style="height: 100px;">
          <div class="center bdb">
            <div class="fb-3">屋顶总数</div>
            <div class="fb-3">装机总量</div>
            <div class="fb-3">屋顶总面积(m²)</div>
          </div>
          <div class="center bold">
            <div class="fb-3">{{totals.total}}</div>
            <div class="fb-3">0</div>
            <div class="fb-3">{{totals.total_area}}</div>
          </div>
        </div>
        <div class="c-bottom fg-1" style="overflow: auto;">
          <div class="center bdb">
            <div class="fb-3" >序列号</div>
            <div class="fb-3">名称</div>
            <div class="fb-3">
              <el-select size="mini" style="width: 120px;" @change="orderChange" v-model="choices_val" placeholder="请选择排序方式">
                <el-option
                  v-for="item in choices"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </div>
          <div tag='div' @click="goDetail(roof.id)" style="height: 50px;" class="fz-14 center bdb item" v-for='roof in roofs' :key='roof.id'>
            <div class="fb-3" >{{roof.id}}</div>
            <div class="fb-3">{{roof.owner}}</div>
            <div class="fb-3">{{roof.area}}</div>
          </div>
          <div id="loading-tag" style="text-align: center;" v-show='offset >= 50 && loading === true'>
            <i class="el-icon-loading"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import debounce from 'lodash.debounce';
import {initMap, geocodeAddress, clickZone, addMarkers} from '@/tools/gmap'
import {isElInView} from '@/tools'
export default {
  data () {
    const choices = [{label: '按距离排序 ', value: 'distance'}, {label: '面积从大到小 ', value: '-area'}, {label: '面积从小到大', value: '+area'}]
    return {
      totals: {},
      zone_id: null,
      zones: [],
      search: '',
      choices,
      choices_val: 'distance',
      distance: 7,
      options: [],
      orderParam: {},
      selectedOptions: [],
      roofs: [],
      loading: true,
      offset: 0
    }
  },
  methods: {
    goDetail (id) {
      const url = `${window.location.origin}/fe/act_detail/${id}` 
      window.open(url)
    },
    getWithDistance (geo) {
      this.loading = true
      this.orderParam = Object.assign(geo)
      this.$http({url: '/roof/count/with_distance', data: {
        lat: geo.lat,
        lon: geo.lon,
        distance: geo.distance
      }})
      .then(res => {
        this.totals = res.data
      })
      this.$http({url: '/roof/with_distance', data: {
        lat: geo.lat,
        lon: geo.lon,
        distance: geo.distance,
        order_by: this.choices_val
      }})
      .then(res => {
        this.roofs = res.data.roofs
        addMarkers(res.data.roofs, this.offset, this.choices_val)
        this.offset = this.roofs.length
      })
    },
    handleSearch ({lat, lon, distance}) {
      if (!this.search) {
        return this.$message.error('请输入地址');
      }
      geocodeAddress(this.search, this.distance * 1000, (geo) => {
        if (!geo) {
          return this.$message.info('没找到该位置')
        }
        Object.assign(geo, {distance: this.distance * 1000})
        this.getWithDistance(geo)
      })
    },
    handleChange (val) {
      if (val[0] !== 'gmap') {
        clickZone(val[1])
      } else {
        this.orderParam = {
          zone_id: val[1]
        }
      }
      this.$http({url: '/roof/count/with_zone', data: {zone_id: val[1]}})
      .then(res => {
        this.totals = res.data
      })
      this.$http({url: '/roof/with_zone', data: {
        zone_id: val[1],
        offset: 0,
        order_by: this.choices_val
      }})
      .then(res => {
        this.roofs = res.data.roofs
        addMarkers(res.data.roofs, this.offset, this.choices_val)
        this.offset = this.roofs.length
      })
    },
    logout () {
      localStorage.removeItem('token')
      this.$router.push({name: 'Login'})
    },
    orderChange (reset = true) {
      if (reset) {
        this.offset = 0;
      }
      const url = this.orderParam.zone_id ? '/roof/with_zone' : '/roof/with_distance'
      this.$http({url, data: {
        zone_id: this.orderParam.zone_id,
        lon: this.orderParam.lon,
        lat: this.orderParam.lat,
        distance: this.orderParam.distance,
        offset: this.offset,
        order_by: this.choices_val
      }})
      .then(res => {
        if (reset) {
          this.roofs = res.data.roofs
        } else {
          this.roofs.push(...res.data.roofs)
        }
        this.loading = true
        if (res.data.roofs.length < 50) this.loading = false
        addMarkers(res.data.roofs, this.offset, this.choices_val)
        this.offset = this.roofs.length
      })
    }
  },
  mounted () {
    window.$map = this
    const scroller = document.querySelector('.c-bottom')
    const el = document.getElementById('loading-tag')
    scroller.onscroll = e => {
      if (isElInView(el) && this.loading === true) {
        this.orderChange(false)
        this.loading = false
      }
    }
    this.$http({url: '/zone'})
    .then(res => {
      this.zones = res.data.zones
      const provinces = res.data.zones.filter(zone => {
        if (zone.pid === 0) {
          zone.children = []
          zone.label = zone.name
          zone.value = zone.id
          return zone
        }
      })
      const data = res.data.zones.reduce((init, v, i) => {
        if (v.pid === 0) return init;
        const city = init.find(p => p.id === v.pid)
        if (!city) return init;
        v.label = v.name
        v.value = v.id
        city.children.push(v)
        return init
      }, provinces)
      this.options = data
      initMap('city-map', this.zones)
    })
  }
}
</script>

<style>
.el-cascader-menu {
  min-width: 200px;
}
</style>

<style lang="scss" scoped>
.map {
  flex-grow: 1;
  min-width: 1030px;
}
.item {
  line-height: 1.5;
  cursor: pointer;
}
.header {
  height: 100px;
  display:  flex;
  flex-shrink: 0;
}
.row {
  height: 50px;
  display: flex;
  align-items: center;
}
.search {
  width: 250px;
  margin-left: 20px;
}
.logo {
  height: 100px;;
  width: 100px;
  color: white;
  background: #0172be;
  font-size: 36px;
  line-height: 100px;
  text-align: center;
}
.c-right {
  height: calc(100vh - 115px);
}
.logout {
  margin-left: auto;
  margin-right: 20px;
  font-size: 14px;
  width: 40px;
  cursor: pointer;
  height: 20px;
}
</style>
