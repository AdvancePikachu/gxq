<template>
    <Layout>
		<Content>
			<Breadcrumb>
				<BreadcrumbItem>统一监管平台</BreadcrumbItem>
				<BreadcrumbItem>单位预警分析</BreadcrumbItem>
			</Breadcrumb>
			<Card style="margin-bottom: 20px;">
				<Form ref="formValidate" :rules="ruleValidate" inline :label-width="100">
                    <FormItem :label="name" :label-width='140'></FormItem>
                    <FormItem label="时间">
                        <DatePicker v-model="defaultDate" type="year" placeholder="选择时间" style="width: 200px"></DatePicker>
					</FormItem>
					<FormItem>
						<Button type="primary" @click="refreshAnalyze">查看分析</Button>
					</FormItem>
					<FormItem class="rt">
						<router-link to="/unitWarnAnalyze"><Button type="primary">返回</Button></router-link>
					</FormItem>
				</Form>
			</Card>
            <Layout>
                <carouseList :data='unitList' :arrowType='arrowType'></carouseList>
                <Layout style="margin-top: 20px;">
                    <Row type="flex" justify="space-between">
                      <Col span="11" class="bgWhite">
                      <div class="level-container">
                        <div class="lt lt_tle">预警级别</div>
                        <div class="lt lt_item" v-for="item in warnlevel" :class="item.className">
                            <h3>{{item.title}}</h3>
                            <p><span class="fontSize">{{item.num}}</span>{{item.quantifier}}</p>
                        </div>
                      </div>
                      </Col>
                      <Col span="13" class="bgWhite">
                        <!-- 预警类型 -->
                      	<!-- <Col span="8">
                          <div class="warning-level">
                            <unit-warning-level ref="warnType"></unit-warning-level>
                          </div>
                        </Col> -->
                        <Col span="12"><!-- 预警级别 -->
                          <div class="warning-level">
                            <level-warning ref="warnLevel"></level-warning>
                          </div>
                        </Col>
                        <Col span="12"><!-- 预警处理情况 -->
                          <div class="warning-level">
                            <back-warning ref="warnBack"></back-warning>
                          </div>
                        </Col>
                      </Col>
                    </Row>
                    <Row type="flex" justify="space-between">
                      <Col style="width: 49%;"><!-- 对比分析 -->
                        <chart-card :title="`${appName}预警处理对比分析`">
                            <contrast-analyze ref="contrastAnalyze"></contrast-analyze>
                        </chart-card>
                      </Col>
                      <Col style="width: 49%;"><!-- 预警产生处理情况 -->
                        <chart-card :title="`${appName}预警状态`">
                            <deal-state ref="dealState"></deal-state>
                        </chart-card>
                      </Col>
                    </Row>
                </Layout>
            </Layout>
		</Content>
	</Layout>
</template>

<script>
import api from '@/api/axiosApi'
import superviseApiList from '@/api/superviseApiList'
// echart图外层容器，包括卡片样式
import chartCard from './echarts/chartCard.vue'
// 对比分析
import contrastAnalyze from './echarts/contrastAnalyze.vue'
// 单位预警处理情况
import unitWarnDealState from './echarts/unitWarnDealState.vue'
// 预警类型
import unitPieCharts from './echarts/unitPieCharts'
// 预警级别
import levelPieCharts from './echarts/levelPieCharts'
// 退出理由
import backPieCharts from './echarts/backPieCharts'
// 顶部滑动列表模块
import carouseList from "./modal/carouseList.vue";

// 所有部门
const allDepartmentList = new Map()
export default {
    components: {
        carouseList,
        'chart-card': chartCard,
        'dealState': unitWarnDealState,
        'unitWarningLevel': unitPieCharts,
        'levelWarning': levelPieCharts,
        'backWarning': backPieCharts,
        'contrastAnalyze': contrastAnalyze,
    },
    data(){
        return{
            defaultDate:new Date(),//获取今年年份
            orgIds:[],
            unitList:[],
            unitLevel:[],
            GxqptPublicLevel:{1:'一般预警',2:'较重预警',3 :'严重预警 ',4:'特别严重预警'},
            type:'',
            orgId:'',
            value1: 0,
            arrowType:'never',
            ruleValidate:{},
            formData:{},
            name:'',
            warnlevel:[
            	{
            		title:"特别严重预警",
            		num:1,
            		quantifier:"个",
            		className:"most",
            	},
            	{
            		title:"严重预警",
            		num:5,
            		quantifier:"个",
            		className:"danger",
            	},
            	{
            		title:"较重预警",
            		num:7,
            		quantifier:"个",
            		className:"serious",
            	},
            	{
            		title:"一般预警",
            		num:16,
            		quantifier:"个",
            		className:"normal",
            	}
            ],
            caOptions:{
        		legendData:[],
        	},
        }
    },
    computed: {
        appName () {
            return this.$route.query.app
        }
    },
    mounted(){
        console.log("进来");
        this.orgId = this.$route.params.id;//传递的单位id
        this.name = this.$route.query.app + '预警分析';
        let year = this.defaultDate.getFullYear().toString();
        this.init(year);
    },
    methods:{
        init(year){
            console.log("初始化");
            this.findDpmByUserAndOrg(year);
        },
        findDpmByUserAndOrg(year){//获取基本单位id
            var data = {orgId:this.orgId};//跳转页面获取的单位id值
            api(superviseApiList.findDpmByUserAndOrg,data).then((res) => {
                if(res.data.errcode == 0) {
                    allDepartmentList.clear()
                    for(var i = 0;i<res.data.data.length;i++){
                        this.orgIds.push(res.data.data[i].id);
                        allDepartmentList.set(res.data.data[i].id, res.data.data[i])
                    }
                    this.getFindSurvey(year);
                    this.findPublicContrast(year);
                    // this.warntype(year);
                    this.warnlevels(year);
                    this.warnHandleStatistical(year);
                }else{
                    this.$Message.error(res.data.errmsg);
                }
            }, (error) => {})
        },
        getFindSurvey(y){//获取所有部门关联未处理预警的数量
            let data = {},currData=[];
            data['dpmIds'] = this.orgIds;
            if(y)data.date=y;
            api(superviseApiList.findSurvey,data).then((res) => {
                if(res.data.errcode == 0) {
                    this.unitList = []
                    for(var i = 0;i<res.data.data.length;i++){
                        //整理参数
                        res.data.data[i].color = "#F7645D";
                        res.data.data[i].idName = res.data.data[i].id;
                        res.data.data[i].count = res.data.data[i].num;
                        res.data.data[i].countSize = "#50";
                        res.data.data[i].introText = res.data.data[i].name;
                        res.data.data[i].link =  `/departmentWarnAnalyzeView/${res.data.data[i].id}`;
                        currData.push(res.data.data[i]);
                        allDepartmentList.delete(res.data.data[i].id)
                        if(currData.length === 8) {
                            this.unitList.push(currData);
                            currData = [];
                        }
                    }
                    // 遍历剩余没有数字的部门
                    let size = allDepartmentList.size
                    allDepartmentList.forEach((value, key, map) => {
                      currData.push({
                        color: "#F7645D",
                        idName: value.name,
                        count: 0,
                        countSize: "#50",
                        introText: value.name
                      })
                      size--
                      if(currData.length === 8 || size === 0) {
                        this.unitList.push(currData)
                        currData = []
                      }
                    })
                    // 如果没有为0的就需要判断这个条件
                    if (currData.length > 0) {
                      this.unitList.push(currData)
                    }
                    if(this.unitList.length>1){
                        this.arrowType='always';
                    }
                }else{
                    this.$Message.error(res.data.errmsg);
                }
            }, (error) => {})
        },
        warnlevels(y){//该单位各预警级别情况
            let data = {};
            data['id'] = this.orgId;
            if(y)data.year=y;
            api(superviseApiList.organalysisWarnlevel,data).then((res) => {
                if(res.data.errcode == 0) {
                  const data = res.data.data
                  this.warnlevel[0].num = data[3] ? data[3].count : 0;
                  this.warnlevel[1].num = data[2] ? data[2].count : 0;
                  this.warnlevel[2].num = data[1] ? data[1].count : 0;
                  this.warnlevel[3].num = data[0] ? data[0].count : 0;
                  this.$refs.warnLevel.refresh(res.data.data);
                }else{
                  this.$Message.error(res.data.errmsg);
                }
            }, (error) => {})
        },
        warntype(y){//该单位各预警类型情况
            let data = {};
            data['id'] = this.orgId;
            if(y)data.year=y;
            api(superviseApiList.organalysisWarntype,data).then((res) => {
                if(res.data.errcode == 0) {
                    this.$refs.warnType.refresh(res.data.data);
                }else{
                    this.$Message.error(res.data.errmsg);
                }
            }, (error) => {})
        },
        warnHandleStatistical(y){//预警处理时长对比分析
            let data = {};
            data['id'] = this.orgId;
            if(y)data.year=y;
            api(superviseApiList.organalysisWarnHandleStatistical,data).then((res) => {
                if(res.data.errcode == 0) {
                    this.$refs.warnBack.refresh(res.data.data);
                    this.$refs.dealState.refresh(res.data.data);
                }else{
                    this.$Message.error(res.data.errmsg);
                }
            }, (error) => {})
        },
        findPublicContrast(y){//公用查询对比分析
            let data = {};
            data['orgId'] = this.orgId;
            if(y)data.date=y;
            api(superviseApiList.findPublicContrast,data).then((res) => {
                if(res.data.errcode == 0) {
                    res.data.data.legendData=["平均水平",this.appName];
                    this.$refs.contrastAnalyze.refresh(res.data.data);
                }else{
                    this.$Message.error(res.data.errmsg);
                }
            }, (error) => {})
        },
        refreshAnalyze(){
            this.orgIds = [];
            this.init(this.defaultDate.getFullYear().toString());
        },
    }
}
</script>

<style lang="less" scoped>
.bgWhite{
    background-color: #fff;
}
.level-container{
    margin-top: 83px;
}
.lt{
	float: left;
}
.rt{
	float: right;
}
.lt_tle{
	width: 1em;
	padding: 1em 2em;
	line-height: 30px;
}
.lt_item{
	width: 110px;
	height: 110px;
	border: 1px solid #0066CC;
	border-radius: 50%;
	text-align: center;
	margin: 1.3em;
	h3{
		margin: 2.5em 0 1em;
	}
}
.most{
	color: #FD7F7F;
    border-color: #FD7F7F;
}
.danger{
	color: #FFA358;
    border-color: #FFA358;
}
.serious{
	color: #FFD851;
    border-color: #FFD851;
}
.normal{
    color: #55CFF4;
    border-color: #55CFF4;
}
.fontSize{
	font-size: 18px;
}
.radioMod{
    width:80%;
    height:100%;
    padding:10px 0;
    border:1px solid #ccc;
    border-radius: 50%;
    margin: 30px auto;
}
.mf{
    margin-left:2%;
}
.radioTxt{
    width:100px;
    height:100px;
    margin:35px auto;
    font-size:20px;
    text-align: center
}
.warning-level,
.app-warning-analysis,
.warning-occur-handle{
	height: 300px;
}
</style>
