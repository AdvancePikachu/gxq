<!-- 数据库管理 -->
<template>
	<Layout>
		<Content>
			<Breadcrumb>
				<BreadcrumbItem>{{ title }}</BreadcrumbItem>
			</Breadcrumb>
			<Card>
				<Form ref="formValidate" inline :label-width="110" :model="serverData">
					<FormItem label="数据库实例ID：">
             <Input type="text" v-model="serverData.instanceDi" style="width:140px"></Input>
					</FormItem>
          <FormItem label="业务系统：">
             <Input type="text" v-model="serverData.associatedServiceSystem" style="width:140px"></Input>
					</FormItem>
          <FormItem label="管理员：">
             <Input type="text" v-model="serverData.admin" style="width:140px"></Input>
					</FormItem>
					<FormItem label="数据库类型：">
						<Select class="queryItem" clearable v-model="serverData.type">
							<Option value="1">MYSQL</Option>
							<Option value="2">ORACLE</Option>
							<Option value="3">SQLSERVER</Option>
							<Option value="4">ACCESS</Option>
							<Option value="5">SYBASE</Option>
						</Select>
					</FormItem>
					<FormItem :label-width="20">
						<Button type="primary" @click="search">查询</Button>
						<Button type="primary" v-if="checkButton('hardware_database_management_xz')" @click="addNew">新增</Button>
					</FormItem>
				</Form>
				<hy-table ref="selection" :data="data" :columns="columns" :current="pageOption.current" :total="pageOption.total" :page-size="pageOption.pageSize" @on-change="pageChange" @on-page-size-change="changePageSize" show-sizer show-elevator/>
			</Card>
			<Modal v-model="createModal" title="新增" width="40%" :mask-closable="false">
        <Form ref="createForm" :model="createForm" :rules="createRule" :label-width="100">
          <FormItem label="数据库实例ID" prop="instanceDi">
            <Input type="text" v-model="createForm.instanceDi" :maxlength="60" placeholder="内容长度限制60字符以内"/>
          </FormItem>
          <FormItem label="管理员" prop="admin">
            <Input type="text" v-model="createForm.admin" :maxlength="4" placeholder="内容长度限制4字符以内"/>
          </FormItem>
          <FormItem label="管理员账户" prop="account">
            <Input type="text" v-model="createForm.account" :maxlength="15" placeholder="内容长度限制15字符以内"/>
          </FormItem>
          <FormItem label="数据库类型" :required="true" prop="type">
						<Select class="queryItem" clearable v-model="createForm.type">
							<Option value="1">MYSQL</Option>
							<Option value="2">ORACLE</Option>
							<Option value="3">SQLSERVER</Option>
							<Option value="4">ACCESS</Option>
							<Option value="5">SYBASE</Option>
						</Select>
          </FormItem>
					<FormItem label="主机IP地址" :required="true" prop="hostIpAddress">
						<Input type="text" v-model="createForm.hostIpAddress" :maxlength="15" placeholder="内容长度限制15字符以内"/>
          </FormItem>
					<FormItem label="字符集" :required="true" prop="characterSet">
						<Input type="text" v-model="createForm.characterSet" :maxlength="30" placeholder="内容长度限制30字符以内"/>
          </FormItem>
					<FormItem label="端口" :required="true" prop="port">
						<Input type="text" v-model="createForm.port" Number :maxlength="5" placeholder="内容长度限制5字符以内"/>
          </FormItem>
          <FormItem label="所属网络" :required="true" prop="code">
						<Select clearable v-model="createForm.code" style="width:200px">
							<Option v-for="netsItem in netScopeArray" :key="netsItem.id" :value="netsItem.code">{{netsItem.name}}</Option>
						</Select>
          </FormItem>
					<FormItem label="关联业务系统" :required="true" prop="associatedServiceSystem">
						<Input type="text" v-model="createForm.associatedServiceSystem" :maxlength="25" placeholder="内容长度限制25字符以内"/>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button class="modalBtn" type="primary" @click="saveDatabase" size="large">确定</Button>
          <Button class="modalBtn" type="default" @click="createModal = false" size="large">取消</Button>
        </div>
      </Modal>
		</Content>
	</Layout>
</template>

<script>
	import api from '@/api/axiosApi'
	import softhardApiList from '@/api/softhardApiList'
	import { mapState } from 'vuex'
	function getCreateForm() {
		return {
			instanceDi:'',
			admin:'',
			account:'',
			type:'',
			hostIpAddress:'',
			characterSet:'',
			port:'',
			code:'',
			associatedServiceSystem:'',
		}
	}
	export default {
		data() {
		  const validateSequence = (rule, value, callback) => {
        let regNum = /^.{1,5}$/
        if (value === '') {
          callback(new Error('不能为空'));
        } else if (!Number.isInteger(+value)) {
          callback(new Error('内容应为数字类型'));
        } else if (!regNum.test(value)) {
          callback(new Error('长度限制5字符以内'));
        } else {
          callback()
        }
      }
		  //自定义规则校验邮箱输 入
      const ipAddress = (rule, value, callback) => {
        let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        if (!reg.test(value)) {
          callback(new Error('ip地址不正确！'));
        } else {
          callback();
        }
      };
			return {
				title:this.$store.state.title,
				netScopeArray: this.$store.state.netScopeArray,//所属网络列表
				databaseType:['MYSQL', 'ORACLE', 'SQLSERVER', 'ACCESS', 'SYBASE'],
				modelType:'0',
				serverData: { //查询参数
          instanceDi:"",
          associatedServiceSystem:"",
					admin: "",
					type: "",
				},
				createForm:{
          instanceDi:'',
          admin:'',
          account:'',
          type:'',
					hostIpAddress:'',
					characterSet:'',
					port:'',
					code:'',
					associatedServiceSystem:'',
        },
        createModal:false,
        createRule: {
					instanceDi: [{required: true, message: '不能为空', trigger: 'blur'}],
					admin: [{required: true, message: '不能为空', trigger: 'blur'}],
					account: [{required: true, message: '不能为空', trigger: 'blur'}],
					type: [{required: true, message: '不能为空', trigger: 'blur'}],
					hostIpAddress: [{required: true, validator: ipAddress, trigger: 'blur'}],
					characterSet: [{required: true, message: '不能为空', trigger: 'blur'}],
					port: [{required: true, validator: validateSequence, trigger: 'blur'}],
					code: [{required: true, message: '不能为空', trigger: 'blur'}],
					associatedServiceSystem: [{required: true, message: '不能为空', trigger: 'blur'}],
          // file: [{
          //   required: true,
          //   trigger: 'blur',
          //   validator: (rule, value, cb) => {
					// 		console.log(this.createForm.attachment);
          //     if (this.createForm.attachment.length==0) {
          //       cb(new Error('附件报告不能为空'))
          //       return
          //     }
          //     cb()
          //   }
          // }],
        },
				columns: [{
						type: 'index',
						title: '序号',
						width: 60,
						align: 'center'
					},
					{
						title: '数据库实例ID',
						key: 'instanceDi'
          },
					{
						title: '管理员',
						key: 'admin'
          },
					{
						title: '数据库类型',
						key: 'type',
						render: (h, params) => {
              return h('span', ['MYSQL', 'ORACLE', 'SQLSERVER', 'ACCESS', 'SYBASE'][params.row.type-1])
            }
          },
          {
						title: '主机IP地址',
						key: 'hostIpAddress'
					},
					{
						title: '字符集',
						key: 'characterSet'
					},
					{
						title: '端口',
						key: 'port'
					},
					{
						title: '所属网络',
						key: 'codeName',
						// render: (h, params) => {
            //   return h('span', ['政务外网', '互联网', '内网 '][params.row.ownershipNetwork])
            // }
					},
					{
						title: '关联业务系统',
						key: 'associatedServiceSystem'
					},
					{
						title: '创建时间',
						width: 220,
						align: 'center',
						key: 'createTime'
					},
					{
						title: '操作',
						key: 'act',
						width: 160,
						render: (h, params) => {
							const edit = h('Button', {
								props: {
									type: 'primary',
									size: 'small'
								},
								style: {
									display:this.checkButton('hardware_database_management_xg')?'inline-block':'none'
								},
								on: {
									click: () => {
										console.log(params);
										this.$refs['createForm'].resetFields();
										this.gotoCtrl(1, params.index);
									}
								}
							}, '修改');
							const del = h('Button', {
								props: {
									type: 'primary',
									size: 'small'
								},
								style: {
									display:this.checkButton('hardware_database_management_sf')?'inline-block':'none'
								},
								on: {
									click: () => {
										this.itemDelete(params.row.id,params.index);
									}
								}
							},"释放");
							return h('div', [edit, del]);
						}
					}
				],
				data: [],
				pageOption: { //分页参数
					pageNo: 1,
					total: 0,
					pageSize: 10
				},
				sysVal: "",
			}
		},
		mounted() {
			this.findDatabaseList(); //查询服务分配管理分页
			console.log(this.$store.state);
		},
		methods: {
			handleChange(value, selecteddata) {
				if(selecteddata.length>0){
					let val = selecteddata.map(o => o.value).reverse();
					this.serverData.system = val[0];
				}else{
					this.serverData.system = "";
				}
			},
			pageChange(num) { //页码改变的回调
				this.pageOption.pageNo = num;
				this.findDatabaseList();
			},
			changePageSize(num) { //切换每页条数时的回调
				this.pageOption.pageSize = num;
				this.findDatabaseList();
			},
			findDatabaseList() { // 查询服务分配管理分页
				this.data = [];
				var formData = {
					"data": { ...this.serverData
					}, //Object.assign({}, this.searchCondition),
					"pageNo": this.pageOption.pageNo,
					"pageSize": this.pageOption.pageSize
				};
				api(softhardApiList.findDatabaseList, formData).then((res) => {
					if(res.status == 200 && res.data.data) {
						this.data = res.data.data.list;
						if(this.data.length>0){
							this.pageOption.pageSize = res.data.data.pageSize;
							this.pageOption.total = res.data.data.total;
							this.pageOption.pageNo = res.data.data.pageNum;
							this.data.forEach(item=>{
								this.netScopeArray.forEach(netItem=>{
									if(netItem.code == item.code){
										item.codeName = netItem.name;
									}
								})
								item.createTime = item.createTime.replace("-","年");
								item.createTime = item.createTime.replace("-","月");
								item.createTime = item.createTime.replace(" ","日 ");
							})
							console.log(this.data);
						};
					}
				}, (err) => {
					//dong something...
				})
			},
			saveDatabase(){
				console.log(this.createForm);
				let url = '';
				(this.modelType=='0') ? url = softhardApiList.saveDatabase : url = softhardApiList.updateDatabase;
				this.$refs['createForm'].validate((valid) => {
					if(valid) {
						// this.databaseType.forEach((item,index)=>{
						// 	if(this.createForm.type == item){
						// 		this.createForm.type=index;
						// 	}
						// })
						console.log("进来");
						console.log(this.createForm);
						api(url, this.createForm).then((res) => {
							if(res.status == 200 && res.data.data) {
								if(res.data.data && res.data.errmsg == 'ok'){
									let msg = (this.modelType=='0') ? '保存成功！' : '编辑成功！';
									this.$Message.success(msg);
									this.findDatabaseList();
								}else{
									this.$Message.error(res.data.errmsg);
								}
							}else{
								this.$Message.error(res.data.errmsg);
							}
						});
						this.createModal = false;
					}
				})
      },
			search() {
				this.pageOption.current=1;
				console.log(this.serverData);
				this.findDatabaseList();
			},
			addNew(){
				console.log("新增");
				this.$refs['createForm'].resetFields();
				this.modelType = '0';
        this.createModal = true;
			},
			itemDelete(id,idx) {//释放
        const vm = this
        vm.$Modal.confirm({
          title: '该资源空间中数据将会被清空',
          content: '是否确定删除？',
          onOk: () => {
            api(softhardApiList.releaseDatabase, {id: id}).then(res => {
              if (res.data.errcode === 0) {
                vm.$Message.success('删除成功！')
								vm.modal = false;
								vm.data.splice(idx, 1)
              }else{
								vm.$Message.error(res.data.errmsg)
							}
            }, error => {console.log(error)})
          }
        })
			},
			// 操作
			gotoCtrl (type, idx) {
				this.createForm.attachment = [];
				this.idx = idx;
				// 删除
				if (type === 0) {
					this.tableList.data.splice(idx, 1)
				} else {
				// 修改
					const data = JSON.parse(JSON.stringify(this.data[idx]))
					console.log(data);
					this.createForm = {...getCreateForm(), ...data};
					// this.createForm.date = new Date(data.year.toString());
					this.createForm.type = this.createForm.type.toString();
					this.createForm.id = data.id;
					console.log(this.createForm);
					this.createModal = true;
					this.modelType = '1';
				}
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

<style lang='less' scoped>
	.ivu-btn-small {
		margin: 0 3px;
	}
	.handle{
		color:red;
		cursor: pointer;
	}
	.queryItem {
		width: 200px;
	}
	.access-list {
		span.handle {
			margin: 0 5px;
			display: inline-block;
			cursor: pointer;
			&:hover {
				color: #57a3f3;
			}
		}
	}
</style>
