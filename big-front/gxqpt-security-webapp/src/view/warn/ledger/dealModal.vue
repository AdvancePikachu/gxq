<template>
  <Modal
    v-model="showModal"
    title="预警信息处理"
    width="40%">
    <Form ref="dealForm" :model="dealForm" :rules="validate" :label-width="90">
      <FormItem :label="isDeal ? '处理信息': '确认信息'" prop="remarks" :required="isDeal">
        <Input
          v-model="dealForm.remarks"
          type="textarea"
          :maxlength="200"
          :autosize="{minRows: 5,maxRows: 5}"
          placeholder="请输入确认信息...">
        </Input>
        <p style="font-size: 12px; color: #bbb;">内容限200字以内</p>
      </FormItem>
      <FormItem label="预警级别">
        <Select v-model="dealForm.level">
          <Option :value="item.value" v-for="item in levels" :key="item.value" v-if="item.value != ''">{{item.label}}</Option>
        </Select>
      </FormItem>
      <FormItem label="处理结果">
        <RadioGroup v-model="result" @on-change="radioChange">
          <Radio label="属实"></Radio>
          <Radio label="不属实"></Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="指定责任人" v-if="!isDeal && result==='属实'">
        <Select v-model="currentIdx">
          <Option :value="idx" v-for="(item, idx) in emps" :key="idx">{{item.name}}</Option>
        </Select>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button class="modalBtn" type="default" @click="showModal = false" size="large">取消</Button>
      <Button class="modalBtn" type="primary" @click="submit" size="large">确定</Button>
    </div>
  </Modal>
</template>

<script>
import {mapState} from 'vuex'
import api from '@/api/axiosApi'
import warnApiList from '@/api/warnApiList'
import {levels, allStatus} from './constant'

export default {
  data () {
    const vm = this
    return {
      levels,
      showModal: false,
      isDeal: true,
      // 一开始指定的责任人的信息
      dutyerInfo: {},
      // 当前登录人的所有单位的所有人员
      emps: [],
      currentIdx: 0,
      dealForm: {
        level: '',
        result: 'true',
        remarks: ''
      },
      result: '属实',
      validate: {
        remarks: [{validator: (rule, value, cb) => {
          if (vm.isDeal && !vm.dealForm.remarks) {
            cb(new Error('处理信息不能为空'))
            return
          } else if (!vm.dealForm.remarks && vm.result === '不属实') {
            cb(new Error('不属实时确认信息不能为空'))
            return
          }
          cb()
        }}]
      }
    }
  },
  computed: {
    ...mapState(['userInfo'])
  },
  methods: {
    resetDealForm () {
      this.dealForm = {
        level: '',
        result: 'true',
        remarks: ''
      }
    },
    open (id, isDeal) {
      const vm = this
      vm.showModal = true
      vm.isDeal = isDeal
      vm.resetDealForm()
      vm.dealForm.id = id
      api(warnApiList.warnGetById, { id })
      .then(res => {
        if (res.data.errcode === 0) {
          vm.dealForm.level = res.data.data.warn.level.toString()
        }
      }, error => {console.log(error)})

      if (!vm.isDeal) {
        api(warnApiList.getDutyer, { warnId: id })
        .then(res => {
          if (res.data.errcode === 0) {
            if (res.data.data && res.data.data.userId) {
              vm.dealForm.userId = res.data.data.userId
            }
            api(warnApiList.getTreeEmpPhoneByUserId, { userId: vm.userInfo.userId })
            .then(res => {
              if (res.data.errcode === 0) {
                const data = res.data.data || []
                let emps = []
                // 单位
                data.map((u, i) => {
                  const deptList = u.deptList || []
                  // 部门
                  deptList.map((d, j) => {
                    const empList = d.empList
                    // 人员
                    empList.map(emp => {
                      if (emp.gxqptEmpId == vm.dealForm.userId) {
                        vm.currentIdx = emps.length
                      }
                      emps.push(emp)
                    })
                  })
                })
                vm.emps = emps
              }
            }, error => {console.log(error)})
          }
        }, error => {console.log(error)})
      }
    },
    submit () {
      const vm = this
      vm.$refs.dealForm.validate((valid) => {
        if (valid) {
          // 指定的责任人信息
          const dutyer = vm.emps[vm.currentIdx] || {
            userId: '',
            recName: ''
          }
          vm.$emit('on-ok', {
            ...vm.dealForm,
            userId: dutyer.gxqptEmpId,
            recName: dutyer.name
          })
          vm.showModal = false
        } else {
          vm.$Message.info('预警确认失败')
        }
      })
    }
  },
  watch: {
    result (label) {
      this.dealForm.result = label == '属实'
    }
  }
}
</script>
