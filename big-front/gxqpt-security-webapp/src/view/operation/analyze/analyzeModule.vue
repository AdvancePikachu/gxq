<template>
  <Layout>
    <Content>
      <Breadcrumb>
        <BreadcrumbItem>运维分析</BreadcrumbItem>
        <BreadcrumbItem>共性模块监控</BreadcrumbItem>
      </Breadcrumb>
      <Card>
        <Row type="flex" justify="space-between">
          <Col style="width: 49%">
            <chart-card title="模块新增量">
              <chartLine ref="newModules" el="newModules" :lineOption="newModulesOption">
                <div id="newModules" style="height: 400px;"></div>
              </chartLine>
            </chart-card>
          </Col>
          <Col style="width: 49%">
            <chart-card title="模块使用量">
              <chartBar ref="moduleUsage" el="moduleUsage" :barOption="moduleUsageOption">
                <div id="moduleUsage" style="height: 400px;"></div>
              </chartBar>
            </chart-card>
          </Col>
        </Row>
        <Row type="flex" justify="space-between">
          <Col style="width: 49%">
            <chart-card title="模块使用top10">
              <chartBar ref="moduleTopTen" el="moduleTopTen" :barOption="moduleTopTenOption">
                <div id="moduleTopTen" style="height: 400px;"></div>
              </chartBar>
            </chart-card>
          </Col>
          <Col style="width: 49%">
            <chart-card title="模块使用率">
              <chartLine ref="moduleUsageRate" el="moduleUsageRate" :lineOption="moduleUsageRateOption">
                <div id="moduleUsageRate" style="height: 400px;"></div>
              </chartLine>
            </chart-card>
          </Col>
        </Row>
      </Card>
    </Content>
  </Layout>
</template>

<script>
import api from '@/api/axiosApi'
import operationApiList from '@/api/operationApiList'
// echart图外层容器，包括卡片样式
import chartCard from '@/view/home/chartCard.vue'
import chartLine from './../echarts/ChartLine.vue'
import chartBar from './../echarts/bar.vue'
// echart图的一些共用的配置
import {symbolLine, symbolBar, horizontalBar} from '@/assets/js/echartOption'

export default {
  components: {
    chartCard,
    chartLine,
    chartBar
  },
  data () {
    return {
      newModulesOption: symbolLine(),
      moduleUsageOption: symbolBar(),
      moduleTopTenOption: horizontalBar(),
      moduleUsageRateOption: symbolLine(),
      commonXdata: []
    }
  },
  mounted() {
    this.getDataAnalysis()
  },
  methods: {
    // 获取共性模块的数据
    getDataAnalysis() {
      const vm = this
      api(operationApiList.getDataAnalysis)
      .then(res => {
        if (res.data.errcode === 0) {
          const data = res.data.data
          vm.commonXdata = data.ymonthArray
          vm.drawNewModules(data.insertNumber)
          vm.drawModulesRate(data.useRate)
          vm.drawModuleTopTen(data.useTop)
          vm.drawModuleUsage(data.useNumber)
        } else {
          vm.$Message.info(res.data.errmsg)
        }
      }, err => {console.log(err)})
    },
    // 新增模块数
    drawNewModules (yData) {
      this.newModulesOption.xAxis.axisLabel = {
        interval: 0,
        rotate: 30
      }
      this.newModulesOption.xAxis.data = this.commonXdata
      this.newModulesOption.series[0].data = yData
      this.$refs.newModules.refresh()
    },
    // 模块使用量
    drawModuleUsage (yData) {
      this.moduleUsageOption.xAxis.axisLabel = {
        interval: 0,
        rotate: 30
      }
      this.moduleUsageOption.xAxis.data = this.commonXdata
      this.moduleUsageOption.series[0].data = yData
      this.$refs.moduleUsage.refresh()
    },
    // 模块top10
    drawModuleTopTen (top) {
      const name = []
      const count = []
      top.map(item => {
        name.unshift(item.modularName)
        count.unshift(item.downloadCount)
      })
      this.moduleTopTenOption.yAxis = {
        show: true
      }
      this.moduleTopTenOption.yAxis.data = name
      this.moduleTopTenOption.series[0].data = count
      this.$refs.moduleTopTen.refresh()
    },
    // 模块使用率
    drawModulesRate (yData) {
      this.moduleUsageRateOption.yAxis.name = '使用率'
      this.moduleUsageRateOption.yAxis.axisLabel = {
        formatter: '{value}%'
      }
      this.moduleUsageRateOption.xAxis.axisLabel = {
        interval: 0,
        rotate: 30
      }
      this.moduleUsageRateOption.xAxis.data = this.commonXdata
      this.moduleUsageRateOption.series[0].data = yData
      this.$refs.moduleUsageRate.refresh()
    }
  }
}
</script>
