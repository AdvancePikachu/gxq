<template>
  <Layout>
    <hengyun-header :title="{chinese: '软硬件管理平台', english: 'Software And Hardware Management Platform'}"></hengyun-header>
    <Layout class="ivu-layout-has-sider"  v-if="menus.length > 0">
      <hengyun-sidebar :menus="menus" />
      <router-view v-if="isRouterAlive"></router-view>
    </Layout>
  </Layout>
</template>
<script>
import api from '@/api/axiosApi'
import apiList from '@/api/comApiList'
// 头部
import header from '@/components/hengyun/header'
// 侧边栏
import siderBar from '@/components/hengyun/sideBar'
import { mapState,mapActions } from 'vuex'
// const menus = [{
//   name: '部门用户',
//   subMenu: [{
//     name: '服务器管理（使用方）',
//     link: '/departmentServer'
//   }, {
//     name: '申请管理',
//     link: '/departmentApply'
//   }]
// }, {
//   name: '管理员（大数据办）',
//   subMenu: [{
//     name: '服务器管理',
//     link: '/admin/server'
//   }, {
//     name: '申请管理',
//     link: '/adminApply'
//   }, {
//     name: '主机信息查看',
//     link: '/adminEngine'
//   }]
// }, {
//   name: '国信优易',
//   subMenu: [{
//     name: '服务器管理',
//     link: '/serverMgr'
//   }, {
//     name: '申请管理',
//     link: '/applyMgr'
//   }, {
//     name: '主机信息查看',
//     link: '/hostInfoLook'
//   },{
//     name: '基础数据维护',
//     link: '/basisDataMaintain'
//   }]
// }, {
//   name: '高新翼云',
//   subMenu: [{
//     name: '申请管理',
//     link: '/gxyyApply'
//   }, {
//     name: '主机信息管理',
//     link: '/gxyyAdminEngine'
//   }]
// }]

export default {
  components: {
    'hengyun-sidebar': siderBar,
    'hengyun-header': header
  },
  provide(){
    return {
      reload:this.reload
    }
  },
  data() {
    return {
      isCollapsed: false,
      menus: [],
      isRouterAlive:true
    }
  },
  mounted(){
    this.$store.dispatch('getAuthButton')
    this.czxtFindByCode();
    this.sswlFindByCode();
    this.wlkdFindByCode();
  },
  computed: {
    rotateIcon() {
      return [
        'menu-icon',
        this.isCollapsed ? 'rotate-icon' : ''
      ];
    },
    menuitemClasses() {
      return [
        'menu-item',
        this.isCollapsed ? 'collapsed-menu' : ''
      ]
    },
    ...mapState([
      'userInfo',
    ])
  },
  created() {
    this.$nextTick(() => {
      this.init();
    })
  },
  methods: {
    reload(){
      this.isRouterAlive = false;
      this.$nextTick(function(){
        this.isRouterAlive = true;
      })
    },
    collapsedSider() {
      this.$refs.side1.toggleCollapse();
    },
    init() {
      this.getOperateMenu();
    },
    getOperateMenu() {
      function buildMenu(data) {
        var arr = [];
        data.forEach(function(item, index) {
          var obj = {
            name: item.name,
            link: item.url,
            icon: item.icon,
            subMenu: item.children ? buildMenu(item.children) : null
          }
          arr.push(obj);
        })
        return arr;
      }
      let AxiosData = {
        userId:this.userInfo.userId,
        group: 'DEFAULT'
      }
      api(apiList.getOperateMenu, AxiosData).then((res) => {
        if(res.status == 200) {
          this.menus = buildMenu(res.data.data)
          if (this.menus.length > 0) {
            var obj = {}
            if(this.menus[0].subMenu && this.menus[0].subMenu.length) {
              obj = this.menus[0].subMenu[0]
            } else {
              obj = this.menus[0]
            }
            if(this.$route.matched && this.$route.matched.length === 0) {//当登陆调转时自动跳到一级菜单的一级目录
              this.$router.push({
                path: obj.link
              })
            }
          }
        }
      })
    },
    ...mapActions([
      'czxtFindByCode',
      'sswlFindByCode',
      'wlkdFindByCode'
    ])
  }
}
</script>
<style>
html, body, #app, .ivu-layout{
  height:auto;
  min-height: 100%;
}
</style>

