<template>
	<Card :bordered="false">
		<!--<p slot="title">修改服务器</p>-->
		<div style="text-align:center">
			<Form ref="evalData" :model="evalData" :rules="ruleValidate" :label-width="90" class="clearfix">
				<Row :gutter="40">
					<Col span="11">
						<FormItem label="服务器ID" prop="serverId">
							<Input v-model="evalData.serverId" disabled></Input>
						</FormItem>
					</Col>
					<Col span="11">
						<FormItem label="服务器IP" prop="ip">
							<Input v-model="evalData.ip" disabled></Input>
						</FormItem>
					</Col>
					<Col span="11">
						<FormItem label="CPU核数" prop="cpuCount">
							<Select clearable v-model="evalData.cpuCount">
								<Option value='2'>2核</Option>
								<Option value='4'>4核</Option>
								<Option value='8'>8核</Option>
								<Option value='16'>16核</Option>
							</Select>
						</FormItem>
					</Col>
					<Col span="11">
						<FormItem label="内存大小" prop="memorySize">
							<Select clearable v-model="evalData.memorySize">
								<Option value='2'>2GB</Option>
								<Option value='4'>4GB</Option>
								<Option value='8'>8GB</Option>
								<Option value='16'>16GB</Option>
								<Option value='32'>32GB</Option>
								<Option value='64'>64GB</Option>
							</Select>
						</FormItem>
					</Col>
					<Col span="11">
						<FormItem label="操作系统" prop="system">
							<Cascader :data="systemArray" v-model="systemVal" @on-change="handleChange" trigger="hover"></Cascader>
						</FormItem>
					</Col>
					<Col span="11">
						<FormItem label="所属网络" prop="netScope">
							<!--<Cascader :data="netScopeArray" v-model="netScopeVal" @on-change="netScopeChange" trigger="hover"></Cascader>-->
							<Select clearable id="netscopeId" v-model="evalData.netScope">
								<Option v-for="netsItem in netScopeArray" :key="netsItem.id" :value="netsItem.code">{{netsItem.name}}</Option>
							</Select>
						</FormItem>
					</Col>
					<Col span="11">
						<FormItem label="网络带宽" prop="netWide">
							<Select clearable v-model="evalData.netWide">
								<Option v-for="item in netWideData" :value="item.name" :key="item.name">{{item.name}}M</Option>
							</Select>
						</FormItem>
					</Col>
					<Col span="11">
						<FormItem label="管理单位" prop="orgid">
							<Select clearable v-model="evalData.orgid" disabled>
								<Option v-for="orgIetm in orgArray" :key="orgIetm.id" :value="orgIetm.id">{{orgIetm.name}}</Option>
							</Select>
						</FormItem>
					</Col>
					<Col span="11">
						<FormItem v-for="(item, index) in evalData.dtos" :key="index" :label="item.diskName" :prop="'dtos.' + index + '.diskSize'" :rules="[{required: true, message: '磁盘 ' + item.diskName +' 不能为空', trigger: 'blur'},{ type: 'number', message: '请输入数字格式', trigger: 'blur', transform(value) {return Number(value);}}]">
							<Row>
								<Col span="15">
									<Input type="text" v-model:number="item.diskSize" placeholder="输入磁盘容量" :disabled="(item.diskType=='2') ? true : false"></Input>
								</Col>
								<Col span="2">GB</Col>
								<Col span="4" offset="1">
									<Button v-if="(item.diskType=='2') ? false : true" type="ghost" @click="handleRemove(item.id,index)">删除</Button>
								</Col>
							</Row>
						</FormItem>
						<FormItem>
							<Row>
								<Col span="24">
									<Button type="dashed" long @click="handleAdd" icon="plus-round">添加</Button>
								</Col>
							</Row>
						</FormItem>
					</Col>
				</Row>
			</Form>
		</div>
	</Card>
</template>

<script>
	import api from '@/api/axiosApi'
	import softhardApiList from '@/api/softhardApiList'
	const positiveInteger = (rule, value, callback) => {
		if(value == undefined) {
			callback(new Error('该项为必填项，请填写相应数据!'));
			return false;
		};
		value = value.replace(/(^\s*)|(\s*$)/g, "");
		if(value == "") {
			callback(new Error('该项为必填项，请填写相应数据!'));
		} else {
			let regu = /^[1-9]\d*$/;
			if(!regu.test(value)) {
				callback(new Error('请填写大于等于0的数!'));
			} else {
				callback();
			}
		}
	};
	export default {
		props: ['detailDate'],
		data() {
			return {
				index: 1,
				orgArray: [], //管理单位列表
				systemArray: this.$store.state.systemArray, //操作系统列表
				netScopeArray: this.$store.state.netScopeArray, //所属网络列表
				netWideData:this.$store.state.netWideData,//网络带宽
				orgPointer: null, //单位指针
				mgrId: "",
				deleteIds: [], //磁盘删除id集合 
				savesDtos: [], //新增磁盘集合 
				systemVal: [],//操作系统默认值
				netScopeVal: [],//所属网络默认值
				sysVal: "",
				netsVal: "",
				evalData: {
					"cpuCount": null,
					"dtos": [{
						"id": "",
						"diskId": "",
						"diskName": "1",
						"diskPath": "",
						"diskSize": "",
						"diskType": "",
					}],
					"id": null,
					"ip": "",
					"memorySize": null,
					"netScope": "",
					"netWide": "",
					"serverId": "",
					"system": "",
					"orgid": "",
					"orgname": ""
				},
				ruleValidate: {
					serverId: [{
						required: true,
						message: '该项为必填项，请填写相应数据！',
						trigger: 'blur'
					}],
					ip: [{
						required: true,
						message: '该项为必填项，请填写相应数据！',
						trigger: 'blur'
					}],
					cpuCount: [{
						required: true,
						validator: positiveInteger,
						trigger: 'change'
					}],
					memorySize: [{
						required: true,
						validator: positiveInteger,
						trigger: 'change'
					}],
					system: [{
						required: true,
						message: '该项为必填项，请填写相应数据！',
						trigger: 'change'
					}],
					netScope: [{
						required: true,
						message: '该项为必填项，请填写相应数据！',
						trigger: 'change'
					}],
					netWide: [{
						required: true,
						message: '该项为必填项，请填写相应数据！',
						trigger: 'change'
					}],
					orgid: [{
						required: true,
						message: '该项为必填项，请填写相应数据！',
						trigger: 'change'
					}],
				},
			}
		},
		mounted() {
			this.czxtFindByCode(); //获取操作系统列表
			this.sswlFindByCode(); //获取所属网络列表
			this.findOrgByUser(); //获取单位列表
		},
		methods: {
			czxtFindByCode() { //获取操作系统列表
				let _this = this;
				api(softhardApiList.findDictionaryTree, {
					code: "ZDWH_czxt"
				}).then((res) => {
					if(res.status == 200 && res.data.data) {
						let systemList = res.data.data;
						_this.systemArray=_this.builderTree(systemList);
					}
				}, (err) => {
					//dong something...
				})
			},
			sswlFindByCode() { //获取所属网络列表
				let _this = this;
				api(softhardApiList.dictionaryFindByCode, {
					code: "ZDWH_sswl"
				}).then((res) => {
					if(res.status == 200 && res.data.data) {
						_this.netScopeArray=res.data.data;
					}
				}, (err) => {
					//dong something...
				})
			},
			findOrgByUser() { //获取单位列表
				api(softhardApiList.orgFindOrgByUser).then((res) => {
					if(res.status == 200 && res.data.data) {
						this.orgArray = res.data.data;
					}
				}, (err) => {
					//dong something...
				})
			},
			getDetail() { //获取详情信息数据
				if(!this.detailDate.id || this.detailDate.id==""){
					return false;
				};
				this.mgrId = this.detailDate.id;
				this.index = this.detailDate.dtos.length;
				this.evalData = this.detailDate;
				if(this.evalData.memorySize) {
					this.evalData.memorySize = (this.evalData.memorySize).toString();
				};
				if(this.evalData.cpuCount) {
					this.evalData.cpuCount = (this.evalData.cpuCount).toString();
				};
				if(!this.sysVal){
					this.sysVal=this.evalData.system;
				};
				this.systemVal=this.systemLoopTree(this.systemArray);
				if(this.systemVal){
					let sysData = this.systemVal;
					let sysLength = sysData.length-1;
					this.evalData.system=sysData[sysLength];
				};
				if(this.netScopeArray.length>0){
					for(let i in this.netScopeArray){
						if(this.netScopeArray[i].name==this.detailDate.netScope){
							this.evalData.netScope=this.netScopeArray[i].code;
						}
					}
				}
			},
			handleSubmit(name) {
				let _this = this;
				this.$refs[name].validate((valid) => {
					if(valid) {
						if(!_this.mgrId) {
							let date = new Date();
							_this.evalData.openTime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
							_this.$emit('examine', _this.evalData);
						} else {
							let updatesArray = [];
							for(let i in _this.evalData.dtos) {
								if(_this.evalData.dtos[i].id) {
									updatesArray.push(_this.evalData.dtos[i]);
								}
							};
							let editData = {
								"cpuCount": _this.evalData.cpuCount,
								"updates": updatesArray,
								"id": _this.evalData.id,
								"ip": _this.evalData.ip,
								"memorySize": _this.evalData.memorySize,
								"netScope": _this.evalData.netScope,
								"netWide": _this.evalData.netWide,
								"serverId": _this.evalData.serverId,
								"system": _this.evalData.system,
								"orgid": _this.evalData.orgid,
								"orgname": _this.evalData.orgname,
								"saves": _this.savesDtos,
								"deleteIds": _this.deleteIds
							};
							_this.$emit('examine', editData);
						};
					}
				})
			},
			handleAdd() { //新增磁盘
				this.index++;
				let dtosItem = {
					"diskId": "",
					"diskName": "数据磁盘"+(this.index-1).toString(),
					"diskPath": "",
					"diskSize": "",
					"diskType": "",
				};
				if(this.mgrId) {
					this.savesDtos.push(dtosItem);
				};
				this.evalData.dtos.push(dtosItem);
			},
			handleRemove(id, index) { //删除磁盘
				// this.evalData.items[index].status = 0;
				if(id) {
					this.deleteIds.push(id);
				};
				this.evalData.dtos.splice(index, 1);
			},
			reloadPage() {
				this.index = 1;
				this.systemVal = [];
				this.netScopeVal = [];
				this.sysVal = "";
				this.netsVal = "";
				this.evalData = {
					"cpuCount": null,
					"dtos": [{
						"id": "",
						"diskId": "",
						"diskName": "1",
						"diskPath": "",
						"diskSize": "",
						"diskType": "",
					}],
					"id": null,
					"ip": "",
					"memorySize": null,
					"netScope": "",
					"netWide": "",
					"serverId": "",
					"system": "",
					"orgid": "",
					"orgname": ""
				};
				this.$refs.evalData.resetFields();
				this.evalData.dtos = [{
					"id": "",
					"diskId": "",
					"diskName": "1",
					"diskPath": "",
					"diskSize": "",
					"diskType": "",
				}];
			},
			handleChange(value, selecteddata) {
				let val = selecteddata.map(o => o.value).reverse();
				this.systemVal = selecteddata.map(o => o.value);
				this.detailDate.system = val[0];
				this.evalData.system = val[0];
				let sysValName = selecteddata.map(o => o.label).reverse();
				this.sysVal = sysValName[0];
			},
			builderTree(r) {
				let _this = this;
				if(!r || r.length == 0) {
					return;
				};
				let itemArray = [];
				r.forEach(function(value, index) {
					let isChildOrg = true;
					if(!value.dtos || value.dtos.length == 0) {
						isChildOrg = false;
						value.children = [];
					};
					if(isChildOrg) {
						value.children = _this.builderTree(value.dtos);
					};
					let itemRow = {
						value: value.code,
						label: value.name,
						children: value.children,
					};
					itemArray.push(itemRow);
					return;
				});
				return itemArray;
			},
			systemLoopTree(r) {
				let _this = this;
				let istrue = [];
				if(!r || r.length == 0) {
					return [];
				};
				let systemRow = [];
				r.forEach(function(value, index) {
					let isChildOrg = true;
					if(!value.children || value.children.length == 0){
						isChildOrg = false;
					};
					if(isChildOrg){
						istrue = _this.systemLoopTree(value.children);
					};
					if(value.label==_this.sysVal){
						systemRow.push(value.value);
					};
					if(istrue.length>0){
						systemRow.push(value.value);
						for(let j in istrue){
							systemRow.push(istrue[j]);
						}
					}
					return [];
				});
				return systemRow;
			},
			netScopeLoopTree(r) {
				let _this = this;
				let istrue = [];
				if(!r || r.length == 0) {
					return [];
				};
				let netScopeRow = [];
				r.forEach(function(value, index) {
					let isChildOrg = true;
					if(!value.children || value.children.length == 0){
						isChildOrg = false;
					};
					if(isChildOrg){
						istrue = _this.netScopeLoopTree(value.children);
					};
					if(value.label==_this.netsVal){
						netScopeRow.push(value.value);
					};
					if(istrue.length>0){
						netScopeRow.push(value.value);
						for(let j in istrue){
							netScopeRow.push(istrue[j]);
						}
					}
					return [];
				});
				return netScopeRow;
			}
		},
		watch: {
			'evalData.orgid': function(val) {
				if(val) {
					for(let i in this.orgArray) {
						if(val == this.orgArray[i].id) {
							this.evalData.orgname = this.orgArray[i].name;
						};
					}
				}
			},
			detailDate: {　　　　
				handler(newValue, oldValue) {
					this.getDetail();　　
				},
				deep: true　　
			},
		},
	}
</script>