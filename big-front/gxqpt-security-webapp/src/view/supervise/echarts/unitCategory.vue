<!-- 各单位预警类别情况 -->
<template>
  <div id="unitCategory"></div>
</template>

<script>
export default {
  data(){
    return{
      nameList:[],
      indicator:[],
      seriesData:[],
      echartData: [],
      unitCategory: ''
    }
  },
  methods: {
    initUnitCategory() {
      if(this.indicator.length==0){
        this.indicator = [0,0,0,0,0,0,0,0];
        this.nameList = ['暂无数据']
    	};
      // 基于准备好的dom，初始化echarts实例
      if (!this.unitCategory) {
        this.unitCategory = this.$echarts.init(document.getElementById('unitCategory'))
      }
      const option = {
          backgroundColor: '#fff',
          tooltip: {
              show: true
          },
          legend: {
              type: 'scroll',
              orient: 'vertical',
              top: '10%',
              right: '10%',
              selected: {
                  //'iPhone X': false,
              },
              data: this.nameList
          },
          radar: {
              shape: 'circle',
              scale: true,
              indicator: this.indicator,
              center: ['30%', '50%'],
              radius: '50%'
          },

          series: [{
              type: 'radar',
              zlevel: 2,
              data: this.echartData
          }]
      }

      // 使用刚指定的配置项和数据显示图表。
      this.unitCategory.setOption(option);
    },
    count(){//整理数据
      this.nameList = [];
      this.indicator = [];
      let obj = {};
      for(var i =0;i<this.echartData.length;i++){
        Object.assign(obj,this.echartData[i].count);//合并选项
        this.echartData[i].value = [];
        this.nameList.push(this.echartData[i].name);
      }
      for(var j in obj){//计算全部显示数据
        this.indicator.push({'text':j});
      }
      for(var i =0;i<this.echartData.length;i++){//计算雷达数据，没有则为0
        for(var j in obj){
          (this.echartData[i].count[j]) ? this.echartData[i].value.push(this.echartData[i].count[j]) : this.echartData[i].value.push(0);
        }
      }
    },
    refresh (data) {
      this.echartData = data
      this.count()
      this.initUnitCategory()
    }
  }
}
</script>

<style lang="less" scoped>
#unitCategory {
  width: 100%;
  height: 300px;
}
</style>