<template>
	<div>
		<Modal @on-visible-change="openModal" v-model="evalModal" title="处理" width="500" :closable='false' :mask-closable='false'>
			<div style="text-align:center;padding:15px;">
				<Row :gutter="40">
					<Col span="24">
					<RadioGroup v-model="radioChange" @on-change="changeModal(radioChange)">
						<Radio label="同意"></Radio>
						<Radio label="驳回"></Radio>
					</RadioGroup>
					</Col>
				</Row>
			</div>
			<Form ref="modalForm" :model="evalData" :rules="ruleValidate" :label-width="100" class="clearfix">
				<template v-if="changeT">
					<Row :gutter="40">
						<Col span="24">
						<FormItem label="处理意见：" prop="auditOpinion">
							<Input v-model="evalData.auditOpinion" key="dealOpinion" type="textarea" :autosize="{minRows: 2,maxRows: 5}" :maxlength="500" placeholder="限制输入500个字符以内"></Input>
						</FormItem>
						</Col>
						<Col span="13">
						<FormItem label="处理人" prop="dealUserDTO" required>
							<div class="ivu-form-item-content" @click="openTreeModal(false)">
								<div class="ivu-input-wrapper ivu-input-type">
									<i class="ivu-icon ivu-icon-load-c ivu-load-loop ivu-input-icon ivu-input-icon-validate"></i>
									<div class="ivu-input" style="width: 100%;">{{trainerInfo.title}}</div>
								</div>
							</div>
						</FormItem>
						</Col>
						<Col span="24">
						<FormItem label="协助人">
							<div class="ivu-form-item-content" @click="openTreeModal(true)">
								<div class="ivu-input-wrapper ivu-input-type">
									<i class="ivu-icon ivu-icon-load-c ivu-load-loop ivu-input-icon ivu-input-icon-validate"></i>
									<div class="ivu-input" style="width: 100%;">{{assistantNames.join(',')}}</div>
								</div>
							</div>
						</FormItem>
						</Col>
					</Row>
				</template>
				<template v-if="!changeT">
					<Row :gutter="40">
						<Col span="24">
						<FormItem label="驳回理由：" prop="auditOpinion" required>
							<Input
								v-model="evalData.auditOpinion"
								key="auditOpinion"
								type="textarea"
								:autosize="{minRows: 5,maxRows: 8}"
								:maxlength="500"
								placeholder="限制输入500个字符以内"></Input>
						</FormItem>
						</Col>
					</Row>
				</template>
			</Form>
			<div slot="footer">
				<Button class="modalBtn" type="default" @click="closeModal" size="large">取消</Button>
				<Button class="modalBtn" type="primary" @click="handleSubmit" size="large">确定</Button>
			</div>
		</Modal>
		<!-- 选择培训人的树形弹窗 -->
		<personTreeModal ref="getTrainer" :multiple="isAssitantSelect" @on-ok="selectPerson" :id="evalData.id" :dontFilter="isAssitantSelect" />
	</div>
</template>

<script>
	import api from '@/api/axiosApi'
	import operationApiList from '@/api/operationApiList'
	import personTreeModal from '@/view/operation/trainMgr/trainModal/personTreeModal'
	export default {
		data() {
			const vm = this
			return {
				// 当前弹框选择的是处理人还是协助人
				isAssitantSelect: false,
				// 处理人的信息
				trainerInfo: {
					title: '',
					id: ''
				},
				// 协助人名单
				assistantList: [],
				radioChange: '同意',
				changeT: true,
				evalData: {
					id: '',
					status: '3',
					result: '1',
					dealUserDTO: {},
					userNames: [],
					auditOpinion: ''
				},
				ruleValidate: {
					dealUserDTO: [{
						validator: (rule, value, cb) => {
							if(vm.evalData.dealUserDTO.bussId) {
								cb()
							} else {
								cb(new Error('处理人不能为空'))
							}
						}
					}],
					auditOpinion: [{
						validator: (rule, val, cb) => {
							// 驳回
							if (vm.evalData.status == 2 && !vm.evalData.auditOpinion) {
								cb(new Error('驳回意见不能为空'))
								return
							}
							cb()
						}
					}]
				}
			}
		},
		components: {
			personTreeModal
		},
		props: {
			evalModal: {
				type: Boolean,
				default: false
			},
			closeModal: Function,
		},
		computed: {
			assistantNames() {
				const names = []
				this.assistantList.map(item => {
					names.push(item.title)
				})
				return names
			}
		},
		methods: {
			getId(id){//获取id;
				this.evalData.id=id;
			},
			// 打开树形结构，选择人员
			openTreeModal(isAssitantSelect) {
				this.isAssitantSelect = isAssitantSelect
				this.$nextTick(() => {
					this.$refs.getTrainer.open()
				})
			},
			openModal() {
				if(!this.evalModal) {
					this.evalData.status = '3'
					this.$refs.modalForm.resetFields()
					console.log(this.evalData.status)
					// 当前弹框选择的是处理人还是协助人
					this.isAssitantSelect = false
					// 处理人的信息
					this.trainerInfo = {
						title: '',
						id: ''
					}
					// 协助人名单
					this.assistantList = []
					this.radioChange = '同意'
					this.changeT = true
				}
			},
			// 选择人员之后的回调
			selectPerson(list) {
				// 协助人
				if(this.isAssitantSelect) {
					this.assistantList = list;
					const userNames = []
					list.map(item => {
						userNames.push({
							bussId: this.evalData.id,
							personId: item.id,
							personName: item.title,
							type: 'xzr'
						})
					})
					this.evalData.userNames = userNames;
				} else {
					this.trainerInfo = list[0];
					this.evalData.dealUserDTO = {
						bussId: this.evalData.id,
						personId: list[0].id,
						personName: list[0].title,
						type: 'clr'
					}
					this.$refs.modalForm.validateField('dealUserDTO', res => {})
				}
			},
			handleSubmit() {
				this.$refs.modalForm.validate(valid => {
					if(valid) {
						api(operationApiList.updateAudit, this.evalData).then(res => {
							if(res.data.errcode === 0) {
								this.evalData={
									id: '',
									status: '3',
									result: '1',
									dealUserDTO: {},
									userNames: []
								},
								this.closeModal();
								this.evalData = {
									id: '',
									status: '3',
									result: '1',
									dealUserDTO: {},
									userNames: []
								}
							}
						}, error => {
							console.log(error)
						})
					}
				})
			},
			changeModal(radioChange) {
				this.evalData.auditOpinion="";
				(radioChange == '同意') ? this.changeT = true: this.changeT = false;
				this.$refs.modalForm.resetFields()
				if(radioChange == '同意') {
					this.evalData.status = "3";
					this.evalData.result = "1";
				} else {
					this.evalData.status = "2";
					this.evalData.result = "2";
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	.modalBtn {
		margin: 0 20px;
	}
	
	.ivu-form-item /deep/ .ivu-form-item-content {
		height: auto;
	}
	
	.ivu-input-wrapper /deep/ textarea {
		resize: none;
	}
</style>