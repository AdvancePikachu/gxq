<template>
  <Layout>
    <Content>
      <Breadcrumb>
        <BreadcrumbItem>数据概览</BreadcrumbItem>
      </Breadcrumb>
      <Card>
        <div class="card-container">
          <div class="card-list">
            <Card style="height:70px;background: #fff;color:#495060;">
              <div class="card-content">
                <p style="line-height: 42px;"><span>主机：</span>{{machineCount}}台</p>
              </div>
              <div class="card-content">
                <p style="line-height: 42px;"><span>服务器：</span>{{serverCount}}台</p>
              </div>
              <div class="card-content">
                <p style="line-height: 42px;"><span>CPU：</span>{{cpuCount}}核</p>
              </div>
              <div class="card-content">
                <p style="line-height: 42px;"><span>内存：</span>{{memorySize}}GB</p>
              </div>
              <div class="card-content">
                <p style="line-height: 42px;"><span>磁盘：</span>{{(diskSize /1024).toFixed(2)}}TB</p>
              </div>
            </Card>
          </div>
        </div>
        <Row type="flex" justify="space-between">
          <Col style="width: 49%">
            <chart-card title="服务器新增数(每月)">
              <lineChart ref="serviceAdd">
                <div id="serviceAdd" style="height: 495px;"></div>
              </lineChart>
            </chart-card>
          </Col>
          <Col style="width: 49%">
            <chart-card title="各部门服务器数量">
              <barChart ref="serviceNum">
                <div id="serviceNum" style="height: 540px;"></div>
              </barChart>
            </chart-card>
          </Col>
          <Col style="width: 100%">
            <chart-card title="各资源数量统计">
              <barChart ref="numStatics">
                <div id="numStatics" style="height: 400px;"></div>
              </barChart>
            </chart-card>
          </Col>
        </Row>
      </Card>
    </Content>
  </Layout>
</template>

<script>
// echart图外层容器，包括卡片样式
import chartCard from '@/view/home/chartCard.vue'
import lineChart from '@/view/home/lineChart.vue'
import barChart from '@/view/home/barChart.vue'
import api from '@/api/axiosApi'
import softhardApiList from '@/api/softhardApiList'
export default {
  components:{
    chartCard,
    lineChart,
    barChart
  },
  data() {
    return {
      machineCount: 0,
      serverCount: 0,
      cpuCount: 0,
      memorySize: 0,
      diskSize: 0,
    }
  },
  mounted () {
    this.init();
  },
  methods: {
    init(){//初始化
      this.getResourceCount();
      this.getServersCountByMonth();
      this.getOrgServersCount();
      this.getServersResCountByMonth();
    },
    getResourceCount() {//软硬件面板各资源数量查询
      api(softhardApiList.getResourceCount).then((res) => {
        if(res.status == 200) {
          this.machineCount = res.data.data.machineCount;
          this.serverCount = res.data.data.serverCount;
          this.cpuCount = res.data.data.cpuCount;
          this.memorySize = res.data.data.memorySize;
          this.diskSize = res.data.data.diskSize;
        }
      }, (err) => {})
    },
    getServersCountByMonth() {//查询当前月及前十一个月的服务器数量
      let mon =[],arr=[];
      api(softhardApiList.getServersCountByMonth).then((res) => {
        if(res.status == 200) {
          res.data.data.forEach(item => {
            mon.push(item.mon);
            arr.push(parseInt(item.serverCount));
          });
          this.drawServiceAdd(mon,arr)
        }
      }, (err) => {})
    },
    getOrgServersCount() {//查询各单位服务器数量统计
      let name =[],arr=[];
      api(softhardApiList.getOrgServersCount).then((res) => {
        if(res.status == 200) {
          res.data.data.forEach(item => {
            name.push(item.orgName);
            arr.push(parseInt(item.serverCount));
          });
          this.drawServiceNum(name,arr)
        }
      }, (err) => {})
    },
    getServersResCountByMonth() {//查询当前月及前十一个月的服务器cpu，内存，硬盘等资源数量
      let date =[],cpuArr=[],memoryArr=[],diskArr=[];
      api(softhardApiList.getServersResCountByMonth).then((res) => {
        if(res.status == 200) {
          res.data.data.forEach(item => {
            date.push(item.mon);
            cpuArr.push(parseInt(item.cpuCount));
            memoryArr.push(parseInt(item.memorySize));
            diskArr.push(parseInt(item.diskSize));
          });
          this.drawNumStatics(date,cpuArr,memoryArr,diskArr)
        }
      }, (err) => {})
    },
    // 绘制查询当前月及前十一个月的服务器数量分析图表
    drawServiceAdd (mon,arr) {
      const vm = this
      const opts = {
        el: 'serviceAdd',
        xAxis: {
          name: '时间',
          data:  mon,
          axisLabel: {
            interval:0,
            rotate:-40
          }
        },
        yAxis: {
          name: '服务器数量(台)',
          minInterval: 1,
          max: Math.max(...arr) + 5
        },
        series: [{
          name: '服务器新增数',
          type:'line',
          data: arr
        }]
      }
      vm.$refs.serviceAdd.refresh(opts)
    },
    // 绘制故障处理分析图表
    drawServiceNum (name,arr) {
      const vm = this
      const opts = {
        el: 'serviceNum',
        legend: {
          left: 'center',
          bottom: 10,
          textStyle: {
            fontSize: '16px'
          },
          data: name
        },
        xAxis: {
          name: '部门',
          data: name,
          axisLabel: {
            interval:0,
            rotate:-40
          }
        },
        yAxis: {
          name: '服务器数量(台)',
          minInterval: 1,
          max: Math.max(...arr) + 5
        },
        series: [{
          name: '数量',
          data: arr,
          barWidth : (arr.length > 12) ? 20 : 40,
          itemStyle:{
              normal:{//柱子颜色
                  color:'#4F81BD'
              }
          },
        }]
      }
      vm.$refs.serviceNum.refresh(opts)
    },
    drawNumStatics (date,cpuArr,memoryArr,diskArr) {
      const vm = this
      const opts = {
        el: 'numStatics',
        legend: {
          left: 'center',
          bottom: 10,
          textStyle: {
            fontSize: 16
          },
          data: ['CPU', '内存', '磁盘'],
          /*selected: {
            '内存': false, '磁盘': false
          }*/
        },
        tooltip:{
          formatter: function (params, ticket, callback) {
              let xVal = ''
              let tooltipArray = []
              params.map(item => {
                xVal = item.name
                let itemText = ''
                switch (item.seriesName){
                	case 'CPU':
                  	itemText = `<p><span class="tooltipClass" style="color:${item.color}">·</span>${item.seriesName}: ${item.value}核</p>`
                		break;
                	case '内存':
                  	itemText = `<p><span class="tooltipClass" style="color:${item.color}">·</span>${item.seriesName}: ${item.value}GB</p>`
                		break;
                	case '磁盘':
                  	itemText = `<p><span class="tooltipClass" style="color:${item.color}">·</span>${item.seriesName}: ${item.value}M</p>`
                		break;
                	default:
                		break;
                }
                tooltipArray.push(itemText)
                
              })
              return `${xVal}: <br/>${tooltipArray.join('')}`;
          }
        },
        xAxis: {
          name: '时间',
          data: date
        },
        yAxis: {
          name: '数量'
        },
        series: [{
          name: 'CPU',
          data: cpuArr,
          itemStyle: { //图形样式
            normal: {
              color: '#4F81BD'
            },
          }
        }, {
          name: '内存',
          data: memoryArr,
          itemStyle: { //图形样式
            normal: {
              color: '#70C44B'
            },
          }
        }, {
          name: '磁盘',
          data: diskArr,
          itemStyle: { //图形样式
            normal: {
              color: '#cc0000'
            },
          }
        }]
      }
      vm.$refs.numStatics.refresh(opts)
    }
  }
}
</script>

<style lang="less" scoped>
.card-container{
  &:after{
    content: '';
    clear: both;
    display: block;
  }
  .card-list{
    float: left;
    width: 100%;
    margin-left: 4%;
    text-align: center;
    &:nth-child(1){
      margin-left: 0;
    }
    .card-content{
      width:20%;
      float:left;
      display: inline-block;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      height: 42px;
      span{
        color:#0099CC;
      }
    }
  }
}
</style>
<style lang="less">
.tooltipClass{
  font-size:80px;
  float: left;
  line-height: 9px;
  margin-right: 5px;
}
</style>
