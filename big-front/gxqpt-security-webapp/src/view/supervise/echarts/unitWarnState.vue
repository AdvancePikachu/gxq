<!-- 单位预警状态柱状图对比分析 -->
<template>
  <div id="unitWarnState"></div>
</template>

<script>
export default {
    data () {
        return {
            echartData: [],
            unitWarnState: ''
        }
    },
    methods: {
        initUnitWarnState () {
            // 基于准备好的dom，初始化echarts实例
            if (!this.unitWarnState) {
                this.unitWarnState = this.$echarts.init(document.getElementById('unitWarnState'))
            }
            const option = {
                backgroundColor: '#fff',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['已处理预警', '未处理预警', '新增预警'],
                    align: 'right',
                    right: 10,
                    textStyle: {
                        color: "#333"
                    },
                    itemWidth: 10,
                    itemHeight: 10,
                    itemGap: 35
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [{
                    type: 'category',
                    data:  this.echartData.names,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: "#063374",
                            width: 1,
                            type: "solid"
                        }
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: "#00c7ff",
                        }
                    },
                }],
                yAxis: [{
                    type: 'value',
                    axisTick: {
                        show: false,
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: "#A6A6A6",
                            width: 1,
                            type: "solid"
                        },
                    },
                    splitLine: {
                        show: false
                    }
                }],
                series: [{
                    name: '已处理预警',
                    type: 'bar',
                    data: this.echartData.processeds,
                    barWidth: 10, //柱子宽度
                    barGap: 1, //柱子之间间距
                    itemStyle: {
                        normal: {
                            color: '#9FDFA1',
                            opacity: 1,
                        }
                    }
                }, {
                    name: '未处理预警',
                    type: 'bar',
                    data: this.echartData.untreateds,
                    barWidth: 10,
                    barGap: 1,
                    itemStyle: {
                        normal: {
                            color: '#F19A9A',
                            opacity: 1,
                        }
                    }
                }, {
                    name: '新增预警',
                    type: 'bar',
                    data: this.echartData.newThisYears,
                    barWidth: 10,
                    barGap: 1,
                    itemStyle: {
                        normal: {
                            color:'#85C8F6',
                            opacity: 1,
                        }
                    }
                }]
                    // legend: {
                    //     data: ['已处理预警', '未处理预警', '新增预警'],
                    //     align: 'right',
                    //     right: 10,
                    //     textStyle: {
                    //         color: "#333"
                    //     },
                    //     itemWidth: 10,
                    //     itemHeight: 10,
                    //     itemGap: 35
                    // },
                    // grid: {
                    //     left: '3%',
                    //     right: '4%',
                    //     bottom: '3%',
                    //     containLabel: true
                    // },
                    // xAxis: [{
                    //     type: 'category',
                    //     data: this.echartData.names,
                    //     axisLabel : {
                    //         show: true,
                    //         textStyle: {
                    //             color: "#00c7ff",
                    //         },
                    //         formatter : function (value){
                    //             let valueTxt = '';
                    //             if (value.length > 6) {
                    //             valueTxt = value.substring(0, 4) + '...';
                    //             }
                    //             else {
                    //                 valueTxt = value;
                    //             }
                    //             return valueTxt ;
                    //         },
                    //         interval:0,
                    //         rotate:40
                    //     },
                    //     axisLine: {
                    //         show: true,
                    //         lineStyle: {
                    //             color: "#A6A6A6",
                    //             width: 1,
                    //             type: "solid"
                    //         },
                    //     },
                    //     axisTick: {
                    //         show: false
                    //     }
                    // }],
                    // yAxis: [{
                    //     type: 'value',
                    //     axisTick: {
                    //         show: false,
                    //     },
                    //     axisLine: {
                    //         show: true,
                    //         lineStyle: {
                    //             color: "#A6A6A6",
                    //             width: 1,
                    //             type: "solid"
                    //         },
                    //     },
                    //     splitLine: {
                    //         show: false
                    //     }
                    // }],
                    // series: [{
                    //     name: '已处理预警',
                    //     type: 'bar',
                    //     data: this.echartData.processeds,
                    //     barWidth: 10,
                    //     barGap: 1,
                    //     itemStyle: {
                    //         normal: {
                    //             color: this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    //                 offset: 0,
                    //                 color: '#ccc'
                    //             }, {
                    //                 offset: 1,
                    //                 color: '#000'
                    //             }]),
                    //             opacity: 1,
                    //             // color: '#9FDFA1'
                    //         }
                    //     }
                    // }, {
                    //     name: '未处理预警',
                    //     type: 'bar',
                    //     data: this.echartData.untreateds,
                    //     barWidth: 10,
                    //     barGap: 1,
                    //     itemStyle: {
                    //         normal: {
                    //             color: this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    //                 offset: 0,
                    //                 color: '#ccc'
                    //             }, {
                    //                 offset: 1,
                    //                 color: '#000'
                    //             }]),
                    //             opacity: 1,
                    //             // color: '#F19A9A'
                    //         }
                    //     }
                    // }, {
                    //     name: '新增预警',
                    //     type: 'bar',
                    //     data: this.echartData.newThisYears,
                    //     barWidth: 10, //柱子宽度
                    //     barGap: 1, //柱子之间间距
                    //     itemStyle: {
                    //         normal: {
                    //             color: this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    //                 offset: 0,
                    //                 color: '#ccc'
                    //             }, {
                    //                 offset: 1,
                    //                 color: '#000'
                    //             }]),
                    //             opacity: 1,
                    //             // color: '#85C8F6'
                    //         }
                    //     }
                    // }]
            };
            // 使用刚指定的配置项和数据显示图表。
            this.unitWarnState.setOption(option);
        },
        refresh (data) {
            this.echartData = data
            this.initUnitWarnState()
        }
    }
}
</script>

<style lang="less" scoped>
#unitWarnState{
  width: 100%;
  height: 300px;
}
</style>
