<template>
  <div>

      <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type=primary @click="showAddCartDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table class="treeTable" :data="cartList" :columns="columns"
      :selection-type="false" :expand-type="false"
      show-index index-text="#" border :show-row-hover="false">
      <!-- 是否有效 -->
      <template slot="isok" slot-scope="scope">
        <i class="el-icon-success"
        v-if="scope.row.cat_deleted === false" style="color: linghtgreen;"></i>
        <i class="el-icon-error" v-else style="color: red;"></i>
      </template>
      <!-- 排序 -->
      <template slot="order" slot-scope="scope">
        <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
        <el-tag size="mini" v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
        <el-tag size="mini" v-else type="warning">三级</el-tag>
      </template>
      <!-- 操作 -->
      <template slot="opt" slot-scope="">
        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
      </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->

    <el-dialog
      title="添加分类"
      :visible.sync="addCartDialogVisible"
      width="50%" @close="addCartDialogClosed">
      <!-- 添加分类表单 -->
      <el-form :model="addCartForm" :rules="addCartFormRules" ref="addCartFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCartForm.cat_name"></el-input>
        </el-form-item>
         <el-form-item label="父级分类" >
           <!-- options 指定数据来源 -->
           <!-- props 用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable change-on-select>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCartDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCart">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 默认总条数
      total: 0,
      // 商品分类数据列表，默认为空
      cartList: [],
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示,将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示,将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示,将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框显示与隐藏
      addCartDialogVisible: false,
      // 添加分类的表单数据对象
      addCartForm: {
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 添加分类等级，默认为1
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCartFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCartList()
  },
  methods: {
    // 获取商品分类数据
    async getCartList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }

      // console.log(res)
      // 把数值列表赋值给cartList
      this.cartList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCartList()
    },
    // 监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCartList()
    },
    // 点击按钮展示添加分类对话框
    showAddCartDialog() {
      // 先获取父级分类的对话框
      // 在显示对话框
      this.getParentCateList()
      this.addCartDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败！')
      }
      // console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择项发生变化时触发这个函数
    parentCateChange() {
      // console.log(this.selectedKeys)
      // 如果selectedKeys数组中的length大于0，证明选中有父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCartForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]

        // 当前分类的等级赋值
        this.addCartForm.cat_level = this.selectedKeys.length
        return false
      } else {
        // 父级分类的id
        this.addCartForm.cat_pid = 0

        // 当前分类的等级赋值
        this.addCartForm.cat_level = 0
      }
    },
    // 点击按钮，添加新的分类
    addCart() {
      // console.log(this.addCartForm)
      this.$refs.addCartFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCartForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCartList()
        this.addCartDialogVisible = false
      })
    },
    // 监听对话框关闭事件，重置表单数据
    addCartDialogClosed() {
      // 重置表单
      this.$refs.addCartFormRef.resetFields()
      // 清空选中的数组
      this.selectedKeys = []
      // 清空id
      this.addCartForm.cat_pid = 0
      // 清空等级
      this.addCartForm.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  height: 100%;
}
</style>
