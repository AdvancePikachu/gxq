<template>
    <Layout>
		<Content>
			<Breadcrumb>
				<BreadcrumbItem>预警分析</BreadcrumbItem>
				<BreadcrumbItem>部门预警分析</BreadcrumbItem>
			</Breadcrumb>
			<Card style="margin-bottom: 20px;">
				<Form ref="formValidate" :model='formData' :rules="ruleValidate" inline :label-width="100">
					<FormItem label="时间">
                        <DatePicker :value="defaultDate" @on-change="changeYear" type="year" placeholder="选择时间" :options="pickerOptions" style="width: 200px"></DatePicker>
					</FormItem>
					<FormItem label="单位">
						<Select v-model="formData.unitName" style="width:180px">
							<Option v-for="(item, index) in unitOrgIds" :key="index" :value="item.id">{{item.name}}</Option>
						</Select>
						<Button v-if="checkButton('supervise_Analysis_department_view')" type="primary" @click="refreshAnalyze">查看分析</Button>
					</FormItem>
				</Form>
			</Card>
        <Layout style="background:#fff;">
            <carouseList :data='unitList' :arrowType='arrowType'></carouseList>
            <Layout>
                <Col span="14"></Col>
                <Col span="9"></Col>
                <Row type="flex" justify="space-between">
                  <Col style="width: 49%;">
                    <chart-card title="各部门预警状态">
                      <unitWarnState ref="unitWarnState" />
                    </chart-card>
                  </Col>
                  <Col style="width: 49%;">
                    <chart-card title="各部门预警类别情况">
                      <unit-category ref="unitCategorye" />
                    </chart-card>
                  </Col>
                </Row>
                <Row type="flex" justify="space-between">
                  <Col style="width: 49%;">
                    <chart-card title="各部门预警处理对比分析">
                      <unit-manage ref="unitManageData" />
                    </chart-card>
                  </Col>
                  <Col style="width: 49%;">
                    <chart-card title="各部门预警级别情况">
                      <unit-level ref="unitLevel" />
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
import countUp from '@/components/hengyun/countUp.vue'
// 各部门预警状态
import unitWarnState from './echarts/unitWarnState.vue'
// 各部门预警类别情况
import unitCategory from './echarts/unitCategory.vue'
// 各部门预警处理对比分析
import unitManage from './echarts/unitManage.vue'
// 各部门预警级别情况
import unitLevel from './echarts/unitLevel.vue'
// 顶部滑动列表模块
import carouseList from "./modal/carouseList.vue";
import { mapState } from 'vuex'
// 保存所有部门的信息
const allDepartmentList = new Map()
export default {
    components: {
      'chart-card': chartCard,
      countUp,
      unitWarnState,
      carouseList,
      'unit-category': unitCategory,
      'unit-manage': unitManage,
      'unit-level': unitLevel
    },
    data(){
        return{
            arrowType:'never',
            unitList:[],//部门列表
            defaultDate:new Date(),//获取今年年份
            orgId:'',
            dpmIds:[],//初始化部门集合
            unitOrgIds:[],//初始化单位集合
            ruleValidate:{},
            formData:{
              year:new Date().getFullYear(),
              unitName:''
            },
            echartDatas:{},
            pickerOptions: {
                // disabledDate是一个函数,参数是当前选中的日期值,这个函数需要返回一个Boolean值,
                disabledDate: (year) => {
                    var myYear = year.getFullYear()
                    var myDate = new Date();
                    // 如果函数处理比较简单,可以直接在这里写逻辑方法
                    return !(myYear <= myDate.getFullYear() && myYear >= 1900)
                //return this.dealDisabledDate(time)
                }
            } // 日期设置对象
        }
    },
    mounted(){
        //初始化
        let date = new Date();
        let year = date.getFullYear().toString();
        this.init(year);
    },
    methods:{
        init(year){
            this.getUnitData(year);
        },
        getUnitData(year){//获取基本单位id
            api(superviseApiList.findOrgByUser).then((res) => {
                if(res.data.errcode == 0) {
                    this.formData.unitName = res.data.data[0].id;
                    this.unitOrgIds = res.data.data;
                    this.orgId = res.data.data[0].id;
                    this.getDepartmentData(year);
                }else{
                    this.$Message.error(res.data.errmsg);
                }
            }, (error) => {})
        },
        getDepartmentData(year){//获取基本部门id
            api(superviseApiList.findDpmByOrg,{ systemCode:'gxqpt', orgId:this.orgId }).then((res) => {
                if(res.data.errcode == 0) {
                    this.dpmIds = [];
                    allDepartmentList.clear()
                    for(var i in res.data.data){
                        this.dpmIds.push(res.data.data[i].id);
                        // 往map插入人员信息数据，后面获取数字之后有用
                        allDepartmentList.set(res.data.data[i].id, res.data.data[i])
                    }
                    this.getFindSurvey(year);
                    this.getFindPublicSuperviseStatus(year);
                    this.getDepartmentTypeList(year);
                    this.getFindPublicHandle(year);
                    this.getDepartmentLevelList(year);
                }else{
                    this.$Message.error(res.data.errmsg);
                }
            }, (error) => {})
        },
        getFindSurvey(y){//获取所有部门关联未处理预警的数量
            let data = {},currData=[];
            data['dpmIds'] = this.dpmIds;
            if(y)data.date=y;
            api(superviseApiList.findSurvey,data).then((res) => {
                if(res.data.errcode == 0) {
                    for(var i = 0;i<res.data.data.length;i++){
                        //整理参数
                        res.data.data[i].color = "#F7645D";
                        res.data.data[i].idName = res.data.data[i].name;
                        res.data.data[i].count = res.data.data[i].num;
                        res.data.data[i].countSize = "#50";
                        res.data.data[i].introText = res.data.data[i].name;
                        res.data.data[i].link =  `/departmentWarnAnalyzeView/${res.data.data[i].id}`;
                        currData.push(res.data.data[i]);
                        allDepartmentList.delete(res.data.data[i].id)
                        if(currData.length === 8) {
                          this.unitList.push(currData)
                          currData = []
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
        getFindPublicSuperviseStatus(y){//各部门预警状态
            let data = {};
            data['dpmIds'] = this.dpmIds;
            if(y)data.date=y;
            api(superviseApiList.findPublicSuperviseStatus,data).then((res) => {
                if(res.data.errcode == 0) {
                    this.$refs.unitWarnState.refresh(res.data.data);
                }else{
                    this.$Message.error(res.data.errmsg);
                }
            }, (error) => {})
        },
        getDepartmentTypeList(y){//各部门预警类别情况
            let data = {};
            data['ids'] = this.dpmIds;
            if(y)data.date=y;
            api(superviseApiList.departmentTypeList,data).then((res) => {
                if(res.data.errcode == 0) {
                    this.$refs.unitCategorye.refresh(res.data.data);
                }else{
                    this.$Message.error(res.data.errmsg);
                }
            }, (error) => {})
        },
        getFindPublicHandle(y){//各部门预警处理时长对比分析
            let data = {};
            data['dpmIds'] = this.dpmIds;
            if(y)data.date=y;
            api(superviseApiList.findPublicHandle,data).then((res) => {
                if(res.data.errcode == 0) {
                    this.$refs.unitManageData.refresh(res.data.data);
                }else{
                    this.$Message.error(res.data.errmsg);
                }
            }, (error) => {})
        },
        getDepartmentLevelList(y){//各部门预警级别情况
            let data = {};
            data['ids'] = this.dpmIds;
            if(y)data.date=y;
            api(superviseApiList.departmentLevelList,data).then((res) => {
                if(res.data.errcode == 0) {
                    this.$refs.unitLevel.refresh(res.data.data);
                }else{
                    this.$Message.error(res.data.errmsg);
                }
            }, (error) => {})
        },
        getUnit(val){//获取选项卡部门
            this.formData.unitName = val;
            console.log(this.unitOrgIds);
            console.log(val);
        },
        changeYear(val){//选取年份
            this.formData.year = val;
        },
        refreshAnalyze(){//查看刷新的分析
            this.unitList = [];
            this.orgId = this.formData.unitName;
            let year = this.formData.year.toString();
            this.getDepartmentData(year);
        },
        checkButton(code){
			if(this.authButton.indexOf(code) >= 0){
				return true;
			}else{
				return false;
			}
		}
    },
    computed: {
		...mapState([
			'authButton'
		])
	},
}
</script>

<style lang="less" scoped>
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
.card-title{
    text-align: center;
    background-color: #888;
}
</style>
