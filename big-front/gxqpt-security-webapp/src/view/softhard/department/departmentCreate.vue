<template>
  <Layout>
    <Content>
      <Breadcrumb>
        <!-- <BreadcrumbItem>部门用户</BreadcrumbItem> -->
        <BreadcrumbItem>申请管理</BreadcrumbItem>
      </Breadcrumb>
      <serverCreate></serverCreate>
      <!-- <specificInfo :disab="disab"></specificInfo>
      <hostInfo></hostInfo> -->
      <!-- <approvalOpinions v-if='this.$route.params.id!=1'></approvalOpinions> -->
    </Content>
  </Layout>
</template>

<script>
// 新增服务的表单
import serverCreate from './../common/serverCreate'
import specificInfo from './../common/specificInfo'
import hostInfo from './../common/hostInfo'
import approvalOpinions from './../common/approvalOpinions'
export default {
  components: {
    serverCreate,
    specificInfo,
    hostInfo,
    approvalOpinions
  },
  data(){
    return{
      disab:true,
    }
  },
  methods:{
      goback(n){
          this.$router.go(n);
      }
  }
}
</script>
<style scoped>
.backBtn{
    float: right;
}
</style>