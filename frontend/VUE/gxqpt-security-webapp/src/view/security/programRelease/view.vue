<template>
	<Layout>
		<Content>
			<Breadcrumb>
				<BreadcrumbItem>安全保障平台</BreadcrumbItem>
				<BreadcrumbItem>程序发布管理</BreadcrumbItem>
				<BreadcrumbItem>详情</BreadcrumbItem>
				<button @click="goback" type="button" class="ivu-btn ivu-btn-primary" style="float:right;margin-right:10px;"> <span>返回</span></button>
			</Breadcrumb>
			<Card>
				<Form ref="programRelease" :model="programRelease" :label-width="100">
					<FormItem label="系统名称：">
						<Row>
							<Col span="24">
							<Input v-model="programRelease.name" disabled></Input>
							</Col>
						</Row>
					</FormItem>
					<FormItem label="版本号：">
						<Row>
							<Col span="24">
							<Input v-model="programRelease.versionId" disabled></Input>
							</Col>
						</Row>
					</FormItem>
					<FormItem label="版本名称：">
						<Row>
							<Col span="24">
							<Input v-model="programRelease.versionName" disabled></Input>
							</Col>
						</Row>
					</FormItem>
					<FormItem label="发布服务器：">
						<Row>
							<Col span="24">
							<Input v-model="programRelease.serverIp" disabled></Input>
							</Col>
						</Row>
					</FormItem>
					<FormItem label="发布文件：">
						<Input
							type="text"
							v-model="programRelease.upgradeFileName"
							disabled
							style="width: 400px;">
						</Input>
						<Button type="primary" @click="downLoad(programRelease.upgradeFileUrl,programRelease.upgradeFileName)">下载</Button>
					</FormItem>
					<FormItem label="升级内容：">
						<Row>
							<Col span="24">
								<Input class="contentHtml" v-html="programRelease.upgradeConent" type="textarea" :rows="5" disabled></Input>
							</Col>
						</Row>
					</FormItem>
					<FormItem label="备注：">
						<Row>
							<Col span="24">
							<Input v-model="programRelease.remarks" type="textarea" :rows="5" disabled></Input>
							</Col>
						</Row>
					</FormItem>
					<Row>
						<Col span="12">
						<FormItem label="审核时间：">
							<DatePicker type="date" v-model="programRelease.auditTime" readonly> </DatePicker>
						</FormItem>
						</Col>
						<Col span="12">
						<FormItem label="审核人：">
							<Input v-model="programRelease.auditUser" class="w168" disabled></Input>
						</FormItem>
						</Col>
					</Row>
					<Row>
						<Col span="12">
						<FormItem label="发布日期：">
							<DatePicker type="date" v-model="programRelease.upgradeTime" readonly> </DatePicker>
						</FormItem>
						</Col>
						<Col span="12">
						<FormItem label="创建日期：" prop="">
							<DatePicker type="date" v-model="programRelease.createTime" readonly> </DatePicker>
						</FormItem>
						</Col>
					</Row>
				</Form>
			</Card>
		</Content>
	</Layout>
</template>

<script>
	import UE from '@/components/ue/ue.vue';
	import api from '@/api/axiosApi'
	import apiList from '@/api/securityApiList'
	export default {
		data() {
			return {
				programRelease: {},
				defaultMsg: '',
				config: {
					initialFrameWidth: null,
					initialFrameHeight: 350
				},
				ue1: "ue1", // 不同编辑器必须不同的id
			}
		},
		components: {
			UE
		},
		methods: {
			init(){
				this.getProgram();
			},
			getUEContent() { //获取富文本框内容
				let content = this.$refs.ue.getUEContent(); // 调用子组件方法
				console.log(content)
			},
			getUEContentTxt() { //获取富文本框纯文本内容
				let content = this.$refs.ue.getUEContentTxt(); // 调用子组件方法
				console.log(content)
			},
			getProgram() {
				api(apiList.viewProgram,{
					id:this.$route.params.id
				}).then((res) => {
					if(res.status == 200) {
						this.programRelease = res.data.data;
					}
				}, (err) => {
					//do something...
				})
			},
			downLoad(fileUrl,fileName){//下载
				let roots = process.env.API_ROOT;
				let urlDownload = roots+"/api/file/file/download?url=" + fileUrl + "&filename=" + fileName;
				window.open(urlDownload);
			},
			goback(){
				this.$router.go(-1)
			}
		},
		created() {
			this.$nextTick(()=>{
				this.init();
			})
		}
	}
</script>

<style type="text/css" scoped>
	.w168 {
		width: 168px;
	}
	.contentHtml{
		background-color: #f3f3f3;
		opacity: 1;
		cursor: not-allowed;
		color: #ccc;
		display: inline-block;
		width: 100%;
		min-height: 32px;
		height:auto;
		line-height: 1.5;
		padding: 4px 7px;
		font-size: 12px;
		border: 1px solid #e4e5e7;
		border-radius: 4px;
		position: relative;
		cursor: text;
		transition: border .2s ease-in-out,background .2s ease-in-out,box-shadow .2s ease-in-out;
	}
</style>