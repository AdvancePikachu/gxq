<template>
  <Layout>
    <Content>
      <Breadcrumb>
        <!-- <BreadcrumbItem>部门用户</BreadcrumbItem> -->
        <BreadcrumbItem>服务器配置变更</BreadcrumbItem>
      </Breadcrumb>
      <Card>
        <Form ref="formInfo" :model="formInfo" :rules="ruleValidate" :label-width="100">
          <Row>
            <Col span="6">
              <FormItem label="申请单位：">
                <Input type="text" v-model="formInfo.orgname" disabled>
                </Input>
              </FormItem>
            </Col>
            <Col span="6" :offset="1">
              <FormItem label="申请人：">
                <Input v-if="formInfo.manageUname" type="text" v-model="formInfo.manageUname" disabled>
                </Input>
              </FormItem>
            </Col>
            <Col span="6" :offset="1">
              <FormItem label="服务器ID：">
                <Input type="text" v-model="formInfo.serverId" disabled>
                </Input>
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem label="服务器ip：">
                <Input type="text" v-model="formInfo.ip" disabled>
                </Input>
              </FormItem>
            </Col>
            <Col span="12" :offset="1">
              <FormItem label="申请人邮箱：" prop="applyEmail">
                <AutoComplete
                    v-model="formInfo.applyEmail"
                    @on-search="emailHandleSearch"
                    @on-change="emailChange"
                    placeholder="请输入邮箱地址"
                    style="width:200px">
                    <Option v-for="item in emailData" :value="item" :key="item">{{ item }}</Option>
                </AutoComplete>
                <!-- <Input type="text" v-model="formInfo.applyEmail"></Input> -->
              </FormItem>
            </Col>
            <Col span="20">
              <FormItem label="CPU：" prop="cpuCount">
                <RadioGroup v-model="formInfo.cpuCount" type="button" @on-change="cpuCountFun(0)">
                  <Radio label="2">2核</Radio>
                  <Radio label="4">4核</Radio>
                  <Radio label="8">8核</Radio>
                  <Radio label="16">16核</Radio>
                </RadioGroup>
                <span v-if="cpuCountShow" style="color: red;">（变更前：{{cpuCountChange}} 核）</span>
              </FormItem>
            </Col>
            <Col span="20">
              <FormItem label="内存：" prop="memorySize">
                <RadioGroup v-model="formInfo.memorySize" type="button" @on-change="cpuCountFun(1)">
                  <Radio label="2">2GB</Radio>
                  <Radio label="4">4GB</Radio>
                  <Radio label="8">8GB</Radio>
                  <Radio label="16">16GB</Radio>
                  <Radio label="32">32GB</Radio>
                  <Radio label="64">64GB</Radio>
                </RadioGroup>
                <span v-if="memorySizeShow" style="color: red;">（变更前：{{memorySizeChange}} GB）</span>
              </FormItem>
            </Col>
            <Col span="10">
              <FormItem label="操作系统：" prop="system">
                <Cascader v-model="systemVal" :data="systemData" @on-change="handleChange" trigger="hover" disabled></Cascader>
              </FormItem>
            </Col>
            <Col span="10" :offset="1">
              <FormItem label="所属网络：" prop="netScope">
                <Select class="queryItem" clearable v-model="formInfo.netScope" disabled>
                  <Option v-for="netsItem in netScopeArray" :key="netsItem.id" :value="netsItem.code" :label="netsItem.name"></Option>
                </Select>
              </FormItem>
            </Col>
            <Col span="10">
              <FormItem label="网络带宽：" prop="netWide">
                <Select clearable v-model="formInfo.netWide" @on-change="cpuCountFun(2)">
                  <Option v-for="item in netWideData" :value="item.name" :key="item.name">{{item.name}}M</Option>
                </Select>
                <span v-if="netWideShow" style="color: red;">（变更前：{{netWideChange}} M）</span>
              </FormItem>
            </Col>
            <Col span="18">
              <FormItem label="网关描述：" prop="gatewayDesc">
                <Input type="textarea" v-model="formInfo.gatewayDesc" :maxlength="200" placeholder="限制输入200个字符以内" :rows="5">
                </Input>
              </FormItem>
            </Col>
            <Col span="10">
              <FormItem label="系统盘大小" prop="sysDisksize">
                <!-- <Input type="text" v-model="formInfo.sysDisksize" disabled><span slot="append">GB</span></Input> -->
                <Input type="text" v-model="disks[0].diskSize" disabled><span slot="append">GB</span></Input>
              </FormItem>
            </Col>
            <Col span="10" :offset="1">
              <FormItem label="申请数量：" prop="applyCount">
                <InputNumber v-model="formInfo.applyCount" :editable="false" :min='1'></InputNumber>
              </FormItem>
            </Col>
            <Col span="10">
              <FormItem label="数据盘：">
                <Button type="primary" @click="addDisk(disks.length)">+添加</Button>
              </FormItem>
            </Col>
            <Col span="15">
              <FormItem v-if="idx!=0" class="disk" v-for="(item, idx) in disks" :key="idx" v-model="item.diskName" :label="item.diskName || `数据磁盘${idx}`" :label-width="100" :prop="'disks.' + idx + '.diskSize'" :rules="[{required: true, message: '磁盘 ' + item.diskName +' 不能为空', trigger: 'blur'},{ type: 'number', message: '请输入数字格式', trigger: 'blur', transform(value) {return Number(value);}}]">
                  <Input style="width:80%;" type="text" v-model:number="item.diskSize" :disabled="item.diskName !== ''"><span slot="append">GB</span></Input>
                  <a @click="handleRemove(idx)">删除</a>
              </FormItem>
            </Col>
            <!-- <Col span="18">
              <FormItem label="数据盘：">
                <Button style="float: right;" type="primary" @click="addDisk(disks.length)">+添加</Button>
                <div class="disk" v-for="(item, idx) in disks" :key="idx">
                  <FormItem :label="item.diskName || `数据磁盘${idx+1}：`" :label-width="100" :prop="'item.' + idx + '磁盘'" :rules="[{required: true, message: '磁盘 ' + item.diskName +' 不能为空', trigger: 'blur'},{ type: 'number', message: '请输入数字格式', trigger: 'blur', transform(value) {return Number(value);}}]">
                    <Col span="12">
                      <Input type="text" v-model="item.diskSize"><span slot="append">GB</span></Input>
                    </Col>
                    <Col span="4" offset="1">
                      <a @click="handleRemove(idx)">删除</a>
                    </Col>
                  </FormItem>
                </div>
              </FormItem>
            </Col> -->
            <Col span="18">
              <FormItem label="申请原因：" prop="applyReason">
                <Input type="textarea" style="width: 400px;" v-model="formInfo.applyReason">
                </Input>
              </FormItem>
            </Col>
            <Col span="18">
              <FormItem label="附件说明：" style="margin-top: 40px;">
                <hy-upload ref="evalReport" multiple :on-success="setEvalReport" :format="['xls','xlsx','doc', 'docx','pdf']" :on-remove="removeEvalReport" :before-upload="evalBeforeUpload"></hy-upload>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <!-- <server-config v-if="flag" ref="serverConfig" :formInfo="formInfo" :disks="formInfo.disks" :hidecode="hidecode" /> -->
        <Row class="bottom-bar" style="text-align: center">
          <Col>
            <Button type="default" @click="quit">取消</Button>
            <Button type="primary" @click="submit(1)">保存</Button>
            <Button type="primary" @click="submit(2)">提交</Button>
          </Col>
        </Row>
      </Card>
    </Content>
  </Layout>
</template>

<script>
// 服务器配置表单
import serverConfig from './../common/serverConfig'
import api from '@/api/axiosApi'
import softhardApiList from '@/api/softhardApiList'
import hyUpload from '@/components/hengyun/hyUpload'
const hidecode = ['操作系统', '网关描述', '申请数量'];
const validateCount = (rule, value, callback) => {
    console.log(value);
    if (!value) {
        return callback(new Error('该项为必填项，请填写相应数据'));
    }
    // 模拟异步验证效果
    setTimeout(() => {
        if (!Number.isInteger(parseInt(value))) {
            callback(new Error('请填写数字！'));
        } else {
            if (parseInt(value) <= 0) {
                callback(new Error('不能为负数!'));
            } else {
                callback();
            }
        }
    }, 1000);
};
const validateEmail = (rule, value, callback) => {
    let regEmail= /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if (!value) {
        return callback(new Error('邮箱不能为空！'));
    }else if (!regEmail.test(value)) {
      callback(new Error('邮箱格式不正确'));
    }else{
      callback();
    }
};
function getConfigInfo() {
  return {
    cpuCountShow: false,
    memorySizeShow: false,
    netWideShow: false,
    netWideChange: '',
    memorySizeChange: '',
    cpuCountChange: '',
    cpuCount:'',
    memorySize:'',
    system:'',
    netScope:'',
    netWide:'',
    content:'',
    sysDisksize:0,
    applyCount: 1,
    disks: [
      {
        createTime:"",
        diskId:"",
        diskName:"",
        diskPath:"",
        diskSize:"",
        diskType:"",
        id:"",
        serverId:"",
      }
    ],
  }
}
export default {
  components: {
    serverConfig,
    hyUpload
  },
  data () {
    return {
      systemData:this.$store.state.systemArray,//操作系统
      netScopeArray:this.$store.state.netScopeArray,//所属网络
      systemVal: [],//操作系统默认值
      netScopeVal: [],//所属网络默认值
      sysVal: "",
      netWideData:this.$store.state.netWideData,//网络带宽
      hidecode,
      flag:false,
      emailData:[],//邮箱自动列表
      disks: [
        {
          createTime:"",
          diskId:"",
          diskName:"",
          diskPath:"",
          diskSize:"",
          diskType:"",
          id:"",
          serverId:"",
        }
      ],
      formInfo:{
        orgname:'',
        manageUname:'',
        serverId:'',
        ip:'',
        applyEmail:'',
        cpuCount:'',
        memorySize:'',
        system:'',
        netScope:'',
        netWide:'',
        gatewayDesc:'',
        sysDisksize:0,
        applyCount: 1,
        applyReason:'',
        disks: [],
      },
      ruleValidate: {
        applyEmail: [{
          required: true,
          validator:validateEmail,
          trigger: 'change',
        },
        {validator: (rule, value, cb) => {
          if (this.formInfo.applyEmail.length > 26) {
            cb(new Error('限制26个字符以内'))
            return
          }
          cb()
        }}],
        cpuCount: [{
          required: true,
          message: '该项为必填项，请填写相应数据！',
          trigger: 'change'
        }],
        memorySize: [{
          required: true,
          message: '该项为必填项，请填写相应数据！',
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
        gatewayDesc: [{
          required: true,
          message: '该项为必填项，请填写相应数据！',
          trigger: 'change'
        }],
        // sysDisksize: [{
        //   required: true,
        //   validator:validateCount,
        //   trigger: 'blur'
        // }],
        // applyCount: [{
        //   validator:validateCount,
        //   trigger: 'blur'
        // }],
        applyReason: [{
          required: true,
          message: '该项为必填项，请填写相应数据！',
          trigger: 'change'
        }],
      },
    }
  },
  mounted(){
    this.servermanagerDetail();
  },
  methods: {
    cpuCountFun (type) {
      switch (type) {
        case 0:
        this.cpuCountShow = true
        break
        case 1:
        this.memorySizeShow = true
        break
        case 2:
        this.netWideShow = true
        break
      }
    },
    servermanagerDetail() {//获取更多详情}
      this.$refs.formInfo.resetFields()
      let serverId = this.$route.params.departData.id;
      api(softhardApiList.servermanagerDetail, {
        serverId: serverId
      }).then((res) => {
          console.log(res);
          // res.data.data.dtos.forEach(item => {
          //   item.diskName = '数据磁盘' + (item.order+1)
          // })
          this.systemData.forEach(item => {
            item.children.forEach(items => {
              if(res.data.data.system == items.label){
                this.systemVal[0] = item.value;
                this.systemVal[1] = items.value;
              }
            })
          });
          this.$set(this.systemVal);//更新
          if(res.data.data.netScope == '-')res.data.data.netScope='';
          this.formInfo = {...res.data.data, ...this.$route.params.departData};
          this.formInfo.disks = res.data.data.dtos;
          this.disks = res.data.data.dtos;
          this.netWideChange = res.data.data.netWide
          this.cpuCountChange = res.data.data.cpuCount
          this.memorySizeChange = res.data.data.memorySize
          console.log(this.disks);
          this.formInfo.cpuCount = this.formInfo.cpuCount.toString();
          this.netScopeArray.forEach(item =>{
            if(item.name == this.formInfo.netScope){
              this.formInfo.netScope = item.code
            }
          })
          this.formInfo.memorySize = this.formInfo.memorySize.toString();
          // this.formInfo.netWide = this.formInfo.netWide + 'M';
          this.flag = true
          console.log(this.formInfo);
      }, (err) => {
        //dong something...
      })
    },
    // getApplyServerById() { // 根据id查询申请服务器资源
    //   api(softhardApiList.getApplyServerById,{id:this.$route.params.departData.serverId}).then((res) => {
    //     if(res.data.errcode == 0){
    //       console.log(res);
    //       res.data.data.disks.forEach(item => {
    //         item.diskName = '数据磁盘' + (item.order+1)
    //       })
    //       this.formInfo = res.data.data;
    //       this.formInfo.cpuCount = this.formInfo.cpuCount.toString();
    //       this.formInfo.memorySize = this.formInfo.memorySize.toString();
    //       this.formInfo.netScope = parseFloat(this.formInfo.netScope);
    //       this.formInfo.netWide = parseFloat(this.formInfo.netWide);
    //       console.log(this.formInfo);
    //     }else{
    //       this.$Message.error(res.data.errmsg);
    //     }
    //   }, (err) => {
    //     //dong something...
    //   })
    // },
    validForm() {
      this.$refs['formInfo'].validate();
    },
    emailHandleSearch(value) {
        this.emailData = !value || value.indexOf('@') >= 0 ? [] : [
            value + '@qq.com',
            value + '@sina.com',
            value + '@163.com',
            value + '@126.com',
            value + '@139.com'
        ];
    },
    evalBeforeUpload() { //文件上传前清空
      // this.$refs.evalReport.$children[0].clearFiles();
    },
    setEvalReport(response, file, fileList) {
      console.log(response)
      if(this.$route.params.id != 3){
        this.formInfo.attachment = [];
      }
      console.log(fileList);
      fileList.forEach(item => {
        let obj = {};
        if(item.response){
          obj.busType = 'hd_applymanage_upload';
          obj.fileName = item.response.data.list[0].submittedFileName;
          obj.fileSize = item.response.data.list[0].size;
          obj.fileType = item.response.data.list[0].mime;
          obj.fileUrl = item.response.data.list[0].url;
          obj.name = item.response.data.list[0].submittedFileName;
          obj.url = item.response.data.list[0].url;
          this.formInfo.attachment.push(obj);
        }
      });
      console.log(this.formInfo);
      this.validForm();
    },
    removeEvalReport(file, fileList) {
      if(fileList.length) {
        this.evalFormData.evalReport = 'ok';
      } else {
        this.evalFormData.evalReport = '';
      }
      this.validForm();
    },
    submit(type){//保存申请服务器
      // let data = {};
      // data = this.dataM(this.formInfo,type);
      console.log(this.formInfo);
      this.$refs['formInfo'].validate((valid) => {
          if (valid) {
              let data = {};
              data = this.dataM(this.formInfo,type);
              console.log(data);
              api(softhardApiList.saveMyApply,data).then((res) => {
                if(res.data.errcode == 0) {
                  this.$router.go(-1);//返回上一页
                }else{
                  this.$Message.error(res.data.errmsg);
                }
              }, (error) => {})
          } else {
              this.$Message.error('数据不满足，请检查！');
          }
      })
    },
    dataM(formInfo,type){//保存的数据整理
      let data = {};
      data.applyEmail = formInfo.applyEmail;//申请人邮箱
      data.applyOrgid = formInfo.orgid;//申请单位id
      data.applyOrgname = formInfo.orgname;//申请单位名称
      data.applyReason = formInfo.applyReason;//申请原因
      data.serverKeyid = formInfo.id;//服务器变更id
      data.applyServer = [];
      data.applyServer.push(this.formInfo);//服务器申请
      data.applyType = 2;//申请类型(1新增2变更)
      data.attachment = formInfo.attachment;//附件集合
      data.id = formInfo.id;//主键
      data.type = type;//提交类型：1仅保存，2提交
      data.applyServer.forEach(item => {
        console.log(item);
        item.cpuCount = parseFloat(item.cpuCount);
        item.memorySize = parseFloat(item.memorySize);
        item.netScope = item.netScope.toString();
        // item.netWide = parseInt(item.netWide);
        this.systemData.forEach(systemDataItem => {//操作系统转换
          systemDataItem.children.forEach(systemDataItemtems => {
            if(item.system == systemDataItemtems.label){
              item.system = systemDataItemtems.value;
            }
          })
        });
      })
      return data;
    },
    // 取消
    quit () {
      this.$router.go(-1)
    },
    // 弹框需要调用的方法
    addDisk (len) {
      let diskItem = {diskSize:'', diskName:''};
      this.disks.push(diskItem);
    },
    handleRemove (idx) {//删除磁盘列表
      this.disks.splice(idx,1);
    },
    handleChange(value, selecteddata) {//操作系统赋值
      let val = selecteddata.map(o => o.value).reverse();
      this.systemVal = selecteddata.map(o => o.value);
      this.formInfo.system = val[0];
      let sysValName = selecteddata.map(o => o.label).reverse();
      this.sysVal = sysValName[0];
    },
    emailChange (val) {
      if (val.length > 26) {
        this.formInfo.applyEmail = ''
        this.$Message.error('限制26个字符以内')
      }
    }
  },
}
</script>
<style lang="less" scoped>
.disk{
  position: relative;
  a{
    position: absolute;
    top:0;
    right:10px;
  }
}
</style>

