<!-- 
  对iview table和分页进行二次封装，融合在一起
  table属性事件等和iview的table一样
  page属性变化如下：
    size更换为pageType
    placement默认为top
  page的slot需要指定name为page
  新增方法
    onPageChange，返回值为(pageNo,pageSize),页码变化时触发
  slot: 出现在table和page之间
  新增属性
    needPage: 默认为true,是否需要显示分页信息
  新增属性(2018-09-20)
    dragable: 默认为false,是否需要拖拽表格列功能，拖拽结束后触发事件endFunc映射父级on-end绑定事件，传递参数index，可自定义增加传参
-->

<template>
  <div class="hy-table">
    <Table
      :data="data"
      :columns="columns"
      :size="size"
      :width="width"
      :height="height"
      :stripe="stripe"
      :border="border"
      :showHeader="showHeader"
      :highlightRow="highlightRow"
      :rowClassName="rowClassName"
      :noDataText="noDataText"
      :noFilteredDataText="noFilteredDataText"
      :disabledHover="disabledHover"
      :loading="loading"
      @on-current-change="onCurrentChange"
      @on-select="onSelect"
      @on-select-cancel="onSelectCancel"
      @on-select-all="onSelectAll"
      @on-selection-change="onSelectionChange"
      @on-sort-change="onSortChange"
      @on-filter-change="onFilterChange"
      @on-row-click="onRowClick"
      @on-row-dbclick="onRowDbClick"
      @on-expand="onExpand"
      ref="hyTable">
      <slot name="header"></slot>
      <slot name="footer"></slot>
      <slot name="loading"></slot>
    </Table>
    <slot></slot>
    <div class="bottom-bar" v-if="needPage">
      <Page
        :current.sync="pageInfo.pageNo"
        :total="total"
        :page-size="pageSize"
        :page-size-opts="pageSizeOpts"
        :placement="placement"
        :transfer="transfer"
        :size="sizeType"
        :simple="simple"
        :show-total="showTotal"
        :show-elevator="showElevator"
        :show-sizer="showSizer"
        :class-name="className"
        :styles="styles"
        @on-change="onChange"
        @on-page-size-change="onPageSizeChange">
          <slot name="page"></slot>
        </Page>
    </div>
  </div>
</template>

<script>
import Sortable from 'sortablejs' //拖拽表格实现
function oneOf (value, validList) {
  for (let i = 0; i < validList.length; i++) {
    if (value === validList[i]) {
      return true;
    }
  }
  return false;
}
export default {
  props: {
    data: {
      type: Array,
      default () {
        return [];
      }
    },
    columns: {
      type: Array,
      default () {
        return [];
      }
    },
    size: {
      validator (value) {
        return oneOf(value, ['small', 'large', 'default']);
      }
    },
    width: {
      type: [Number, String],
      default: ''
    },
    height: {
      type: [Number, String],
      default: ''
    },
    stripe: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: false
    },
    dragable:{
      type: Boolean,
      default: false
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    highlightRow: {
      type: Boolean,
      default: false
    },
    rowClassName: {
      type: Function,
      default () {
        return '';
      }
    },
    noDataText: {
      type: String
    },
    noFilteredDataText: {
      type: String
    },
    disabledHover: {
      type: Boolean
    },
    loading: {
      type: Boolean,
      default: false
    },
    current: {
      type: Number,
      default: 1
    },
    total: {
      type: Number,
      default: 0
    },
    pageSize: {
      type: Number,
      default: 10
    },
    pageSizeOpts: {
      type: Array,
      default () {
        return [10, 20, 30, 40];
      }
    },
    placement: {
      validator (value) {
        return oneOf(value, ['top', 'bottom']);
      },
      default: 'top'
    },
    transfer: {
      type: Boolean,
      default: false
    },
    sizeType: {
      validator (value) {
        return oneOf(value, ['small']);
      }
    },
    simple: {
      type: Boolean,
      default: false
    },
    showTotal: {
      type: Boolean,
      default: true
    },
    showElevator: {
      type: Boolean,
      default: false
    },
    showSizer: {
      type: Boolean,
      default: false
    },
    className: {
      type: String
    },
    styles: {
      type: Object
    },
    needPage: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      pageInfo: {
        pageSize: this.pageSize,
        pageNo: this.current
      }
    }
  },
  watch: {
    current (val) {
      this.pageInfo.pageNo = val
    }
  },
  mounted(){
    if(this.dragable)this.dragableTable()
  },
  methods: {
    dragableTable(){
      //拖拽功能初始化
      var el = this.$refs.hyTable.$children[1].$el.children[1];
      let vm = this;
      Sortable.create(el, {
          onEnd: vm.endFunc,
      });
    },
    endFunc (e) {
      this.$emit('on-end', {
          from: e.oldIndex,
          to: e.newIndex
      });
    },
    onCurrentChange (currentRow, oldCurrentRow) {
      this.$emit('on-current-change', currentRow, oldCurrentRow)
    },
    onSelect (selection, row) {
      this.$emit('on-select', selection, row)
    },
    onSelectCancel (selection, row) {
      this.$emit('on-select-cancel', selection, row)
    },
    onSelectAll (selection) {
      this.$emit('on-select-all', selection)
    },
    onSelectionChange (selection) {
      this.$emit('on-selection-change', selection)
    },
    onSortChange (column, key, order) {
      this.$emit('on-sort-change', column, key, order)
    },
    onFilterChange (row) {
      this.$emit('on-filter-change', row)
    },
    onRowClick (index) {
      this.$emit('on-row-click', index)
    },
    onRowDbClick (index) {
      this.$emit('on-row-dbclick', index)
    },
    onExpand (row, status) {
      this.$emit('on-expand', row, status)
    },
    exportCsv (data) {
      this.$refs.hyTable.exportCsv(data)
    },
    clearCurrentRow () {
      this.$refs.hyTable.clearCurrentRow()
    },
    onChange (pageNo) {
      this.$emit('on-change', pageNo)
      this.pageInfo.pageNo = pageNo
      this.onPageChange()
    },
    onPageSizeChange (pageSize) {
      this.$emit('on-page-size-change', pageSize)
      this.pageInfo.pageSize = pageSize
      this.onPageChange()
    },
    onPageChange () {
      this.$emit('on-page-change', this.pageInfo.pageNo, this.pageInfo.pageSize)
    }
  }
}
</script>
<style lang="less">
.hy-table{
  margin-bottom: 20px;
}
.bottom-bar{
	text-align: right;
  margin-top:30px;
}
</style>
