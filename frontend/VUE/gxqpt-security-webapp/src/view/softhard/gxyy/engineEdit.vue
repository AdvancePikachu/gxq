<template>
	<div id="examine">
		<Form ref="engine" :model="engineData" :rules="ruleValidate" :label-width="100">
			<Row>
				<Col span="12">
				<FormItem label="主机IP：" prop="ip">
					<Input type="text" v-model="engineData.ip" :maxlength="30" placeholder="限制输入30个字符以内"> </Input>
				</FormItem>
				</Col>
				<Col span="12">
				<FormItem label="所属集群：" prop="cluster">
					<Input type="text" v-model="engineData.cluster" :maxlength="30" placeholder="限制输入30个字符以内"> </Input>
				</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="12">
				<FormItem label="型号：">
					<Input type="text" v-model="engineData.model" :maxlength="30" placeholder="限制输入30个字符以内"> </Input>
				</FormItem>
				</Col>
				<Col span="12">
				<FormItem label="处理器类型：">
					<Input type="text" v-model="engineData.cpuType" :maxlength="30" placeholder="限制输入30个字符以内"> </Input>
				</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="12">
				<FormItem label="处理器数量：" prop="cpuCount">
					<Input type="text" v-model="engineData.cpuCount">
					  <span slot="append">核</span>
					</Input>
				</FormItem>
				</Col>
				<Col span="12">
				<FormItem label="内存大小：" prop="memory">
					<Input type="text" v-model="engineData.memory">
					  <span slot="append">G</span>
					</Input>
				</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="12">
				<FormItem label="网卡数量：" prop="netcardCount">
					<Input type="text" v-model="engineData.netcardCount">
					  <span slot="append">个</span>
					</Input>
				</FormItem>
				</Col>
				<Col span="12">
				<FormItem label="磁盘大小：" prop="diskSize">
					<Input type="text" v-model="engineData.diskSize">
					  <span slot="append">G</span>
					</Input>
				</FormItem>
				</Col>
			</Row>
		</Form>
	</div>
</template>

<script>
	import api from '@/api/axiosApi'
	import softhardApiList from '@/api/softhardApiList'
	export default {
		data() {
			const positiveInteger= (rule, value, callback) => {
				if(value == undefined){
					callback(new Error('该项为必填项，请填写相应数据!'));
					return false;
				};
				console.log(rule);
				console.log(value);
				value = value.toString();
				value = value.replace(/(^\s*)|(\s*$)/g, "");
				if(value==""){
					callback(new Error('该项为必填项，请填写相应数据!'));
				}else{
					var regu = /^\d+$/;
					if (!regu.test(value) || value > 999999) {
					    callback(new Error('请输入不大于999999正整数!'));
					} else {
					    callback();
					}
				}
      };
      const ruleValidateIp = (rule, value, callback) => {
        let reg=/^(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))$/;
        if (!reg.test(value)) {
            callback(new Error('请输入正确的ip地址!'));
        } else {
            callback();
        }                             
      }
			return {
				engineData: {},
				ruleValidate: {
					ip: [{
						required: true,
						message: '该项为必填项，请填写相应数据！',
						trigger: 'blur'
					}, {
					  validator: ruleValidateIp,
            trigger: 'blur'
					}],
					cluster: [{
						required: true,
						message: '该项为必填项，请填写相应数据！',
						trigger: 'blur'
					}],
					cpuCount: [{
						required: true,
						validator: positiveInteger,
						trigger: 'blur'
					}],
					memory: [{
						required: true,
						validator: positiveInteger,
						trigger: 'blur'
					}],
					netcardCount: [{
						required: true,
						validator: positiveInteger,
						trigger: 'blur'
					}],
					diskSize: [{
						required: true,
						validator: positiveInteger,
						trigger: 'blur'
					}],
				},
			}
		},
		methods: {
			handleSubmit(name) {
				this.$refs[name].validate((valid) => {
					if(valid) {
						this.$emit('examine', this.engineData);
					}
				})
			},
			getMachineDetail(id) {
				api(softhardApiList.getMachineDetail, {id:id}).then((res) => {
					if(res.status == 200 && res.data.data) {
						this.engineData = res.data.data;
						this.engineData.diskSize = Number(res.data.data.diskSize);
					}
				}, (err) => {
					//dong something...
				})
			},
			reload() {
				this.engineData = {};
				this.$refs.engine.resetFields();
			},
		},
	}
</script>

<style>

</style>