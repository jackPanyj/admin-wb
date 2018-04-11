<template lang="pug">
div.act-detail.fg-1.bd.flex-d

  div.header.bdb
    div.left 为式
    div.right
      div.title.bdb.row.flex(style='align-items: center;')
        span.bold {{roof_info.owner}}
        span.fz-12 {{roof_info.address}}
        span.logout.bold(@click="logout") 退出
      div.flex.fz-12.row
        div.fb-2.bdr.center.bold
          span.mr-20 全投资税后IRR
          span.fz-18 {{res.net_cashflow && res.net_cashflow.toFixed(3)}}%
        div.fb-2.center.bold
          span.mr-20 资本金税后IRR
          span.fz-18 {{res.net_cashflow_l && res.net_cashflow_l.toFixed(3)}}%

  div.content.bd.swiper-container
    div.swiper-wrapper(style="height: 600px;")
      div.swiper-slide.flex
        div.swiper-no-swiping#map.fb-4(style="width: 200px; height: 355px;")
        div.section-1.fg-1.bdl
          div.row.bdb.center 项目概况
          div.row.flex.fz-14.bdb
            span.fb-2.bdr.center 装机规模(兆瓦)
            span.fb-2.center 初始投资(万元)
          div.row.flex.fz-12.bdb
            span.fb-2.center.bdr.gray {{roof_info.cap}}
            span.fb-2.center.gray {{res.initial_investment}}

          div.row.flex.fz-14.bdb
            span.fb-3.center.bdr 建设成本(元/W)
            span.fb-3.center.bdr 屋顶租金 (元/m²*年)
            span.fb-3.center 运维成本(元/kwp)
          div.row.flex.fz-14.bdb
            input.fb-3.center(v-model.number='params.cost')
            input.fb-3.center(v-model.number='params.leasing_price')
            input.fb-3.center(v-model.number='params.om_cost')

          div.center.bdb(style="height: 100px;")
            el-radio(v-model.number="params.self_use" :label="1" style='margin-right: 40px;') 自发自用
            el-radio(v-model.number="params.self_use" :label="2") 全额上网

          div.fz-12.flex-d
            div.row.flex.bdb(v-show='params.self_use === 1')
              div.fb-3.center.bdr 自发自用率(%)
              div.fg-1.center
                span {{params.self_use_ratio}}% &nbsp;&nbsp;&nbsp;
                el-slider.swiper-no-swiping(v-model.number="params.self_use_ratio" style="width: 200px")
            div.row.bdb.flex(v-show='params.self_use === 1')
              div.fb-3.center.bdr 电费折扣(%)
              div.fg-1.center
                span {{params.electric_discount}}% &nbsp;&nbsp;&nbsp;
                el-slider.swiper-no-swiping(v-model.number="params.electric_discount" style="width: 200px")
            div.row.bdb.flex
              div.fb-3.center.bdr 电价 (元/度)
              input.fg-1.center(v-model.number="params.electric_price")
      div.swiper-slide
        div.row.bdb.center 气象数据
        div.box.flex
          div.left.fb-2.fg-1(style='display: flex; align-items: center;')
            ve-histogram(:data="roof_info.chartData" :settings="roof_info.chartSettings" style="width: 100%;")
          div.right.fb-2(style='width: 100%; height: 500px;')
            img(:src='roof_info.weather_img' style='width: 100%; height: 100%;')
      div.swiper-slide
        div.row.bdb.center 技术分析
        div.section-2.flex-d(style="height: 100%;")
          div.row.flex.fz-14.bdb
            div.fb-4.center.bdr
              span 屋顶类型: &nbsp;&nbsp;
              el-select(v-model="params.mount_type" placeholder="请选择" size="mini")
                el-option(v-for="item in roofs" :key="item.value" :value="item.value" :label="item.label")
            div.fb-4.center.bdr
              span 光伏阵列安装朝向:
              el-select(v-model="params.solar_az" placeholder="请选择" size="mini" style="width: 100px; padding-left: 10px;")
                el-option(v-for="item in directions" :key="item.value" :value="item.value" :label="item.label")
            div.fb-4.center.bdr
              span 光伏阵列安装倾角:
              el-select(v-model="params.solar_tilt" placeholder="请选择" size="mini" style="width: 100px; padding-left: 10px;")
                el-option(v-for="item in roof_1" :key="item.value" :disabled="params.mount_type != 'roofblast' && item.value > 10" :value="item.value" :label="item.label")
            div.fb-4.center
              span 组件类型:&nbsp;&nbsp;
              el-select(v-model="params.module_type" placeholder="请选择" size="mini")
                el-option(v-for="item in com_types" :key="item.value" :value="item.value" :label="item.label")
          div.fg-1.flex
            div.right.fb-2.fg-1(style='display: flex; align-items: center;')
              ve-histogram(:data="res.charts_month_yield_hr" :settings="res.charts_month_yield_hr_setting" style="width: 100%;")
      div.swiper-slide
        div.row.bdb.center 全投资
        div.section-3(style="height: 540px;")
          div.row.flex.bdb.fz-14
            div.fb-5.center.bdr 标杆电价 (元)
            div.fb-5.center.bdr 脱硫电价 (元)
            div.fb-5.center.bdr 国家补贴 (元)
            div.fb-5.center.bdr 省级补贴 (元)
            div.fb-5.center 市级补贴 (元)
          div.row.flex.bdb.fz-14
            input.fb-5.center.bdr(v-model.number='params.normal_price')
            input.fb-5.center.bdr(v-model.number='params.to_grid_price')
            input.fb-5.center.bdr(v-model.number='params.self_national_sub_price')
            input.fb-5.center.bdr(v-model.number='params.province_sub_price') 
            input.fb-5.center(v-model.number='params.city_sub_price') 
          div.fg-1(style="padding-top: 40px;")
            ve-line(:data="res.charts_quan" :settings="res.charts_quan_setting")
      div.swiper-slide
        div.row.bdb.center 资本金
        div.section-4(v-show='true' style="height: 600px;")
          div.row.flex.bdb
            div.fb-3.center.bdr
            div.fb-3.center.bdr 建设期
            div.fb-3.center 长期融资
          div.row.flex.bdb
            div.fb-3.center.bdr 利率(%)
            input.fb-3.center.bdr(v-model.number='params.trust_lending_rate')
            input.fb-3.center(v-model.number='params.lt_lending_rate')
          div.row.flex.bdb
            div.fb-3.center.bdr 杠杆比例
            input.fg-1.center(v-model.number='params.equity_ratio')
          div.row.flex.bdb
            div.fb-3.center.bdr 周期
            div.fb-3.center.bdr
              input(v-model.number='params.trust_lending_term')
              span 月
            div.fb-3.center
              input(v-model.number='params.loan_tenor' style='width: 20px;')
              span 年
          div.fg-1
            ve-line(:data="res.charts_ziben" :settings="res.charts_ziben_setting")
      div.swiper-slide.center.fg-1.flex-d
        div.row.bdb.center 业主资信
        div.section-5.flex.fz-14.fg-1.bdb.bdt
          div.left.bdr.fg-1
          div.right.fb-3
            div.row.flex.bdb.center 注册资本
            div.row.flex.bdb.center 法定代表人
            div.row.flex.bdb.center 注册地址
            div.row.flex.bdb.center 注册时间
            div.row.flex.bdb.center 企业性质
            div.row.flex.center 是否上市公司
    div.swiper-pagination
</template>
<script>
/* eslint-disable */
const months = [
  { '月份': 'Jan' },
  { '月份': 'Feb' },
  { '月份': 'Mar' },
  { '月份': 'Apr' },
  { '月份': 'May' },
  { '月份': 'Jun' },
  { '月份': 'Jul' },
  { '月份': 'Aug' },
  { '月份': 'Sep' },
  { '月份': 'Oct' },
  { '月份': 'Nov' },
  { '月份': 'Dec' }
]
const months_26 = [
  { '月份': '0年' },
  { '月份': '1年' },
  { '月份': '2年' },
  { '月份': '3年' },
  { '月份': '4年' },
  { '月份': '5年' },
  { '月份': '6年' },
  { '月份': '7年' },
  { '月份': '8年' },
  { '月份': '9年' },
  { '月份': '10年' },
  { '月份': '11年' },
  { '月份': '12年' },
  { '月份': '13年' },
  { '月份': '14年' },
  { '月份': '15年' },
  { '月份': '16年' },
  { '月份': '17年' },
  { '月份': '18年' },
  { '月份': '19年' },
  { '月份': '20年' },
  { '月份': '21年' },
  { '月份': '22年' },
  { '月份': '23年' },
  { '月份': '24年' },
  { '月份': '25年' }
]
import debounce from 'lodash.debounce';
export default {
  data () {
    const roofs = [{label: '水泥屋顶', value: 'roofblast'}, {label: '彩钢瓦', value: 'flushmount'}]
    const directions = [{label: '东', value: 90}, {label: '南', value: 180}, {label: '东南', value: 135}, {label: '西南', value: 225}, {label: '西', value: 270}]
    const roof_1 = [{label: 5, value: 5}, {label: 10, value: 10}, {label: 20, value: 20}, {label: 25, value: 25}]
    const com_types = [{label: '单晶', value: 'mono'}, {label: '多晶', value: 'poly'}]
    return {
      roofs,
      directions,
      roof_1,
      com_types,
      roof_info: {},
      res: {},
      params: {
        roof_id: 1,
        cost: 6.0,
        leasing_price: 3.0,
        om_cost: 0.1,
        self_use: 1,
        self_use_ratio: 90,
        electric_discount: 85,
        electric_price: 0.8183,
        mount_type: 'roofblast',
        solar_az: 180,
        solar_tilt: 5,
        module_type: 'mono',
        normal_price: 0.75,
        to_grid_price: 0.391,
        self_national_sub_price: 0.37,
        province_sub_price: 0,
        city_sub_price: 0,
        trust_lending_rate: 6.5,
        lt_lending_rate: 7.0,
        equity_ratio: 70,
        trust_lending_term: 6,
        loan_tenor: 20
      }
    }
  },
  methods: {
    changeData () {
      const id = this.$route.params.id
      this.$http({url: `/roof/${id}/calculate`, data: this.params})
        .then(res => {
          res.data.charts_month_yield_hr = {
            columns: ['月份', '可利用小时数'],
            rows: months.map((v, i) => Object.assign(v, {'可利用小时数': res.data.month_yield_hr[i].toFixed(3)}))
          }
          res.data.charts_month_yield_hr_setting = {
            metrics: ['可利用小时数'],
            dimension: ['月份'],
            yAxisName: ['[h]']
          }
          res.data.charts_quan = {
            columns: ['月份', '净现金流量', '累计现金流量'],
            rows: months_26.map((v, i) => Object.assign(v, {'净现金流量': res.data.net_cashflow_arr[i], '累计现金流量': res.data.net_cashflow_arr_c[i]}))
          }
          res.data.charts_quan_setting = {
            metrics: ['净现金流量', '累计现金流量'],
            dimension: ['月份']
          }
          res.data.charts_ziben = {
            columns: ['月份', '净现金流量', '累计现金流量'],
            rows: months_26.map((v, i) => Object.assign(v, {'净现金流量': res.data.net_cashflow_l_arr[i], '累计现金流量': res.data.net_cashflow_l_arr_c[i]}))
          }
          res.data.charts_ziben_setting = {
            metrics: ['净现金流量', '累计现金流量'],
            dimension: ['月份']
          }
          this.res = res.data;
        })
    },
    logout () {
      localStorage.removeItem('token')
      this.$router.push({name: 'Login'})
    }
  },
  watch: {
    params: {
      handler: debounce(function () {this.changeData()}, 1000),
      deep: true
    }
  },
  created () {
    this.changeData();
    const id = this.$route.params.id
    this.$http({url: `/roof/${id}`})
    .then(res => {
      res.data.chartData = {
        columns: ['月份', '气温', '散射辐照', '直射辐照'],
        rows: months.map((v, i) => Object.assign(v, {'气温': res.data.temp_info[i], '散射辐照': res.data.dif_info[i], '直射辐照': res.data.direct_info[i].toFixed(2)}))
      }
      res.data.chartSettings = {
        metrics: ['气温', '散射辐照', '直射辐照'],
        axisSite: {right: ['气温']},
        showLine: ['气温'],
        stack: {all: ['散射辐照', '直射辐照']},
        yAxisName: ['kwh/m^2', '℃']
      }
      document.title = res.data.owner;
      let map;
      let maxZoomService;
      let infoWindow;

      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 20,
          center: {lat: res.data.lat, lng: res.data.lon},
          mapTypeId: 'satellite',
            zoomControl: true,
            draggable: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false
        });
        infoWindow = new google.maps.InfoWindow();
      }
      initMap()

      this.roof_info = res.data
       var mySwiper = new window.Swiper('.swiper-container', {
        observer: true,
        pagination : '.swiper-pagination',
        paginationClickable :true,
        observerParent: true,
        direction : 'vertical',
        mousewheelControl : true
      })
    })
  }
}
</script>

<style lang="scss" scoped>
.swiper-pagination {
  position: fixed;
  top: 300px;
  left: calc(100vw - 50px);
  width: 130px;
  height: 60px;
}
@import '../sass/var';
.act-detail {
  min-width: 1000px;
}

.header {
  display: flex;
  min-width: 1000px;
  .left {
    width: 100px;
    height: 100px;
    background-color: #0172be;
    text-align: center;
    line-height: 100px;
    color: white;
    font-size: 36px;
  }
  .right {
    flex-grow: 1;
    .title {
      span:first-child {
        padding-left: 40px;
        line-height: 50px;
      }
      span:nth-child(2) {
        padding-left: 50px;
      }
    }
  }
}

.row {
  height: 50px;
}
.section-5 {
  min-height: 300px;
  width: 100%;
}
.content {
  width: 1080px;
  margin: 70px auto;
  min-height: 600px;
}
.logout {
  margin-left: auto;
  margin-right: 20px;
  font-size: 14px;
  width: 40px;
  cursor: pointer;
  height: 20px;
}
.swiper-pagination-bullet {
  margin-left: 10px;
}
</style>
