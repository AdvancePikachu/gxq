<template>
  <Layout>
    <Content>
      <Breadcrumb>
        <BreadcrumbItem>培训管理</BreadcrumbItem>
        <BreadcrumbItem>培训课程目录</BreadcrumbItem>
      </Breadcrumb>
      <Card>
        <Form
          ref="formValidate"
          inline
          :label-width="100"
          :model="searchCondition">
            <FormItem label="培训类别">
              <Select v-model="currentTypeIdx" style="width:200px">
                <Option :value="''">全部</Option>
                <Option :value="i" v-for="(item, i) in typeList" :key="i">{{item.type}}</Option>
              </Select>
            </FormItem>
            <FormItem label="培训名称">
              <Select v-model="searchCondition.name" style="width:200px">
                <Option value="">全部</Option>
                <Option :value="item" v-for="item in names" :key="item">{{item}}</Option>
              </Select>
            </FormItem>
            <FormItem label="培训内容：">
              <Input
                type="text"
                v-model="searchCondition.context"
                :maxlength="1000">
              </Input>
            </FormItem>
          <FormItem>
            <Button type="primary" @click="preSearch" v-if="authButton.includes('ops_train_curriculum_query')">查询</Button>
          </FormItem>
        </Form>
        <Row style="margin-bottom: 15px;">
          <Button type="primary" size="large"
            @click="exportAllData"
            v-if="authButton.includes('ops_train_exporting_all_data')">
            <Icon type="ios-download-outline"></Icon> 导出全部数据</Button>
          <Button type="primary" size="large"
            @click="exportPageData"
            v-if="authButton.includes('ops_train_export_page_data')">
            <Icon type="ios-download-outline"></Icon> 导出本页数据</Button>
          <Button type="primary" size="large" @click="exportCustomData"
            v-if="authButton.includes('ops_train_custom_export')">
            <Icon type="ios-download-outline"></Icon>
            自定义导出</Button>
          <Button type="primary" size="large" @click="trainApply(true, false)"
            style="float: right;"
            v-if="authButton.includes('ops_train_custom_apply')">
            自定义申请
          </Button>
        </Row>
        <hy-table
          highlight-row
          border
          :current="pageInfo.pageNo"
          :columns="tableList.columns"
          :data="tableList.data"
          :total="Number(pageInfo.total)"
          :pageSize="Number(pageInfo.pageSize)"
          pageType="small"
          show-elevator
          show-sizer
          ref="thisTable"
          @on-page-change="pageChange" />
      </Card>
    </Content>
    <customTableModal
      @checkData="getCheckData"
      :listScreen='tableList.columns'
      :evalModal='customTable'
      :closeModal='closeCustomTable'>
    </customTableModal>
    <trainDetailModal
      ref="trainDetailModal"
      title="培训申请"
      :typeList="typeList"
      @on-ok="saveApply">
    </trainDetailModal>
  </Layout>
</template>

<script>
import {mapState} from 'vuex'
import api from '@/api/axiosApi'
import operationApiList from '@/api/operationApiList'

import customTableModal from "./trainModal/customTableModal.vue";
import trainDetailModal from "./trainModal/trainDetailModal.vue";
export default {
    components: {
        customTableModal,
        trainDetailModal
    },
  data () {
    const vm = this
    return {
      // 当前选择的类型
      currentTypeIdx: '',
      customTable:false,
      searchCondition: {
        // 培训类别
        type: "",
        // 培训内容
        context: '',
        // 培训名称
        name: ''
      },
      // 当前操作的培训信息
      currentActTrainInfo: {},
      tableList: {
        columns: [{
          type: 'index',
          title: '序号',
          width: 60,
          align: 'center',
          key: 'deviceId'
        },
        {
          title: '培训类别',
          key: 'type'
        },
        {
          title: '培训名称',
          key: 'name'
        },
        {
          title: '培训内容',
          key: 'context'
        },{
          title: '操作',
          type: 'act',
          width: 200,
          align: 'center',
          render: (h, params) => {
            const apply = h('Button', {
              props: {
                type: 'primary',
                size: 'small'
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: () => {
                  vm.currentActTrainInfo = params.row
                  vm.trainApply(false, true)
                }
              }
            }, '培训申请')
            if (vm.authButton.includes('ops_train_apply')) {
              return h('div', [apply])
            }
            return h('div', '--')
          }
        }],
        data: []
      },
      pageInfo: {
        pageNo: 1,
        pageSize: 10,
        total: 0
      },
      isNew: false,
      isEdit: false,
      // 类型列表
      typeList: []
    }
  },
  computed: {
    names () {
      if (this.currentTypeIdx || this.currentTypeIdx === 0) {
        return this.typeList[this.currentTypeIdx].names
      }
      return []
    },
    ...mapState(['authButton'])
  },
  methods: {
    preSearch() {
        this.pageInfo.pageNo = 1
        this.search()
    },
    pageChange(pageNo, pageSize) {
      this.pageInfo.pageNo = pageNo
      this.pageInfo.pageSize = pageSize
      this.search()
    },
    // 查询所有的类型和名称的关系列表
    getTrainTypeList() {
      const vm = this
      api(operationApiList.trainTypeList)
      .then(res => {
        if (res.data.errcode === 0) {
          vm.typeList = res.data.data
        }
      }, error => {console.log(error)})
    },
    // 查询列表
    search (pageNo, pageSize, cb) {
      const vm = this
      api(operationApiList.trainPage, {
        pageNo: pageNo || vm.pageInfo.pageNo,
        pageSize: pageSize || vm.pageInfo.pageSize,
        data: vm.searchCondition
      }).then(res => {
        if (res.data.errcode === 0) {
          const result = res.data.data
          // 导出全部数据时使用
          if (cb) {
            cb(result)
            return
          }
          vm.pageInfo.pageNo = result.pageNum
          vm.pageInfo.total = result.total
          vm.tableList.data = result.list
        }
      }, error => {console.log(error)})
    },
    // 保存培训申请
    saveApply(data) {
      const vm = this
      const date = new Date(data.trainTime)
      data.trainTime = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
      api(operationApiList.trainApply, data)
      .then(res => {
        if (res.data.errcode === 0) {
          vm.search();
          vm.$refs.trainDetailModal.closeModal();
          vm.$Message.success('申请成功，等待审批！');
        } else {
          vm.$Message.error(res.data.errmsg);
        }
      }, error => {console.log(error)})
    },
    // 申请培训，打开弹窗
    trainApply(isNew, isEdit) {
      if (isNew) {
        this.currentActTrainInfo = {}
      }
      this.$refs.trainDetailModal.open(isNew, isEdit, this.currentActTrainInfo)
    },
    //导出全部数据
    exportAllData() {
      const vm = this
      vm.search(1, vm.pageInfo.total, res => {
        let dataArray = res.list.map((k, index) => {
          k.deviceId = index + 1
          return k
        })
        vm.$refs.thisTable.exportCsv({
          filename: '培训课程目录(全部)',
          columns: vm.tableList.columns,
          data: dataArray
        })
      })
    },
    //导出本页数据
    exportPageData(){
      let dataArray = this.tableList.data.map((k, index) => {
        k.deviceId = index + 1
        return k
      })
      this.$refs.thisTable.exportCsv({
        filename: '培训课程目录(单页)',
        columns: vm.tableList.columns,
        data: dataArray
      })
    },
    //自定义导出
    exportCustomData(){
      this.customTable = true;
    },
    closeCustomTable(){
      this.customTable = false;
    },
    trainDetailBtn(){
      this.trainDetail = true;
    },
    getCheckData(data){//获取选择的列名
      var arr = [];
      for(var i =0;i<this.tableList.columns.length;i++){//筛选匹配正确的列名单
        for(var j in data){
          if(this.tableList.columns[i].title==data[j]){
            arr.push(this.tableList.columns[i]);
          }
        }
      }
      if(arr.length!=0){
        let dataArray = this.tableList.data.map((k, index) => {
          k.deviceId = index + 1
          return k
        })
        this.$refs.thisTable.exportCsv({
          filename: 'table',
          columns: arr,
          data: dataArray
        })
      }else{
        this.$Message.fail('请至少选择一列')
      }
      this.customTable = false
    }
  },
  watch: {
    currentTypeIdx () {
      if (this.currentTypeIdx || this.currentTypeIdx === 0) {
        this.searchCondition.name = ''
        this.searchCondition.type = this.typeList[this.currentTypeIdx].type
      } else {
        this.searchCondition.name = ''
        this.searchCondition.type = ''
      }
    }
  },
  mounted () {
    this.search()
    this.getTrainTypeList()
  }
}
</script>

<style lang='less'>
.access-list{
  span.handle{
    margin: 0 5px;
    display: inline-block;
  }
}
</style>
